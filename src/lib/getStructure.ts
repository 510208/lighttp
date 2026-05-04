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
  let command = `curl -X ${store.method.toUpperCase()} "${store.url}" ${breakLineSymbol}`;

  // Headers
  store.headers.forEach((header) => {
    if (header.enabled) {
      command += `\n  -H "${header.key}: ${header.value}" ${breakLineSymbol}`;
    }
  });

  // Auth
  console.log("Auth type:", store.auth.type);
  if (store.auth.type === "basic" && store.auth.content) {
    console.log("Auth content:", store.auth.content);
    const authContent = store.auth.content as BasicAuthContent;
    command += `\n  -u "${authContent.username}:${authContent.password}" ${breakLineSymbol}`;
  } else if (store.auth.type === "bearer token" && store.auth.content) {
    const token = (store.auth.content as { token: string }).token;
    command += `\n  -H "Authorization: Bearer ${token}" ${breakLineSymbol}`;
  }

  // Body
  if (store.bodyContent && store.bodyType !== "None") {
    // Escape double quotes in body content
    // const escapedBody = store.bodyContent.replace(/"/g, '\\"');
    const escapedBody = store.bodyContent;
    // 將 body content 包裹在雙引號中，並添加 -d 參數
    command += `\n  -d '${escapedBody}' ${breakLineSymbol}`;
  }

  // Proxy
  if (store.proxyConfig && store.proxyConfig.host && store.proxyConfig.port) {
    const proxyUrlAuthPart = `${store.proxyConfig.auth ? `${store.proxyConfig.auth.username}:${store.proxyConfig.auth.password}@` : ""}`;
    const proxyUrl = `${store.proxyConfig.protocol}://${proxyUrlAuthPart}${store.proxyConfig.host}:${store.proxyConfig.port}`;
    command += `\n  -x "${proxyUrl}" ${breakLineSymbol}`;
  }

  // Remove the trailing backslash and newline
  command = command.trim().replace(new RegExp(`${breakLineSymbol}$`), "");

  return command;
}

export {
  convertJsonToSchema,
  convertJsonToTypeScript,
  convertJsonToPython,
  convertJsonToRust,
  getCurlCommand,
};
