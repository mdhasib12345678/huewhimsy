import { Migration } from "@mikro-orm/migrations"

export class Migration20260516130000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "testimonial" (
        "id" text NOT NULL,
        "name" text NOT NULL,
        "role" text NULL,
        "quote" text NOT NULL,
        "rating" integer NULL,
        "avatar" text NULL,
        "location" text NULL,
        "display_order" integer NOT NULL DEFAULT 0,
        "status" text CHECK ("status" IN ('draft', 'published', 'archived')) NOT NULL DEFAULT 'draft',
        "translations" jsonb NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "PK_testimonial_id" PRIMARY KEY ("id"),
        CONSTRAINT "CK_testimonial_rating_range" CHECK ("rating" IS NULL OR ("rating" BETWEEN 1 AND 5))
      );
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_testimonial_status_order"
      ON "testimonial" ("status", "display_order")
      WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_testimonial_deleted_at"
      ON "testimonial" ("deleted_at");
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "testimonial" CASCADE;`)
  }
}
