<script setup lang="ts">
import { Loader2Icon } from "@lucide/vue"
import { useForm } from "vee-validate"
import { useRoute, useRouter } from "vue-router"

import AppCredit from "@/components/shared/AppCredit.vue"
import BrandMark from "@/components/shared/BrandMark.vue"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toTypedSchema } from "@/lib/zod-typed-schema"

import { redirectTarget } from "./redirect"
import { loginSchema } from "./schema"
import { useAuth } from "./session"

// .example is reserved for documentation, so this can never reach a real inbox.
const DEMO_EMAIL = "staff@roomflow.example"
const DEMO_PASSWORD = "demo1234"

const { login, isLoading } = useAuth()
const route = useRoute()
const router = useRouter()

const { defineField, errors, handleSubmit, setValues } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: { email: "", password: "" },
})

// defineField returns a ref for v-model and the listeners to bind next to
// it. A field stays quiet while it's first filled in; once a submit has
// marked it invalid, it re-checks on every keystroke so the message
// clears as soon as the value is right.
const [email, emailAttrs] = defineField("email", (state) => ({
  validateOnModelUpdate: state.errors.length > 0,
}))
const [password, passwordAttrs] = defineField("password", (state) => ({
  validateOnModelUpdate: state.errors.length > 0,
}))

// handleSubmit validates first and only calls this with valid values.
const onSubmit = handleSubmit(async (values) => {
  await login(values)
  await router.replace(redirectTarget(route.query))
})

function fillDemoAccount() {
  setValues({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
}
</script>

<template>
  <div
    class="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-10"
  >
    <Card class="w-full max-w-[22rem] [--card-spacing:--spacing(6)]">
      <CardHeader class="justify-items-center gap-1.5 text-center">
        <BrandMark class="mb-4" />
        <CardTitle class="text-section">Sign in</CardTitle>
        <CardDescription class="text-balance">
          Guest requests for every hotel you work in, in one place.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-5" novalidate @submit="onSubmit">
          <Field :data-invalid="!!errors.email">
            <FieldLabel for="login-email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="login-email"
                v-model="email"
                v-bind="emailAttrs"
                type="email"
                autocomplete="username"
                :aria-invalid="!!errors.email"
                class="h-10"
              />
              <FieldError :errors="[errors.email]" />
            </FieldContent>
          </Field>

          <Field :data-invalid="!!errors.password">
            <FieldLabel for="login-password">Password</FieldLabel>
            <FieldContent>
              <Input
                id="login-password"
                v-model="password"
                v-bind="passwordAttrs"
                type="password"
                autocomplete="current-password"
                :aria-invalid="!!errors.password"
                class="h-10"
              />
              <FieldError :errors="[errors.password]" />
            </FieldContent>
          </Field>

          <Button
            type="submit"
            class="mt-1 h-10 w-full text-body"
            :disabled="isLoading"
          >
            <Loader2Icon v-if="isLoading" class="animate-spin" />
            {{ isLoading ? "Signing in…" : "Sign in" }}
          </Button>
        </form>
      </CardContent>
      <CardFooter
        class="flex-col gap-0.5 text-center text-sm text-muted-foreground"
      >
        <p class="text-balance">
          Demo account: any password of 6+ characters works.
        </p>
        <Button
          type="button"
          variant="link"
          class="h-auto p-0 text-sm"
          @click="fillDemoAccount"
        >
          Use demo account
        </Button>
      </CardFooter>
    </Card>
    <AppCredit />
  </div>
</template>
