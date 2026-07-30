import type { FamilyData } from "../types";

const files = {
  hallgrimurJonsson: () => import("./families/hallgrimurJonsson.json"),
  valgerdurEinarsdottir: () => import("./families/valgerdurEinarsdottir.json"),
};

export type FamilyDataset = keyof typeof files;

let currentFamilyDataset: FamilyDataset = "hallgrimurJonsson";

export function setFamilyDataset(lang: FamilyDataset) {
  currentFamilyDataset = lang;
}

export function getFamilyDataset() {
  return currentFamilyDataset;
}

export async function loadData(lang: FamilyDataset = currentFamilyDataset) {
  const module = await files[lang]();
  return module.default as FamilyData;
}