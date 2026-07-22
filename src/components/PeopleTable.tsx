import type { Person } from '../types';

interface PeopleTableProps {
  people: Person[];
  sortKey: 'name' | 'born';
  sortDirection: 'asc' | 'desc';
  onSort: (key: 'name' | 'born') => void;
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
            <th>Fjölskylda</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.name} onClick={() => onSelectPerson(person)}>
              <td>{person.name}</td>
              <td>{formatDate(person.born)}</td>
              <td>{[person.father, person.mother].filter(Boolean).join(' / ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PeopleTable;
