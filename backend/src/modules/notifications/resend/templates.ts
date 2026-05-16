type Rendered = { html: string; text: string }

const BRAND_COLOR = "#FF5F6D"
const BRAND_NAME = "HueWhimsy"
const STORE_URL = "https://huewhimsy.com"

function wrap(title: string, body: string, footerCta?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.04);">
        <tr><td style="background:${BRAND_COLOR};padding:24px;text-align:center;">
          <a href="${STORE_URL}" style="color:#fff;text-decoration:none;font-size:24px;font-weight:700;letter-spacing:-0.02em;">${BRAND_NAME}</a>
        </td></tr>
        <tr><td style="padding:32px 32px 16px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#0a0a0a;">${escape(title)}</h1>
          ${body}
        </td></tr>
        ${footerCta ? `<tr><td style="padding:0 32px 32px;">${footerCta}</td></tr>` : ""}
        <tr><td style="padding:24px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center;">
          <div>You're receiving this from ${BRAND_NAME}.</div>
          <div style="margin-top:4px;">
            <a href="${STORE_URL}" style="color:#6b7280;text-decoration:underline;">huewhimsy.com</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function escape(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function button(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">${escape(label)}</a>`
}

function toText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const templates: Record<string, (data: Record<string, any>) => Rendered> = {
  "order-confirmation": (data) => {
    const order = data.order ?? {}
    const items = (order.items ?? [])
      .map(
        (i: any) =>
          `<tr><td>${escape(i.title)} × ${i.quantity}</td><td align="right">${escape(i.formatted_total ?? `${i.unit_price ?? ""}`)}</td></tr>`,
      )
      .join("")
    const html = wrap(
      `Thank you for your order, ${escape(data.customer_name ?? order.email ?? "friend")}!`,
      `<p>Your order #${escape(order.display_id ?? order.id ?? "")} has been received.</p>
       <table cellpadding="6" cellspacing="0" width="100%" style="margin-top:16px;font-size:14px;">${items}</table>
       <p style="margin-top:16px;color:#525252;">Total: <strong>${escape(order.formatted_total ?? "")}</strong></p>`,
      button("View your order", `${STORE_URL}/account/orders`),
    )
    return {
      html,
      text: toText(html),
    }
  },

  "customer-welcome": (data) => {
    const html = wrap(
      `Welcome to ${BRAND_NAME}!`,
      `<p>Hi ${escape(data.first_name ?? "there")},</p>
       <p>Your account is ready. Explore whimsical books and creative activities for little ones aged 3-8.</p>`,
      button("Start exploring", `${STORE_URL}/shop`),
    )
    return { html, text: toText(html) }
  },

  "password-reset": (data) => {
    const url = data.reset_url ?? STORE_URL
    const html = wrap(
      "Reset your password",
      `<p>We received a request to reset your ${BRAND_NAME} password. This link is valid for 1 hour.</p>
       <p style="margin-top:24px;">${button("Reset password", url)}</p>
       <p style="margin-top:24px;color:#525252;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>`,
    )
    return { html, text: toText(html) }
  },

  "newsletter-confirmation": (data) => {
    const html = wrap(
      "You're on the list",
      `<p>Hi ${escape(data.name ?? "there")},</p>
       <p>Thanks for subscribing to ${BRAND_NAME} updates. We'll send free activity packs, new book releases, and parenting tips — never spam.</p>`,
      button("Browse free activities", `${STORE_URL}/free-activities`),
    )
    return { html, text: toText(html) }
  },

  "contact-form-receipt": (data) => {
    const html = wrap(
      "We got your message",
      `<p>Hi ${escape(data.name ?? "there")},</p>
       <p>Thanks for reaching out! We've received your message and will reply within 1-2 business days.</p>
       <blockquote style="margin:16px 0;padding:12px 16px;background:#f5f5f5;border-left:3px solid ${BRAND_COLOR};color:#525252;">${escape(data.message ?? "")}</blockquote>`,
    )
    return { html, text: toText(html) }
  },

  "contact-form-admin-alert": (data) => {
    const html = wrap(
      "New contact form submission",
      `<p><strong>From:</strong> ${escape(data.name)} &lt;${escape(data.email)}&gt;</p>
       ${data.subject ? `<p><strong>Subject:</strong> ${escape(data.subject)}</p>` : ""}
       <div style="margin-top:16px;padding:12px 16px;background:#f5f5f5;border-radius:8px;white-space:pre-wrap;">${escape(data.message)}</div>
       <p style="margin-top:16px;font-size:13px;color:#525252;">Page: ${escape(data.page_url ?? "—")}</p>`,
      button("Open inbox", `${STORE_URL}/studio/contact`),
    )
    return { html, text: toText(html) }
  },
}

export function renderTemplate(
  name: string,
  data: Record<string, any>,
): Rendered {
  const tpl = templates[name]
  if (!tpl) {
    const html = wrap(
      `Notification: ${escape(name)}`,
      `<pre style="white-space:pre-wrap;font-family:monospace;font-size:12px;">${escape(JSON.stringify(data, null, 2))}</pre>`,
    )
    return { html, text: toText(html) }
  }
  return tpl(data)
}
