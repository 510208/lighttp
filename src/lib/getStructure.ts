import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  QuickTypeError,
} from "quicktype-core";
import { type RequestStoreData } from "@/stores/useRequestStore";
import { BasicAuthContent } from "@/stores/authType";

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
  breakLineSymbol: string = "\\",
): string {
  // 1. 改用陣列收集每一行的指令片段
  const parts: string[] = [];

  // 基礎 URL
  parts.push(`curl -X ${store.method.toUpperCase()} "${store.url}"`);

  // Headers
  store.headers.forEach((header) => {
    if (header.enabled) {
      parts.push(`  -H "${header.key}: ${header.value}"`);
    }
  });

  // Auth
  if (store.auth.type === "basic" && store.auth.content) {
    const authContent = store.auth.content as BasicAuthContent;
    parts.push(`  -u "${authContent.username}:${authContent.password}"`);
  } else if (store.auth.type === "bearer token" && store.auth.content) {
    const token = (store.auth.content as { token: string }).token;
    parts.push(`  -H "Authorization: Bearer ${token}"`);
  }

  // Body
  if (store.bodyContent && store.bodyType !== "None") {
    // 提示：若 body 內含單引號 '，在 bash 中直接用單引號包裹會出錯，建議維持轉義或處理
    const escapedBody = store.bodyContent;
    parts.push(`  -d '${escapedBody}'`);
  }

  // Proxy
  if (store.proxyConfig && store.proxyConfig.host && store.proxyConfig.port) {
    const proxyUrlAuthPart = `${store.proxyConfig.auth ? `${store.proxyConfig.auth.username}:${store.proxyConfig.auth.password}@` : ""}`;
    const proxyUrl = `${store.proxyConfig.protocol}://${proxyUrlAuthPart}${store.proxyConfig.host}:${store.proxyConfig.port}`;
    parts.push(`  -x "${proxyUrl}"`);
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
