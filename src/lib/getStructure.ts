import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  QuickTypeError,
} from "quicktype-core";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { getCurlCommand } from "./getCurl";

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
  const store = useSettingsStore();

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
      allPropertiesOptional: store.quicktypeConfig.allPropertiesOptional,
      rendererOptions: {
        "just-types": store.quicktypeConfig.justTypes.toString(),
      },
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
  const store = useSettingsStore();

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
      allPropertiesOptional: store.quicktypeConfig.allPropertiesOptional,
      rendererOptions: {
        "just-types": store.quicktypeConfig.justTypes.toString(),
      },
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
  const store = useSettingsStore();

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

    console.log("Quicktype config:", store.getQuicktypeConfig());

    const result = await quicktype({
      inputData,
      lang: "python",
      allPropertiesOptional: store.quicktypeConfig.allPropertiesOptional,
      rendererOptions: {
        "just-types": store.quicktypeConfig.justTypes.toString(),
      },
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
  const store = useSettingsStore();

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
      allPropertiesOptional: store.quicktypeConfig.allPropertiesOptional,
      rendererOptions: {
        "just-types": store.quicktypeConfig.justTypes.toString(),
      },
    });

    return result.lines.join("\n");
  } catch (error) {
    if (error instanceof QuickTypeError) {
      throw new Error(`Quicktype error: ${error.message}`);
    }
    throw error;
  }
}

export {
  convertJsonToSchema,
  convertJsonToTypeScript,
  convertJsonToPython,
  convertJsonToRust,
  getCurlCommand,
};
