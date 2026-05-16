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
import { ChatBubbleLeftRight, Star } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type Endorsement = {
  id: string
  name: string
  role: string | null
  quote: string
  rating: number | null
  avatar: string | null
  location: string | null
  display_order: number
  status: "draft" | "published" | "archived"
  created_at: string
  updated_at: string
}

const EMPTY: Partial<Endorsement> = {
  name: "",
  role: "",
  quote: "",
  rating: 5,
  avatar: "",
  location: "",
  display_order: 0,
  status: "draft",
}

const EndorsementsAdminPage = () => {
  const [items, setItems] = useState<Endorsement[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<Endorsement>>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const r = await fetch("/admin/endorsements?limit=500", {
        credentials: "include",
      })
      const json = await r.json()
      setItems(json.endorsements ?? [])
    } catch {
      toast.error("Failed to load testimonials")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const setField = <K extends keyof Endorsement>(k: K, v: Endorsement[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const startEdit = (t: Endorsement) => {
    setEditingId(t.id)
    setForm(t)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
  }

  const save = async () => {
    if (!form.name || !form.quote) {
      toast.error("name and quote are required")
      return
    }
    const payload = {
      ...form,
      rating:
        form.rating !== undefined && form.rating !== null
          ? Number(form.rating)
          : null,
      display_order: Number(form.display_order ?? 0),
    }
    setLoading(true)
    try {
      const url = editingId
        ? `/admin/endorsements/${editingId}`
        : `/admin/endorsements`
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
    if (!confirm("Delete this testimonial permanently?")) return
    setLoading(true)
    try {
      await fetch(`/admin/endorsements/${id}`, {
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
        <Heading level="h1">Testimonials</Heading>
        {editingId && (
          <Button variant="secondary" onClick={cancelEdit}>
            Cancel edit
          </Button>
        )}
      </div>

      <div className="px-6 py-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name ?? ""}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Sarah Johnson"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="role">Role / Relation</Label>
          <Input
            id="role"
            value={form.role ?? ""}
            onChange={(e) => setField("role", e.target.value)}
            placeholder="Parent of Jamie (age 5)"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="quote">Quote *</Label>
          <Textarea
            id="quote"
            rows={4}
            value={form.quote ?? ""}
            onChange={(e) => setField("quote", e.target.value)}
            placeholder="My daughter loves the Alphabet Fun books..."
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="5"
            value={form.rating ?? ""}
            onChange={(e) =>
              setField(
                "rating",
                e.target.value ? (Number(e.target.value) as any) : (null as any),
              )
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={form.location ?? ""}
            onChange={(e) => setField("location", e.target.value)}
            placeholder="Brooklyn, NY"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="avatar">Avatar image URL</Label>
          <Input
            id="avatar"
            value={form.avatar ?? ""}
            onChange={(e) => setField("avatar", e.target.value)}
            placeholder="https://huewhimsy.com/files/..."
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="display_order">Display order (0 = first)</Label>
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

        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status ?? "draft"}
            onValueChange={(v) => setField("status", v as Endorsement["status"])}
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
            {editingId ? "Save changes" : "Create testimonial"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        <Heading level="h2">All testimonials ({items.length})</Heading>
      </div>
      <div className="px-6 pb-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Rating</Table.HeaderCell>
              <Table.HeaderCell>Quote</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedItems.map((t) => (
              <Table.Row key={t.id}>
                <Table.Cell className="text-ui-fg-subtle font-mono text-xs">
                  {t.display_order}
                </Table.Cell>
                <Table.Cell className="font-medium">{t.name}</Table.Cell>
                <Table.Cell>{t.role ?? "—"}</Table.Cell>
                <Table.Cell>
                  {t.rating ? (
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {t.rating}
                    </span>
                  ) : (
                    "—"
                  )}
                </Table.Cell>
                <Table.Cell className="max-w-[300px] truncate">
                  {t.quote}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      t.status === "published"
                        ? "green"
                        : t.status === "draft"
                          ? "grey"
                          : "orange"
                    }
                  >
                    {t.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => startEdit(t)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => remove(t.id)}
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
                  No testimonials yet. Use the form above to add your first.
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
  label: "Testimonials",
  icon: ChatBubbleLeftRight,
})

export default EndorsementsAdminPage
