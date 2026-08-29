<template>
  <main class="items-left flex h-full flex-col gap-5 px-15 py-10">
    <div class="flex items-center justify-between">
      <img id="sh-logo" :src="logo" alt="Logo" class="h-12 w-fit" />
      <div class="flex h-full flex-col justify-between p-0">
        <p class="text-lh-subtext-1 text-right text-sm">
          Make HTTP requests simple, API calls easier
        </p>
        <p class="text-lh-subtext-1 text-right font-bold">v{{ appVersion }}</p>
      </div>
    </div>

    <Separator class="my-2" />

    <div>
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-lh-text-1 text-lh-text text-lg font-bold">
          Release Notes
        </h2>
        <Button variant="ghost" size="sm" @click="openReleaseNotes">
          <ArrowRight class="h-4 w-4" />
          Read More
        </Button>
      </div>
      <div
        class="bg-lh-surface-0 mt-2.5 h-40 overflow-y-scroll rounded-md border p-2"
      >
        <VueMarkdown
          class="changelog-container overflow-y-scroll"
          :options="{ html: true }"
          :plugins="plugins"
          :source="releaseNotes"
        />
      </div>
    </div>

    <div class="flex w-full items-end justify-between gap-2">
      <div>
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-lh-text-1 text-lh-text text-lg font-bold">
            Contributors
          </h2>
        </div>
        <div class="flex items-center gap-4">
          <TooltipProvider :delayDuration="0" disableHoverableContent>
            <div class="flex -space-x-2">
              <Tooltip
                v-for="(contributor, index) in displayContributors"
                :key="contributor.name"
              >
                <TooltipTrigger as-child>
                  <Avatar
                    class="ring-background cursor-pointer ring-2 transition-transform hover:brightness-125"
                    @click="openUrl(contributor.github_url)"
                    :style="{ zIndex: displayContributors.length - index }"
                  >
                    <AvatarImage
                      :src="contributor.avatar_url"
                      :alt="`@${contributor.name}`"
                    />
                    <AvatarFallback>
                      {{ contributor.name.charAt(0).toUpperCase() }}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{{ contributor.name }}</p>
                </TooltipContent>
              </Tooltip>
              <Avatar
                v-if="countributorAvatars.length > 5"
                class="ring-background ring-2 transition-transform hover:brightness-125"
                :style="{ zIndex: 0 }"
              >
                <AvatarFallback>
                  +{{ countributorAvatars.length - 5 }}
                </AvatarFallback>
              </Avatar>
            </div>
          </TooltipProvider>

          <Button variant="ghost" size="sm" @click="openContributors">
            <ArrowRight class="h-4 w-4" />
            All Contributors
          </Button>
        </div>
      </div>
      <Button
        variant="default"
        @click="closeWindow"
        class="flex items-center justify-center gap-1"
      >
        <X class="mr-2 h-4 w-4" />
        Close
      </Button>
    </div>
  </main>
</template>

<script setup lang="ts">
import logo from "@/assets/lighttp_logo_wordmark.svg";
import { getVersion } from "@tauri-apps/api/app";
import { onMounted, onUnmounted, ref, computed } from "vue";
import { Window } from "@tauri-apps/api/window";
import { GitHubInfo, Updater } from "@/services";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRight, X } from "@lucide/vue";

import VueMarkdown from "vue-markdown-render";
import taskLists from "markdown-it-task-lists";
import MarkdownItGitHubAlerts from "markdown-it-github-alerts"; // For > [!NOTE] styles

import { openUrl } from "@tauri-apps/plugin-opener";
import { useI18n } from "vue-i18n";

interface Contributor {
  name: string;
  avatar_url: string;
  github_url: string;
}

const plugins = [taskLists, MarkdownItGitHubAlerts];

const appVersion = ref("");
const releaseNotes = ref("");
const countributorAvatars = ref([] as Contributor[]);

const { t } = useI18n();

onMounted(async () => {
  appVersion.value = await getVersion();
  releaseNotes.value =
    (await Updater.fetchReleaseNotes(appVersion.value)) ||
    t("settings_panel.update.no_release_notes", {
      url: `https://github.com/510208/lighttp/releases/tag/app-v${appVersion.value}`,
    });

  const contributors = await GitHubInfo.fetchContributors();
  countributorAvatars.value = contributors.map((contributor: any) => ({
    name: contributor.login,
    avatar_url: contributor.avatar_url,
    github_url: contributor.html_url,
  }));
});

const displayContributors = computed(() => {
  // 打亂貢獻者陣列的順序，並取五個人做渲染，如果超過五個人，則顯示 +N 的方式
  if (countributorAvatars.value.length > 5) {
    const shuffled = [...countributorAvatars.value].sort(
      () => 0.5 - Math.random(),
    );
    return shuffled.slice(0, 5);
  }

  return countributorAvatars.value;
});

function closeWindow() {
  const appWindow = Window.getCurrent();
  appWindow.close();
}

function openReleaseNotes() {
  openUrl(
    `https://github.com/510208/lighttp/releases/tag/app-v${appVersion.value}`,
  );
}

function openContributors() {
  openUrl(`https://github.com/510208/lighttp/graphs/contributors`);
}

function useEasterEgg() {
  let clickCount = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const logo = document.querySelector("#sh-logo");
  if (!logo) return;

  const handleClick = () => {
    clickCount++;

    clearTimeout(timer);
    timer = setTimeout(() => {
      clickCount = 0;
    }, 5000);

    if (clickCount === 7) {
      openUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      clickCount = 0;
      clearTimeout(timer);
    }
  };

  logo.addEventListener("click", handleClick);

  // 回傳清除函數，供組件卸載時呼叫
  return () => {
    logo.removeEventListener("click", handleClick);
    clearTimeout(timer);
  };
}

let cleanup: (() => void) | undefined;

// 註冊彩蛋到Logo上
onMounted(() => {
  cleanup = useEasterEgg();
});

onUnmounted(() => {
  if (cleanup) cleanup();
});
</script>

<style scoped>
/* 深度選擇器：針對 VueMarkdown 動態產生的 DOM 子元素 */
.changelog-container :deep(h2) {
  font-size: 1.15rem;
  font-weight: 600;
  color: #f0f6fc;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #21262d;
}

.changelog-container :deep(h2:first-child) {
  margin-top: 0;
}

/* 超連結 */
.changelog-container :deep(a) {
  color: #58a6ff;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
}

.changelog-container :deep(a:hover) {
  color: #79c0ff;
  text-decoration: underline;
}

/* GitHub Markdown Alert (Important) */
.changelog-container :deep(.markdown-alert.important) {
  margin: 1rem 0;
  padding: 0.85rem 1rem;
  background-color: rgba(137, 87, 229, 0.1);
  border-left: 4px solid #8957e5;
  border-radius: 0.4rem;
  color: #d2a8ff;
}

.changelog-container :deep(.markdown-alert-icon) {
  fill: #8957e5;
  vertical-align: text-bottom;
  margin-right: 0.35rem;
  display: inline-block;
}

.changelog-container :deep(.markdown-alert span) {
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.changelog-container :deep(.markdown-alert p) {
  margin: 0;
  font-size: 0.875rem;
  color: #c9d1d9;
}

.changelog-container :deep(.markdown-alert a) {
  color: #d2a8ff;
  text-decoration: underline;
}

/* 清單與 Task List */
.changelog-container :deep(ul.contains-task-list) {
  list-style-type: none;
  padding-left: 0;
  margin: 1rem 0;
}

.changelog-container :deep(.task-list-item) {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* 客製化已勾選 Checkbox */
.changelog-container :deep(.task-list-item-checkbox) {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  margin-right: 0.6rem;
  margin-top: 0.2rem;
  border-radius: 4px;
  background-color: #238636;
  border: 1px solid #238636;
  position: relative;
  cursor: default;
  flex-shrink: 0;
}

.changelog-container :deep(.task-list-item-checkbox:checked::after) {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* 強調文字與標籤 */
.changelog-container :deep(strong) {
  color: #f0f6fc;
  font-weight: 600;
}

/* 分隔線 */
.changelog-container :deep(hr) {
  height: 1px;
  background-color: #30363d;
  border: none;
  margin: 1.25rem 0;
}
</style>
