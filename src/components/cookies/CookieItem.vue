<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Cookie, HardDriveDownload, Pencil, Trash2 } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import type { ManagedCookie } from "@/types/cookies";

const props = defineProps<{ cookie: ManagedCookie; busy: boolean }>();
const emit = defineEmits<{
  edit: [cookie: ManagedCookie];
  remove: [cookie: ManagedCookie];
  togglePersistent: [cookie: ManagedCookie];
}>();
const { t, locale } = useI18n();

function expiry() {
  return props.cookie.expires
    ? new Date(props.cookie.expires * 1000).toLocaleString(locale.value)
    : t("cookies.session");
}
</script>

<template>
  <li class="lh-setting-card gap-3">
    <div class="flex min-w-0 items-center gap-2">
      <span
        class="bg-lh-surface-1 text-lh-subtext-1 flex size-8 shrink-0 items-center justify-center rounded-md"
      >
        <Cookie class="size-5" aria-hidden="true" />
      </span>
      <p class="text-lh-text min-w-0 truncate text-base font-bold">
        {{ cookie.name }}
      </p>
    </div>
    <dl class="grid min-w-0 grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
      <div class="flex min-w-0 gap-2">
        <dt class="text-lh-subtext-0 shrink-0">{{ t("cookies.domain") }}</dt>
        <dd class="truncate" :title="cookie.domain">{{ cookie.domain }}</dd>
      </div>
      <div class="flex min-w-0 gap-2">
        <dt class="text-lh-subtext-0 shrink-0">{{ t("cookies.path") }}</dt>
        <dd class="truncate" :title="cookie.path">{{ cookie.path }}</dd>
      </div>
      <div class="flex min-w-0 gap-2">
        <dt class="text-lh-subtext-0 shrink-0">
          {{ t("cookies.expires_short") }}
        </dt>
        <dd class="truncate" :title="expiry()">{{ expiry() }}</dd>
      </div>
      <div class="flex min-w-0 gap-2">
        <dt class="text-lh-subtext-0 shrink-0">SameSite</dt>
        <dd class="truncate">
          {{ cookie.sameSite ?? t("cookies.unspecified") }}
        </dd>
      </div>
    </dl>
    <div class="flex flex-wrap items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        :disabled="busy"
        :aria-pressed="cookie.persistent"
        @click="emit('togglePersistent', cookie)"
      >
        <HardDriveDownload class="size-4" />
        {{
          cookie.persistent
            ? t("cookies.make_not_persistent")
            : t("cookies.make_persistent")
        }}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="text-lh-red"
        :disabled="busy"
        @click="emit('remove', cookie)"
      >
        <Trash2 class="size-4" />{{ t("cookies.remove") }}
      </Button>
      <Button size="sm" :disabled="busy" @click="emit('edit', cookie)">
        <Pencil class="size-4" />{{ t("cookies.edit") }}
      </Button>
    </div>
  </li>
</template>
