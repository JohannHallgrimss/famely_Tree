import type { Person } from '../types';
import {
  formatDate,
  getAge,
  getDaysUntilBirthday,
} from '../utils/dateUtils';

interface PeopleTableProps {
  people: Person[];
  sortKey: 'name' | 'born' | 'age' | 'daysUntilBirthday';
  sortDirection: 'asc' | 'desc';
  onSort: (key: 'name' | 'born' | 'age' | 'daysUntilBirthday') => void;
  onSelectPerson: (person: Person) => void;
}

const PeopleTable = ({ people, sortKey, sortDirection, onSort, onSelectPerson }: PeopleTableProps) => {
 
  return (
    <div className="table-wrapper">
      <table className="people-table people-tableHome">
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
            <th>
              <button type="button" onClick={() => onSort('daysUntilBirthday')}>
                Dagar að afmæli {sortKey === 'daysUntilBirthday' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.name} onClick={() => onSelectPerson(person)}>
              <td>{person.name}</td>
              <td>{formatDate(person.born)}</td>
              <td>{getAge(person.born)}</td>
              <td>{getDaysUntilBirthday(person.born)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PeopleTable;
