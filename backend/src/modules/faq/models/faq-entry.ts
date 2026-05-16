import { model } from "@medusajs/framework/utils"

const FaqEntry = model.define("faq_entry", {
  id: model.id().primaryKey(),
  question: model.text().searchable(),
  answer: model.text().searchable(),
  category: model.text().nullable(),
  display_order: model.number().default(0),
  status: model.enum(["draft", "published", "archived"]).default("draft"),
  translations: model.json().nullable(),
})

export default FaqEntry
