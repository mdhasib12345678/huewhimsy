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
  toast,
  Toaster,
} from "@medusajs/ui"
import { Envelope, ArrowDownTray } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type Subscriber = {
  id: string
  email: string
  name: string | null
  locale: string
  source: string | null
  status: "pending" | "confirmed" | "unsubscribed" | "bounced"
  confirmed_at: string | null
  unsubscribed_at: string | null
  tags: string[] | null
  created_at: string
}

const NewsletterAdminPage = () => {
  const [items, setItems] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [search, setSearch] = useState("")

  const refresh = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set("limit", "1000")
      if (statusFilter) qs.set("status", statusFilter)
      const r = await fetch(`/admin/newsletter?${qs.toString()}`, {
        credentials: "include",
      })
      const json = await r.json()
      setItems(json.subscribers ?? [])
    } catch {
      toast.error("Failed to load subscribers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [statusFilter])

  const remove = async (id: string) => {
    if (!confirm("Delete this subscriber permanently?")) return
    setLoading(true)
    try {
      await fetch(`/admin/newsletter/${id}`, {
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

  const updateStatus = async (
    id: string,
    status: Subscriber["status"],
  ) => {
    setLoading(true)
    try {
      await fetch(`/admin/newsletter/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      })
      toast.success("Updated")
      refresh()
    } catch {
      toast.error("Update failed")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase().trim()
    return items.filter(
      (i) =>
        i.email.toLowerCase().includes(q) ||
        (i.name ?? "").toLowerCase().includes(q) ||
        (i.source ?? "").toLowerCase().includes(q),
    )
  }, [items, search])

  const downloadCsv = () => {
    const qs = new URLSearchParams()
    qs.set("format", "csv")
    if (statusFilter) qs.set("status", statusFilter)
    window.open(`/admin/newsletter?${qs.toString()}`, "_blank")
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Newsletter Subscribers</Heading>
        <Button onClick={downloadCsv} variant="secondary">
          <ArrowDownTray className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="px-6 py-4 flex flex-wrap items-end gap-4 bg-ui-bg-subtle">
        <div className="space-y-1">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="email, name, source"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="status_filter">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
          >
            <Select.Trigger id="status_filter" className="w-[180px]">
              <Select.Value placeholder="All statuses" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All statuses</Select.Item>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="confirmed">Confirmed</Select.Item>
              <Select.Item value="unsubscribed">Unsubscribed</Select.Item>
              <Select.Item value="bounced">Bounced</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className="ml-auto text-sm text-ui-fg-subtle">
          Showing {filtered.length} of {items.length}
        </div>
      </div>

      <div className="px-6 pb-6 pt-4">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Source</Table.HeaderCell>
              <Table.HeaderCell>Locale</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Joined</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.map((s) => (
              <Table.Row key={s.id}>
                <Table.Cell className="font-mono text-xs">{s.email}</Table.Cell>
                <Table.Cell>{s.name ?? "—"}</Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">
                  {s.source ?? "—"}
                </Table.Cell>
                <Table.Cell>{s.locale}</Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      s.status === "confirmed"
                        ? "green"
                        : s.status === "pending"
                          ? "blue"
                          : s.status === "bounced"
                            ? "red"
                            : "grey"
                    }
                  >
                    {s.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="text-xs text-ui-fg-subtle">
                  {new Date(s.created_at).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    {s.status === "pending" && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => updateStatus(s.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                    )}
                    {s.status !== "unsubscribed" && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => updateStatus(s.id, "unsubscribed")}
                      >
                        Unsubscribe
                      </Button>
                    )}
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
            {!filtered.length && !loading && (
              <Table.Row>
                <Table.Cell
                  colSpan={7}
                  className="text-center text-ui-fg-subtle py-8"
                >
                  No subscribers yet. They'll appear here when visitors sign
                  up on the storefront.
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
  label: "Newsletter",
  icon: Envelope,
})

export default NewsletterAdminPage
