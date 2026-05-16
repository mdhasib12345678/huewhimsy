import { model } from "@medusajs/framework/utils"

const BlogPost = model.define("blog_post", {
  id: model.id().primaryKey(),
  slug: model.text().unique().searchable(),
  title: model.text().searchable(),
  excerpt: model.text().nullable(),
  body: model.text(),
  cover_image: model.text().nullable(),
  author_name: model.text().nullable(),
  author_avatar: model.text().nullable(),
  category: model.text().nullable(),
  tags: model.json().nullable(),
  read_time_minutes: model.number().nullable(),
  status: model.enum(["draft", "published", "archived"]).default("draft"),
  published_at: model.dateTime().nullable(),
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
  og_image: model.text().nullable(),
  translations: model.json().nullable(),
})

export default BlogPost
