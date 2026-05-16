import { model } from "@medusajs/framework/utils"

const Activity = model.define("activity", {
  id: model.id().primaryKey(),
  slug: model.text().unique().searchable(),
  title: model.text().searchable(),
  description: model.text().nullable(),
  file_url: model.text().nullable(),
  thumbnail: model.text().nullable(),
  category: model.text().nullable(),
  age_range: model.text().nullable(),
  pages: model.number().nullable(),
  requires_subscription: model.boolean().default(false),
  display_order: model.number().default(0),
  status: model.enum(["draft", "published", "archived"]).default("draft"),
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
  og_image: model.text().nullable(),
  translations: model.json().nullable(),
})

export default Activity
