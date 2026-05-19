import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Table,
  Toaster,
  toast,
} from "@medusajs/ui"
import { CreditCard } from "@medusajs/icons"
import { useEffect, useState } from "react"

type Provider = { id: string; is_enabled: boolean }
type Cfg = {
  providers: Provider[]
  config: {
    stripe: {
      configured: boolean
      webhook_configured: boolean
      publishable_key_present: boolean
    }
    currencies: string[]
  }
  docs: {
    stripe_dashboard: string
    stripe_webhook_url: string
    regions_admin_url: string
  }
}

const providerLabel = (id: string): { title: string; sub: string } => {
  if (id.includes("stripe"))
    return { title: "Stripe", sub: "Card payments via Stripe (PCI handled by Stripe)" }
  if (id.includes("system_default") || id === "manual")
    return { title: "Manual / Offline", sub: "Bank transfer, cash on delivery, etc." }
  return { title: id, sub: "Custom payment provider" }
}

const PaymentSettingsPage = () => {
  const [cfg, setCfg] = useState<Cfg | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const r = await fetch("/admin/payments", { credentials: "include" })
      if (!r.ok) throw new Error(`${r.status}`)
      const json = (await r.json()) as Cfg
      setCfg(json)
    } catch (e: any) {
      toast.error(`Failed to load payment config: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  if (loading) {
    return (
      <Container className="p-6">
        <Heading level="h1">Payment Settings</Heading>
        <Text className="mt-2 text-ui-fg-subtle">Loading payment configuration…</Text>
      </Container>
    )
  }

  const stripe = cfg?.config.stripe
  const stripeFullyWired =
    !!stripe?.configured && !!stripe?.webhook_configured

  return (
    <Container className="p-6">
      <Toaster />
      <div className="flex items-center justify-between mb-2">
        <div>
          <Heading level="h1">Payment Settings</Heading>
          <Text className="text-ui-fg-subtle">
            Manage payment gateways, providers and checkout behaviour for your storefront.
          </Text>
        </div>
        <Button variant="secondary" size="small" onClick={refresh}>
          Refresh
        </Button>
      </div>

      {/* GATEWAY HEALTH */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-ui-border-base p-4 bg-ui-bg-base">
          <Text size="small" weight="plus" className="text-ui-fg-muted uppercase">
            Stripe API
          </Text>
          <div className="mt-2 flex items-center gap-2">
            {stripe?.configured ? (
              <Badge color="green">Connected</Badge>
            ) : (
              <Badge color="orange">Not configured</Badge>
            )}
          </div>
          <Text size="xsmall" className="mt-2 text-ui-fg-subtle">
            Set <code>STRIPE_SECRET_KEY</code> in your environment to enable card payments.
          </Text>
        </div>

        <div className="rounded-lg border border-ui-border-base p-4 bg-ui-bg-base">
          <Text size="small" weight="plus" className="text-ui-fg-muted uppercase">
            Stripe Webhook
          </Text>
          <div className="mt-2 flex items-center gap-2">
            {stripe?.webhook_configured ? (
              <Badge color="green">Verified</Badge>
            ) : (
              <Badge color="orange">Missing secret</Badge>
            )}
          </div>
          <Text size="xsmall" className="mt-2 text-ui-fg-subtle">
            Endpoint: <code>{cfg?.docs.stripe_webhook_url}</code>. Set <code>STRIPE_WEBHOOK_SECRET</code> to verify signatures.
          </Text>
        </div>

        <div className="rounded-lg border border-ui-border-base p-4 bg-ui-bg-base">
          <Text size="small" weight="plus" className="text-ui-fg-muted uppercase">
            Storefront key
          </Text>
          <div className="mt-2 flex items-center gap-2">
            {stripe?.publishable_key_present ? (
              <Badge color="green">Present</Badge>
            ) : (
              <Badge color="grey">Optional</Badge>
            )}
          </div>
          <Text size="xsmall" className="mt-2 text-ui-fg-subtle">
            Storefront only needs <code>STRIPE_PUBLISHABLE_KEY</code> when using Stripe Elements directly.
          </Text>
        </div>
      </div>

      {/* REGISTERED PROVIDERS */}
      <div className="mt-8">
        <Heading level="h2">Registered providers</Heading>
        <Text className="text-ui-fg-subtle">
          Providers currently registered with this Medusa instance. Map a provider to a region under <strong>Settings → Regions</strong> to make it available at checkout.
        </Text>

        <Table className="mt-4">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Provider</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {cfg?.providers && cfg.providers.length > 0 ? (
              cfg.providers.map((p) => {
                const l = providerLabel(p.id)
                return (
                  <Table.Row key={p.id}>
                    <Table.Cell>{l.title}</Table.Cell>
                    <Table.Cell>
                      <Text size="small" className="text-ui-fg-subtle">{l.sub}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <code className="text-xs">{p.id}</code>
                    </Table.Cell>
                    <Table.Cell>
                      {p.is_enabled ? (
                        <Badge color="green">Enabled</Badge>
                      ) : (
                        <Badge color="grey">Disabled</Badge>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )
              })
            ) : (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <Text className="text-ui-fg-subtle">
                    No payment providers registered yet. The built-in offline provider should always appear here once a payment module is loaded.
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      {/* HOW-TO */}
      <div className="mt-10 rounded-lg border border-ui-border-base p-5 bg-ui-bg-subtle">
        <Heading level="h3">How to enable card payments</Heading>
        <ol className="list-decimal pl-5 mt-3 space-y-1 text-sm text-ui-fg-subtle">
          <li>
            Create an API key in your <a className="text-ui-fg-interactive underline" target="_blank" rel="noreferrer" href={cfg?.docs.stripe_dashboard}>Stripe dashboard</a>.
          </li>
          <li>
            Set <code>STRIPE_SECRET_KEY</code> and (optionally) <code>STRIPE_PUBLISHABLE_KEY</code> in your <code>.env.production</code>.
          </li>
          <li>
            Add a webhook endpoint pointing to <code>{cfg?.docs.stripe_webhook_url}</code> on your domain. Copy the signing secret into <code>STRIPE_WEBHOOK_SECRET</code>.
          </li>
          <li>Restart the backend container.</li>
          <li>
            Go to <strong>Settings → Regions</strong> and enable Stripe for each region you want to accept cards in.
          </li>
        </ol>
        <div className="mt-4">
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              window.location.href = cfg?.docs.regions_admin_url ?? "/app/settings/regions"
            }}
          >
            Open Regions settings
          </Button>
        </div>
        <Text size="small" className="mt-4 text-ui-fg-muted">
          {stripeFullyWired
            ? "✓ Stripe is fully wired. Cards will be processed live at checkout."
            : "⚠ Stripe is not fully configured. Card payments will be hidden at checkout; manual / offline orders still work."}
        </Text>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Payments",
  icon: CreditCard,
})

export default PaymentSettingsPage
