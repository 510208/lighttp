<template>
  <div class="min-h-ui flex w-full flex-col gap-4">
    <div class="flex items-center gap-2">
      <Switch id="proxy-enabled" v-model="requestStore.proxyConfig.enabled" />
      <label for="proxy-enabled" class="text-sm font-medium">
        {{ $t("home.settings_panel.tabs.proxy.enable") }}
      </label>
    </div>

    <div
      class="border-muted flex flex-col gap-2 rounded-md border p-4"
      :class="{
        'pointer-events-none opacity-50': !requestStore.proxyConfig.enabled,
      }"
    >
      <!-- Proxy 設定 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <div class="flex flex-1 flex-col gap-1 transition-colors">
            <label class="text-sm font-semibold" for="proxy-host">
              {{ $t("home.settings_panel.tabs.proxy.hostname.label") }}
            </label>
            <div class="flex overflow-hidden rounded-md border">
              <Select
                v-model="requestStore.proxyConfig.protocol"
                class="w-32 flex-shrink-0 rounded-none border-0 bg-transparent p-0"
              >
                <SelectTrigger class="rounded-none border-0">
                  <SelectValue
                    :placeholder="
                      $t(
                        'home.settings_panel.tabs.proxy.hostname.protocol_placeholder',
                      )
                    "
                  />
                </SelectTrigger>
                <SelectContent align="start" class="mt-2">
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="https">HTTPS</SelectItem>
                  <SelectItem value="socks4">SOCKS4</SelectItem>
                  <SelectItem value="socks5">SOCKS5</SelectItem>
                </SelectContent>
              </Select>

              <div
                class="pointer-events-none flex items-center px-2"
                style="
                  background-color: color-mix(
                    in oklab,
                    var(--input) 30%,
                    transparent
                  );
                "
              >
                ://
              </div>

              <Input
                id="proxy-host"
                v-model="requestStore.proxyConfig.host"
                :placeholder="
                  $t('home.settings_panel.tabs.proxy.hostname.placeholder')
                "
                class="focus-visible:bg-ctp-surface0 flex-1 rounded-none border-none transition-colors [&:focus-visible]:ring-0"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold">　</p>
            <p class="text-center font-semibold">:</p>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold" for="proxy-port">
              {{ $t("home.settings_panel.tabs.proxy.port.label") }}
            </label>
            <Input
              id="proxy-port"
              v-model.number="requestStore.proxyConfig.port"
              default-value="8080"
              type="number"
              placeholder="8080"
              class="w-24"
            />
          </div>
        </div>
      </div>

      <Separator class="my-4" />

      <!-- 登入驗證 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <Switch id="proxy-auth-enabled" v-model="proxyAuthEnabled" />
          <label for="proxy-auth-enabled" class="text-sm font-medium">
            {{ $t("home.settings_panel.tabs.proxy.auth.enable_auth.label") }}
          </label>
        </div>

        <div v-if="requestStore.proxyConfig.auth" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold" for="proxy-username">{{
              $t("home.settings_panel.tabs.proxy.auth.username.label")
            }}</label>
            <Input
              id="proxy-username"
              v-model="requestStore.proxyConfig.auth.username"
              :placeholder="
                $t('home.settings_panel.tabs.proxy.auth.username.placeholder')
              "
              :disabled="!proxyAuthEnabled"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold" for="proxy-password">{{
              $t("home.settings_panel.tabs.proxy.auth.password.label")
            }}</label>
            <Input
              id="proxy-password"
              v-model="requestStore.proxyConfig.auth.password"
              type="password"
              :placeholder="
                $t('home.settings_panel.tabs.proxy.auth.password.placeholder')
              "
              :disabled="!proxyAuthEnabled"
            />
          </div>
        </div>
      </div>

      <Separator class="my-4" />

      <!-- 檢查設定 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <Switch
            id="proxy-check-before-send"
            v-model="requestStore.proxyConfig.checkBeforeSend"
          />
          <label for="proxy-check-before-send" class="text-sm font-medium">
            {{ $t("home.settings_panel.tabs.proxy.check_before_send.label") }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Switch } from "@/components/ui/switch";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRequestStore } from "@/stores/useRequestStore.ts";
const requestStore = useRequestStore();

/**
 * 使用具備 getter 和 setter 的 computed
 * 確保 UI 的開關與 Store 內的 auth 物件狀態完全同步
 */
const proxyAuthEnabled = computed({
  get: () => !!requestStore.proxyConfig.auth,
  set: (val: boolean) => {
    if (val) {
      // 開啟時，確保 auth 物件存在
      requestStore.proxyConfig.auth = {
        username: "",
        password: "",
      };
    } else {
      // 關閉時，移除 auth 屬性以符合 ProxyConfig 介面定義
      requestStore.proxyConfig.auth = undefined;
    }
  },
});
</script>
