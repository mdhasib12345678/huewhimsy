import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260516210754 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "endorsement" ("id" text not null, "name" text not null, "role" text null, "quote" text not null, "rating" integer null, "avatar" text null, "location" text null, "display_order" integer not null default 0, "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft', "translations" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "endorsement_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_endorsement_deleted_at" ON "endorsement" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "endorsement" cascade;`);
  }

}
