import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import familyData from '../data/familyData.json';
import type { FamilyData, Person } from '../types';
import { getRelatedPeopleNames } from './familyTreeUtils';

const data = familyData as FamilyData;

const FamilyTreePage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialFocus = params.get('focus') ?? '';
  const [focusName, setFocusName] = useState<string>(initialFocus);
  const [searchValue, setSearchValue] = useState<string>(initialFocus);
  const [showFocusView, setShowFocusView] = useState(false);

  const people = useMemo(() => data.persons, []);
  const focusedPerson = useMemo(
    () => people.find((person) => person.name === focusName) ?? people[0] ?? null,
    [focusName, people]
  );

  const parentNames = useMemo(() => {
    if (!focusedPerson) {
      return [];
    }

    return [focusedPerson.father, focusedPerson.mother].filter(Boolean) as string[];
  }, [focusedPerson]);

  const childNames = useMemo(() => {
    if (!focusedPerson) {
      return [];
    }

    return people
      .filter((person) => person.father === focusedPerson.name || person.mother === focusedPerson.name)
      .map((person) => person.name);
  }, [focusedPerson, people]);

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

    generationRows.forEach(({ level, persons }) => {
      persons.forEach((person, index) => {
        positions.set(person.name, {
          x: 90 + index * 180,
          y: 70 + level * 140
        });
      });
    });

    return positions;
  }, [generationRows]);

  const connectors = useMemo(() => {
    const lines: Array<{ fromX: number; fromY: number; toX: number; toY: number }> = [];

    visiblePeople.forEach((person) => {
      const parentNames = [person.father, person.mother].filter(Boolean) as string[];
      parentNames.forEach((parentName) => {
        const parentPosition = nodePositions.get(parentName);
        const childPosition = nodePositions.get(person.name);

        if (parentPosition && childPosition) {
          lines.push({
            fromX: parentPosition.x + 70,
            fromY: parentPosition.y + 30,
            toX: childPosition.x + 70,
            toY: childPosition.y + 30
          });
        }
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

  const handleNodeSelect = (name: string) => {
    setFocusName(name);
    setSearchValue(name);
    setShowFocusView(true);
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
            <svg className="tree-lines" viewBox="0 0 1100 500" preserveAspectRatio="xMidYMid meet">
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
                      onClick={() => handleNodeSelect(person.name)}
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

        {showFocusView && focusedPerson && (
          <div className="tree-focus-view">
            <div className="tree-focus-card">
              <h3>{focusedPerson.name}</h3>
              <p><strong>Fæddur:</strong> {focusedPerson.born || '—'}</p>
              <p><strong>Foreldrar:</strong> {parentNames.length > 0 ? parentNames.join(', ') : '—'}</p>
              <p><strong>Börn:</strong> {childNames.length > 0 ? childNames.join(', ') : '—'}</p>
              <button type="button" className="tree-focus-close" onClick={() => setShowFocusView(false)}>
                Loka sýn
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default FamilyTreePage;
