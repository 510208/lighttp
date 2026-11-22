import { i18n } from "@/i18n";
import type { RequestState } from "@/types/workspace";

export function validateBodyFiles(
  request: Pick<RequestState, "bodyType" | "formData" | "bodyFilePath">,
): void {
  if (request.bodyType === "Binary" && !request.bodyFilePath?.trim()) {
    throw new Error(
      i18n.global.t("home.settings_panel.tabs.body.file_required"),
    );
  }
  if (request.bodyType === "Form Data") {
    const missingFile = request.formData.find(
      (field) =>
        field.enabled &&
        field.key &&
        field.type === "file" &&
        !field.filePath?.trim(),
    );
    if (missingFile) {
      throw new Error(
        i18n.global.t("home.settings_panel.tabs.body.field_file_required", {
          name: missingFile.key,
        }),
      );
    }
  }
}
