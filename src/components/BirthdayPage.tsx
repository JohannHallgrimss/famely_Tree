import { useMemo } from 'react';
import type { FamilyData, Person } from '../types';

interface BirthdayPageProps {
  onSelectPerson: (person: Person) => void;
  data: FamilyData;
}

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

const BirthdayPage = ({ onSelectPerson, data }: BirthdayPageProps) => {
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data.persons
      .map(person => {
        const birthday = new Date(person.born);

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

        return {
          person,
          daysUntilBirthday,
        };
      })
      .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday)
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
                <th>
                  Nafn
                </th>
                <th>
                  Fæðingardagur
                </th>
                <th>Fjöldi daga í afmæli</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBirthdays.map((birthday) => (
                <tr key={birthday.person.name} onClick={() => onSelectPerson(birthday.person)} >
                  <td>{birthday.person.name}</td>
                  <td>{formatDate(birthday.person.born)}</td>
                  <td>{birthday.daysUntilBirthday}</td>
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
