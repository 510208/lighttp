<template>
  <div class="relative flex h-full flex-col border-t">
    <CodeViewer
      :model-value="responseStore.body"
      :language="responseLanguage"
      v-if="!bodyIsMedia()"
    />
    <div
      v-else
      class="flex h-full w-full items-center justify-center overflow-auto bg-zinc-900 p-4"
    >
      <div
        class="bg-lh-surface-variant flex h-full flex-col items-center justify-center gap-4 rounded p-6"
        v-if="!forceShowMedia"
      >
        <IconContainer><Binary /></IconContainer>

        <p class="text-lh-overlay-2 text-sm">
          {{ $t("home.response_panel.body_panel.media_hidden_warning") }}<br />
          {{ $t("home.response_panel.body_panel.media_hidden_hint") }}
        </p>

        <Button
          variant="outline"
          @click="
            forceShowMedia = true;

            toast.success(
              $t('home.response_panel.body_panel.toast.force_show_success'),
            );
          "
        >
          {{ $t("home.response_panel.body_panel.force_show_button") }}
        </Button>
      </div>

      <div v-else class="h-full">
        <template v-if="getMediaType() === 'image'">
          <img
            :src="mediaUrl"
            class="max-h-full max-w-full object-contain shadow-lg"
          />
        </template>

        <template v-else-if="getMediaType() === 'video'">
          <video :src="mediaUrl" controls class="max-h-full max-w-full"></video>
        </template>

        <template v-else-if="getMediaType() === 'audio'">
          <audio :src="mediaUrl" controls></audio>
        </template>

        <template v-else>
          <iframe
            :srcdoc="responseStore.body"
            sandbox="allow-forms allow-modals"
            class="h-full w-full rounded"
          ></iframe>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconContainer from "@/components/ui/icon-ct/IconContainer.vue";
import { Button } from "@/components/ui/button";
import CodeViewer from "@/components/ui/editor/CodeViewer.vue";

import { useResponseStore } from "@/stores/useResponseStore.ts";
import { Binary } from "@lucide/vue";
import { onUnmounted, ref, watch } from "vue";
import { toast } from "vue-sonner";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const forceShowMedia = ref(false);
const mediaUrl = ref<string>("");

const responseStore = useResponseStore();
const URL = globalThis.URL;

// 監控 responseStore.headers 中的 Content-Type，根據不同的類型設置 responseLanguage
const responseLanguage = ref<string>("json");

/**
 * 通用安全取值函式：從 Headers 物件中尋找特定 Key（不區分大小寫），並統一回傳字串陣列
 */
function getHeaderValues(
  headers: Record<string, string | string[]> | undefined,
  targetKey: string,
): string[] {
  if (!headers || typeof headers !== "object") return [];

  const foundEntry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === targetKey.toLowerCase(),
  );

  if (!foundEntry) return [];

  const val = foundEntry[1];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return [val];
  return [];
}

/**
 * 取得主要的 Content-Type 字串（取第一個值）
 */
function getPrimaryContentType(): string {
  const values = getHeaderValues(responseStore.headers, "content-type");
  return values[0]?.toLowerCase() || "";
}

watch(
  () => responseStore.headers,
  (newHeaders) => {
    if (!newHeaders || typeof newHeaders !== "object") {
      responseLanguage.value = "json";
      return;
    }

    const contentType = getPrimaryContentType();

    if (contentType) {
      forceShowMedia.value = false; // 每次 headers 更新時重置強制顯示媒體的狀態

      if (contentType.includes("application/json")) {
        responseLanguage.value = "json";
      } else if (
        contentType.includes("application/xml") ||
        contentType.includes("text/xml")
      ) {
        responseLanguage.value = "xml";
      } else if (contentType.includes("text/html")) {
        responseLanguage.value = "html";
      } else {
        responseLanguage.value = "text";
      }
    } else {
      console.warn("Content-Type header not found. Defaulting to JSON.");
      responseLanguage.value = "json";
    }
  },
  { immediate: true },
);

function getMediaType(): "image" | "video" | "audio" | "other" {
  const contentType = getPrimaryContentType();

  if (contentType.includes("image/")) return "image";
  if (contentType.includes("video/")) return "video";
  if (contentType.includes("audio/")) return "audio";
  return "other";
}

/**
 * 輔助函式：將 Base64 字串轉換為 Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

watch(
  [() => responseStore.body, forceShowMedia],
  ([newBody, show]) => {
    // 釋放舊的 URL 物件，避免記憶體洩漏
    if (mediaUrl.value) {
      URL.revokeObjectURL(mediaUrl.value);
      mediaUrl.value = "";
    }

    // 只有在使用者點擊「強制顯示」且有資料時才執行
    if (show && newBody) {
      const contentType = getPrimaryContentType() || "application/octet-stream";

      try {
        // 將 Base64 還原為二進位數據
        const pureBase64 = newBody.includes(",")
          ? newBody.split(",")[1]
          : newBody;
        const byteArray = base64ToUint8Array(pureBase64);

        // 使用 Array.from 或是明確轉為 BlobPart 陣列
        const blob = new Blob([byteArray] as BlobPart[], { type: contentType });
        console.log("[Generated Media Blob]:", blob);

        // 生成 URL
        mediaUrl.value = URL.createObjectURL(blob);
      } catch (error) {
        console.error("[Base64 Decode Error]:", error);
        toast.error(
          t("home.response_panel.body_panel.toast.media_decode_error"),
        );
      }
    }
  },
  { immediate: true },
);

function bodyIsMedia(): boolean {
  // 取得 Content-Type 的所有設定值進行檢查
  const contentTypeValues = getHeaderValues(
    responseStore.headers,
    "content-type",
  );

  const isMedia = contentTypeValues.some((val) => {
    const lower = val.toLowerCase();
    return (
      lower.includes("image/") ||
      lower.includes("video/") ||
      lower.includes("audio/")
    );
  });

  console.log("[Content-Type Values]:", contentTypeValues);
  console.log("[Is Media]:", isMedia);
  return isMedia;
}

onUnmounted(() => {
  if (mediaUrl.value) {
    URL.revokeObjectURL(mediaUrl.value);
  }
});
</script>

<style scoped></style>
