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
import { QuestionMarkCircle } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type Faq = {
  id: string
  question: string
  answer: string
  category: string | null
  display_order: number
  status: "draft" | "published" | "archived"
  created_at: string
  updated_at: string
}

const EMPTY: Partial<Faq> = {
  question: "",
  answer: "",
  category: "",
  display_order: 0,
  status: "draft",
}

const FaqAdminPage = () => {
  const [items, setItems] = useState<Faq[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<Faq>>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const r = await fetch("/admin/faq?limit=500", { credentials: "include" })
      const json = await r.json()
      setItems(json.faqs ?? [])
    } catch {
      toast.error("Failed to load FAQs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const setField = <K extends keyof Faq>(k: K, v: Faq[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const startEdit = (f: Faq) => {
    setEditingId(f.id)
    setForm(f)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
  }

  const save = async () => {
    if (!form.question || !form.answer) {
      toast.error("Question and answer required")
      return
    }
    const payload = {
      ...form,
      display_order: Number(form.display_order ?? 0),
    }
    setLoading(true)
    try {
      const url = editingId ? `/admin/faq/${editingId}` : `/admin/faq`
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
    if (!confirm("Delete this FAQ permanently?")) return
    setLoading(true)
    try {
      await fetch(`/admin/faq/${id}`, {
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
        <Heading level="h1">FAQ</Heading>
        {editingId && (
          <Button variant="secondary" onClick={cancelEdit}>
            Cancel edit
          </Button>
        )}
      </div>

      <div className="px-6 py-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="question">Question *</Label>
          <Input
            id="question"
            value={form.question ?? ""}
            onChange={(e) => setField("question", e.target.value)}
            placeholder="How long does shipping take?"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="answer">Answer *</Label>
          <Textarea
            id="answer"
            rows={5}
            value={form.answer ?? ""}
            onChange={(e) => setField("answer", e.target.value)}
            placeholder="Standard shipping takes 3-5 business days..."
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category ?? ""}
            onChange={(e) => setField("category", e.target.value)}
            placeholder="Shipping, Returns, Account..."
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

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status ?? "draft"}
            onValueChange={(v) => setField("status", v as Faq["status"])}
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
            {editingId ? "Save changes" : "Create FAQ"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        <Heading level="h2">All FAQs ({items.length})</Heading>
      </div>
      <div className="px-6 pb-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Question</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedItems.map((f) => (
              <Table.Row key={f.id}>
                <Table.Cell className="text-ui-fg-subtle font-mono text-xs">
                  {f.display_order}
                </Table.Cell>
                <Table.Cell className="max-w-[400px] truncate font-medium">
                  {f.question}
                </Table.Cell>
                <Table.Cell>{f.category ?? "—"}</Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      f.status === "published"
                        ? "green"
                        : f.status === "draft"
                          ? "grey"
                          : "orange"
                    }
                  >
                    {f.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => startEdit(f)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => remove(f.id)}
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
                  colSpan={5}
                  className="text-center text-ui-fg-subtle py-8"
                >
                  No FAQs yet. Use the form above to add your first.
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
  label: "FAQ",
  icon: QuestionMarkCircle,
})

export default FaqAdminPage
