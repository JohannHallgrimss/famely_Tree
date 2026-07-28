import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import familyData from '../data/familyData.json';
import type { FamilyData, Person } from '../types';
import { getRelatedPeopleNames } from './familyTreeUtils';

const data = familyData as FamilyData;
interface FamilyTreeProps {
  onSelectPerson: (person: Person) => void;
}

const FamilyTreePage = ({ onSelectPerson }: FamilyTreeProps) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialFocus = params.get('focus') ?? '';
  const [focusName, setFocusName] = useState<string>(initialFocus);
  const [searchValue, setSearchValue] = useState<string>(initialFocus);

  const people = useMemo(() => data.persons, []);
  const focusedPerson = useMemo(
    () => people.find((person) => person.name === focusName) ?? people[0] ?? null,
    [focusName, people]
  );

  const visiblePeople = useMemo(() => {
    if (!focusName) {
      return people;
    }

    const relatedNames = getRelatedPeopleNames(people, focusName);
    return people.filter((person) => relatedNames.includes(person.name));
  }, [focusName, people]);

  const generationRows = useMemo(() => {
    const getGeneration = (person: Person, seen = new Set<string>()): number => {
      if (seen.has(person.name)) {
        return 0;
      }

      const parentNames = [person.father, person.mother].filter(Boolean) as string[];
      if (parentNames.length === 0) {
        return 0;
      }

      const parents = parentNames
        .map((name) => people.find((entry) => entry.name === name))
        .filter(Boolean) as Person[];

      seen.add(person.name);
      return 1 + Math.max(...parents.map((parent) => getGeneration(parent, seen)));
    };

    const generationMap = new Map<number, Person[]>();
    visiblePeople.forEach((person) => {
      const level = getGeneration(person);
      const existing = generationMap.get(level) ?? [];
      existing.push(person);
      generationMap.set(level, existing);
    });

    return Array.from(generationMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([level, persons]) => ({
        level,
        persons: persons.sort((a, b) => a.name.localeCompare(b.name))
      }));
  }, [people, visiblePeople]);

 const nodePositions = useMemo(() => {
  const positions = new Map<string, { x: number; y: number }>();

  const COLUMN_WIDTH = 220;
  const ROW_HEIGHT = 110;

  const maxPeopleInGeneration = Math.max(
    ...generationRows.map(({ persons }) => persons.length),
    1
  );

  generationRows.forEach(({ level, persons }) => {
    const generationHeight = persons.length * ROW_HEIGHT;
    const totalHeight = maxPeopleInGeneration * ROW_HEIGHT;

    // miðjar kynslóðina lóðrétt
    const verticalOffset = (totalHeight - generationHeight) / 2;

    persons.forEach((person, index) => {
      positions.set(person.name, {
        // kynslóðir fara frá vinstri til hægri
        x: 80 + level * COLUMN_WIDTH,

        // einstaklingar innan kynslóðar staflast niður
        // en kynslóðin sjálf er miðjuð
        y: 60 + verticalOffset + index * ROW_HEIGHT
      });
    });
  });

  return positions;
}, [generationRows]);

  const NODE_WIDTH = 140;
const NODE_HEIGHT = 60;

const connectors = useMemo(() => {
  const lines: Array<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }> = [];

  visiblePeople.forEach((person) => {
    const child = nodePositions.get(person.name);

    if (!child) return;

    [person.father, person.mother]
      .filter(Boolean)
      .forEach((parentName) => {
        const parent = nodePositions.get(parentName!);

        if (!parent) return;

        lines.push({
          fromX: parent.x + NODE_WIDTH,
          fromY: parent.y + NODE_HEIGHT / 2,

          toX: child.x,
          toY: child.y + NODE_HEIGHT / 2
        });
      });
  });

  return lines;
}, [nodePositions, visiblePeople]);

  const handleSelectPerson = (value: string) => {
    setSearchValue(value);
    const match = people.find((person) => person.name.toLowerCase() === value.trim().toLowerCase());
    if (match) {
      setFocusName(match.name);
    }
  };

const handleNodeSelect = (person: Person) => {
  setFocusName(person.name);
  setSearchValue(person.name);
  onSelectPerson(person);
};

  return (
    <main className="page-shell">
      <section className="card story-card">
        <div className="story-intro">
          <p className="eyebrow">Myndrænt viðartré</p>
          <h2>Yfirlit</h2>
          <p>
            Klassískt ættartré með hæðir, foreldrum og afkomendum í skýrum tengslum.
          </p>
        </div>

        <div className="tree-toolbar">
          <label className="tree-search-wrap">
            <span className="tree-search-label">Veldu einstakling</span>
            <input
              className="tree-search"
              list="person-options"
              value={searchValue}
              onChange={(event) => handleSelectPerson(event.target.value)}
              onBlur={() => {
                const match = people.find((person) => person.name.toLowerCase() === searchValue.trim().toLowerCase());
                if (match) {
                  setFocusName(match.name);
                }
              }}
              placeholder="Skrifaðu nafnið"
            />
            <datalist id="person-options">
              {people.map((person) => (
                <option key={person.name} value={person.name} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="tree-board tree-board-overview">
          <div className="tree-graph-shell">
            <svg
             className="tree-lines"
                width="1600"
                height="900"
                viewBox="0 0 1600 900"
                >
              {connectors.map((connector, index) => (
                <line
                  key={`${connector.fromX}-${connector.fromY}-${connector.toX}-${connector.toY}-${index}`}
                  x1={connector.fromX}
                  y1={connector.fromY}
                  x2={connector.toX}
                  y2={connector.toY}
                  className="tree-connector"
                />
              ))}
            </svg>

            {generationRows.map(({ level, persons }) => (
              <div key={level} className="tree-level">
                {persons.map((person) => {
                  const position = nodePositions.get(person.name);
                  if (!position) {
                    return null;
                  }

                  return (
                    <button
                      key={person.name}
                      type="button"
                      className={`tree-node ${focusName === person.name ? 'tree-node-active' : ''}`}
                      style={{ left: `${position.x}px`, top: `${position.y}px` }}
                      title={person.name}
                      onClick={() => handleNodeSelect(person)}
                    >
                      <strong>{person.name}</strong>
                      <span>{person.born || '—'}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default FamilyTreePage;
