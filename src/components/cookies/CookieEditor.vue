<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveCookie } from "@/services/cookies";
import type { CookieInput, ManagedCookie } from "@/types/cookies";
import CookieDatePicker from "./CookieDatePicker.vue";

const props = defineProps<{ cookie: ManagedCookie | null }>();
const emit = defineEmits<{ saved: []; cancel: [] }>();
const { t } = useI18n();
const form = ref<CookieInput>(emptyCookie());
const sameSite = computed({
  get: () => form.value.sameSite ?? "unspecified",
  set: (value: string) => {
    form.value.sameSite =
      value === "unspecified" ? null : (value as CookieInput["sameSite"]);
  },
});
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
    error.value = "";
  },
  { immediate: true },
);

async function save() {
  saving.value = true;
  error.value = "";
  try {
    const expires = form.value.expires;
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
  <form class="lh-settings-page gap-4" @submit.prevent="save">
    <h3 class="lh-settings-page-title">
      {{ cookie ? t("cookies.edit") : t("cookies.add") }}
    </h3>
    <fieldset
      :disabled="saving"
      class="lh-setting-card grid gap-4 sm:grid-cols-2"
    >
      <div class="flex min-w-0 flex-col gap-1">
        <Label for="cookie-name">{{ t("cookies.name") }}</Label>
        <Input
          id="cookie-name"
          v-model="form.name"
          required
          autocomplete="off"
        />
      </div>
      <div class="flex min-w-0 flex-col gap-1">
        <Label for="cookie-value">{{ t("cookies.value") }}</Label>
        <Input id="cookie-value" v-model="form.value" autocomplete="off" />
      </div>
      <div class="flex min-w-0 flex-col gap-1">
        <Label for="cookie-domain">{{ t("cookies.domain") }}</Label>
        <Input
          id="cookie-domain"
          v-model="form.domain"
          required
          placeholder="api.example.com"
        />
      </div>
      <div class="flex min-w-0 flex-col gap-1">
        <Label for="cookie-path">{{ t("cookies.path") }}</Label>
        <Input id="cookie-path" v-model="form.path" required placeholder="/" />
      </div>
      <div class="flex min-w-0 flex-col gap-1">
        <Label>{{ t("cookies.expires") }}</Label>
        <CookieDatePicker v-model="form.expires" :disabled="saving" />
        <span class="text-lh-subtext-0 text-xs">{{
          t("cookies.session_hint")
        }}</span>
      </div>
      <div class="flex min-w-0 flex-col gap-1">
        <Label for="cookie-same-site">SameSite</Label>
        <Select v-model="sameSite">
          <SelectTrigger id="cookie-same-site" class="w-full">
            <SelectValue :placeholder="t('cookies.unspecified')" />
          </SelectTrigger>
          <SelectContent class="bg-lh-base border-lh-surface-2 text-lh-text">
            <SelectItem value="unspecified">{{
              t("cookies.unspecified")
            }}</SelectItem>
            <SelectItem value="Strict">Strict</SelectItem>
            <SelectItem value="Lax">Lax</SelectItem>
            <SelectItem value="None">None</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center justify-between gap-2">
        <Label for="cookie-secure">Secure</Label>
        <Switch id="cookie-secure" v-model="form.secure" />
      </div>
      <div class="flex items-center justify-between gap-2">
        <Label for="cookie-http-only">HttpOnly</Label>
        <Switch id="cookie-http-only" v-model="form.httpOnly" />
      </div>
      <div class="flex items-center justify-between gap-2">
        <Label for="cookie-host-only">{{ t("cookies.host_only") }}</Label>
        <Switch id="cookie-host-only" v-model="form.hostOnly" />
      </div>
      <div class="flex items-center justify-between gap-2">
        <Label for="cookie-persistent">{{ t("cookies.persistent") }}</Label>
        <Switch id="cookie-persistent" v-model="form.persistent" />
      </div>
      <p class="text-lh-subtext-0 text-xs leading-relaxed sm:col-span-2">
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
