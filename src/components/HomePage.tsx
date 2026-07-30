import { useMemo, useState } from 'react';
import PeopleTable from './PeopleTable';
import type { FamilyData, Person } from '../types';
import {
  formatDate,
  getAge,
  getDaysUntilBirthday,
  parseDate
} from '../utils/dateUtils';

type SortKey = 'name' | 'born' | 'age' | 'daysUntilBirthday';
type SortDirection = 'asc' | 'desc';

interface HomePageProps {
  onSelectPerson: (person: Person) => void;
  data: FamilyData;
}

const getPersonByName = (
  name: string | null,
  persons: Person[]
) => {
  if (!name) return null;

  return persons.find(
    person => person.name === name
  ) ?? null;
};

const sortPersons = (
  persons: Person[],
  sortKey: SortKey,
  sortDirection: SortDirection
) => {
  const sorted = [...persons].sort((a, b) => {

    if (sortKey === 'name') {
      return a.name.localeCompare(
        b.name,
        'is'
      );
    }

    if (sortKey === 'born') {
      return (
        (parseDate(a.born)?.getTime() ?? 0) -
        (parseDate(b.born)?.getTime() ?? 0)
      );
    }

    if (sortKey === 'age') {
      return (
        (getAge(b.born) ?? 0) -
        (getAge(a.born) ?? 0)
      );
    }

    if (sortKey === 'daysUntilBirthday') {
      return (
        (getDaysUntilBirthday(a.born) ?? 9999) -
        (getDaysUntilBirthday(b.born) ?? 9999)
      );
    }

    return 0;
  });

  return sortDirection === 'desc'
    ? sorted.reverse()
    : sorted;
};


const HomePage = ({
  onSelectPerson,
  data
}: HomePageProps) => {

  const [sortKey, setSortKey] =
    useState<SortKey>('name');

  const [sortDirection, setSortDirection] =
    useState<SortDirection>('asc');


  const sortedPersons = useMemo(
    () =>
      sortPersons(
        data.persons,
        sortKey,
        sortDirection
      ),
    [
      data.persons,
      sortKey,
      sortDirection
    ]
  );


  const toggleSort = (
    key: SortKey
  ) => {

    if (sortKey === key) {

      setSortDirection(
        current =>
          current === 'asc'
            ? 'desc'
            : 'asc'
      );

    } else {

      setSortKey(key);
      setSortDirection('asc');

    }
  };


  const tablePeople = useMemo(() => {

    return sortedPersons.map(person => {

      const father =
        getPersonByName(
          person.father,
          data.persons
        );

      const mother =
        getPersonByName(
          person.mother,
          data.persons
        );


      return {
        ...person,

        // notað af PeopleTable
        born: formatDate(person.born),

        age: getAge(person.born),

        daysUntilBirthday:
          getDaysUntilBirthday(person.born),

        father:
          father?.name ?? null,

        mother:
          mother?.name ?? null
      };

    });

  }, [
    sortedPersons,
    data.persons
  ]);


  return (
    <main className="page-shell">
      <section className="card">

        <PeopleTable
          people={tablePeople}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={toggleSort}
          onSelectPerson={onSelectPerson}
        />

      </section>
    </main>
  );
};


export default HomePage;