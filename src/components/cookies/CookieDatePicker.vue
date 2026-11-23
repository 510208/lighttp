<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { CalendarDays } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "reka-ui";

const props = defineProps<{
  modelValue: number | null;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  (event: "update:modelValue", value: number | null): void;
}>();
const { t, locale } = useI18n();
const open = ref(false);

function dateFromTimestamp(timestamp: number): CalendarDate {
  const value = new Date(timestamp * 1000);
  return new CalendarDate(
    value.getFullYear(),
    value.getMonth() + 1,
    value.getDate(),
  );
}

const selectedDate = computed<DateValue | undefined>(() =>
  props.modelValue === null ? undefined : dateFromTimestamp(props.modelValue),
);
const selectedHour = computed(() =>
  props.modelValue === null
    ? "23"
    : String(new Date(props.modelValue * 1000).getHours()).padStart(2, "0"),
);
const selectedMinute = computed(() =>
  props.modelValue === null
    ? "59"
    : String(new Date(props.modelValue * 1000).getMinutes()).padStart(2, "0"),
);
const dateLabel = computed(() =>
  props.modelValue === null
    ? t("cookies.choose_date")
    : new Date(props.modelValue * 1000).toLocaleString(locale.value, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
);

function update(date: DateValue | undefined, hour: number, minute: number) {
  if (!date) return;
  // 日曆選取的是本地日期；使用 JS Date 轉為 Rust 使用的 Unix 秒數。
  const value = new Date(date.year, date.month - 1, date.day, hour, minute);
  emit("update:modelValue", Math.floor(value.getTime() / 1000));
}

function changeDate(date: DateValue | undefined) {
  update(date, Number(selectedHour.value), Number(selectedMinute.value));
}

function changeTime(event: Event, part: "hour" | "minute") {
  const value = Number((event.target as HTMLInputElement).value);
  const maximum = part === "hour" ? 23 : 59;
  if (!Number.isInteger(value) || value < 0 || value > maximum) return;
  const hour = part === "hour" ? value : Number(selectedHour.value);
  const minute = part === "minute" ? value : Number(selectedMinute.value);
  update(selectedDate.value, hour, minute);
}
</script>

<template>
  <div class="flex min-w-0 flex-col gap-2">
    <PopoverRoot v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="outline"
          class="w-full min-w-0 justify-start font-normal"
          :disabled="disabled"
        >
          <CalendarDays class="size-4" aria-hidden="true" />
          <span class="truncate">{{ dateLabel }}</span>
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          side="bottom"
          align="start"
          :side-offset="6"
          class="bg-lh-base border-lh-surface-2 text-lh-text z-[60] rounded-lg border p-3 shadow-lg"
        >
          <Calendar
            :model-value="selectedDate"
            :default-placeholder="selectedDate ?? today(getLocalTimeZone())"
            :locale="locale"
            layout="month-and-year"
            class="text-lh-text [&_[data-selected]]:bg-lh-green [&_[data-selected]]:text-lh-crust [&_[data-slot=native-select]]:bg-lh-surface-0"
            @update:model-value="changeDate"
          />
          <div class="border-lh-surface-1 flex items-end gap-2 border-t pt-3">
            <div class="min-w-0 flex-1">
              <Label for="cookie-expiry-hour">{{ t("cookies.hour") }}</Label>
              <Input
                id="cookie-expiry-hour"
                type="number"
                min="0"
                max="23"
                :model-value="selectedHour"
                @change="changeTime($event, 'hour')"
              />
            </div>
            <div class="min-w-0 flex-1">
              <Label for="cookie-expiry-minute">{{
                t("cookies.minute")
              }}</Label>
              <Input
                id="cookie-expiry-minute"
                type="number"
                min="0"
                max="59"
                :model-value="selectedMinute"
                @change="changeTime($event, 'minute')"
              />
            </div>
          </div>
          <div class="mt-3 flex justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="emit('update:modelValue', null)"
            >
              {{ t("cookies.clear_expiry") }}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              @click="open = false"
            >
              {{ t("cookies.done") }}
            </Button>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </div>
</template>
