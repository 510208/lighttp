<script setup lang="ts">
import { computed } from "vue";
import { Plus, Trash } from "@lucide/vue";
import Button from "@/components/ui/button/Button.vue";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BodyFilePicker from "../BodyFilePicker.vue";
import { useRequestStore } from "@/stores/useRequestStore";
import { selectBodyFile } from "@/services/requestBodyFile";
import type { FormDataField } from "@/types/workspace";

const props = defineProps<{ multipart: boolean }>();
const requestStore = useRequestStore();
const fields = computed<FormDataField[]>(() =>
  props.multipart
    ? requestStore.formData
    : requestStore.urlEncoded.map((item) => ({
        ...item,
        type: "text",
        filePath: null,
      })),
);

function updateField(id: string, updates: Partial<Omit<FormDataField, "id">>) {
  if (props.multipart) requestStore.updateFormData(id, updates);
  else requestStore.updateUrlEncoded(id, updates);
}

function toggleField(id: string, enabled: boolean) {
  if (props.multipart) requestStore.updateFormData(id, { enabled });
  else {
    const item = requestStore.urlEncoded.find((item) => item.id === id);
    if (item) item.enabled = enabled;
  }
}

function setFieldType(id: string, value: unknown) {
  if (value === "text" || value === "file") {
    requestStore.updateFormData(id, { type: value });
  }
}
</script>

<template>
  <div class="flex min-w-0 flex-col gap-4 p-4">
    <Button
      variant="outline"
      class="w-fit gap-2"
      @click="
        multipart ? requestStore.addFormData() : requestStore.addUrlEncoded()
      "
    >
      <Plus :size="16" />
      {{ $t("home.settings_panel.tabs.body.add_field") }}
    </Button>

    <div class="border-lh-surface-1 max-h-80 overflow-auto rounded-lg border">
      <Table class="w-full min-w-96 table-fixed">
        <TableHeader class="bg-lh-crust sticky top-0 z-10">
          <TableRow class="border-lh-surface-1 hover:bg-transparent">
            <TableHead class="w-10">
              <span class="sr-only">{{
                $t("home.settings_panel.tabs.body.enabled")
              }}</span>
            </TableHead>
            <TableHead>{{
              $t("home.settings_panel.tabs.body.field_name")
            }}</TableHead>
            <TableHead v-if="multipart" class="w-24">
              {{ $t("home.settings_panel.tabs.body.field_type") }}
            </TableHead>
            <TableHead>{{
              $t("home.settings_panel.tabs.body.field_value")
            }}</TableHead>
            <TableHead class="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="item in fields"
            :key="item.id"
            class="hover:bg-lh-surface-0/50"
            :class="{ 'opacity-50': !item.enabled }"
          >
            <TableCell class="text-center align-top">
              <Checkbox
                :model-value="item.enabled"
                :aria-label="$t('home.settings_panel.tabs.body.enabled')"
                @update:model-value="toggleField(item.id, $event === true)"
              />
            </TableCell>
            <TableCell class="align-top">
              <Input
                :model-value="item.key"
                :aria-label="$t('home.settings_panel.tabs.body.field_name')"
                @update:model-value="
                  updateField(item.id, { key: String($event) })
                "
              />
            </TableCell>
            <TableCell v-if="multipart" class="align-top">
              <Select
                :model-value="item.type"
                @update:model-value="setFieldType(item.id, $event)"
              >
                <SelectTrigger
                  size="sm"
                  :aria-label="$t('home.settings_panel.tabs.body.field_type')"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">{{
                    $t("home.settings_panel.tabs.body.text")
                  }}</SelectItem>
                  <SelectItem value="file">{{
                    $t("home.settings_panel.tabs.body.file")
                  }}</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell class="align-top">
              <BodyFilePicker
                v-if="multipart && item.type === 'file'"
                :file-path="item.filePath"
                @select="selectBodyFile(item.id)"
                @remove="updateField(item.id, { filePath: null })"
              />
              <Input
                v-else
                :model-value="item.value"
                :aria-label="$t('home.settings_panel.tabs.body.field_value')"
                @update:model-value="
                  updateField(item.id, { value: String($event) })
                "
              />
            </TableCell>
            <TableCell class="align-top">
              <Button
                variant="destructive"
                size="icon-sm"
                :aria-label="$t('home.settings_panel.tabs.body.remove_field')"
                @click="
                  multipart
                    ? requestStore.removeFormData(item.id)
                    : requestStore.removeUrlEncoded(item.id)
                "
              >
                <Trash class="text-lh-red" :size="16" />
              </Button>
            </TableCell>
          </TableRow>
          <TableRow v-if="fields.length === 0">
            <TableCell
              :colspan="multipart ? 5 : 4"
              class="text-lh-subtext-1 py-6 text-center"
            >
              {{ $t("home.settings_panel.tabs.body.empty_fields") }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <p v-if="multipart" class="text-lh-subtext-1 text-sm">
      {{ $t("home.settings_panel.tabs.body.file_path_hint") }}
    </p>
  </div>
</template>
