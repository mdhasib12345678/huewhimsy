import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260517010000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "activity" (
        "id" text not null,
        "slug" text not null,
        "title" text not null,
        "description" text null,
        "file_url" text null,
        "thumbnail" text null,
        "category" text null,
        "age_range" text null,
        "pages" integer null,
        "requires_subscription" boolean not null default false,
        "display_order" integer not null default 0,
        "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft',
        "meta_title" text null,
        "meta_description" text null,
        "og_image" text null,
        "translations" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "activity_pkey" primary key ("id")
      );
    `)
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_activity_slug_unique" ON "activity" ("slug") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_activity_deleted_at" ON "activity" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_activity_status_order" ON "activity" ("status", "display_order") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_activity_category" ON "activity" ("category") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "activity" cascade;`)
  }
}
