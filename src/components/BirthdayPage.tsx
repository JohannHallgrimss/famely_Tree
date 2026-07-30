import { useMemo } from 'react';
import type { FamilyData, Person } from '../types';
import { formatDate, getDaysUntilBirthday } from '../utils/dateUtils';

interface BirthdayPageProps {
  onSelectPerson: (person: Person) => void;
  data: FamilyData;
}

const BirthdayPage = ({ onSelectPerson, data }: BirthdayPageProps) => {
  const upcomingBirthdays = useMemo(() => {
    return data.persons
      .map((person) => ({
        person,
        daysUntilBirthday: getDaysUntilBirthday(person.born)
      }))
      .filter(
        (item): item is { person: Person; daysUntilBirthday: number } =>
          item.daysUntilBirthday !== null
      )
      .sort(
        (a, b) =>
          a.daysUntilBirthday - b.daysUntilBirthday
      )
      .slice(0, 10);
  }, [data.persons]);

  return (
    <main className="page-shell">
      <section className="card">
        <h2>Næstu afmæli</h2>

        <div className="table-wrapper">
          <table className="people-table">
            <thead>
              <tr>
                <th>Nafn</th>
                <th>Fæðingardagur</th>
                <th>Dagar að afmæli</th>
              </tr>
            </thead>

            <tbody>
              {upcomingBirthdays.map(({ person, daysUntilBirthday }) => (
                <tr
                  key={person.name}
                  onClick={() => onSelectPerson(person)}
                >
                  <td>{person.name}</td>
                  <td>{formatDate(person.born)}</td>
                  <td>{daysUntilBirthday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default BirthdayPage;