import * as fs from "fs";

export function getCommonExistingKey(
  selectedText: string,
  keyValues: Record<string, any>
): [string, boolean] {
  const keyValueClone: Record<string, any> = { ...keyValues };

  // delete non-common keys for less iterations
  for (const key in keyValueClone) {
    if (!key.startsWith("txt_")) {
      delete keyValueClone[key];
    }
  }

  const flippedKeyValue: Record<string, any> = objectFlip(keyValueClone);
  const foundKey: string = flippedKeyValue[selectedText];
  return [foundKey, !!foundKey];
}

export function readJSONFile(filePath: string): Record<string, any> {
  return JSON.parse(
    fs.readFileSync(filePath, {
      encoding: "utf8",
    })
  );
}

export function writeJSONFile(filePath: string, data: any): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function objectFlip(obj: Record<string, any>) {
  const ret: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    ret[obj[key]] = key;
  });
  return ret;
}
