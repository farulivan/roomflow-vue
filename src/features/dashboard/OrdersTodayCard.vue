<script setup lang="ts">
import { CurveType } from "@unovis/ts/types/curve"
import VisArea from "@unovis/vue/components/area"
import VisAxis from "@unovis/vue/components/axis"
import VisXYContainer from "@unovis/vue/containers/xy-container"
import { computed, useId } from "vue"
import type { HTMLAttributes } from "vue"

import MoneyAmount from "@/components/shared/MoneyAmount.vue"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  componentToString,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import type { HourBucket } from "@/domain/metrics"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

import OrdersHourTooltip from "./OrdersHourTooltip.vue"

/**
 * The day at a glance: today's order count, what it earned, and how it was
 * spread over the hours. The count is the sum of the hourly buckets, so the
 * figure and the chart can never disagree.
 */
const props = defineProps<{
  ordersByHour: HourBucket[]
  revenueToday: number
  avgOrderValue: number
  class?: HTMLAttributes["class"]
}>()

interface HourPoint extends HourBucket {
  label: string
}

const chartConfig = {
  orders: { label: "Orders" },
} satisfies ChartConfig

const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`

const ordersToday = computed(() =>
  props.ordersByHour.reduce((sum, bucket) => sum + bucket.orders, 0)
)

const points = computed<HourPoint[]>(() =>
  props.ordersByHour.map((bucket) => ({
    ...bucket,
    label: hourLabel(bucket.hour),
  }))
)

// Labels every three hours, never on the first or last point: the chart
// runs edge to edge, so a label there would be cut in half.
const tickValues = computed(() =>
  points.value
    .slice(1, -1)
    .filter((point) => point.hour % 3 === 0)
    .map((point) => point.hour)
)

/**
 * The top of the y-axis: the busiest hour rounded up to four even steps,
 * so the curve's peak sits below the card's header instead of touching it.
 */
const yMax = computed(() => {
  const peak = Math.max(0, ...points.value.map((point) => point.orders))
  if (peak === 0) return 4

  const roughStep = peak / 4
  const magnitude = 10 ** Math.floor(Math.log10(roughStep) + 1)
  const unit = magnitude === 10 ? 0.1 : 0.05
  const step = Math.ceil(roughStep / magnitude / unit) * unit * magnitude
  return step * 4
})

// The fill fades out towards the baseline. The id comes from useId so two
// cards on one page can't end up sharing a gradient.
const gradientId = useId()
const gradient = computed(
  () => `
  <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="var(--chart-1)" stop-opacity="0.16" />
    <stop offset="100%" stop-color="var(--chart-1)" stop-opacity="0" />
  </linearGradient>`
)

const tooltipTemplate = componentToString<HourPoint>(OrdersHourTooltip)
</script>

<template>
  <Card :class="cn('pb-0', props.class)">
    <CardHeader>
      <CardTitle>Orders today</CardTitle>
      <p class="text-figure tabular-nums">{{ ordersToday }}</p>
      <p class="text-sm text-muted-foreground">
        <MoneyAmount
          :value="formatCurrency(revenueToday)"
          class="text-foreground"
        />
        revenue ・
        <MoneyAmount
          :value="formatCurrency(avgOrderValue)"
          class="text-foreground"
        />
        avg order
      </p>
    </CardHeader>

    <ChartContainer
      :config="chartConfig"
      cursor
      class="mt-auto aspect-auto h-44 w-full"
    >
      <!--
        The margins are set by hand so the curve runs edge to edge: 8px
        above the plot, and 38px below it for the hour labels. `bleed` is
        the inset the library would add for the line's own thickness.
      -->
      <VisXYContainer
        :data="points"
        :margin="{ top: 8, right: 0, bottom: 38, left: 0 }"
        :auto-margin="false"
        :bleed="{ top: 0, right: 0, bottom: 0, left: 0 }"
        :y-domain="[0, yMax]"
        :svg-defs="gradient"
      >
        <VisArea
          :x="(point: HourPoint) => point.hour"
          :y="(point: HourPoint) => point.orders"
          :curve-type="CurveType.MonotoneX"
          :color="`url(#${gradientId})`"
          :opacity="0.6"
          line
          line-color="var(--chart-1)"
          :line-width="1.5"
        />
        <VisAxis
          type="x"
          :tick-values="tickValues"
          :tick-format="(hour: number | Date) => hourLabel(Number(hour))"
          :grid-line="false"
          :tick-line="false"
          :domain-line="false"
          :tick-padding="2"
        />
        <ChartTooltip :horizontal-shift="10" />
        <ChartCrosshair :template="tooltipTemplate" color="var(--chart-1)" />
      </VisXYContainer>
    </ChartContainer>
  </Card>
</template>
