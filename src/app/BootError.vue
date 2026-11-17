<script setup lang="ts">
import { Button } from "@/components/ui/button"

import StatusScreen from "./StatusScreen.vue"

/**
 * Rendered when the in-browser mock backend can't start. Service workers
 * only run in a secure context, so the usual cause is opening the dev
 * server over plain http on a LAN address (e.g. a phone on 192.168.x.x).
 */
const reload = () => window.location.reload()
</script>

<template>
  <StatusScreen
    title="The demo backend couldn't start"
    message="This app's API runs in a service worker, which browsers only allow over HTTPS or on localhost. Open it from one of those and reload."
  >
    <Button @click="reload">Reload</Button>
  </StatusScreen>
</template>
