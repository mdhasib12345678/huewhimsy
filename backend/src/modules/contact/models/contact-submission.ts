import { model } from "@medusajs/framework/utils"

const ContactSubmission = model.define("contact_submission", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  email: model.text().searchable(),
  phone: model.text().nullable(),
  subject: model.text().nullable(),
  message: model.text().searchable(),
  status: model
    .enum(["new", "in_progress", "resolved", "spam"])
    .default("new"),
  assigned_to: model.text().nullable(),
  admin_notes: model.text().nullable(),
  ip_address: model.text().nullable(),
  user_agent: model.text().nullable(),
  page_url: model.text().nullable(),
  locale: model.text().nullable(),
})

export default ContactSubmission
