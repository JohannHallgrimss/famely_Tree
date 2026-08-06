import type { FamilyData } from "../types";
import familiesManifest from "./families.json";

type FamilyManifestEntry = {
  id: string;
  name: string;
};

export const familyList =
  familiesManifest as FamilyManifestEntry[];

export type FamilyDataset =
  FamilyManifestEntry["id"];


const familyNames = Object.fromEntries(
  familyList.map((entry) => [
    entry.id,
    entry.name
  ])
) as Record<string, string>;


// Vite pakkar þessum json skrám inn í build
const familyFiles =
  import.meta.glob<FamilyData>(
    "./families/*.json",
    {
      eager: true,
      import: "default"
    }
  );


const files =
  familyList.reduce(
    (
      acc,
      entry
    ) => {

      const key =
        `./families/${entry.id}.json`;

      const familyData =
        familyFiles[key];


      if (!familyData) {
        console.error(
          "Available family files:",
          Object.keys(familyFiles)
        );

        throw new Error(
          `Missing family file: ${key}`
        );
      }


      acc[entry.id] = familyData;

      return acc;

    },
    {} as Record<string, FamilyData>
  );


let currentFamilyDataset:
  FamilyDataset =
    familyList[0]?.id ??
    "hallgrimurJonsson";


export function setFamilyDataset(
  dataset: FamilyDataset
) {
  if (files[dataset]) {
    currentFamilyDataset = dataset;
  } else {
    console.warn(
      `Unknown family dataset: ${dataset}`
    );
  }
}


export function getFamilyDataset() {
  return currentFamilyDataset;
}


export function getFamilyList() {
  return familyList;
}


export function getFamilyName(
  familyDataset: FamilyDataset
) {
  return (
    familyNames[familyDataset] ??
    familyDataset
  );
}


export async function loadData(
  dataset: FamilyDataset = currentFamilyDataset
): Promise<FamilyData> {

  const familyData =
    files[dataset];


  if (!familyData) {
    throw new Error(
      `Family dataset not found: ${dataset}`
    );
  }


  return familyData;
}