import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  QuickTypeError,
} from "quicktype-core";
import { type RequestStoreData } from "@/stores/useRequestStore";
import { BasicAuthContent } from "@/stores/authType";

// 監聽 settingsStore 中的 defaultIndentSize 設定，並變動 indentString 裡的空白長度
function getIndentString(defaultIndentSize: number | string): string {
  // 如果 defaultIndentSize 是字串形式的數字，則重複空白字元；如果是字串，則直接使用該字串作為縮排
  if (typeof defaultIndentSize === "number") {
    return " ".repeat(defaultIndentSize);
  } else if (typeof defaultIndentSize === "string") {
    // 嘗試將字串轉換為數字，如果成功則重複空白字元；如果失敗則直接使用該字串作為縮排
    const indentSize = parseInt(defaultIndentSize, 10);
    if (!isNaN(indentSize)) {
      return " ".repeat(indentSize);
    } else if (defaultIndentSize === "tab") {
      return "\t";
    }
    return defaultIndentSize;
  }
  return "  ";
}

function jsonIsValid(json: string): boolean {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    console.error("JSON validation error:", e);
    return false;
  }
}

async function convertJsonToSchema(
  jsonString: string,
  indentString: string | number,
  typeName: string = "RootObject",
): Promise<string> {
  // Validate JSON first
  if (!jsonIsValid(jsonString)) {
    throw new Error("Invalid JSON: Please check your input JSON syntax");
  }

  try {
    const jsonInput = jsonInputForTargetLanguage("schema");

    await jsonInput.addSource({
      name: typeName,
      samples: [jsonString],
    });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const result = await quicktype({
      inputData,
      lang: "schema",
      indentation: getIndentString(indentString),
    });

    return result.lines.join("\n");
  } catch (error) {
    if (error instanceof QuickTypeError) {
      throw new Error(`Quicktype error: ${error.message}`);
    }
    throw error;
  }
}

async function convertJsonToTypeScript(
  jsonString: string,
  indentString: string | number,
  typeName: string = "RootObject",
): Promise<string> {
  if (!jsonIsValid(jsonString)) {
    throw new Error("Invalid JSON: Please check your input JSON syntax");
  }

  try {
    const jsonInput = jsonInputForTargetLanguage("typescript");

    await jsonInput.addSource({
      name: typeName,
      samples: [jsonString],
    });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const result = await quicktype({
      inputData,
      lang: "typescript",
      indentation: getIndentString(indentString),
    });

    return result.lines.join("\n");
  } catch (error) {
    if (error instanceof QuickTypeError) {
      throw new Error(`Quicktype error: ${error.message}`);
    }
    throw error;
  }
}

async function convertJsonToPython(
  jsonString: string,
  indentString: string | number,
  typeName: string = "RootObject",
): Promise<string> {
  if (!jsonIsValid(jsonString)) {
    throw new Error("Invalid JSON: Please check your input JSON syntax");
  }

  try {
    const jsonInput = jsonInputForTargetLanguage("python");

    await jsonInput.addSource({
      name: typeName,
      samples: [jsonString],
    });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const result = await quicktype({
      inputData,
      lang: "python",
      indentation: getIndentString(indentString),
    });

    return result.lines.join("\n");
  } catch (error) {
    if (error instanceof QuickTypeError) {
      throw new Error(`Quicktype error: ${error.message}`);
    }
    throw error;
  }
}

async function convertJsonToRust(
  jsonString: string,
  indentString: string | number,
  typeName: string = "RootObject",
): Promise<string> {
  if (!jsonIsValid(jsonString)) {
    throw new Error("Invalid JSON: Please check your input JSON syntax");
  }

  try {
    const jsonInput = jsonInputForTargetLanguage("rust");

    await jsonInput.addSource({
      name: typeName,
      samples: [jsonString],
    });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const result = await quicktype({
      inputData,
      lang: "rust",
      indentation: getIndentString(indentString),
    });

    return result.lines.join("\n");
  } catch (error) {
    if (error instanceof QuickTypeError) {
      throw new Error(`Quicktype error: ${error.message}`);
    }
    throw error;
  }
}

function getCurlCommand(
  store: RequestStoreData,
  indentString: string | number,
  breakLineSymbol: string = "\\",
): string {
  // 1. 改用陣列收集每一行的指令片段
  const parts: string[] = [];

  // 基礎 URL
  parts.push(`curl -X ${store.method.toUpperCase()} "${store.url}"`);

  // Headers
  store.headers.forEach((header) => {
    if (header.enabled) {
      parts.push(
        `${getIndentString(indentString)}-H "${header.key}: ${header.value}"`,
      );
    }
  });

  // Auth
  if (store.auth.type === "basic" && store.auth.content) {
    const authContent = store.auth.content as BasicAuthContent;
    parts.push(
      `${getIndentString(indentString)}-u "${authContent.username}:${authContent.password}"`,
    );
  } else if (store.auth.type === "bearer token" && store.auth.content) {
    const token = (store.auth.content as { token: string }).token;
    parts.push(
      `${getIndentString(indentString)}-H "Authorization: Bearer ${token}"`,
    );
  }

  // Body
  if (store.bodyContent && store.bodyType !== "None") {
    // 提示：若 body 內含單引號 '，在 bash 中直接用單引號包裹會出錯，建議維持轉義或處理
    const escapedBody = store.bodyContent;
    parts.push(`${getIndentString(indentString)}-d '${escapedBody}'`);
  }

  // Proxy
  if (store.proxyConfig && store.proxyConfig.host && store.proxyConfig.port) {
    const proxyUrlAuthPart = `${store.proxyConfig.auth ? `${store.proxyConfig.auth.username}:${store.proxyConfig.auth.password}@` : ""}`;
    const proxyUrl = `${store.proxyConfig.protocol}://${proxyUrlAuthPart}${store.proxyConfig.host}:${store.proxyConfig.port}`;
    parts.push(`${getIndentString(indentString)}-x "${proxyUrl}"`);
  }

  return parts.join(` ${breakLineSymbol}\n`);
}

export {
  convertJsonToSchema,
  convertJsonToTypeScript,
  convertJsonToPython,
  convertJsonToRust,
  getCurlCommand,
};
