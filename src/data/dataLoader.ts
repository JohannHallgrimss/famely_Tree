import { FamilyData } from "../types";

const files = {
  hallgrimurJonsson: () => import("./familyData_Hallgr.json"),
  valgerdurEinarsdottir: () => import("./familyData_Valgerdur.json"),
};
export type Language = keyof typeof files;

let currentLanguage: Language = "hallgrimurJonsson";

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

export async function loadData() {
  const module = await files[currentLanguage]();
  return module.default as FamilyData
}

export function getLanguage() {
  return currentLanguage;
}