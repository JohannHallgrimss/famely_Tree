import type { FamilyData } from "../types";
import familiesManifest from "./families.json";

type FamilyManifestEntry = {
  id: string;
  name: string;
  path: string;
};

export const familyList = familiesManifest as FamilyManifestEntry[];

export type FamilyDataset = FamilyManifestEntry["id"];

const familyNames = Object.fromEntries(
  familyList.map((entry) => [entry.id, entry.name])
) as Record<string, string>;

const familyFileLoaders = import.meta.glob<{
  default: FamilyData;
}>("./families/*.json");

const files = familyList.reduce((acc, entry) => {
  const loader = familyFileLoaders[entry.path];

  if (!loader) {
    throw new Error(`Missing loader for family data path: ${entry.path}`);
  }

  acc[entry.id] = loader;
  return acc;
}, {} as Record<string, () => Promise<{ default: FamilyData }>>);

let currentFamilyDataset: FamilyDataset = familyList[0]?.id ?? "hallgrimurJonsson";

export function setFamilyDataset(lang: FamilyDataset) {
  if (files[lang]) {
    currentFamilyDataset = lang;
  } else {
    console.warn(`Unknown family dataset: ${lang}`);
  }
}

export function getFamilyDataset() {
  return currentFamilyDataset;
}

export function getFamilyList() {
  return familyList;
}

export function getFamilyName(familyDataset: FamilyDataset) {
  return familyNames[familyDataset] ?? familyDataset;
}

export async function loadData(lang: FamilyDataset = currentFamilyDataset) {
  const loader = files[lang];
  if (!loader) {
    throw new Error(`Family dataset loader not found: ${lang}`);
  }

  const module = await loader();
  return module.default as FamilyData;
}
