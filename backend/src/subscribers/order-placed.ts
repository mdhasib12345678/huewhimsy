import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { INotificationModuleService, IOrderModuleService } from "@medusajs/framework/types"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data?.id
  if (!orderId) return

  const orderService: IOrderModuleService = container.resolve(Modules.ORDER)
  const notification: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )

  const order = (await orderService.retrieveOrder(orderId, {
    relations: ["items"],
  }).catch(() => null)) as any

  if (!order?.email) return

  await notification.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-confirmation",
    data: {
      subject: `Your HueWhimsy order #${order.display_id ?? order.id}`,
      customer_name: order.shipping_address?.first_name ?? order.email,
      order,
    },
  } as any)
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
