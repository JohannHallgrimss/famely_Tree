import { describe, expect, it } from 'vitest';
import { getRelatedPeopleNames } from './familyTreeUtils';
import type { Person } from '../types';

const makePerson = (name: string, father: string | null = null, mother: string | null = null): Person => ({
  name,
  born: '1900-01-01',
  father,
  mother,
  spouse: null,
  gender: 'male',
  address: null,
  phone: null
});

describe('getRelatedPeopleNames', () => {
  it('avoids recursive loops when family relationships form a cycle', () => {
    const persons = [
      makePerson('A', 'B'),
      makePerson('B', 'A')
    ];

    const names = getRelatedPeopleNames(persons, 'A');

    expect(names.sort()).toEqual(['A', 'B']);
  });
});
