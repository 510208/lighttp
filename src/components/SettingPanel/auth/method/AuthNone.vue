<template>
  <div
    class="text-ctp-text flex h-full w-full flex-col items-center justify-center gap-2 text-sm"
  >
    <IconContainer>
      <Ghost />
    </IconContainer>
    <h3 class="text-ctp-text text-lg font-bold">沒有更多選項</h3>
    <p>此選項無需進一步的認證設定</p>
  </div>
</template>

<script setup lang="ts">
import IconContainer from "@/components/ui/icon-ct/IconContainer.vue";
import { Ghost } from "@lucide/vue";
import { useRequestStore } from "@/stores/useRequestStore";
import { AuthStore } from "@/stores/authType";

// 當選到 "無" 認證方式時，將認證方式設為NoneAuthContent
const requestStore = useRequestStore();
requestStore.setAuth({
  type: "none",
  content: {},
} as AuthStore);
</script>
