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
import { Tag } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type ServiceRow = {
  id: string
  slug: string
  name: string
  short_description: string | null
  description: string
  icon: string | null
  cover_image: string | null
  pricing_tiers: any
  features: any
  display_order: number
  status: "draft" | "published" | "archived"
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  created_at: string
  updated_at: string
}

const EMPTY: Partial<ServiceRow> = {
  slug: "",
  name: "",
  short_description: "",
  description: "",
  icon: "",
  cover_image: "",
  pricing_tiers: [],
  features: [],
  display_order: 0,
  status: "draft",
  meta_title: "",
  meta_description: "",
  og_image: "",
}

const ServicesAdminPage = () => {
  const [items, setItems] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<ServiceRow>>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pricingText, setPricingText] = useState("[]")
  const [featuresText, setFeaturesText] = useState("[]")

  const refresh = async () => {
    setLoading(true)
    try {
      const r = await fetch("/admin/services?limit=500", {
        credentials: "include",
      })
      const json = await r.json()
      setItems(json.services ?? [])
    } catch {
      toast.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const setField = <K extends keyof ServiceRow>(k: K, v: ServiceRow[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const startEdit = (s: ServiceRow) => {
    setEditingId(s.id)
    setForm(s)
    setPricingText(JSON.stringify(s.pricing_tiers ?? [], null, 2))
    setFeaturesText(JSON.stringify(s.features ?? [], null, 2))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
    setPricingText("[]")
    setFeaturesText("[]")
  }

  const save = async () => {
    if (!form.slug || !form.name || !form.description) {
      toast.error("slug, name, description required")
      return
    }
    let pricing_tiers: any = []
    let features: any = []
    try {
      pricing_tiers = pricingText ? JSON.parse(pricingText) : []
      features = featuresText ? JSON.parse(featuresText) : []
    } catch {
      toast.error("Pricing/features must be valid JSON")
      return
    }
    const payload = {
      ...form,
      pricing_tiers,
      features,
      display_order: Number(form.display_order ?? 0),
    }
    setLoading(true)
    try {
      const url = editingId
        ? `/admin/services/${editingId}`
        : `/admin/services`
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
    if (!confirm("Delete this service permanently?")) return
    setLoading(true)
    try {
      await fetch(`/admin/services/${id}`, {
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
        <Heading level="h1">Services</Heading>
        {editingId && (
          <Button variant="secondary" onClick={cancelEdit}>
            Cancel edit
          </Button>
        )}
      </div>

      <div className="px-6 py-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">Service name *</Label>
          <Input
            id="name"
            value={form.name ?? ""}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Website Design"
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
            placeholder="website-design"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="short_description">Short description (1-line)</Label>
          <Input
            id="short_description"
            value={form.short_description ?? ""}
            onChange={(e) => setField("short_description", e.target.value)}
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="description">Full description *</Label>
          <Textarea
            id="description"
            rows={6}
            value={form.description ?? ""}
            onChange={(e) => setField("description", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="icon">Icon name (lucide name)</Label>
          <Input
            id="icon"
            value={form.icon ?? ""}
            onChange={(e) => setField("icon", e.target.value)}
            placeholder="Palette"
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

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="pricing_tiers">
            Pricing tiers JSON (array of {`{label, price_amount, currency, features:[]}`})
          </Label>
          <Textarea
            id="pricing_tiers"
            rows={6}
            value={pricingText}
            onChange={(e) => setPricingText(e.target.value)}
            placeholder='[{"label":"Starter","price_amount":4999,"currency":"usd","features":["10 pages","Logo design"]}]'
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="features">Features JSON (string array)</Label>
          <Textarea
            id="features"
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder='["Responsive","Mobile-friendly","SEO ready"]'
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
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status ?? "draft"}
            onValueChange={(v) => setField("status", v as ServiceRow["status"])}
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
            {editingId ? "Save changes" : "Create service"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        <Heading level="h2">All services ({items.length})</Heading>
      </div>
      <div className="px-6 pb-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Slug</Table.HeaderCell>
              <Table.HeaderCell>Tiers</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedItems.map((s) => (
              <Table.Row key={s.id}>
                <Table.Cell className="text-ui-fg-subtle font-mono text-xs">
                  {s.display_order}
                </Table.Cell>
                <Table.Cell className="font-medium">{s.name}</Table.Cell>
                <Table.Cell className="text-ui-fg-subtle font-mono text-xs">
                  /{s.slug}
                </Table.Cell>
                <Table.Cell>
                  {Array.isArray(s.pricing_tiers) ? s.pricing_tiers.length : 0}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      s.status === "published"
                        ? "green"
                        : s.status === "draft"
                          ? "grey"
                          : "orange"
                    }
                  >
                    {s.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => startEdit(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => remove(s.id)}
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
                  colSpan={6}
                  className="text-center text-ui-fg-subtle py-8"
                >
                  No services yet. Use the form above to add your first.
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
  label: "Services",
  icon: Tag,
})

export default ServicesAdminPage
