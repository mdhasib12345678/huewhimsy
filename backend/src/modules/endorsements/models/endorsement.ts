import { model } from "@medusajs/framework/utils"

const Endorsement = model.define("endorsement", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  role: model.text().nullable(),
  quote: model.text().searchable(),
  rating: model.number().nullable(),
  avatar: model.text().nullable(),
  location: model.text().nullable(),
  display_order: model.number().default(0),
  status: model.enum(["draft", "published", "archived"]).default("draft"),
  translations: model.json().nullable(),
})

export default Endorsement
