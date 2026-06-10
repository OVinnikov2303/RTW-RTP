import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createMonobankInvoice } from "@/lib/monobank"
import { sendNewOrderNotification } from "@/lib/email"
import { z } from "zod"

const cartItemSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    stock: z.number(),
    slug: z.string().optional(),
    images: z.array(z.any()).optional(),
    category: z.any().optional(),
  }),
  quantity: z.number().int().positive(),
})

const schema = z.object({
  items: z.array(cartItemSchema).min(1),
  shippingName: z.string().min(2),
  shippingEmail: z.string().email(),
  shippingPhone: z.string().optional(),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingCountry: z.string().min(2),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Невірний формат запиту" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Невірні дані форми", details: parsed.error.flatten() }, { status: 400 })
  }

  const { items, discountCode, ...shippingData } = parsed.data

  let discountAmount = 0
  let discountId: string | undefined

  if (discountCode) {
    const discount = await prisma.discount.findFirst({
      where: {
        code: discountCode,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })
    if (discount) {
      const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
      const meetsMin = !discount.minOrder || subtotal >= discount.minOrder
      const hasUses = !discount.maxUses || discount.usedCount < discount.maxUses
      if (meetsMin && hasUses) {
        discountAmount =
          discount.type === "PERCENTAGE"
            ? (subtotal * discount.value) / 100
            : Math.min(discount.value, subtotal)
        discountId = discount.id
      }
    }
  }

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const total = Math.max(0.01, subtotal - discountAmount) // minimum 1 kopeck

  let order: { id: string }
  try {
    order = await prisma.order.create({
      data: {
        userId: session.user.id,
        subtotal,
        discountAmount,
        total,
        discountId,
        paymentMethod: "monobank",
        ...shippingData,
        items: {
          create: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            price: i.product.price,
          })),
        },
      },
    })
  } catch (err) {
    console.error("Order creation failed:", err)
    return NextResponse.json({ error: "Не вдалося створити замовлення" }, { status: 500 })
  }

  await sendNewOrderNotification({
    orderId: order.id,
    shippingName: shippingData.shippingName,
    shippingEmail: shippingData.shippingEmail,
    shippingPhone: shippingData.shippingPhone,
    shippingAddress: shippingData.shippingAddress,
    shippingCity: shippingData.shippingCity,
    shippingCountry: shippingData.shippingCountry,
    total,
  }).catch((err) => console.error("Order notification email failed:", err))

  if (discountId) {
    await prisma.discount.update({
      where: { id: discountId },
      data: { usedCount: { increment: 1 } },
    }).catch(() => {/* non-critical */})
  }

  const host = req.headers.get("host") ?? "localhost:3000"
  const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https")
  const baseUrl = process.env.NEXTAUTH_URL ?? `${proto}://${host}`

  let invoice: { invoiceId: string; pageUrl: string }
  try {
    invoice = await createMonobankInvoice({
      amount: total,
      orderId: order.id,
      description: `Замовлення #${order.id.slice(-8).toUpperCase()} — RTW-RTP`,
      redirectUrl: `${baseUrl}/payment/success?orderId=${order.id}`,
      webHookUrl: `${baseUrl}/api/webhooks/monobank`,
      items: items.map((i) => ({
        name: i.product.name,
        qty: i.quantity,
        sum: i.product.price * i.quantity,
        code: i.product.id,
      })),
    })
  } catch (err) {
    console.error("Monobank invoice creation failed:", err)
    // Clean up the order so user can retry
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
    return NextResponse.json(
      { error: "Не вдалося ініціювати платіж. Спробуйте пізніше." },
      { status: 502 }
    )
  }

  await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      invoiceId: invoice.invoiceId,
      amount: total,
      status: "created",
      pageUrl: invoice.pageUrl,
      statusHistory: { create: { status: "created" } },
    },
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentRef: invoice.invoiceId },
  })

  return NextResponse.json({ paymentUrl: invoice.pageUrl, orderId: order.id })
}
