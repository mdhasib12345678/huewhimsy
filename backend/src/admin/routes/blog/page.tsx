import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Textarea, Label, Select, Table, Badge, toast, Toaster } from "@medusajs/ui"
import { DocumentText } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  cover_image: string | null
  author_name: string | null
  author_avatar: string | null
  category: string | null
  tags: string[] | null
  read_time_minutes: number | null
  status: "draft" | "published" | "archived"
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  created_at: string
  updated_at: string
}

const EMPTY: Partial<BlogPost> = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  cover_image: "",
  author_name: "",
  category: "",
  tags: [],
  read_time_minutes: 5,
  status: "draft",
  meta_title: "",
  meta_description: "",
  og_image: "",
}

const BlogAdminPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<BlogPost>>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tagsInput, setTagsInput] = useState("")

  const refresh = async () => {
    setLoading(true)
    try {
      const r = await fetch("/admin/blog?limit=200", {
        credentials: "include",
      })
      const json = await r.json()
      setPosts(json.posts ?? [])
    } catch (e) {
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const setField = <K extends keyof BlogPost>(k: K, v: BlogPost[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const startEdit = (p: BlogPost) => {
    setEditingId(p.id)
    setForm(p)
    setTagsInput(p.tags?.join(", ") ?? "")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
    setTagsInput("")
  }

  const save = async () => {
    if (!form.slug || !form.title || !form.body) {
      toast.error("slug, title, body required")
      return
    }
    const payload = {
      ...form,
      tags: tagsInput
        ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
        : null,
      read_time_minutes: form.read_time_minutes
        ? Number(form.read_time_minutes)
        : null,
    }
    setLoading(true)
    try {
      const url = editingId ? `/admin/blog/${editingId}` : `/admin/blog`
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
    if (!confirm("Delete this post permanently?")) return
    setLoading(true)
    try {
      await fetch(`/admin/blog/${id}`, {
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

  const sortedPosts = useMemo(
    () =>
      [...posts].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      ),
    [posts],
  )

  return (
    <Container className="divide-y p-0">
      <Toaster />

      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Blog Posts</Heading>
        <div className="flex items-center gap-2">
          {editingId && (
            <Button variant="secondary" onClick={cancelEdit}>
              Cancel edit
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 py-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title ?? ""}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="The art of phonics for ages 3-5"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug * (URL)</Label>
          <Input
            id="slug"
            value={form.slug ?? ""}
            onChange={(e) =>
              setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))
            }
            placeholder="art-of-phonics"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            rows={2}
            value={form.excerpt ?? ""}
            onChange={(e) => setField("excerpt", e.target.value)}
            placeholder="Short 1-2 line summary shown in listings"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="body">Body * (markdown or HTML)</Label>
          <Textarea
            id="body"
            rows={10}
            value={form.body ?? ""}
            onChange={(e) => setField("body", e.target.value)}
            placeholder="Full article content"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cover">Cover image URL</Label>
          <Input
            id="cover"
            value={form.cover_image ?? ""}
            onChange={(e) => setField("cover_image", e.target.value)}
            placeholder="https://huewhimsy.com/files/..."
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="author">Author name</Label>
          <Input
            id="author"
            value={form.author_name ?? ""}
            onChange={(e) => setField("author_name", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category ?? ""}
            onChange={(e) => setField("category", e.target.value)}
            placeholder="Phonics, Activities, Tips..."
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="reading, age-4, parent-tips"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="read_time">Read time (minutes)</Label>
          <Input
            id="read_time"
            type="number"
            min="1"
            value={form.read_time_minutes ?? ""}
            onChange={(e) =>
              setField("read_time_minutes", Number(e.target.value) as any)
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status ?? "draft"}
            onValueChange={(v) => setField("status", v as BlogPost["status"])}
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
            <Label htmlFor="og_image">OG image URL (1200×630)</Label>
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
            {editingId ? "Save changes" : "Create post"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        <Heading level="h2">All posts ({posts.length})</Heading>
      </div>
      <div className="px-6 pb-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Slug</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Published</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedPosts.map((p) => (
              <Table.Row key={p.id}>
                <Table.Cell className="font-medium">{p.title}</Table.Cell>
                <Table.Cell className="text-ui-fg-subtle font-mono text-xs">
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
                <Table.Cell>{p.category ?? "—"}</Table.Cell>
                <Table.Cell>
                  {p.published_at
                    ? new Date(p.published_at).toLocaleDateString()
                    : "—"}
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
            {!sortedPosts.length && !loading && (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center text-ui-fg-subtle py-8">
                  No blog posts yet. Use the form above to create your first.
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
  label: "Blog",
  icon: DocumentText,
})

export default BlogAdminPage
