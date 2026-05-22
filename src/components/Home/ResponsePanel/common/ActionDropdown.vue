<template>
  <div class="absolute right-6 bottom-10">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="icon-sm">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="copyToClipboard">
          <Copy />
          {{ $t("home.response_panel.body_panel.copy_response") }}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem @click="generateJsonSchema">
          <Braces />
          {{ $t("home.response_panel.body_panel.generate_json_schema") }}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <BookA />
            {{ $t("home.response_panel.body_panel.generate_type_definition") }}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent class="mr-2">
              <DropdownMenuItem @click="generatePythonType">
                {{ $t("home.response_panel.body_panel.language_python") }}
              </DropdownMenuItem>
              <DropdownMenuItem @click="generateTypeScriptType">
                {{ $t("home.response_panel.body_panel.language_typescript") }}
              </DropdownMenuItem>
              <DropdownMenuItem @click="generateRustType">
                {{ $t("home.response_panel.body_panel.language_rust") }}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Terminal />
            {{ $t("home.response_panel.body_panel.generate_curl") }}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent class="mr-2">
              <DropdownMenuItem @click="generateCurlCommand('`')">
                <Grid2x2 />
                {{
                  $t("home.response_panel.body_panel.generate_curl_powershell")
                }}
              </DropdownMenuItem>
              <DropdownMenuItem @click="generateCurlCommand('\\')">
                <Terminal />
                {{ $t("home.response_panel.body_panel.generate_curl_bash") }}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>

    <StructureDialog
      v-model:open="isModalOpen"
      :schema="generatedSchema"
      :language="schemaLanguage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue-sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import Button from "../../../ui/button/Button.vue";
import StructureDialog from "./StructureDialog.vue";
import {
  EllipsisVertical,
  Copy,
  Braces,
  BookA,
  Terminal,
  Grid2x2,
} from "@lucide/vue";
import { useRequestStore } from "@/stores/useRequestStore.ts";
import { useResponseStore } from "@/stores/useResponseStore.ts";
import { useSettingsStore } from "@/stores/useSettingsStore.ts";
import {
  convertJsonToSchema,
  convertJsonToTypeScript,
  convertJsonToPython,
  convertJsonToRust,
  getCurlCommand,
} from "@/lib/getStructure.ts";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const requestStore = useRequestStore();
const responseStore = useResponseStore();
const settingsStore = useSettingsStore();

const isModalOpen = ref(false);
const generatedSchema = ref<string | null>(null);
const schemaLanguage = ref<string>("json");

function getContent(): string {
  if (responseStore.body === "") {
    return "";
  }
  const bodyObject = JSON.parse(responseStore.body);
  console.log("[Parsed Body Object]:", bodyObject);
  console.log(
    "[Stringified Body Object]:",
    JSON.stringify(bodyObject, null, 2),
  );
  return JSON.stringify(bodyObject, null, 2);
}

function copyToClipboard() {
  const textToCopy = getContent();
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      toast.success(t("home.response_panel.body_panel.toast.copy_success"));
    })
    .catch((err) => {
      console.error("Failed to copy response body: ", err);
      toast.error(
        t("home.response_panel.body_panel.toast.copy_error", { error: err }),
      );
    });
}

async function generateJsonSchema() {
  if (responseStore.body === "") {
    console.warn("Response body is empty. Cannot generate JSON Schema.");
    toast.error(
      t("home.response_panel.body_panel.toast.empty_body_json_schema"),
    );
    return;
  }
  try {
    const jsonSchema = await convertJsonToSchema(
      responseStore.body,
      settingsStore.defaultIndentSize,
    );
    console.log("Generated JSON Schema:", jsonSchema);

    generatedSchema.value = jsonSchema;
    schemaLanguage.value = "json";
    isModalOpen.value = true;
  } catch (error) {
    console.error(
      "Failed to parse response body or generate JSON Schema: ",
      error,
    );
  }
}

async function generateTypeScriptType() {
  if (responseStore.body === "") {
    console.warn(
      "Response body is empty. Cannot generate TypeScript definitions.",
    );
    toast.error(
      t("home.response_panel.body_panel.toast.empty_body_typescript"),
    );
    return;
  }
  try {
    const typeScriptDef = await convertJsonToTypeScript(
      responseStore.body,
      settingsStore.defaultIndentSize,
    );
    console.log("Generated TypeScript Definitions:", typeScriptDef);

    generatedSchema.value = typeScriptDef;
    schemaLanguage.value = "typescript";
    isModalOpen.value = true;
  } catch (error) {
    console.error(
      "Failed to parse response body or generate TypeScript definitions: ",
      error,
    );
  }
}

async function generatePythonType() {
  if (responseStore.body === "") {
    console.warn("Response body is empty. Cannot generate Python definitions.");
    toast.error(t("home.response_panel.body_panel.toast.empty_body_python"));
    return;
  }
  try {
    const pythonDef = await convertJsonToPython(
      responseStore.body,
      settingsStore.defaultIndentSize,
    );
    console.log("Generated Python Definitions:", pythonDef);

    generatedSchema.value = pythonDef;
    schemaLanguage.value = "python";
    isModalOpen.value = true;
  } catch (error) {
    console.error(
      "Failed to parse response body or generate Python definitions: ",
      error,
    );
  }
}

async function generateRustType() {
  if (responseStore.body === "") {
    console.warn("Response body is empty. Cannot generate Rust definitions.");
    toast.error(t("home.response_panel.body_panel.toast.empty_body_rust"));
    return;
  }
  try {
    const rustDef = await convertJsonToRust(
      responseStore.body,
      settingsStore.defaultIndentSize,
    );
    console.log("Generated Rust Definitions:", rustDef);

    generatedSchema.value = rustDef;
    schemaLanguage.value = "rust";
    isModalOpen.value = true;
  } catch (error) {
    console.error(
      "Failed to parse response body or generate Rust definitions: ",
      error,
    );
  }
}

function generateCurlCommand(symbol: string) {
  const curlCommand = getCurlCommand(
    requestStore,
    settingsStore.defaultIndentSize,
    symbol,
  );
  generatedSchema.value = curlCommand;
  schemaLanguage.value = "shell";
  isModalOpen.value = true;
}
</script>
