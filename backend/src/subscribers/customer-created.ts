import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import {
  ICustomerModuleService,
  INotificationModuleService,
} from "@medusajs/framework/types"

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const customerId = data?.id
  if (!customerId) return

  const customerService: ICustomerModuleService = container.resolve(
    Modules.CUSTOMER,
  )
  const notification: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )

  const customer = await customerService
    .retrieveCustomer(customerId)
    .catch(() => null)
  if (!customer?.email) return

  await notification.createNotifications({
    to: customer.email,
    channel: "email",
    template: "customer-welcome",
    data: {
      subject: "Welcome to HueWhimsy!",
      first_name: customer.first_name ?? null,
    },
  } as any)
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
