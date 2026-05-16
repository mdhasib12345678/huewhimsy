import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260516220000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "faq_entry" (
        "id" text not null,
        "question" text not null,
        "answer" text not null,
        "category" text null,
        "display_order" integer not null default 0,
        "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft',
        "translations" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "faq_entry_pkey" primary key ("id")
      );
    `)
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_faq_entry_deleted_at" ON "faq_entry" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_faq_entry_status_order" ON "faq_entry" ("status", "display_order") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "faq_entry" cascade;`)
  }
}
