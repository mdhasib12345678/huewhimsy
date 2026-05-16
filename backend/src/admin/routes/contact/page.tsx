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
import { Envelope } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type Submission = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: "new" | "in_progress" | "resolved" | "spam"
  assigned_to: string | null
  admin_notes: string | null
  ip_address: string | null
  user_agent: string | null
  page_url: string | null
  locale: string | null
  created_at: string
}

const ContactAdminPage = () => {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Submission | null>(null)
  const [notesDraft, setNotesDraft] = useState("")

  const refresh = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set("limit", "500")
      if (statusFilter) qs.set("status", statusFilter)
      const r = await fetch(`/admin/contact?${qs.toString()}`, {
        credentials: "include",
      })
      const json = await r.json()
      setItems(json.submissions ?? [])
    } catch {
      toast.error("Failed to load submissions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [statusFilter])

  const setStatus = async (id: string, status: Submission["status"]) => {
    setLoading(true)
    try {
      await fetch(`/admin/contact/${id}`, {
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

  const saveNotes = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await fetch(`/admin/contact/${selected.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ admin_notes: notesDraft }),
      })
      toast.success("Notes saved")
      refresh()
      setSelected({ ...selected, admin_notes: notesDraft })
    } catch {
      toast.error("Save failed")
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this submission permanently?")) return
    setLoading(true)
    try {
      await fetch(`/admin/contact/${id}`, {
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
      (i) =>
        i.email.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        (i.subject ?? "").toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q),
    )
  }, [items, search])

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Contact Submissions</Heading>
        <div className="text-sm text-ui-fg-subtle">
          {items.length} total
        </div>
      </div>

      <div className="px-6 py-4 flex flex-wrap items-end gap-4 bg-ui-bg-subtle">
        <div className="space-y-1">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="name, email, subject, message"
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
              <Select.Item value="new">New</Select.Item>
              <Select.Item value="in_progress">In progress</Select.Item>
              <Select.Item value="resolved">Resolved</Select.Item>
              <Select.Item value="spam">Spam</Select.Item>
            </Select.Content>
          </Select>
        </div>
      </div>

      <div className="px-6 py-4 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Subject</Table.HeaderCell>
                <Table.HeaderCell>Received</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.map((s) => (
                <Table.Row
                  key={s.id}
                  className={
                    selected?.id === s.id
                      ? "bg-ui-bg-base-hover cursor-pointer"
                      : "cursor-pointer"
                  }
                  onClick={() => {
                    setSelected(s)
                    setNotesDraft(s.admin_notes ?? "")
                  }}
                >
                  <Table.Cell>
                    <Badge
                      color={
                        s.status === "new"
                          ? "blue"
                          : s.status === "in_progress"
                            ? "orange"
                            : s.status === "resolved"
                              ? "green"
                              : "red"
                      }
                    >
                      {s.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-ui-fg-subtle font-mono">
                      {s.email}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="max-w-[260px] truncate">
                    {s.subject ?? "(no subject)"}
                  </Table.Cell>
                  <Table.Cell className="text-xs text-ui-fg-subtle">
                    {new Date(s.created_at).toLocaleString()}
                  </Table.Cell>
                </Table.Row>
              ))}
              {!filtered.length && !loading && (
                <Table.Row>
                  <Table.Cell
                    colSpan={4}
                    className="text-center text-ui-fg-subtle py-8"
                  >
                    No submissions yet.
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
                  <div className="font-medium">{selected.name}</div>
                  <div className="text-xs text-ui-fg-subtle font-mono">
                    {selected.email}
                  </div>
                  {selected.phone && (
                    <div className="text-xs text-ui-fg-subtle">
                      {selected.phone}
                    </div>
                  )}
                </div>
                <Badge
                  color={
                    selected.status === "new"
                      ? "blue"
                      : selected.status === "in_progress"
                        ? "orange"
                        : selected.status === "resolved"
                          ? "green"
                          : "red"
                  }
                >
                  {selected.status}
                </Badge>
              </div>

              {selected.subject && (
                <div>
                  <Label>Subject</Label>
                  <div className="text-sm">{selected.subject}</div>
                </div>
              )}

              <div>
                <Label>Message</Label>
                <div className="text-sm whitespace-pre-wrap p-3 bg-ui-bg-subtle rounded border">
                  {selected.message}
                </div>
              </div>

              <div className="text-xs text-ui-fg-subtle space-y-1">
                <div>Received: {new Date(selected.created_at).toLocaleString()}</div>
                {selected.page_url && <div>From page: {selected.page_url}</div>}
                {selected.locale && <div>Locale: {selected.locale}</div>}
                {selected.ip_address && <div>IP: {selected.ip_address}</div>}
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="admin_notes">Internal notes</Label>
                <Textarea
                  id="admin_notes"
                  rows={4}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                />
                <Button size="small" onClick={saveNotes} disabled={loading}>
                  Save notes
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setStatus(selected.id, "in_progress")}
                >
                  Mark in progress
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setStatus(selected.id, "resolved")}
                >
                  Resolve
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setStatus(selected.id, "spam")}
                >
                  Mark spam
                </Button>
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => remove(selected.id)}
                >
                  Delete
                </Button>
                <a
                  className="ml-auto text-sm text-ui-fg-interactive underline"
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject ?? "your message")}`}
                >
                  Reply via email
                </a>
              </div>
            </div>
          ) : (
            <div className="text-sm text-ui-fg-subtle p-4 border rounded">
              Select a submission to see full details.
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Contact Inbox",
  icon: Envelope,
})

export default ContactAdminPage
