<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "@/stores/useSettingsStore";
import {
  createDefaultHttpClientConfig,
  normalizeHttpClientConfig,
  MAX_TIMEOUT_SECONDS,
  MAX_REDIRECTS,
  type HttpClientConfig,
} from "@/lib/httpClientConfig";
import { Separator } from "@/components/ui/separator";
import {
  SettingsPageHeader,
  SettingsSection,
  SettingRow,
  SettingSwitch,
  SettingInput,
  SettingAction,
} from "@/components/settings/components";

const settingsStore = useSettingsStore();
const config = computed(() =>
  normalizeHttpClientConfig(settingsStore.httpClientConfig),
);
const timeoutFields = ["timeout", "connectTimeout", "readTimeout"] as const;
type NumericSetting = (typeof timeoutFields)[number] | "maxRedirects";
type BooleanSetting = "followRedirects" | "referer" | "httpsOnly";

function updateSetting<K extends keyof HttpClientConfig>(
  key: K,
  value: HttpClientConfig[K],
) {
  settingsStore.httpClientConfig = { ...config.value, [key]: value };
}

function updateNumber(key: NumericSetting, event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.valueAsNumber;

  // 僅在完成輸入後寫入合法整數，清空或無效輸入會還原原值。
  if (input.validity.valid && Number.isSafeInteger(value)) {
    updateSetting(key, value);
  }
  input.value = String(config.value[key]);
}

function updateBoolean(key: BooleanSetting, value: boolean) {
  updateSetting(key, value);
}
</script>

<template>
  <div class="lh-settings-page">
    <SettingsPageHeader
      :title="$t('settings_panel.http_client.title')"
      :description="$t('settings_panel.http_client.description')"
    >
      <template #actions>
        <SettingAction
          @click="
            settingsStore.httpClientConfig = createDefaultHttpClientConfig()
          "
        >
          {{ $t("settings_panel.http_client.reset") }}
        </SettingAction>
      </template>
    </SettingsPageHeader>

    <SettingsSection :title="$t('settings_panel.http_client.timeouts')">
      <template v-for="(field, index) in timeoutFields" :key="field">
        <Separator v-if="index > 0" />
        <SettingRow
          :title="$t(`settings_panel.http_client.${field}.label`)"
          :description="$t(`settings_panel.http_client.${field}.description`)"
        >
          <SettingInput
            :model-value="config[field]"
            type="number"
            class="w-32"
            :min="0"
            :max="MAX_TIMEOUT_SECONDS"
            :step="1"
            required
            :aria-label="$t(`settings_panel.http_client.${field}.label`)"
            @change="updateNumber(field, $event)"
          />
        </SettingRow>
      </template>
    </SettingsSection>

    <Separator />

    <SettingsSection :title="$t('settings_panel.http_client.redirects')">
      <SettingRow
        :title="$t('settings_panel.http_client.followRedirects.label')"
        :description="
          $t('settings_panel.http_client.followRedirects.description')
        "
      >
        <SettingSwitch
          :model-value="config.followRedirects"
          :aria-label="$t('settings_panel.http_client.followRedirects.label')"
          @update:model-value="updateBoolean('followRedirects', $event)"
        />
      </SettingRow>

      <Separator />

      <SettingRow
        :title="$t('settings_panel.http_client.maxRedirects.label')"
        :description="$t('settings_panel.http_client.maxRedirects.description')"
      >
        <SettingInput
          :model-value="config.maxRedirects"
          type="number"
          class="w-32"
          :min="1"
          :max="MAX_REDIRECTS"
          :step="1"
          required
          :disabled="!config.followRedirects"
          :aria-label="$t('settings_panel.http_client.maxRedirects.label')"
          @change="updateNumber('maxRedirects', $event)"
        />
      </SettingRow>

      <Separator />

      <SettingRow
        :title="$t('settings_panel.http_client.referer.label')"
        :description="$t('settings_panel.http_client.referer.description')"
      >
        <SettingSwitch
          :model-value="config.referer"
          :disabled="!config.followRedirects"
          :aria-label="$t('settings_panel.http_client.referer.label')"
          @update:model-value="updateBoolean('referer', $event)"
        />
      </SettingRow>
    </SettingsSection>

    <Separator />

    <SettingsSection :title="$t('settings_panel.http_client.connection')">
      <SettingRow
        :title="$t('settings_panel.http_client.httpsOnly.label')"
        :description="$t('settings_panel.http_client.httpsOnly.description')"
      >
        <SettingSwitch
          :model-value="config.httpsOnly"
          :aria-label="$t('settings_panel.http_client.httpsOnly.label')"
          @update:model-value="updateBoolean('httpsOnly', $event)"
        />
      </SettingRow>
    </SettingsSection>
  </div>
</template>
