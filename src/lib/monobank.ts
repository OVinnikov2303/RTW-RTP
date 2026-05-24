import crypto from "crypto"

const MONOBANK_API = "https://api.monobank.ua"

function token() {
  const t = process.env.MONOBANK_TOKEN
  if (!t) throw new Error("MONOBANK_TOKEN is not set")
  return t
}

export interface MonobankInvoiceParams {
  amount: number // UAH — converted to kopecks internally
  orderId: string
  description: string
  redirectUrl: string
  webHookUrl: string
  items?: Array<{ name: string; qty: number; sum: number; code?: string }>
}

export interface MonobankInvoiceResponse {
  invoiceId: string
  pageUrl: string
}

export interface MonobankStatusResponse {
  invoiceId: string
  status: "created" | "processing" | "hold" | "success" | "failure" | "reversed" | "expired"
  amount: number // kopecks
  ccy: number
  reference?: string
  createdDate: number
  modifiedDate: number
  errCode?: string
  errText?: string
  paymentInfo?: {
    maskedPan?: string
    approvalCode?: string
    rrn?: string
    tranId?: string
    terminal?: string
    bank?: string
    paymentSystem?: string
    country?: string
    fee?: number
  }
}

export async function createMonobankInvoice(
  params: MonobankInvoiceParams
): Promise<MonobankInvoiceResponse> {
  const amountKopecks = Math.round(params.amount * 100)

  const body = {
    amount: amountKopecks,
    ccy: 980, // UAH ISO 4217
    merchantPaymInfo: {
      reference: params.orderId,
      destination: params.description,
      basketOrder: params.items?.map((i) => ({
        name: i.name,
        qty: i.qty,
        sum: Math.round(i.sum * 100),
        icon: "",
        unit: "шт.",
        code: i.code ?? "",
        barcode: "",
        header: "",
        footer: "",
        tax: [],
        uktzed: "",
      })),
    },
    redirectUrl: params.redirectUrl,
    webHookUrl: params.webHookUrl,
  }

  const res = await fetch(`${MONOBANK_API}/api/merchant/invoice/create`, {
    method: "POST",
    headers: { "X-Token": token(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Monobank create invoice failed ${res.status}: ${err}`)
  }

  return res.json()
}

export async function getMonobankInvoiceStatus(
  invoiceId: string
): Promise<MonobankStatusResponse> {
  const res = await fetch(
    `${MONOBANK_API}/api/merchant/invoice/status?invoiceId=${encodeURIComponent(invoiceId)}`,
    { headers: { "X-Token": token() } }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Monobank invoice status failed ${res.status}: ${err}`)
  }

  return res.json()
}

// Cached public key for webhook signature verification
let _pubKey: crypto.KeyObject | null = null

async function fetchPublicKey(): Promise<crypto.KeyObject> {
  if (_pubKey) return _pubKey
  const res = await fetch(`${MONOBANK_API}/api/merchant/pubkey`, {
    headers: { "X-Token": token() },
  })
  if (!res.ok) throw new Error("Failed to fetch Monobank public key")
  const { key } = await res.json()
  _pubKey = crypto.createPublicKey({ key: Buffer.from(key, "base64"), format: "der", type: "spki" })
  return _pubKey
}

export async function verifyMonobankWebhook(
  rawBody: string,
  xSign: string | null
): Promise<boolean> {
  // Skip verification in development when no signature is present
  if (!xSign) return process.env.NODE_ENV !== "production"
  try {
    const pubKey = await fetchPublicKey()
    return crypto.verify(
      "SHA256",
      Buffer.from(rawBody, "utf-8"),
      pubKey,
      Buffer.from(xSign, "base64")
    )
  } catch {
    return false
  }
}

// Map Monobank status to our DB PaymentStatus enum value
export function mapMonobankStatus(
  status: MonobankStatusResponse["status"]
): "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED" {
  switch (status) {
    case "success":
      return "PAID"
    case "failure":
      return "FAILED"
    case "reversed":
      return "REFUNDED"
    case "expired":
      return "CANCELLED"
    default:
      return "PENDING"
  }
}
