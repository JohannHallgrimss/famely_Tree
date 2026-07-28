import type { Person } from '../types';

interface PeopleTableProps {
  people: Person[];
  sortKey: 'name' | 'born' | 'age';
  sortDirection: 'asc' | 'desc';
  onSort: (key: 'name' | 'born' | 'age') => void;
  onSelectPerson: (person: Person) => void;
}

const PeopleTable = ({ people, sortKey, sortDirection, onSort, onSelectPerson }: PeopleTableProps) => {
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
  return (
    <div className="table-wrapper">
      <table className="people-table">
        <thead>
          <tr>
            <th>
              <button type="button" onClick={() => onSort('name')}>
                Nafn {sortKey === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
              </button>
            </th>
            <th>
              <button type="button" onClick={() => onSort('born')}>
                Fæddur {sortKey === 'born' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
              </button>
            </th>
            <th>
              <button type="button" onClick={() => onSort('age')}>
                Aldur {sortKey === 'age' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.name} onClick={() => onSelectPerson(person)}>
              <td>{person.name}</td>
              <td>{formatDate(person.born)}</td>
              <td>{getPersonAge(person.born)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PeopleTable;
