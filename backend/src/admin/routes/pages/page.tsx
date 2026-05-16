import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Button,
  Input,
  Textarea,
  Label,
  Select,
  Table,
  Badge,
  toast,
  Toaster,
} from "@medusajs/ui"
import { DocumentText } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type StaticPage = {
  id: string
  slug: string
  title: string
  body: string
  excerpt: string | null
  cover_image: string | null
  status: "draft" | "published" | "archived"
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  created_at: string
  updated_at: string
}

const EMPTY: Partial<StaticPage> = {
  slug: "",
  title: "",
  body: "",
  excerpt: "",
  cover_image: "",
  status: "draft",
  meta_title: "",
  meta_description: "",
  og_image: "",
}

const PagesAdminPage = () => {
  const [items, setItems] = useState<StaticPage[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<StaticPage>>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const r = await fetch("/admin/pages?limit=200", {
        credentials: "include",
      })
      const json = await r.json()
      setItems(json.pages ?? [])
    } catch {
      toast.error("Failed to load pages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const setField = <K extends keyof StaticPage>(k: K, v: StaticPage[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const startEdit = (p: StaticPage) => {
    setEditingId(p.id)
    setForm(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
  }

  const save = async () => {
    if (!form.slug || !form.title || !form.body) {
      toast.error("slug, title, body required")
      return
    }
    setLoading(true)
    try {
      const url = editingId ? `/admin/pages/${editingId}` : `/admin/pages`
      const r = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.message ?? "Save failed")
      }
      toast.success(editingId ? "Updated" : "Created")
      cancelEdit()
      refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this page permanently?")) return
    setLoading(true)
    try {
      await fetch(`/admin/pages/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      toast.success("Deleted")
      refresh()
    } catch {
      toast.error("Delete failed")
    } finally {
      setLoading(false)
    }
  }

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) =>
        (b.updated_at ?? "").localeCompare(a.updated_at ?? ""),
      ),
    [items],
  )

  const STARTERS: Array<{ slug: string; title: string }> = [
    { slug: "privacy", title: "Privacy Policy" },
    { slug: "terms", title: "Terms of Service" },
    { slug: "refund", title: "Refund Policy" },
    { slug: "about", title: "About Us" },
    { slug: "shipping", title: "Shipping Information" },
  ]

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Static Pages</Heading>
        {editingId && (
          <Button variant="secondary" onClick={cancelEdit}>
            Cancel edit
          </Button>
        )}
      </div>

      <div className="px-6 py-4 bg-ui-bg-subtle text-xs text-ui-fg-subtle">
        Common slugs the storefront uses:{" "}
        {STARTERS.map((s, i) => (
          <span key={s.slug}>
            <button
              className="underline hover:text-ui-fg-base"
              type="button"
              onClick={() => {
                setForm({ ...EMPTY, slug: s.slug, title: s.title })
                setEditingId(null)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            >
              /{s.slug}
            </button>
            {i < STARTERS.length - 1 ? " · " : ""}
          </span>
        ))}
      </div>

      <div className="px-6 py-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title ?? ""}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Privacy Policy"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={form.slug ?? ""}
            onChange={(e) =>
              setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))
            }
            placeholder="privacy"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="excerpt">Excerpt (short summary)</Label>
          <Textarea
            id="excerpt"
            rows={2}
            value={form.excerpt ?? ""}
            onChange={(e) => setField("excerpt", e.target.value)}
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="body">Body * (Markdown or HTML)</Label>
          <Textarea
            id="body"
            rows={18}
            value={form.body ?? ""}
            onChange={(e) => setField("body", e.target.value)}
            placeholder="## Heading\n\nYour content here..."
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cover_image">Cover image URL</Label>
          <Input
            id="cover_image"
            value={form.cover_image ?? ""}
            onChange={(e) => setField("cover_image", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status ?? "draft"}
            onValueChange={(v) => setField("status", v as StaticPage["status"])}
          >
            <Select.Trigger id="status">
              <Select.Value placeholder="Status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="draft">Draft</Select.Item>
              <Select.Item value="published">Published</Select.Item>
              <Select.Item value="archived">Archived</Select.Item>
            </Select.Content>
          </Select>
        </div>

        <div className="md:col-span-2 grid gap-4 md:grid-cols-2 pt-2 border-t">
          <div className="space-y-1">
            <Label htmlFor="meta_title">SEO meta title</Label>
            <Input
              id="meta_title"
              value={form.meta_title ?? ""}
              onChange={(e) => setField("meta_title", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="og_image">OG image URL</Label>
            <Input
              id="og_image"
              value={form.og_image ?? ""}
              onChange={(e) => setField("og_image", e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="meta_desc">SEO meta description</Label>
            <Textarea
              id="meta_desc"
              rows={2}
              value={form.meta_description ?? ""}
              onChange={(e) => setField("meta_description", e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
          <Button onClick={save} disabled={loading}>
            {editingId ? "Save changes" : "Create page"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        <Heading level="h2">All pages ({items.length})</Heading>
      </div>
      <div className="px-6 pb-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Slug</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Updated</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((p) => (
              <Table.Row key={p.id}>
                <Table.Cell className="font-medium">{p.title}</Table.Cell>
                <Table.Cell className="font-mono text-xs text-ui-fg-subtle">
                  /{p.slug}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      p.status === "published"
                        ? "green"
                        : p.status === "draft"
                          ? "grey"
                          : "orange"
                    }
                  >
                    {p.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="text-xs text-ui-fg-subtle">
                  {new Date(p.updated_at).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => remove(p.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
            {!sorted.length && !loading && (
              <Table.Row>
                <Table.Cell
                  colSpan={5}
                  className="text-center text-ui-fg-subtle py-8"
                >
                  No pages yet. Use the form above to create your first.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Pages",
  icon: DocumentText,
})

export default PagesAdminPage
