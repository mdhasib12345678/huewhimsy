import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { BLOG_MODULE } from "../../modules/blog"
import { SERVICES_MODULE } from "../../modules/services"
import { PAGES_MODULE } from "../../modules/pages"
import { ACTIVITIES_MODULE } from "../../modules/activities"

const SITE_URL = process.env.PUBLIC_SITE_URL || "https://huewhimsy.com"
const SUPPORTED_LOCALES = [
  "en", "es", "pt", "fr", "de", "it", "nl", "pl", "sv", "da", "no",
  "fi", "el", "zh-cn", "zh-tw", "ja", "ko", "hi", "ar", "tr", "vi", "id",
]

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: "daily" | "weekly" | "monthly"
  priority?: number
}

function alternates(path: string): string {
  return SUPPORTED_LOCALES.map((l) => {
    const href = l === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${l}${path === "/" ? "" : path}`
    return `    <xhtml:link rel="alternate" hreflang="${l}" href="${href}"/>`
  }).join("\n")
}

function buildXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${SITE_URL}${e.loc}</loc>
${alternates(e.loc)}
${e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : ""}
${e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : ""}
${e.priority !== undefined ? `    <priority>${e.priority.toFixed(1)}</priority>` : ""}
  </url>`,
    )
    .join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`
}

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const entries: SitemapEntry[] = [
    { loc: "/", changefreq: "daily", priority: 1.0 },
    { loc: "/library", changefreq: "weekly", priority: 0.9 },
    { loc: "/shop", changefreq: "weekly", priority: 0.9 },
    { loc: "/blog", changefreq: "weekly", priority: 0.8 },
    { loc: "/services", changefreq: "monthly", priority: 0.7 },
    { loc: "/free-activities", changefreq: "weekly", priority: 0.8 },
    { loc: "/about", changefreq: "monthly", priority: 0.5 },
    { loc: "/contact", changefreq: "monthly", priority: 0.5 },
    { loc: "/privacy", changefreq: "monthly", priority: 0.3 },
    { loc: "/terms", changefreq: "monthly", priority: 0.3 },
    { loc: "/refund", changefreq: "monthly", priority: 0.3 },
  ]

  try {
    const productSvc: any = req.scope.resolve(Modules.PRODUCT)
    const [products] = await productSvc.listAndCountProducts({ status: "published" }, { take: 1000 })
    for (const p of products) {
      entries.push({
        loc: `/shop/${p.handle}`,
        lastmod: p.updated_at,
        changefreq: "weekly",
        priority: 0.7,
      })
    }
  } catch {
    /* noop */
  }

  try {
    const blogSvc: any = req.scope.resolve(BLOG_MODULE)
    const [posts] = await blogSvc.listAndCountBlogPosts({ status: "published" }, { take: 1000 })
    for (const p of posts) {
      entries.push({
        loc: `/blog/${p.slug}`,
        lastmod: p.updated_at,
        changefreq: "monthly",
        priority: 0.6,
      })
    }
  } catch {
    /* noop */
  }

  try {
    const svc: any = req.scope.resolve(SERVICES_MODULE)
    const [services] = await svc.listAndCountServiceOfferings({ status: "published" }, { take: 200 })
    for (const s of services) {
      entries.push({
        loc: `/services/${s.slug}`,
        lastmod: s.updated_at,
        changefreq: "monthly",
        priority: 0.6,
      })
    }
  } catch {
    /* noop */
  }

  try {
    const svc: any = req.scope.resolve(PAGES_MODULE)
    const [pages] = await svc.listAndCountStaticPages({ status: "published" }, { take: 200 })
    for (const p of pages) {
      entries.push({
        loc: `/${p.slug}`,
        lastmod: p.updated_at,
        changefreq: "monthly",
        priority: 0.4,
      })
    }
  } catch {
    /* noop */
  }

  try {
    const svc: any = req.scope.resolve(ACTIVITIES_MODULE)
    const [acts] = await svc.listAndCountActivities({ status: "published" }, { take: 500 })
    for (const a of acts) {
      entries.push({
        loc: `/free-activities/${a.slug}`,
        lastmod: a.updated_at,
        changefreq: "monthly",
        priority: 0.5,
      })
    }
  } catch {
    /* noop */
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8")
  res.setHeader("Cache-Control", "public, max-age=3600")
  res.send(buildXml(entries))
}
