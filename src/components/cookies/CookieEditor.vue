<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { saveCookie } from "@/services/cookies";
import type { CookieInput, ManagedCookie } from "@/types/cookies";

const props = defineProps<{ cookie: ManagedCookie | null }>();
const emit = defineEmits<{ saved: []; cancel: [] }>();
const { t } = useI18n();
const form = ref<CookieInput>(emptyCookie());
const expiresAt = ref("");
const saving = ref(false);
const error = ref("");

function emptyCookie(): CookieInput {
  return {
    name: "",
    value: "",
    domain: "",
    path: "/",
    secure: false,
    httpOnly: false,
    hostOnly: true,
    persistent: false,
    expires: null,
    sameSite: null,
  };
}

watch(
  () => props.cookie,
  (cookie) => {
    form.value = cookie ? { ...cookie } : emptyCookie();
    const date = cookie?.expires ? new Date(cookie.expires * 1000) : null;
    // datetime-local 使用本地時間，送至 Rust 前再轉回 Unix timestamp。
    expiresAt.value = date
      ? new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
          .toISOString()
          .slice(0, 19)
      : "";
    error.value = "";
  },
  { immediate: true },
);

async function save() {
  saving.value = true;
  error.value = "";
  try {
    const expires = expiresAt.value
      ? Math.floor(new Date(expiresAt.value).getTime() / 1000)
      : null;
    if (expires !== null && !Number.isFinite(expires)) {
      throw new Error(t("cookies.invalid_expiry"));
    }
    await saveCookie({ ...form.value, expires });
    emit("saved");
  } catch (cause) {
    error.value = String(cause);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="save">
    <h3 class="font-semibold">
      {{ cookie ? t("cookies.edit") : t("cookies.add") }}
    </h3>
    <fieldset :disabled="saving" class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1 text-sm">
        {{ t("cookies.name") }}
        <Input v-model="form.name" required autocomplete="off" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        {{ t("cookies.value") }}
        <Input v-model="form.value" autocomplete="off" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        {{ t("cookies.domain") }}
        <Input v-model="form.domain" required placeholder="api.example.com" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        {{ t("cookies.path") }}
        <Input v-model="form.path" required placeholder="/" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        {{ t("cookies.expires") }}
        <Input v-model="expiresAt" type="datetime-local" step="1" />
        <span class="text-lh-subtext-0 text-xs">{{
          t("cookies.session_hint")
        }}</span>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        SameSite
        <select v-model="form.sameSite" class="lh-control h-9 px-3">
          <option :value="null">{{ t("cookies.unspecified") }}</option>
          <option value="Strict">Strict</option>
          <option value="Lax">Lax</option>
          <option value="None">None</option>
        </select>
      </label>
      <label class="flex items-center gap-2 text-sm">
        <Switch v-model="form.secure" /> Secure
      </label>
      <label class="flex items-center gap-2 text-sm">
        <Switch v-model="form.httpOnly" /> HttpOnly
      </label>
      <label class="flex items-center gap-2 text-sm">
        <Switch v-model="form.hostOnly" /> {{ t("cookies.host_only") }}
      </label>
      <label class="flex items-center gap-2 text-sm">
        <Switch v-model="form.persistent" /> {{ t("cookies.persistent") }}
      </label>
      <p class="text-lh-subtext-0 text-xs sm:col-span-2">
        {{ t("cookies.persistence_hint") }}
      </p>
    </fieldset>
    <p v-if="error" role="alert" class="text-lh-red text-sm">{{ error }}</p>
    <div class="flex justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        :disabled="saving"
        @click="emit('cancel')"
      >
        {{ t("cookies.cancel") }}
      </Button>
      <Button type="submit" :disabled="saving">{{ t("cookies.save") }}</Button>
    </div>
  </form>
</template>
