import { useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import familyData from './data/familyData.json';
import type { FamilyData, Person } from './types';

const data = familyData as FamilyData;

type SortKey = 'name' | 'born';
type SortDirection = 'asc' | 'desc';

const formatDate = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('is-IS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getDisplayValue = (value: string | null) => value && value.trim() ? value : '—';

const getPersonByName = (name: string | null, persons: Person[]) => {
  if (!name) return null;
  return persons.find((person) => person.name === name) ?? null;
};

const sortPersons = (persons: Person[], sortKey: SortKey, sortDirection: SortDirection) => {
  const sorted = [...persons].sort((a, b) => {
    const valueA = sortKey === 'name' ? a.name.toLowerCase() : a.born;
    const valueB = sortKey === 'name' ? b.name.toLowerCase() : b.born;
    return valueA.localeCompare(valueB);
  });

  return sortDirection === 'desc' ? sorted.reverse() : sorted;
};

const HomePage = () => {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showModal, setShowModal] = useState(false);

  const sortedPersons = useMemo(
    () => sortPersons(data.persons, sortKey, sortDirection),
    [sortKey, sortDirection]
  );

  const openModal = (person: Person) => {
    setSelectedPerson(person);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPerson(null);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const children = selectedPerson
    ? data.persons.filter((person) => person.father === selectedPerson.name || person.mother === selectedPerson.name)
    : [];

  const orderedChildren = [...children].sort((a, b) => {
    const aDate = new Date(a.born);
    const bDate = new Date(b.born);
    return aDate.getTime() - bDate.getTime();
  });

  return (
    <main className="page-shell">
      <section className="card">
        <div className="table-wrapper">
          <table className="people-table">
            <thead>
              <tr>
                <th>
                  <button type="button" onClick={() => toggleSort('name')}>
                    Nafn {sortKey === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => toggleSort('born')}>
                    Fæddur {sortKey === 'born' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </th>
                <th>Fjölskylda</th>
              </tr>
            </thead>
            <tbody>
              {sortedPersons.map((person) => {
                const father = getPersonByName(person.father, data.persons);
                const mother = getPersonByName(person.mother, data.persons);
                return (
                  <tr key={person.name} onClick={() => openModal(person)}>
                    <td>{person.name}</td>
                    <td>{formatDate(person.born)}</td>
                    <td>{[father?.name, mother?.name].filter(Boolean).join(' / ') || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && selectedPerson && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={closeModal}>
              Loka
            </button>

            <div className="modal-content">
              <img
                className="person-image"
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
                alt={selectedPerson.name}
              />

              <div className="modal-text">
                <h2>{selectedPerson.name}</h2>
                <p>
                  <strong>Afmæli:</strong> {getDisplayValue(selectedPerson.born)}
                </p>
                <p>
                  <strong>Fæddur:</strong> {getDisplayValue(formatDate(selectedPerson.born))}
                </p>
                <p>
                  <strong>Heimilisfang:</strong> {getDisplayValue(selectedPerson.address)}
                </p>
                <p>
                  <strong>Sími:</strong> {getDisplayValue(selectedPerson.phone)}
                </p>

                <div className="relations-block">
                  <p>
                    <strong>Foreldrar</strong>
                  </p>
                  <p>{getDisplayValue(getPersonByName(selectedPerson.father, data.persons)?.name ?? null)}</p>
                  <p>{getDisplayValue(getPersonByName(selectedPerson.mother, data.persons)?.name ?? null)}</p>
                </div>

                <div className="relations-block">
                  <p>
                    <strong>Börn</strong>
                  </p>
                  {orderedChildren.length > 0 ? (
                    orderedChildren.map((child) => <p key={child.name}>{child.name}</p>)
                  ) : (
                    <p>—</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const NotFoundPage = () => <main className="page-shell"><section className="card"><h2>Síða fannst ekki</h2></section></main>;

const App = () => {
  const location = useLocation();
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">Ættartré - {data.patriot}</div>
        <nav className="top-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Heimasíða
          </Link>
          <Link to="/upplýsingar" className={location.pathname === '/upplýsingar' ? 'active' : ''}>
            Upplýsingar
          </Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upplýsingar" element={<section className="page-shell"><section className="card"><h2>Skjástækkun fyrir framtíðarsíður</h2><p>Þessi uppsetning er hönnuð til að auðvelda viðbætur og fleiri síður síðar.</p></section></section>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <footer className="site-footer">Developed by Jóhann Hallgrímsson</footer>
    </div>
  );
};

export default App;
