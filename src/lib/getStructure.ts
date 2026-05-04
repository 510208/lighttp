import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  QuickTypeError,
} from "quicktype-core";

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

export {
  convertJsonToSchema,
  convertJsonToTypeScript,
  convertJsonToPython,
  convertJsonToRust,
};
