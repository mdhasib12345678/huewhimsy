import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260517060000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "static_page" (
        "id" text not null,
        "slug" text not null,
        "title" text not null,
        "body" text not null,
        "excerpt" text null,
        "cover_image" text null,
        "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft',
        "published_at" timestamptz null,
        "meta_title" text null,
        "meta_description" text null,
        "og_image" text null,
        "translations" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "static_page_pkey" primary key ("id")
      );
    `)
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_static_page_slug_unique" ON "static_page" ("slug") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_static_page_status_published" ON "static_page" ("status", "published_at" DESC) WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_static_page_deleted_at" ON "static_page" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "static_page" cascade;`)
  }
}
