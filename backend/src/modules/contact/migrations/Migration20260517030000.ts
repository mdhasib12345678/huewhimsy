import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260517030000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "contact_submission" (
        "id" text not null,
        "name" text not null,
        "email" text not null,
        "phone" text null,
        "subject" text null,
        "message" text not null,
        "status" text check ("status" in ('new', 'in_progress', 'resolved', 'spam')) not null default 'new',
        "assigned_to" text null,
        "admin_notes" text null,
        "ip_address" text null,
        "user_agent" text null,
        "page_url" text null,
        "locale" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "contact_submission_pkey" primary key ("id")
      );
    `)
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_contact_submission_status_created" ON "contact_submission" ("status", "created_at" DESC) WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_contact_submission_email" ON "contact_submission" (lower("email")) WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_contact_submission_deleted_at" ON "contact_submission" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "contact_submission" cascade;`)
  }
}
