<template>
  <Tabs default-value="params">
    <TabsList class="gap-5 bg-transparent p-0">
      <TabsOptions
        value="params"
        name="Params"
        :chinese-name="$t('settings_panel.tabs.params')"
      />
      <TabsOptions
        value="headers"
        name="Headers"
        :chinese-name="$t('settings_panel.tabs.headers')"
      />
      <TabsOptions
        value="auth"
        name="Auth"
        :chinese-name="$t('settings_panel.tabs.auth')"
      />
      <TabsOptions
        value="body"
        name="Body"
        :chinese-name="$t('settings_panel.tabs.body')"
      />
      <TabsOptions
        value="proxy"
        name="Proxy"
        :chinese-name="$t('settings_panel.tabs.proxy')"
      />
    </TabsList>
    <div id="setting-panel-content" class="min-h-30">
      <TabsContent value="params" as-child><ParamTable /></TabsContent>
      <TabsContent value="headers" as-child><HeaderTable /></TabsContent>
      <TabsContent value="auth" as-child>
        <KeepAlive><AuthPanel /></KeepAlive>
      </TabsContent>
      <TabsContent value="body" as-child>
        <KeepAlive><BodyPanel /></KeepAlive>
      </TabsContent>
      <TabsContent value="proxy" as-child><ProxyPanel /></TabsContent>
    </div>
  </Tabs>
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TabsOptions from "@/components/common/TabsOption.vue";
import ParamTable from "./params/ParamTable.vue";
import HeaderTable from "./headers/HeaderTable.vue";
import AuthPanel from "./auth/AuthPanel.vue";
import BodyPanel from "./body/BodyPanel.vue";
import ProxyPanel from "./proxy/ProxyPanel.vue";
</script>
