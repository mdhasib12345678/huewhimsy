import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260517000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "service_offering" (
        "id" text not null,
        "slug" text not null,
        "name" text not null,
        "short_description" text null,
        "description" text not null,
        "icon" text null,
        "cover_image" text null,
        "pricing_tiers" jsonb null,
        "features" jsonb null,
        "display_order" integer not null default 0,
        "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft',
        "meta_title" text null,
        "meta_description" text null,
        "og_image" text null,
        "translations" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "service_offering_pkey" primary key ("id")
      );
    `)
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_service_offering_slug_unique" ON "service_offering" ("slug") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_service_offering_deleted_at" ON "service_offering" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_service_offering_status_order" ON "service_offering" ("status", "display_order") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "service_offering" cascade;`)
  }
}
