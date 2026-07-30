import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import {
  loadData,
  getFamilyDataset,
  FamilyDataset
} from './data/dataLoader';

import FamilyStoryPage from './components/FamilyStoryPage';
import FamilyTreePage from './components/FamilyTreePage';
import BirthdayPage from './components/BirthdayPage';
import PageLayout from './components/PageLayout';
import HomePage from './components/HomePage';
import PersonModal from './components/PersonModal';

import {
  getAge,
  getDaysUntilBirthday
} from './utils/dateUtils';

import type {
  FamilyData,
  Person
} from './types';


const getPersonImageUrl = (personName: string) => {
  const sanitizedName = personName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúýþðæö]+/g, '_')
    .replace(/(^-|-$)/g, '');

  return `/images/${sanitizedName || 'person'}.jpg`;
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

  const [familyDataset, setFamilyDataset] =
    useState<FamilyDataset>(getFamilyDataset());


  useEffect(() => {
    loadData(familyDataset).then(setData);
  }, [familyDataset]);


  if (!data) {
    return <div>Loading...</div>;
  }


  return (
    <AppContent
      data={data}
      familyDataset={familyDataset}
      setFamilyDataset={setFamilyDataset}
    />
  );
};


interface AppContentProps {
  data: FamilyData;
  familyDataset: FamilyDataset;
  setFamilyDataset: (value: FamilyDataset) => void;
}


const AppContent = ({
  data,
  familyDataset,
  setFamilyDataset
}: AppContentProps) => {
  const [selectedPerson, setSelectedPerson] =
    useState<Person | null>(null);

  const [showModal, setShowModal] =
    useState(false);


  const openModal = (person: Person) => {
    const realPerson = data.persons.find(
      item => item.name === person.name
    );

    if (!realPerson) {
      console.warn(`Persóna fannst ekki: ${person.name}`);
      return;
    }

    setSelectedPerson(realPerson);
    setShowModal(true);
  };


const selectPersonInModal = (name: string) => {
  const realPerson = data.persons.find(
    item => item.name === name
  );

  if (!realPerson) {
    console.warn(`Persóna fannst ekki: ${name}`);
    return;
  }

  setSelectedPerson(realPerson);
};


  const closeModal = () => {
    setSelectedPerson(null);
    setShowModal(false);
  };


  const children = selectedPerson
    ? data.persons.filter(
        person =>
          person.father === selectedPerson.name ||
          person.mother === selectedPerson.name
      )
    : [];


  const orderedChildren = [...children].sort((a, b) => {
    const dateA = new Date(a.born).getTime();
    const dateB = new Date(b.born).getTime();

    if (
      Number.isNaN(dateA) ||
      Number.isNaN(dateB)
    ) {
      return 0;
    }

    return dateA - dateB;
  });


  return (
    <PageLayout
      patriot={data.patriot}
      familyDataset={familyDataset}
      onFamilyDatasetChange={setFamilyDataset}
    >
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              data={data}
              onSelectPerson={openModal}
            />
          }
        />

        <Route
          path="/afmæli"
          element={
            <BirthdayPage
              data={data}
              onSelectPerson={openModal}
            />
          }
        />

        <Route
          path="/ættarsaga"
          element={
            <FamilyStoryPage data={data} />
          }
        />

        <Route
          path="/vidartre"
          element={
            <FamilyTreePage
              data={data}
              onSelectPerson={openModal}
            />
          }
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>


      {showModal && selectedPerson && (
        <PersonModal
          person={selectedPerson}
          onClose={closeModal}
          onImageError={() => {
            const img =
              document.querySelector(
                '.person-image'
              ) as HTMLImageElement | null;

            if (img) {
              img.src =
                '/images/placeholder-person.svg';
            }
          }}
          imageUrl={
            getPersonImageUrl(selectedPerson.name)
          }
          displayName={selectedPerson.name}
          age={
            getAge(selectedPerson.born)
          }
          daysUntilBirthday={
            getDaysUntilBirthday(selectedPerson.born)
          }
          relationList={
            orderedChildren.map(
              child => child.name
            )
          }
          parentNames={
            [
              selectedPerson.father,
              selectedPerson.mother
            ].filter(Boolean) as string[]
          }
          spouseName={
            selectedPerson.spouse ?? []
          }
          onSelectPerson={
            selectPersonInModal
          }

        />
      )}
    </PageLayout>
  );
};


export default App;