import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HERO_MODULE } from "../../../modules/hero"
import HeroModuleService from "../../../modules/hero/service"

function applyTranslation(row: any, locale?: string) {
  if (!locale || locale === "en" || !row?.translations) return row
  const slice = row.translations?.[locale]
  if (!slice) return row
  return {
    ...row,
    title: slice.title ?? row.title,
    subtitle: slice.subtitle ?? row.subtitle,
    cta_label: slice.cta_label ?? row.cta_label,
  }
}

function isCurrentlyActive(row: any, now: Date): boolean {
  if (row.active_from && new Date(row.active_from) > now) return false
  if (row.active_until && new Date(row.active_until) < now) return false
  return true
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const service: HeroModuleService = req.scope.resolve(HERO_MODULE)
  const limit = Math.min(Number(req.query.limit ?? 20), 100)
  const offset = Number(req.query.offset ?? 0)
  const locale = req.query.locale as string | undefined
  const placement = req.query.placement as string | undefined

  const filters: Record<string, unknown> = { status: "published" }
  if (placement) filters.placement = placement

  const [rows, count] = await service.listAndCountHeroBanners(filters, {
    take: limit,
    skip: offset,
    order: { display_order: "ASC", created_at: "DESC" },
  })

  const now = new Date()
  const active = rows.filter((r) => isCurrentlyActive(r, now))

  res.json({
    banners: active.map((r) => applyTranslation(r, locale)),
    count: active.length,
    total: count,
    limit,
    offset,
  })
}
