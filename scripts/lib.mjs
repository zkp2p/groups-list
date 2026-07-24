import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

async function walkJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkJsonFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

export async function readJson(filePath) {
  const contents = await readFile(filePath, "utf8");
  try {
    return JSON.parse(contents);
  } catch (error) {
    throw new Error(`${relativePath(filePath)} contains invalid JSON: ${error.message}`);
  }
}

export async function loadGroupEntries() {
  const groupsDirectory = path.join(rootDirectory, "groups");
  const files = await walkJsonFiles(groupsDirectory);
  const entries = [];

  for (const filePath of files) {
    entries.push({
      filePath,
      relativePath: relativePath(filePath),
      group: await readJson(filePath),
    });
  }

  return entries;
}

export function relativePath(filePath) {
  return path.relative(rootDirectory, filePath).split(path.sep).join("/");
}

export function groupIdentity(group) {
  return [
    group.chainId,
    group.registryAddress.toLowerCase(),
    BigInt(group.groupId).toString(),
  ].join(":");
}

export function compareGroups(left, right) {
  if (left.chainId !== right.chainId) return left.chainId - right.chainId;

  const registryComparison = left.registryAddress
    .toLowerCase()
    .localeCompare(right.registryAddress.toLowerCase());
  if (registryComparison !== 0) return registryComparison;

  const leftId = BigInt(left.groupId);
  const rightId = BigInt(right.groupId);
  if (leftId < rightId) return -1;
  if (leftId > rightId) return 1;
  return 0;
}
