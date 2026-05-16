import { Migration } from "@mikro-orm/migrations"

export class Migration20260516120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "blog_post" (
        "id" text NOT NULL,
        "slug" text NOT NULL,
        "title" text NOT NULL,
        "excerpt" text NULL,
        "body" text NOT NULL,
        "cover_image" text NULL,
        "author_name" text NULL,
        "author_avatar" text NULL,
        "category" text NULL,
        "tags" jsonb NULL,
        "read_time_minutes" integer NULL,
        "status" text CHECK ("status" IN ('draft', 'published', 'archived')) NOT NULL DEFAULT 'draft',
        "published_at" timestamptz NULL,
        "meta_title" text NULL,
        "meta_description" text NULL,
        "og_image" text NULL,
        "translations" jsonb NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "PK_blog_post_id" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blog_post_slug_unique"
      ON "blog_post" ("slug")
      WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_blog_post_status_published_at"
      ON "blog_post" ("status", "published_at" DESC)
      WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_blog_post_category"
      ON "blog_post" ("category")
      WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_blog_post_deleted_at"
      ON "blog_post" ("deleted_at");
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "blog_post" CASCADE;`)
  }
}
