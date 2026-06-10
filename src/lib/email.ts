import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

type NewOrderEmailData = {
  orderId: string
  shippingName: string
  shippingEmail: string
  shippingPhone?: string | null
  shippingAddress: string
  shippingCity: string
  shippingCountry: string
  total: number
}

export async function sendNewOrderNotification(data: NewOrderEmailData) {
  const to = process.env.ORDER_NOTIFICATION_EMAIL
  if (!resend || !to) return

  await resend.emails.send({
    from: "RTW-RTP <onboarding@resend.dev>",
    to,
    subject: `Нове замовлення №${data.orderId}`,
    html: `
      <h2>Надійшло нове замовлення</h2>
      <p><strong>Номер замовлення:</strong> ${data.orderId}</p>
      <h3>Дані клієнта</h3>
      <p>
        Ім'я: ${data.shippingName}<br>
        Email: ${data.shippingEmail}<br>
        ${data.shippingPhone ? `Телефон: ${data.shippingPhone}<br>` : ""}
      </p>
      <h3>Адреса доставки</h3>
      <p>
        ${data.shippingAddress}<br>
        ${data.shippingCity}, ${data.shippingCountry}
      </p>
      <h3>Сума замовлення</h3>
      <p>${data.total.toFixed(2)} ₴</p>
    `,
  })
}
