import Ajv from "ajv";
import addFormats from "ajv-formats";
import path from "node:path";

import {
  groupIdentity,
  loadGroupEntries,
  readJson,
  relativePath,
  rootDirectory,
} from "./lib.mjs";

const groupSchemaPath = path.join(rootDirectory, "schema", "group.schema.json");
const groupSchema = await readJson(groupSchemaPath);

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const validateGroup = ajv.compile(groupSchema);

function formatErrors(filePath, errors) {
  return errors
    .map((error) => {
      const location = error.instancePath || "/";
      return `${filePath}${location}: ${error.message}`;
    })
    .join("\n");
}

function assertValidGroup(filePath, group) {
  if (!validateGroup(group)) {
    throw new Error(formatErrors(filePath, validateGroup.errors ?? []));
  }
}

const entries = await loadGroupEntries();
const identities = new Map();

for (const entry of entries) {
  assertValidGroup(entry.relativePath, entry.group);

  const expectedPath = `groups/${entry.group.curator.slug}/${entry.group.slug}.json`;
  if (entry.relativePath !== expectedPath) {
    throw new Error(
      `${entry.relativePath}: expected path ${expectedPath} from curator and group slugs`,
    );
  }

  const identity = groupIdentity(entry.group);
  const existingPath = identities.get(identity);
  if (existingPath) {
    throw new Error(
      `${entry.relativePath}: duplicates onchain identity already listed by ${existingPath}`,
    );
  }
  identities.set(identity, entry.relativePath);
}

const examplePath = path.join(rootDirectory, "examples", "group.example.json");
const example = await readJson(examplePath);
assertValidGroup(relativePath(examplePath), example);

console.log(
  `Validation passed: ${entries.length} verified group(s) and 1 example.`,
);
