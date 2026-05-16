import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import { Resend } from "resend"
import { renderTemplate } from "./templates"

type Options = {
  api_key?: string
  from?: string
  reply_to?: string
}

type InjectedDependencies = {
  logger: Logger
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected logger_: Logger
  protected options_: Options
  protected client_: Resend | null

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options ?? {}
    this.client_ = this.options_.api_key
      ? new Resend(this.options_.api_key)
      : null

    if (!this.client_) {
      this.logger_.warn(
        "[resend] RESEND_API_KEY not set. Emails will be logged but NOT sent.",
      )
    }
  }

  async send(
    notification: ProviderSendNotificationDTO,
  ): Promise<ProviderSendNotificationResultsDTO> {
    if (!notification.to) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Notification 'to' is required",
      )
    }

    const from =
      notification.from ?? this.options_.from ?? "noreply@huewhimsy.com"
    const replyTo = this.options_.reply_to

    const subject = (notification.data as any)?.subject ?? notification.template
    const rendered = renderTemplate(notification.template, notification.data ?? {})

    if (!this.client_) {
      this.logger_.info(
        `[resend:dry-run] to=${notification.to} subject="${subject}" template=${notification.template}`,
      )
      return { id: `dry_${Date.now()}` }
    }

    try {
      const result = await this.client_.emails.send({
        from,
        to: [notification.to],
        subject,
        html: rendered.html,
        text: rendered.text,
        reply_to: replyTo,
      })
      return { id: result.data?.id ?? `resend_${Date.now()}` }
    } catch (e: any) {
      this.logger_.error(`[resend] send failed: ${e.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send notification via Resend: ${e.message}`,
      )
    }
  }
}

export default ResendNotificationProviderService
