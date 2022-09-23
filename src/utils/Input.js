// Parse JSON for input values
// -- Allows whitespace and blank
// -- Rejects quoted strings which JSON.parse allows (e.g. JSON.parse('"string"')
export const ParseInputJson = ({metadata, defaultValue = {}}) => {
  if(typeof metadata === "string") {
    metadata = metadata.trim();

    if(metadata === "") { return defaultValue; }

    if(!metadata.startsWith("{") && !metadata.startsWith("[")) { throw Error("Invalid JSON"); }

    try {
      return JSON.parse(metadata);
    } catch(error) {
      throw Error(
        error.message
          .replace("JSON.parse: ", "")
          .replace("JSON Parse error: ", "")
          .replace(" of the JSON data", "")
      );
    }
  }

  return metadata || defaultValue;
};
