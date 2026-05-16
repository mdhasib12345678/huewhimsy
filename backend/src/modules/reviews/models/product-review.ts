import { model } from "@medusajs/framework/utils"

const ProductReview = model.define("product_review", {
  id: model.id().primaryKey(),
  product_id: model.text().searchable(),
  customer_id: model.text().nullable(),
  author_name: model.text().searchable(),
  author_email: model.text().nullable(),
  rating: model.number(),
  title: model.text().nullable(),
  body: model.text().searchable(),
  status: model
    .enum(["pending", "approved", "rejected", "spam"])
    .default("pending"),
  helpful_count: model.number().default(0),
  reply: model.text().nullable(),
  reply_at: model.dateTime().nullable(),
  ip_address: model.text().nullable(),
})

export default ProductReview
