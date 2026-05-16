import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260517020000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "newsletter_subscriber" (
        "id" text not null,
        "email" text not null,
        "name" text null,
        "locale" text not null default 'en',
        "source" text null,
        "status" text check ("status" in ('pending', 'confirmed', 'unsubscribed', 'bounced')) not null default 'pending',
        "confirmed_at" timestamptz null,
        "unsubscribed_at" timestamptz null,
        "tags" jsonb null,
        "ip_address" text null,
        "user_agent" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "newsletter_subscriber_pkey" primary key ("id")
      );
    `)
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_newsletter_subscriber_email_unique" ON "newsletter_subscriber" (lower("email")) WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_newsletter_subscriber_status" ON "newsletter_subscriber" ("status") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_newsletter_subscriber_source" ON "newsletter_subscriber" ("source") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_newsletter_subscriber_deleted_at" ON "newsletter_subscriber" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "newsletter_subscriber" cascade;`)
  }
}
