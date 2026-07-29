import { useMemo, useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { loadData, getFamilyDataset, FamilyDataset } from './data/dataLoader';
import FamilyStoryPage from './components/FamilyStoryPage';
import FamilyTreePage from './components/FamilyTreePage';
import BirthdayPage from './components/BirthdayPage';
import PageLayout from './components/PageLayout';
import PeopleTable from './components/PeopleTable';
import PersonModal from './components/PersonModal';
import type { FamilyData, Person } from './types';

type SortKey = 'name' | 'born' | 'age' | 'daysUntilBirthday';
type SortDirection = 'asc' | 'desc';

const getPersonImageUrl = (personName: string) => {
  const sanitizedName = personName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúýþðæö]+/g, '_')
    .replace(/(^-|-$)/g, '');

  return `/images/${sanitizedName || 'person'}.jpg`;
};

const getPersonByName = (name: string | null, persons: Person[]) => {
  if (!name) return null;
  return persons.find((person) => person.name === name) ?? null;
};

const sortPersons = (
  persons: Person[],
  sortKey: SortKey,
  sortDirection: SortDirection
) => {
  const sorted = [...persons].sort((a, b) => {
    const valueA = sortKey === 'name' ? a.name.toLowerCase() : a.born;
    const valueB = sortKey === 'name' ? b.name.toLowerCase() : b.born;

    return valueA.localeCompare(valueB);
  });

  return sortDirection === 'desc' ? sorted.reverse() : sorted;
};


interface HomePageProps {
  onSelectPerson: (person: Person) => void;
  data: FamilyData;
}

const HomePage = ({ onSelectPerson, data }: HomePageProps) => {

  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedPersons = useMemo(
    () => sortPersons(data.persons, sortKey, sortDirection),
    [data.persons, sortKey, sortDirection]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) =>
        current === 'asc' ? 'desc' : 'asc'
      );
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };


  return (
    <main className="page-shell">
      <section className="card">
        <PeopleTable
          people={sortedPersons.map((person) => {
            const father = getPersonByName(person.father, data.persons);
            const mother = getPersonByName(person.mother, data.persons);

            return {
              ...person,
              father: father?.name ?? null,
              mother: mother?.name ?? null
            };
          })}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={toggleSort}
          onSelectPerson={onSelectPerson}
        />
      </section>
    </main>
  );
};


const NotFoundPage = () => (
  <main className="page-shell">
    <section className="card">
      <h2>Síða fannst ekki</h2>
    </section>
  </main>
);

const App = () => {
  const [data, setData] = useState<FamilyData | null>(null);
  const [familyDataset, setFamilyDataset] = useState<FamilyDataset>(getFamilyDataset());

  useEffect(() => {
    loadData(familyDataset).then(setData);
  }, [familyDataset]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return <AppContent data={data} familyDataset={familyDataset} setFamilyDataset={setFamilyDataset} />;
};

interface AppContentProps {
  data: FamilyData;
  familyDataset: FamilyDataset;
  setFamilyDataset: (familyDataset: FamilyDataset) => void;
}

const AppContent = ({
  data,
  familyDataset,
  setFamilyDataset
}: AppContentProps) => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showModal, setShowModal] = useState(false);

  const openModal = (person: Person) => {
    setSelectedPerson(person);
    setShowModal(true);
  };

  const selectPersonInModal = (person: Person) => {
    setSelectedPerson(person);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPerson(null);
  };


  const children = selectedPerson
    ? data.persons.filter(
      (person) =>
        person.father === selectedPerson.name ||
        person.mother === selectedPerson.name
    )
    : [];


  const orderedChildren = [...children].sort((a, b) => {
    return (
      new Date(a.born).getTime() -
      new Date(b.born).getTime()
    );
  });
  const getPersonAge = (born: string | null) => {
    if (!born) return null;

    const birthDate = new Date(born);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  const getDaysUntilBirthday = (born: string | null) => {
    if (!born) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birthday = new Date(born);
    const nextBirthday = new Date(
      today.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    );
    nextBirthday.setHours(0, 0, 0, 0);

    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysUntilBirthday = Math.round(
      (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilBirthday;
  }

  return (
    <PageLayout
      patriot={data.patriot}
      familyDataset={familyDataset}
      onFamilyDatasetChange={setFamilyDataset}
    >
      <Routes>
        <Route
          path="/"
          element={<HomePage onSelectPerson={openModal} data={data} />}
        />

        <Route
          path="/afmæli"
          element={<BirthdayPage onSelectPerson={openModal} data={data} />}
        />

        <Route path="/ættarsaga" element={<FamilyStoryPage data={data} />} />

        <Route path="/vidartre" element={<FamilyTreePage onSelectPerson={openModal} data={data} />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>


      {showModal && selectedPerson && (
        <PersonModal
          person={selectedPerson}
          onClose={closeModal}
          onImageError={() => {
            const img = document.querySelector(
              '.person-image'
            ) as HTMLImageElement | null;

            if (img) {
              img.src = '/images/placeholder-person.svg';
            }
          }}
          imageUrl={getPersonImageUrl(selectedPerson.name)}
          displayName={selectedPerson.name}
          age={getPersonAge(selectedPerson.born)}
          daysUntilBirthday={getDaysUntilBirthday(selectedPerson.born)}
          relationList={orderedChildren.map(
            (child) => child.name
          )}
          parentNames={
            [
              selectedPerson.father,
              selectedPerson.mother
            ].filter(Boolean) as string[]
          }
          spouseName={selectedPerson.spouse}
          onSelectPerson={selectPersonInModal}
        />
      )}
    </PageLayout>
  );
};


export default App;