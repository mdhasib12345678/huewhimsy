import { model } from "@medusajs/framework/utils"

const WishlistItem = model.define("wishlist_item", {
  id: model.id().primaryKey(),
  customer_id: model.text().searchable(),
  product_id: model.text().searchable(),
  variant_id: model.text().nullable(),
  notes: model.text().nullable(),
  added_at: model.dateTime(),
})

export default WishlistItem
