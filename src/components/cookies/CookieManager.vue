<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Pencil, Plus, RefreshCw, Trash2 } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCookieStore } from "@/stores/useCookieStore";
import {
  clearCookies,
  deleteCookie,
  setCookiePersistence,
} from "@/services/cookies";
import type { ManagedCookie } from "@/types/cookies";
import CookieEditor from "./CookieEditor.vue";

const store = useCookieStore();
const { t } = useI18n();
const search = ref("");
const editing = ref(false);
const selected = ref<ManagedCookie | null>(null);
const busy = ref(false);
const error = ref("");
const confirmingClear = ref(false);
const visibleCookies = computed(() => {
  const query = search.value.toLowerCase();
  return store.cookies.filter((cookie) =>
    [cookie.name, cookie.domain, cookie.path].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );
});

watch(
  () => store.managerOpen,
  (open) => {
    if (open) {
      editing.value = false;
      confirmingClear.value = false;
      void run(() => store.refresh());
    }
  },
);

async function run(action: () => Promise<unknown>) {
  busy.value = true;
  error.value = "";
  try {
    await action();
  } catch (cause) {
    error.value = String(cause);
  } finally {
    busy.value = false;
  }
}

function edit(cookie: ManagedCookie | null) {
  selected.value = cookie;
  editing.value = true;
}

async function remove(cookie: ManagedCookie) {
  await run(async () => {
    await deleteCookie(cookie.id);
    await store.refresh();
  });
}

async function togglePersistent(cookie: ManagedCookie) {
  await run(async () => {
    await setCookiePersistence(cookie.id, !cookie.persistent);
    await store.refresh();
  });
}

async function clear() {
  await run(async () => {
    await clearCookies();
    confirmingClear.value = false;
    await store.refresh();
  });
}

async function saved() {
  editing.value = false;
  await run(() => store.refresh());
}
</script>

<template>
  <Dialog v-model:open="store.managerOpen">
    <DialogContent
      class="bg-lh-base border-lh-surface-1 text-lh-text max-h-[90vh] overflow-y-auto sm:max-w-4xl"
    >
      <DialogHeader>
        <DialogTitle>{{ t("cookies.manager") }}</DialogTitle>
        <DialogDescription>{{ t("cookies.description") }}</DialogDescription>
      </DialogHeader>
      <CookieEditor
        v-if="editing"
        :cookie="selected"
        @saved="saved"
        @cancel="editing = false"
      />
      <template v-else>
        <div class="flex flex-wrap items-center gap-2">
          <Input
            v-model="search"
            :placeholder="t('cookies.search')"
            :aria-label="t('cookies.search')"
            class="min-w-40 flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            :disabled="busy"
            :aria-label="t('cookies.refresh')"
            @click="run(() => store.refresh())"
            ><RefreshCw
          /></Button>
          <Button :disabled="busy" @click="edit(null)"
            ><Plus />{{ t("cookies.add") }}</Button
          >
          <Button
            variant="destructive"
            :disabled="busy || !store.cookies.length"
            @click="confirmingClear = true"
            >{{ t("cookies.clear") }}</Button
          >
        </div>
        <div
          v-if="confirmingClear"
          class="border-lh-red/40 flex flex-wrap items-center gap-2 rounded-md border p-3"
          role="alert"
        >
          <p class="flex-1 text-sm">{{ t("cookies.confirm_clear") }}</p>
          <Button
            variant="ghost"
            :disabled="busy"
            @click="confirmingClear = false"
            >{{ t("cookies.cancel") }}</Button
          >
          <Button variant="destructive" :disabled="busy" @click="clear">{{
            t("cookies.clear")
          }}</Button>
        </div>
        <p
          v-if="!visibleCookies.length"
          class="text-lh-subtext-0 py-8 text-center text-sm"
        >
          {{ t("cookies.empty") }}
        </p>
        <ul v-else class="flex flex-col gap-2">
          <li
            v-for="cookie in visibleCookies"
            :key="cookie.id"
            class="border-lh-surface-1 flex flex-wrap items-center gap-3 rounded-md border p-3"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate font-mono text-sm font-semibold">
                {{ cookie.name }}
              </p>
              <p class="text-lh-subtext-0 truncate text-xs">
                {{ cookie.domain }}{{ cookie.path }}
              </p>
              <p class="text-lh-subtext-0 mt-1 text-xs">
                {{
                  cookie.expires
                    ? new Date(cookie.expires * 1000).toLocaleString()
                    : t("cookies.session")
                }}
                <span v-if="cookie.secure"> · Secure</span>
                <span v-if="cookie.httpOnly"> · HttpOnly</span>
                <span v-if="cookie.hostOnly">
                  · {{ t("cookies.host_only") }}</span
                >
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              :disabled="busy"
              :aria-pressed="cookie.persistent"
              @click="togglePersistent(cookie)"
            >
              {{
                cookie.persistent
                  ? t("cookies.persistent")
                  : t("cookies.memory_only")
              }}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              :disabled="busy"
              :aria-label="t('cookies.edit_named', { name: cookie.name })"
              @click="edit(cookie)"
              ><Pencil
            /></Button>
            <Button
              variant="ghost"
              size="icon"
              :disabled="busy"
              :aria-label="t('cookies.delete_named', { name: cookie.name })"
              @click="remove(cookie)"
              ><Trash2
            /></Button>
          </li>
        </ul>
      </template>
      <p v-if="error" role="alert" class="text-lh-red text-sm">{{ error }}</p>
    </DialogContent>
  </Dialog>
</template>
