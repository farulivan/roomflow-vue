import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"

import LoginPage from "@/features/auth/LoginPage.vue"
import { redirectTarget } from "@/features/auth/redirect"
import { useSession } from "@/features/auth/session"
import OrderDetailsSheet from "@/features/orders/OrderDetailsSheet.vue"
import OrdersPage from "@/features/orders/OrdersPage.vue"
import { paths } from "@/lib/paths"

import DashboardRoute from "./DashboardRoute.vue"
import HomeRedirect from "./HomeRedirect.vue"
import HotelScope from "./HotelScope.vue"
import NotFoundPage from "./NotFoundPage.vue"

declare module "vue-router" {
  interface RouteMeta {
    /** Reachable without a session. Every other route needs one. */
    public?: boolean
  }
}

/**
 * Nested routes render inside their parent's <RouterView>: HotelScope
 * holds the app shell, the shell holds the page, and the orders page
 * holds the order drawer.
 */
const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { public: true },
  },
  { path: "/", name: "home", component: HomeRedirect },
  {
    path: "/hotels/:hotelId",
    component: HotelScope,
    children: [
      { path: "", name: "dashboard", component: DashboardRoute },
      {
        path: "orders",
        name: "orders",
        component: OrdersPage,
        children: [
          {
            path: ":orderId",
            name: "order",
            component: OrderDetailsSheet,
            // Hands :orderId to the component as a prop.
            props: true,
          },
        ],
      },
      // An unknown page under a hotel keeps the shell around the message.
      { path: ":pathMatch(.*)*", component: NotFoundPage },
    ],
  },
  { path: "/:pathMatch(.*)*", component: NotFoundPage },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * Gates every route behind a session unless it is marked public. A
 * visitor without one goes to /login with the page they wanted in
 * `?redirect=`, so signing in sends them right back to it.
 */
router.beforeEach((to) => {
  const session = useSession()

  if (to.name === "login") {
    // Already signed in: skip the form and carry on to the destination.
    return session.value
      ? { path: redirectTarget(to.query), replace: true }
      : true
  }

  if (to.meta.public || session.value) return true

  return {
    name: "login",
    query: to.fullPath === paths.home ? {} : { redirect: to.fullPath },
    replace: true,
  }
})
