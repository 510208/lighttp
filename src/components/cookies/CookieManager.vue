<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  Cookie,
  Globe,
  HardDriveDownload,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
const { t, locale } = useI18n();
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

function expiry(cookie: ManagedCookie) {
  return cookie.expires
    ? new Date(cookie.expires * 1000).toLocaleString(locale.value)
    : t("cookies.session");
}
</script>

<template>
  <Dialog v-model:open="store.managerOpen">
    <DialogContent class="lh-settings-dialog text-lh-text !max-w-[1200px]">
      <div class="lh-settings-layout">
        <aside
          class="lh-settings-sidebar w-44 shrink-0 sm:w-[200px]"
          :aria-label="t('cookies.sites')"
        >
          <DialogHeader class="lh-settings-heading">
            <DialogTitle class="lh-settings-title">{{
              t("cookies.manager")
            }}</DialogTitle>
            <DialogDescription class="lh-settings-version">
              {{ t("cookies.subtitle") }}
            </DialogDescription>
          </DialogHeader>
          <div class="lh-settings-search min-w-0 px-2 sm:px-3">
            <Search class="size-4 shrink-0" aria-hidden="true" />
            <Input
              v-model="search"
              :placeholder="t('cookies.search')"
              :aria-label="t('cookies.search')"
              class="w-auto border-none !bg-transparent p-0 hover:ring-0"
            />
          </div>
          <Label class="text-lh-subtext-0 px-2 text-xs">{{
            t("cookies.sites")
          }}</Label>
          <nav
            class="flex min-h-0 flex-col gap-1"
            :aria-label="t('cookies.sites')"
          >
            <Button
              variant="ghost"
              class="sh-settings-tab"
              :data-state="selectedDomain === null ? 'active' : 'inactive'"
              :aria-pressed="selectedDomain === null"
              @click="selectedDomain = null"
            >
              <Globe class="size-4 shrink-0" />
              <span class="truncate">{{ t("cookies.all_sites") }}</span>
            </Button>
            <Button
              v-for="domain in domains"
              :key="domain"
              variant="ghost"
              class="sh-settings-tab"
              :data-state="selectedDomain === domain ? 'active' : 'inactive'"
              :aria-pressed="selectedDomain === domain"
              :title="domain"
              @click="selectedDomain = domain"
            >
              <Globe class="size-4 shrink-0" />
              <span class="min-w-0 truncate">{{ domain }}</span>
            </Button>
          </nav>
        </aside>
        <main class="lh-settings-content" tabindex="-1">
          <div class="mb-4 flex flex-wrap items-center justify-end gap-2 pr-8">
            <Button
              variant="ghost"
              size="icon"
              :disabled="busy"
              :aria-label="t('cookies.refresh')"
              @click="run(() => store.refresh())"
            >
              <RefreshCw class="size-4" />
            </Button>
            <Button v-if="!editing" :disabled="busy" @click="edit(null)">
              <Plus class="size-4" />{{ t("cookies.add") }}
            </Button>
            <Button
              v-if="!editing"
              variant="destructive"
              :disabled="busy || !store.cookies.length"
              @click="confirmingClear = true"
            >
              {{ t("cookies.clear") }}
            </Button>
          </div>
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
              <li
                v-for="cookie in visibleCookies"
                :key="cookie.id"
                class="lh-setting-card gap-3"
              >
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
                <dl
                  class="grid min-w-0 grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2"
                >
                  <div class="flex min-w-0 gap-2">
                    <dt class="text-lh-subtext-0 shrink-0">
                      {{ t("cookies.domain") }}
                    </dt>
                    <dd class="truncate" :title="cookie.domain">
                      {{ cookie.domain }}
                    </dd>
                  </div>
                  <div class="flex min-w-0 gap-2">
                    <dt class="text-lh-subtext-0 shrink-0">
                      {{ t("cookies.path") }}
                    </dt>
                    <dd class="truncate" :title="cookie.path">
                      {{ cookie.path }}
                    </dd>
                  </div>
                  <div class="flex min-w-0 gap-2">
                    <dt class="text-lh-subtext-0 shrink-0">
                      {{ t("cookies.expires_short") }}
                    </dt>
                    <dd class="truncate" :title="expiry(cookie)">
                      {{ expiry(cookie) }}
                    </dd>
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
                    @click="togglePersistent(cookie)"
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
                    @click="remove(cookie)"
                  >
                    <Trash2 class="size-4" />{{ t("cookies.remove") }}
                  </Button>
                  <Button size="sm" :disabled="busy" @click="edit(cookie)">
                    <Pencil class="size-4" />{{ t("cookies.edit") }}
                  </Button>
                </div>
              </li>
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
