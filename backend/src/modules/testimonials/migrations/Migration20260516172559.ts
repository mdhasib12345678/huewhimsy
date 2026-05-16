import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260516172559 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "testimonial" ("id" text not null, "name" text not null, "role" text null, "quote" text not null, "rating" integer null, "avatar" text null, "location" text null, "display_order" integer not null default 0, "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft', "translations" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "testimonial_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_testimonial_deleted_at" ON "testimonial" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "testimonial" cascade;`);
  }

}
