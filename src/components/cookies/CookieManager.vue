<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCookieStore } from "@/stores/useCookieStore";
import {
  clearCookies,
  deleteCookie,
  setCookiePersistence,
} from "@/services/cookies";
import type { ManagedCookie } from "@/types/cookies";
import CookieEditor from "./CookieEditor.vue";
import CookieItem from "./CookieItem.vue";
import CookieManagerActions from "./CookieManagerActions.vue";
import CookieManagerSidebar from "./CookieManagerSidebar.vue";

const store = useCookieStore();
const { t } = useI18n();
const search = ref("");
const selectedDomain = ref<string | null>(null);
const editing = ref(false);
const selected = ref<ManagedCookie | null>(null);
const busy = ref(false);
const error = ref("");
const confirmingClear = ref(false);
const domains = computed(() =>
  [...new Set(store.cookies.map((cookie) => cookie.domain))].sort((a, b) =>
    a.localeCompare(b),
  ),
);
const visibleCookies = computed(() => {
  const query = search.value.trim().toLowerCase();
  return store.cookies.filter((cookie) => {
    const matchesDomain =
      !selectedDomain.value || cookie.domain === selectedDomain.value;
    const matchesSearch = [cookie.name, cookie.domain, cookie.path].some(
      (value) => value.toLowerCase().includes(query),
    );
    return matchesDomain && matchesSearch;
  });
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
watch(domains, (available) => {
  if (selectedDomain.value && !available.includes(selectedDomain.value)) {
    selectedDomain.value = null;
  }
});

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
    <DialogContent class="lh-settings-dialog text-lh-text !max-w-[1200px]">
      <div class="lh-settings-layout">
        <CookieManagerSidebar
          v-model:search="search"
          v-model:selected-domain="selectedDomain"
          :domains="domains"
        />
        <main class="lh-settings-content" tabindex="-1">
          <CookieManagerActions
            :busy="busy"
            :editing="editing"
            :has-cookies="store.cookies.length > 0"
            @refresh="run(() => store.refresh())"
            @add="edit(null)"
            @confirm-clear="confirmingClear = true"
          />
          <CookieEditor
            v-if="editing"
            :cookie="selected"
            @saved="saved"
            @cancel="editing = false"
          />
          <template v-else>
            <div
              v-if="confirmingClear"
              class="border-lh-red/40 mb-4 flex flex-wrap items-center gap-2 border p-3"
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
            <ul v-else class="flex flex-col gap-4">
              <CookieItem
                v-for="cookie in visibleCookies"
                :key="cookie.id"
                :cookie="cookie"
                :busy="busy"
                @toggle-persistent="togglePersistent"
                @remove="remove"
                @edit="edit"
              />
            </ul>
          </template>
          <p v-if="error" role="alert" class="text-lh-red mt-4 text-sm">
            {{ error }}
          </p>
        </main>
      </div>
    </DialogContent>
  </Dialog>
</template>
