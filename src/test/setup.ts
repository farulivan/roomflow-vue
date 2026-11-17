import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/vue"
import { afterEach } from "vitest"
import { toast } from "vue-sonner"

afterEach(() => {
  cleanup()
  // vue-sonner keeps toasts in module state and replays the active ones
  // to the next Toaster that mounts, so one test's toasts would show up
  // in another's.
  toast.dismiss()
})
