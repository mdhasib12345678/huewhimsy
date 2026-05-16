import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Input,
  Label,
  Table,
  toast,
  Toaster,
} from "@medusajs/ui"
import { Heart } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type Item = {
  id: string
  customer_id: string
  product_id: string
  variant_id: string | null
  notes: string | null
  added_at: string
  created_at: string
}

const WishlistAdminPage = () => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const refresh = async () => {
    setLoading(true)
    try {
      const r = await fetch("/admin/wishlist?limit=1000", {
        credentials: "include",
      })
      const json = await r.json()
      setItems(json.items ?? [])
    } catch {
      toast.error("Failed to load wishlist data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase().trim()
    return items.filter(
      (i) =>
        i.customer_id.toLowerCase().includes(q) ||
        i.product_id.toLowerCase().includes(q) ||
        (i.variant_id ?? "").toLowerCase().includes(q),
    )
  }, [items, search])

  const grouped = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of items) {
      map.set(i.product_id, (map.get(i.product_id) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [items])

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Wishlists</Heading>
        <div className="text-sm text-ui-fg-subtle">
          {items.length} saved item{items.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="px-6 py-4 bg-ui-bg-subtle">
        <Heading level="h2" className="mb-3">
          Most wished-for products
        </Heading>
        {grouped.length === 0 ? (
          <div className="text-sm text-ui-fg-subtle">
            No wishlist activity yet.
          </div>
        ) : (
          <ol className="grid gap-1 md:grid-cols-2 text-sm">
            {grouped.map(([pid, count], idx) => (
              <li key={pid} className="flex items-center gap-3">
                <span className="text-ui-fg-subtle w-6">{idx + 1}.</span>
                <span className="font-mono text-xs flex-1 truncate">{pid}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="px-6 py-4 flex items-end gap-4">
        <div className="space-y-1 flex-1 max-w-md">
          <Label htmlFor="search">Filter</Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="customer id / product id / variant id"
          />
        </div>
        <div className="text-sm text-ui-fg-subtle">
          Showing {filtered.length} of {items.length}
        </div>
      </div>

      <div className="px-6 pb-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Variant</Table.HeaderCell>
              <Table.HeaderCell>Notes</Table.HeaderCell>
              <Table.HeaderCell>Added</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.map((i) => (
              <Table.Row key={i.id}>
                <Table.Cell className="font-mono text-xs">
                  {i.customer_id}
                </Table.Cell>
                <Table.Cell className="font-mono text-xs">
                  {i.product_id}
                </Table.Cell>
                <Table.Cell className="font-mono text-xs text-ui-fg-subtle">
                  {i.variant_id ?? "—"}
                </Table.Cell>
                <Table.Cell className="text-xs max-w-[260px] truncate">
                  {i.notes ?? "—"}
                </Table.Cell>
                <Table.Cell className="text-xs text-ui-fg-subtle">
                  {new Date(i.added_at).toLocaleDateString()}
                </Table.Cell>
              </Table.Row>
            ))}
            {!filtered.length && !loading && (
              <Table.Row>
                <Table.Cell
                  colSpan={5}
                  className="text-center text-ui-fg-subtle py-8"
                >
                  No wishlist items yet.
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
  label: "Wishlists",
  icon: Heart,
})

export default WishlistAdminPage
