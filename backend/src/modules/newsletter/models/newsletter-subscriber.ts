import { model } from "@medusajs/framework/utils"

const NewsletterSubscriber = model.define("newsletter_subscriber", {
  id: model.id().primaryKey(),
  email: model.text().unique().searchable(),
  name: model.text().nullable(),
  locale: model.text().default("en"),
  source: model.text().nullable(),
  status: model
    .enum(["pending", "confirmed", "unsubscribed", "bounced"])
    .default("pending"),
  confirmed_at: model.dateTime().nullable(),
  unsubscribed_at: model.dateTime().nullable(),
  tags: model.json().nullable(),
  ip_address: model.text().nullable(),
  user_agent: model.text().nullable(),
})

export default NewsletterSubscriber
