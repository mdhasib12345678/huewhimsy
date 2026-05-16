# HueWhimsy Production Launch Checklist

After Phases 1-8 land, this checklist guides the cutover to a real, customer-ready store. Each step is either a one-time CMS action in `/studio` or a credential change in `.env.production` on the VPS.

---

## Phase 9 — Real catalog + production cutover

### 9.1 Real product catalog
- [ ] Log in to https://huewhimsy.com/studio
- [ ] Products → Create each real HueWhimsy book/product (title, handle, description, images, variants, prices, inventory, sales channel = huewhimsy)
- [ ] Categories → Create top-level taxonomy: Books, Educational Toys, Coloring Supplies, etc.
- [ ] Sales Channels → confirm `huewhimsy` channel has all real products assigned

### 9.2 Real CMS content
- [ ] Blog → publish 3-5 launch posts (phonics tips, behind-the-scenes, free pack announcement)
- [ ] Testimonials → seed 5-10 real parent quotes with ratings (status=published, ordered)
- [ ] FAQ → add 8-15 entries (Shipping, Returns, Age recommendations, Digital downloads, Bulk orders)
- [ ] Hero Banners → create `home_hero` placement (title, subtitle, CTA, image, active_from/until window if seasonal)
- [ ] Services → create real service offerings (Website Design, Custom Illustration, Book Design, etc.) with real pricing tiers
- [ ] Free Activities → upload first 5 PDFs (set requires_subscription=true for premium content)
- [ ] Pages → create `privacy`, `terms`, `refund`, `shipping`, `about` — full legal copy reviewed by counsel

### 9.3 Stripe live mode
- [ ] Stripe Dashboard → Switch from Test to Live
- [ ] Copy live `STRIPE_SECRET_KEY` (sk_live_...) into VPS `.env.production`
- [ ] Create Webhook endpoint: https://huewhimsy.com/hooks/stripe (events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`)
- [ ] Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`
- [ ] Restart backend: `docker compose -f docker-compose.prod.yml restart backend`
- [ ] Test with real card (small amount, refund immediately)

### 9.4 Resend transactional email
- [ ] Sign up at https://resend.com (free 3000/mo)
- [ ] Add domain `huewhimsy.com` → copy DKIM + SPF + DMARC DNS records to Cloudflare/Hostinger DNS
- [ ] Wait ~10 min for DNS propagation
- [ ] Verify domain is "Verified" in Resend
- [ ] Copy `RESEND_API_KEY` (re_...) into `.env.production`
- [ ] Set `RESEND_FROM_EMAIL=HueWhimsy <noreply@huewhimsy.com>`
- [ ] Set `CONTACT_ADMIN_EMAIL=hasib107040@gmail.com` (or company inbox)
- [ ] Restart backend
- [ ] Test by submitting `/store/contact` form on storefront → admin receives the alert email; customer receives receipt

### 9.5 Cloudflare R2 file storage
- [ ] Cloudflare Dashboard → R2 → Create Bucket: `huewhimsy-media` (Public access enabled OR custom domain)
- [ ] Create R2 API Token: scope = Object Read/Write on `huewhimsy-media`
- [ ] Copy into VPS `.env.production`:
  - `S3_ACCESS_KEY_ID=<token id>`
  - `S3_SECRET_ACCESS_KEY=<token secret>`
  - `S3_BUCKET=huewhimsy-media`
  - `S3_REGION=auto`
  - `S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
  - `S3_FILE_URL=https://files.huewhimsy.com` (custom CNAME pointed at R2 bucket)
- [ ] Restart backend
- [ ] Upload a test image via `/studio/products/<id>` → verify URL is on `files.huewhimsy.com`

### 9.6 Cloudflare front (CDN + DDoS + WAF)
- [ ] Cloudflare → Add site `huewhimsy.com`
- [ ] Update Hostinger registrar nameservers to Cloudflare's two NS values → wait for activation (~10 min)
- [ ] SSL/TLS mode = Full (Strict)
- [ ] Speed → Polish = Lossless, Brotli on
- [ ] Caching → Browser TTL = 4 hours; Page Rules: `/assets/*` → Cache everything 1 year; `/sitemap.xml` → bypass
- [ ] Security → WAF managed ruleset = OWASP Core + Cloudflare Managed
- [ ] Workers (optional) → Image Resizing for `/files/*`

---

## Phase 10 — Final QA + Launch

### 10.1 Cross-browser smoke
- [ ] Chrome desktop: full purchase flow (browse → add to cart → checkout → confirmation email)
- [ ] Safari desktop: same
- [ ] Firefox desktop: same
- [ ] Mobile Safari (iPhone): same
- [ ] Mobile Chrome (Android): same
- [ ] Test 22-language switcher → URL prefix swaps + content stays correct

### 10.2 Accessibility audit
- [ ] Run axe-core via browser DevTools on Home, Shop, ProductDetails, Checkout — fix any critical violations
- [ ] Keyboard nav: Tab through full home page, all interactive elements visible focus rings
- [ ] Screen reader spot-check (VoiceOver on Mac or NVDA on Windows): hero, nav, product card, form

### 10.3 Performance audit
- [ ] Lighthouse on Home (Mobile, Fast 3G simulated) → target ≥ 90 perf, ≥ 95 SEO, ≥ 95 a11y
- [ ] Lighthouse on Shop → same
- [ ] Lighthouse on ProductDetails → same
- [ ] WebPageTest from EU + US + AU locations → verify CDN delivery
- [ ] Targets: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms

### 10.4 Security audit
- [ ] Mozilla Observatory: https://observatory.mozilla.org/analyze/huewhimsy.com → target ≥ A
- [ ] Qualys SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=huewhimsy.com → A or A+
- [ ] CSP report-only → after 7 days with no violations, swap to enforced
- [ ] Run penetration test on `/admin`, `/auth`, payment flow (manual)

### 10.5 SEO smoke
- [ ] View source on Home — confirm `<title>`, `<meta description>`, OG tags, JSON-LD Organization + WebSite
- [ ] Visit https://huewhimsy.com/sitemap.xml → all entries listed with hreflang
- [ ] https://huewhimsy.com/robots.txt → correct
- [ ] https://huewhimsy.com/llms.txt → correct
- [ ] Google Rich Results Test on a product page + blog post → no errors
- [ ] Submit sitemap to Google Search Console + Bing Webmaster Tools

### 10.6 Monitoring 7-day green
- [ ] Confirm GitHub Actions `External Uptime Probe` workflow ran every 15 min for 7 days with zero failures
- [ ] Confirm `Backup Verification` workflow ran daily for 7 days with zero failures
- [ ] Confirm `/var/log/huewhimsy-health.log` has no recurring FAIL/ERROR entries
- [ ] Confirm daily-digest email arriving cleanly at 06:00 UTC

### 10.7 Launch announcement
- [ ] Social: Instagram, Pinterest, Twitter, LinkedIn — pinned launch post
- [ ] Email blast to newsletter subscribers (via Resend audience)
- [ ] Press: send to 3-5 children's-book / parenting newsletters
- [ ] Update memory: `live_launch_date.md` with date + first-week metrics
