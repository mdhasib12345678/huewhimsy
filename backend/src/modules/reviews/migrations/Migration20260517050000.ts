import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260517050000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "product_review" (
        "id" text not null,
        "product_id" text not null,
        "customer_id" text null,
        "author_name" text not null,
        "author_email" text null,
        "rating" integer not null,
        "title" text null,
        "body" text not null,
        "status" text check ("status" in ('pending', 'approved', 'rejected', 'spam')) not null default 'pending',
        "helpful_count" integer not null default 0,
        "reply" text null,
        "reply_at" timestamptz null,
        "ip_address" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "product_review_pkey" primary key ("id"),
        constraint "product_review_rating_check" check ("rating" between 1 and 5)
      );
    `)
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_review_customer_product_unique" ON "product_review" ("customer_id", "product_id") WHERE deleted_at IS NULL AND customer_id IS NOT NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_product_review_product_status" ON "product_review" ("product_id", "status") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_product_review_status_created" ON "product_review" ("status", "created_at" DESC) WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_product_review_deleted_at" ON "product_review" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_review" cascade;`)
  }
}
