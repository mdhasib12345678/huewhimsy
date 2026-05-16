import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260516230000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "hero_banner" (
        "id" text not null,
        "placement" text not null,
        "title" text not null,
        "subtitle" text null,
        "cta_label" text null,
        "cta_url" text null,
        "image" text null,
        "mobile_image" text null,
        "video_url" text null,
        "text_color" text null,
        "display_order" integer not null default 0,
        "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft',
        "active_from" timestamptz null,
        "active_until" timestamptz null,
        "translations" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "hero_banner_pkey" primary key ("id")
      );
    `)
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_hero_banner_deleted_at" ON "hero_banner" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_hero_banner_placement_status" ON "hero_banner" ("placement", "status", "display_order") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_hero_banner_active_range" ON "hero_banner" ("active_from", "active_until") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "hero_banner" cascade;`)
  }
}
