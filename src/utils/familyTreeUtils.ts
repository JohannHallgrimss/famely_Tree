import type { Person } from '../types';

export const getRelatedPeopleNames = (people: Person[], rootName: string): string[] => {
  const selected = people.find((person) => person.name === rootName);
  if (!selected) {
    return [];
  }

  const related = new Set<string>();
  const visited = new Set<string>();

  const addRelated = (person: Person) => {
    if (visited.has(person.name)) {
      return;
    }

    visited.add(person.name);
    related.add(person.name);

    const parentNames = [person.father, person.mother].filter(Boolean) as string[];
    const childNames = people
      .filter((entry) => entry.father === person.name || entry.mother === person.name)
      .map((entry) => entry.name);

    for (const parentName of parentNames) {
      const parent = people.find((entry) => entry.name === parentName);
      if (parent) {
        addRelated(parent);
      }
    }

    for (const childName of childNames) {
      const child = people.find((entry) => entry.name === childName);
      if (child) {
        addRelated(child);
      }
    }
  };

  addRelated(selected);
  return Array.from(related);
};
