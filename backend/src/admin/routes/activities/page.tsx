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
  Switch,
} from "@medusajs/ui"
import { DocumentText } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type Activity = {
  id: string
  slug: string
  title: string
  description: string | null
  file_url: string | null
  thumbnail: string | null
  category: string | null
  age_range: string | null
  pages: number | null
  requires_subscription: boolean
  display_order: number
  status: "draft" | "published" | "archived"
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  created_at: string
  updated_at: string
}

const EMPTY: Partial<Activity> = {
  slug: "",
  title: "",
  description: "",
  file_url: "",
  thumbnail: "",
  category: "",
  age_range: "",
  pages: undefined,
  requires_subscription: false,
  display_order: 0,
  status: "draft",
  meta_title: "",
  meta_description: "",
  og_image: "",
}

const ActivitiesAdminPage = () => {
  const [items, setItems] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<Activity>>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const r = await fetch("/admin/activities?limit=500", {
        credentials: "include",
      })
      const json = await r.json()
      setItems(json.activities ?? [])
    } catch {
      toast.error("Failed to load activities")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const setField = <K extends keyof Activity>(k: K, v: Activity[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const startEdit = (a: Activity) => {
    setEditingId(a.id)
    setForm(a)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
  }

  const save = async () => {
    if (!form.slug || !form.title) {
      toast.error("slug and title are required")
      return
    }
    const payload = {
      ...form,
      pages: form.pages ? Number(form.pages) : null,
      display_order: Number(form.display_order ?? 0),
    }
    setLoading(true)
    try {
      const url = editingId
        ? `/admin/activities/${editingId}`
        : `/admin/activities`
      const r = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
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
    if (!confirm("Delete this activity permanently?")) return
    setLoading(true)
    try {
      await fetch(`/admin/activities/${id}`, {
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

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          a.display_order - b.display_order ||
          b.created_at.localeCompare(a.created_at),
      ),
    [items],
  )

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Free Activities</Heading>
        {editingId && (
          <Button variant="secondary" onClick={cancelEdit}>
            Cancel edit
          </Button>
        )}
      </div>

      <div className="px-6 py-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title ?? ""}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Alphabet Coloring Pack"
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
            placeholder="alphabet-coloring-pack"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={form.description ?? ""}
            onChange={(e) => setField("description", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="file_url">File URL (PDF or ZIP)</Label>
          <Input
            id="file_url"
            value={form.file_url ?? ""}
            onChange={(e) => setField("file_url", e.target.value)}
            placeholder="https://huewhimsy.com/files/alphabet.pdf"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input
            id="thumbnail"
            value={form.thumbnail ?? ""}
            onChange={(e) => setField("thumbnail", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category ?? ""}
            onChange={(e) => setField("category", e.target.value)}
            placeholder="Coloring, Flashcards, Worksheets"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="age_range">Age range</Label>
          <Input
            id="age_range"
            value={form.age_range ?? ""}
            onChange={(e) => setField("age_range", e.target.value)}
            placeholder="3-5"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pages">Page count</Label>
          <Input
            id="pages"
            type="number"
            min="1"
            value={form.pages ?? ""}
            onChange={(e) =>
              setField("pages", e.target.value ? (Number(e.target.value) as any) : (null as any))
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="display_order">Display order</Label>
          <Input
            id="display_order"
            type="number"
            min="0"
            value={form.display_order ?? 0}
            onChange={(e) =>
              setField("display_order", Number(e.target.value) as any)
            }
          />
        </div>

        <div className="space-y-1 flex items-center gap-3 mt-6">
          <Switch
            id="requires_subscription"
            checked={!!form.requires_subscription}
            onCheckedChange={(v) =>
              setField("requires_subscription", v as any)
            }
          />
          <Label htmlFor="requires_subscription" className="cursor-pointer">
            Requires newsletter subscription to download
          </Label>
        </div>

        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status ?? "draft"}
            onValueChange={(v) => setField("status", v as Activity["status"])}
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
            {editingId ? "Save changes" : "Create activity"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        <Heading level="h2">All activities ({items.length})</Heading>
      </div>
      <div className="px-6 pb-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Age</Table.HeaderCell>
              <Table.HeaderCell>Pages</Table.HeaderCell>
              <Table.HeaderCell>Gated</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedItems.map((a) => (
              <Table.Row key={a.id}>
                <Table.Cell className="text-ui-fg-subtle font-mono text-xs">
                  {a.display_order}
                </Table.Cell>
                <Table.Cell className="font-medium">{a.title}</Table.Cell>
                <Table.Cell>{a.category ?? "—"}</Table.Cell>
                <Table.Cell>{a.age_range ?? "—"}</Table.Cell>
                <Table.Cell>{a.pages ?? "—"}</Table.Cell>
                <Table.Cell>
                  {a.requires_subscription ? (
                    <Badge color="orange">Sub</Badge>
                  ) : (
                    <Badge color="green">Free</Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      a.status === "published"
                        ? "green"
                        : a.status === "draft"
                          ? "grey"
                          : "orange"
                    }
                  >
                    {a.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => startEdit(a)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => remove(a.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
            {!sortedItems.length && !loading && (
              <Table.Row>
                <Table.Cell
                  colSpan={8}
                  className="text-center text-ui-fg-subtle py-8"
                >
                  No activities yet.
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
  label: "Free Activities",
  icon: DocumentText,
})

export default ActivitiesAdminPage
