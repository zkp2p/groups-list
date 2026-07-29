import Ajv from "ajv";
import addFormats from "ajv-formats";
import {
  copyFile,
  mkdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import {
  compareGroups,
  loadGroupEntries,
  readJson,
  rootDirectory,
} from "./lib.mjs";

const schemaVersion = "2.0.0";
const publicBaseUrl = "https://zkp2p.github.io/groups-list";
const distributionDirectory = path.join(rootDirectory, "dist");
const distributionSchemaDirectory = path.join(distributionDirectory, "schema");
const groupSchemaPath = path.join(rootDirectory, "schema", "group.schema.json");
const listSchemaPath = path.join(
  rootDirectory,
  "schema",
  "groups-list.schema.json",
);

const entries = await loadGroupEntries();
const groups = entries.map((entry) => entry.group).sort(compareGroups);

const list = {
  name: "Peer Groups List",
  schemaVersion,
  generatedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA ?? "local",
  schema: `${publicBaseUrl}/schema/groups-list.schema.json`,
  groups,
};

const groupSchema = await readJson(groupSchemaPath);
const listSchema = await readJson(listSchemaPath);
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(groupSchema);
const validateList = ajv.compile(listSchema);

if (!validateList(list)) {
  for (const error of validateList.errors ?? []) {
    console.error(`${error.instancePath || "/"}: ${error.message}`);
  }
  process.exit(1);
}

await rm(distributionDirectory, { recursive: true, force: true });
await mkdir(distributionSchemaDirectory, { recursive: true });
await writeFile(
  path.join(distributionDirectory, "groups-list.json"),
  `${JSON.stringify(list, null, 2)}\n`,
);
await copyFile(groupSchemaPath, path.join(distributionSchemaDirectory, "group.schema.json"));
await copyFile(
  listSchemaPath,
  path.join(distributionSchemaDirectory, "groups-list.schema.json"),
);

console.log(`Built ${groups.length} verified group(s) in dist/groups-list.json.`);
