<template>
  <div class="flex h-full flex-col items-center justify-center gap-4 border-t">
    <IconContainer variant="error">
      <CircleX class="text-ctp-red-100" />
    </IconContainer>
    <div class="flex flex-col items-center justify-center gap-0">
      <h2 class="text-ctp-red-100 text-lg font-semibold">
        {{ $t("home.response_panel.error_response.title") }}
      </h2>
      <p class="text-ctp-red-300 text-sm">
        {{ $t("home.response_panel.error_response.description") }}
      </p>
      <pre
        class="mt-2 overflow-scroll rounded bg-red-50 px-2 py-1 text-left text-xs text-red-500"
        >{{
          parseErrorMessage(responseStoreBody ?? "") ||
          $t("home.response_panel.error_response.no_error_message")
        }}</pre
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import IconContainer from "@/components/ui/icon-ct/IconContainer.vue";
import { CircleX } from "@lucide/vue";

interface Props {
  responseStoreBody: string | undefined;
}

const { responseStoreBody } = defineProps<Props>();

function parseErrorMessage(body: string): string {
  try {
    // 將 -> 替換成 ->\n，讓它能正確換行
    const formattedBody = body.replace(/->/g, "\n->");
    return formattedBody;
  } catch {
    return body;
  }
}
</script>
