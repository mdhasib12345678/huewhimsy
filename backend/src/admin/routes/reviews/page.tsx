import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Button,
  Input,
  Label,
  Select,
  Table,
  Badge,
  Textarea,
  toast,
  Toaster,
} from "@medusajs/ui"
import { Star } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type Review = {
  id: string
  product_id: string
  customer_id: string | null
  author_name: string
  author_email: string | null
  rating: number
  title: string | null
  body: string
  status: "pending" | "approved" | "rejected" | "spam"
  helpful_count: number
  reply: string | null
  reply_at: string | null
  created_at: string
}

const ReviewsAdminPage = () => {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [productFilter, setProductFilter] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Review | null>(null)
  const [replyDraft, setReplyDraft] = useState("")

  const refresh = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set("limit", "500")
      if (statusFilter) qs.set("status", statusFilter)
      if (productFilter.trim()) qs.set("product_id", productFilter.trim())
      const r = await fetch(`/admin/reviews?${qs.toString()}`, {
        credentials: "include",
      })
      const json = await r.json()
      setItems(json.reviews ?? [])
    } catch {
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [statusFilter, productFilter])

  const setStatus = async (id: string, status: Review["status"]) => {
    setLoading(true)
    try {
      await fetch(`/admin/reviews/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      })
      toast.success("Status updated")
      refresh()
      if (selected?.id === id) setSelected({ ...selected, status })
    } catch {
      toast.error("Update failed")
    } finally {
      setLoading(false)
    }
  }

  const saveReply = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await fetch(`/admin/reviews/${selected.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reply: replyDraft || null }),
      })
      toast.success("Reply saved")
      refresh()
      setSelected({
        ...selected,
        reply: replyDraft || null,
        reply_at: replyDraft ? new Date().toISOString() : null,
      })
    } catch {
      toast.error("Save failed")
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return
    setLoading(true)
    try {
      await fetch(`/admin/reviews/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      toast.success("Deleted")
      if (selected?.id === id) setSelected(null)
      refresh()
    } catch {
      toast.error("Delete failed")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase().trim()
    return items.filter(
      (r) =>
        r.author_name.toLowerCase().includes(q) ||
        (r.title ?? "").toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q),
    )
  }, [items, search])

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Product Reviews</Heading>
        <div className="text-sm text-ui-fg-subtle">
          {items.length} shown
        </div>
      </div>

      <div className="px-6 py-4 flex flex-wrap items-end gap-4 bg-ui-bg-subtle">
        <div className="space-y-1">
          <Label htmlFor="status_filter">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
          >
            <Select.Trigger id="status_filter" className="w-[160px]">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All</Select.Item>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="approved">Approved</Select.Item>
              <Select.Item value="rejected">Rejected</Select.Item>
              <Select.Item value="spam">Spam</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="product_filter">Product ID</Label>
          <Input
            id="product_filter"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            placeholder="prod_..."
          />
        </div>
        <div className="space-y-1 flex-1 max-w-md">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="author / title / body"
          />
        </div>
      </div>

      <div className="px-6 py-4 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Rating</Table.HeaderCell>
                <Table.HeaderCell>Author</Table.HeaderCell>
                <Table.HeaderCell>Title / Body</Table.HeaderCell>
                <Table.HeaderCell>Product</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.map((r) => (
                <Table.Row
                  key={r.id}
                  className={
                    selected?.id === r.id
                      ? "bg-ui-bg-base-hover cursor-pointer"
                      : "cursor-pointer"
                  }
                  onClick={() => {
                    setSelected(r)
                    setReplyDraft(r.reply ?? "")
                  }}
                >
                  <Table.Cell>
                    <Badge
                      color={
                        r.status === "approved"
                          ? "green"
                          : r.status === "pending"
                            ? "blue"
                            : r.status === "rejected"
                              ? "orange"
                              : "red"
                      }
                    >
                      {r.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {r.rating}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{r.author_name}</Table.Cell>
                  <Table.Cell className="max-w-[300px] truncate">
                    <span className="font-medium">{r.title ?? ""}</span>
                    {r.title ? " — " : ""}
                    <span className="text-ui-fg-subtle">{r.body}</span>
                  </Table.Cell>
                  <Table.Cell className="font-mono text-xs text-ui-fg-subtle">
                    {r.product_id}
                  </Table.Cell>
                </Table.Row>
              ))}
              {!filtered.length && !loading && (
                <Table.Row>
                  <Table.Cell
                    colSpan={5}
                    className="text-center text-ui-fg-subtle py-8"
                  >
                    No reviews matching filters.
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>

        <div className="lg:col-span-1">
          {selected ? (
            <div className="space-y-4 sticky top-4 bg-ui-bg-base p-4 rounded-lg border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{selected.author_name}</div>
                  <div className="text-xs text-ui-fg-subtle font-mono">
                    {selected.author_email ?? "(no email)"}
                  </div>
                  <div className="text-xs text-ui-fg-subtle">
                    {selected.customer_id
                      ? `Customer ${selected.customer_id}`
                      : "Anonymous"}
                  </div>
                </div>
                <Badge color="blue" className="text-base">
                  <Star className="w-3 h-3 mr-1" />
                  {selected.rating}/5
                </Badge>
              </div>

              {selected.title && (
                <div>
                  <Label>Title</Label>
                  <div className="text-sm font-medium">{selected.title}</div>
                </div>
              )}

              <div>
                <Label>Body</Label>
                <div className="text-sm whitespace-pre-wrap p-3 bg-ui-bg-subtle rounded border">
                  {selected.body}
                </div>
              </div>

              <div className="text-xs text-ui-fg-subtle">
                Posted: {new Date(selected.created_at).toLocaleString()} •
                Helpful: {selected.helpful_count}
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="reply">Store reply (visible to customers)</Label>
                <Textarea
                  id="reply"
                  rows={4}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="Thank you for the review!"
                />
                <Button size="small" onClick={saveReply} disabled={loading}>
                  Save reply
                </Button>
                {selected.reply_at && (
                  <div className="text-xs text-ui-fg-subtle">
                    Last replied: {new Date(selected.reply_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {selected.status !== "approved" && (
                  <Button
                    size="small"
                    onClick={() => setStatus(selected.id, "approved")}
                  >
                    Approve
                  </Button>
                )}
                {selected.status !== "rejected" && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setStatus(selected.id, "rejected")}
                  >
                    Reject
                  </Button>
                )}
                {selected.status !== "spam" && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setStatus(selected.id, "spam")}
                  >
                    Spam
                  </Button>
                )}
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => remove(selected.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-ui-fg-subtle p-4 border rounded">
              Select a review to moderate.
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Reviews",
  icon: Star,
})

export default ReviewsAdminPage
