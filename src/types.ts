export type Gender = 'male' | 'female';

export interface Person {
  name: string;
  born: string;
  father: string | null;
  mother: string | null;
  spouse: string | null;
  gender: Gender;
  address: string | null;
  phone: string | null;
}

export interface FamilyData {
  patriot: string;
  persons: Person[];
}
