import { inject, provide } from "vue"
import type { InjectionKey } from "vue"

import type { Order } from "@/domain/order"
import type { OrderAction } from "@/domain/order-status"

export type RequestConfirmation = (order: Order, action: OrderAction) => void

const confirmActionKey: InjectionKey<RequestConfirmation> =
  Symbol("confirm-action")

/** Called by ConfirmActionProvider to offer its dialog to the components below it. */
export function provideConfirmAction(request: RequestConfirmation): void {
  provide(confirmActionKey, request)
}

/** Ask the user to confirm `action` on `order` before it runs. */
export function useConfirmAction(): RequestConfirmation {
  const request = inject(confirmActionKey)

  if (request === undefined) {
    throw new Error(
      "useConfirmAction must be used within ConfirmActionProvider"
    )
  }

  return request
}
