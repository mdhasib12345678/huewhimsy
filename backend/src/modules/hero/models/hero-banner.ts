import { model } from "@medusajs/framework/utils"

const HeroBanner = model.define("hero_banner", {
  id: model.id().primaryKey(),
  placement: model.text().searchable(),
  title: model.text().searchable(),
  subtitle: model.text().nullable(),
  cta_label: model.text().nullable(),
  cta_url: model.text().nullable(),
  image: model.text().nullable(),
  mobile_image: model.text().nullable(),
  video_url: model.text().nullable(),
  text_color: model.text().nullable(),
  display_order: model.number().default(0),
  status: model.enum(["draft", "published", "archived"]).default("draft"),
  active_from: model.dateTime().nullable(),
  active_until: model.dateTime().nullable(),
  translations: model.json().nullable(),
})

export default HeroBanner
