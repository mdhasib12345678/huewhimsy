import { model } from "@medusajs/framework/utils"

const StaticPage = model.define("static_page", {
  id: model.id().primaryKey(),
  slug: model.text().unique().searchable(),
  title: model.text().searchable(),
  body: model.text().searchable(),
  excerpt: model.text().nullable(),
  cover_image: model.text().nullable(),
  status: model.enum(["draft", "published", "archived"]).default("draft"),
  published_at: model.dateTime().nullable(),
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
  og_image: model.text().nullable(),
  translations: model.json().nullable(),
})

export default StaticPage
