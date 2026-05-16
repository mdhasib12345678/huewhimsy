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
import { PictureSquare } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type Banner = {
  id: string
  placement: string
  title: string
  subtitle: string | null
  cta_label: string | null
  cta_url: string | null
  image: string | null
  mobile_image: string | null
  video_url: string | null
  text_color: string | null
  display_order: number
  status: "draft" | "published" | "archived"
  active_from: string | null
  active_until: string | null
  created_at: string
  updated_at: string
}

const EMPTY: Partial<Banner> = {
  placement: "home_hero",
  title: "",
  subtitle: "",
  cta_label: "",
  cta_url: "",
  image: "",
  mobile_image: "",
  video_url: "",
  text_color: "",
  display_order: 0,
  status: "draft",
  active_from: "",
  active_until: "",
}

const HeroAdminPage = () => {
  const [items, setItems] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<Banner>>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const r = await fetch("/admin/hero?limit=500", {
        credentials: "include",
      })
      const json = await r.json()
      setItems(json.banners ?? [])
    } catch {
      toast.error("Failed to load banners")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const setField = <K extends keyof Banner>(k: K, v: Banner[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const startEdit = (b: Banner) => {
    setEditingId(b.id)
    setForm({
      ...b,
      active_from: b.active_from ? b.active_from.slice(0, 16) : "",
      active_until: b.active_until ? b.active_until.slice(0, 16) : "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
  }

  const save = async () => {
    if (!form.placement || !form.title) {
      toast.error("Placement and title are required")
      return
    }
    const payload = {
      ...form,
      display_order: Number(form.display_order ?? 0),
      active_from: form.active_from || null,
      active_until: form.active_until || null,
    }
    setLoading(true)
    try {
      const url = editingId ? `/admin/hero/${editingId}` : `/admin/hero`
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
    if (!confirm("Delete this banner permanently?")) return
    setLoading(true)
    try {
      await fetch(`/admin/hero/${id}`, {
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
          a.placement.localeCompare(b.placement) ||
          a.display_order - b.display_order ||
          b.created_at.localeCompare(a.created_at),
      ),
    [items],
  )

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Hero Banners</Heading>
        {editingId && (
          <Button variant="secondary" onClick={cancelEdit}>
            Cancel edit
          </Button>
        )}
      </div>

      <div className="px-6 py-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="placement">Placement * (e.g. home_hero)</Label>
          <Input
            id="placement"
            value={form.placement ?? ""}
            onChange={(e) => setField("placement", e.target.value)}
            placeholder="home_hero"
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

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title ?? ""}
            onChange={(e) => setField("title", e.target.value)}
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Textarea
            id="subtitle"
            rows={2}
            value={form.subtitle ?? ""}
            onChange={(e) => setField("subtitle", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cta_label">CTA Label</Label>
          <Input
            id="cta_label"
            value={form.cta_label ?? ""}
            onChange={(e) => setField("cta_label", e.target.value)}
            placeholder="Shop Now"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cta_url">CTA URL</Label>
          <Input
            id="cta_url"
            value={form.cta_url ?? ""}
            onChange={(e) => setField("cta_url", e.target.value)}
            placeholder="/shop"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="image">Image URL (desktop)</Label>
          <Input
            id="image"
            value={form.image ?? ""}
            onChange={(e) => setField("image", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mobile_image">Image URL (mobile)</Label>
          <Input
            id="mobile_image"
            value={form.mobile_image ?? ""}
            onChange={(e) => setField("mobile_image", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="video_url">Video URL (optional)</Label>
          <Input
            id="video_url"
            value={form.video_url ?? ""}
            onChange={(e) => setField("video_url", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="text_color">Text color (hex, optional)</Label>
          <Input
            id="text_color"
            value={form.text_color ?? ""}
            onChange={(e) => setField("text_color", e.target.value)}
            placeholder="#0a0a0a"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="active_from">Active from (optional)</Label>
          <Input
            id="active_from"
            type="datetime-local"
            value={form.active_from ?? ""}
            onChange={(e) => setField("active_from", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="active_until">Active until (optional)</Label>
          <Input
            id="active_until"
            type="datetime-local"
            value={form.active_until ?? ""}
            onChange={(e) => setField("active_until", e.target.value)}
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status ?? "draft"}
            onValueChange={(v) => setField("status", v as Banner["status"])}
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

        <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
          <Button onClick={save} disabled={loading}>
            {editingId ? "Save changes" : "Create banner"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        <Heading level="h2">All banners ({items.length})</Heading>
      </div>
      <div className="px-6 pb-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Placement</Table.HeaderCell>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>CTA</Table.HeaderCell>
              <Table.HeaderCell>Active window</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedItems.map((b) => (
              <Table.Row key={b.id}>
                <Table.Cell className="font-mono text-xs">
                  {b.placement}
                </Table.Cell>
                <Table.Cell>{b.display_order}</Table.Cell>
                <Table.Cell className="font-medium max-w-[260px] truncate">
                  {b.title}
                </Table.Cell>
                <Table.Cell className="text-ui-fg-subtle truncate max-w-[180px]">
                  {b.cta_label ? `${b.cta_label} -> ${b.cta_url}` : "—"}
                </Table.Cell>
                <Table.Cell className="text-xs text-ui-fg-subtle">
                  {b.active_from
                    ? new Date(b.active_from).toLocaleDateString()
                    : "any"}
                  {" → "}
                  {b.active_until
                    ? new Date(b.active_until).toLocaleDateString()
                    : "any"}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      b.status === "published"
                        ? "green"
                        : b.status === "draft"
                          ? "grey"
                          : "orange"
                    }
                  >
                    {b.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => startEdit(b)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => remove(b.id)}
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
                  colSpan={7}
                  className="text-center text-ui-fg-subtle py-8"
                >
                  No banners yet. Use the form above to create your first.
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
  label: "Hero Banners",
  icon: PictureSquare,
})

export default HeroAdminPage
