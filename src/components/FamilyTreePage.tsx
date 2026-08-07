import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { FamilyData, Person } from '../types';
import { getRelatedPeopleNames } from '../utils/familyTreeUtils';

interface FamilyTreeProps {
  onSelectPerson: (person: Person) => void;
  data: FamilyData;
}

const FamilyTreePage = ({ onSelectPerson, data }: FamilyTreeProps) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialFocus = params.get('focus') ?? '';
  const [focusName, setFocusName] = useState<string>(initialFocus);
  const [isMobile, setIsMobile] = useState(false);

 useEffect(() => {
  const mediaQuery = window.matchMedia('(max-width: 700px)');

  const updateIsMobile = () => {
    setIsMobile(mediaQuery.matches);
  };

  updateIsMobile();

  mediaQuery.addEventListener(
    'change',
    updateIsMobile
  );

  return () => {
    mediaQuery.removeEventListener(
      'change',
      updateIsMobile
    );
  };
}, []);

  const people = data.persons;

  const focusPerson = focusName
    ? people.find((person) => person.name === focusName) ?? null
    : null;

  const relatedPersonNames = focusPerson
    ? getRelatedPeopleNames(people, focusName)
    : [];

  const mobilePeople = focusPerson
    ? [
        focusPerson,
        ...people.filter(
          (person) =>
            person.name !== focusName && relatedPersonNames.includes(person.name)
        ),
      ]
    : people;

  const visiblePeople = useMemo(() => {
    if (!focusName) {
      return people;
    }

    const relatedNames = getRelatedPeopleNames(people, focusName);
    return people.filter((person) => relatedNames.includes(person.name));
  }, [focusName, people]);

  const parseBirthTimestamp = (born: string) => {
    const parts = born.split('.').map((part) => part.trim());
    if (parts.length < 3) {
      return Number.MAX_SAFE_INTEGER;
    }

    const day = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10);
    const year = Number.parseInt(parts[2], 10);

    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
      return Number.MAX_SAFE_INTEGER;
    }

    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
  };

  const getBirthTimestamp = (person: Person) => parseBirthTimestamp(person.born);

  const getParentBirthTimestamp = (person: Person) => {
    const parentNames = [person.father, person.mother].filter(Boolean) as string[];
    const parentTimestamps = parentNames
      .map((name) => people.find((p) => p.name === name))
      .filter((parent): parent is Person => Boolean(parent))
      .map(getBirthTimestamp);

    return parentTimestamps.length > 0
      ? Math.min(...parentTimestamps)
      : Number.MAX_SAFE_INTEGER;
  };

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


    const getSiblingGroups = (persons: Person[]) => {
      const graph = new Map<string, Set<string>>();

      persons.forEach((person) => {
        graph.set(person.name, new Set<string>());
      });

      persons.forEach((person) => {
        persons.forEach((other) => {
          if (person.name === other.name) return;
          const parentNames = new Set(
            [person.father, person.mother].filter(Boolean) as string[]
          );
          const otherParentNames = new Set(
            [other.father, other.mother].filter(Boolean) as string[]
          );

          const sharedParent = [...parentNames].some((name) =>
            otherParentNames.has(name)
          );

          if (sharedParent) {
            graph.get(person.name)?.add(other.name);
            graph.get(other.name)?.add(person.name);
          }
        });
      });

      const groups: Person[][] = [];
      const seen = new Set<string>();

      persons.forEach((person) => {
        if (seen.has(person.name)) return;

        const queue = [person.name];
        const component: string[] = [];
        seen.add(person.name);

        while (queue.length) {
          const current = queue.shift()!;
          component.push(current);
          graph.get(current)?.forEach((neighbor) => {
            if (!seen.has(neighbor)) {
              seen.add(neighbor);
              queue.push(neighbor);
            }
          });
        }

        groups.push(
          component
            .map((name) => persons.find((person) => person.name === name)!)
            .sort((a, b) => {
              const aBirth = getBirthTimestamp(a);
              const bBirth = getBirthTimestamp(b);
              if (aBirth !== bBirth) {
                return aBirth - bBirth;
              }
              return a.name.localeCompare(b.name);
            })
        );
      });

      return groups.sort((a, b) => {
        const aParentYear = Math.min(...a.map(getParentBirthTimestamp));
        const bParentYear = Math.min(...b.map(getParentBirthTimestamp));
        if (aParentYear !== bParentYear) {
          return aParentYear - bParentYear;
        }

        const aChildYear = Math.min(...a.map(getBirthTimestamp));
        const bChildYear = Math.min(...b.map(getBirthTimestamp));
        if (aChildYear !== bChildYear) {
          return aChildYear - bChildYear;
        }

        return a[0].name.localeCompare(b[0].name);
      });
    };

    return Array.from(generationMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([level, persons]) => {
        const siblingGroups = getSiblingGroups(persons);
        return {
          level,
          persons: siblingGroups.flat()
        };
      });
  }, [people, visiblePeople]);

  const NODE_WIDTH = 140;
  const NODE_HEIGHT = 60;

  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();

    const COLUMN_WIDTH = 220;
    const ROW_HEIGHT = 110;
    const TOP_Y = 60;

    const maxPeopleInGeneration = Math.max(
      ...generationRows.map(({ persons }) => persons.length),
      1
    );

    const getSiblingGroups = (persons: Person[]) => {
      const graph = new Map<string, Set<string>>();

      persons.forEach((person) => {
        graph.set(person.name, new Set<string>());
      });

      persons.forEach((person) => {
        persons.forEach((other) => {
          if (person.name === other.name) return;
          const parentNames = new Set(
            [person.father, person.mother].filter(Boolean) as string[]
          );
          const otherParentNames = new Set(
            [other.father, other.mother].filter(Boolean) as string[]
          );

          const sharedParent = [...parentNames].some((name) =>
            otherParentNames.has(name)
          );

          if (sharedParent) {
            graph.get(person.name)?.add(other.name);
            graph.get(other.name)?.add(person.name);
          }
        });
      });

      const groups: Person[][] = [];
      const seen = new Set<string>();

      persons.forEach((person) => {
        if (seen.has(person.name)) return;

        const queue = [person.name];
        const component: string[] = [];
        seen.add(person.name);

        while (queue.length) {
          const current = queue.shift()!;
          component.push(current);
          graph.get(current)?.forEach((neighbor) => {
            if (!seen.has(neighbor)) {
              seen.add(neighbor);
              queue.push(neighbor);
            }
          });
        }

        groups.push(
          component
            .map((name) => persons.find((person) => person.name === name)!)
            .sort((a, b) => {
              const aBirth = getBirthTimestamp(a);
              const bBirth = getBirthTimestamp(b);
              if (aBirth !== bBirth) {
                return aBirth - bBirth;
              }
              return a.name.localeCompare(b.name);
            })
        );
      });

      return groups.sort((a, b) => {
        const aYear = Math.min(...a.map(getBirthTimestamp));
        const bYear = Math.min(...b.map(getBirthTimestamp));
        return aYear - bYear;
      });
    };

    generationRows.forEach(({ level, persons }) => {
      const generationHeight = persons.length * ROW_HEIGHT;
      const totalHeight = maxPeopleInGeneration * ROW_HEIGHT;
      const verticalOffset = (totalHeight - generationHeight) / 2;
      const baseY = TOP_Y + verticalOffset;

      const siblingGroups = getSiblingGroups(persons);
      const sortedGroups = siblingGroups.sort((a, b) => {
        const aParentYs = a
          .flatMap((person) => [person.father, person.mother].filter(Boolean) as string[])
          .map((parentName) => positions.get(parentName))
          .filter((parent): parent is { x: number; y: number } => Boolean(parent))
          .map((parent) => parent.y);
        const bParentYs = b
          .flatMap((person) => [person.father, person.mother].filter(Boolean) as string[])
          .map((parentName) => positions.get(parentName))
          .filter((parent): parent is { x: number; y: number } => Boolean(parent))
          .map((parent) => parent.y);

        const aParentY = aParentYs.length > 0 ? Math.min(...aParentYs) : Number.MAX_SAFE_INTEGER;
        const bParentY = bParentYs.length > 0 ? Math.min(...bParentYs) : Number.MAX_SAFE_INTEGER;

        if (aParentY !== bParentY) {
          return aParentY - bParentY;
        }

        const aChildYear = Math.min(...a.map(getBirthTimestamp));
        const bChildYear = Math.min(...b.map(getBirthTimestamp));
        if (aChildYear !== bChildYear) {
          return aChildYear - bChildYear;
        }

        return a[0].name.localeCompare(b[0].name);
      });

      let currentY = baseY;

      sortedGroups.forEach((group) => {
        const groupHeight = group.length * ROW_HEIGHT;
        group.forEach((person, index) => {
          positions.set(person.name, {
            x: 80 + level * COLUMN_WIDTH,
            y: currentY + index * ROW_HEIGHT
          });
        });
        currentY += groupHeight;
      });
    });

    return positions;
  }, [generationRows]);

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

  const handleNodeSelect = (person: Person) => {
    setFocusName(person.name);
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

        <div className="tree-board tree-board-overview">
          {isMobile ? (
            <div className="mobile-tree-shell">
              <div className="mobile-tree-controls">
                <label htmlFor="mobile-focus">Skoða:</label>
                <select
                  id="mobile-focus"
                  value={focusName}
                  onChange={(event) => setFocusName(event.target.value)}
                >
                  <option value="">Allar persónur</option>
                  {people.map((person) => (
                    <option key={person.name} value={person.name}>
                      {person.name}
                    </option>
                  ))}
                </select>
                {focusName && (
                  <button
                    type="button"
                    className="clear-focus"
                    onClick={() => setFocusName('')}
                  >
                    Sýna allt
                  </button>
                )}
              </div>

              <div className="mobile-tree-list">
                {mobilePeople.map((person) => (
                  <button
                    key={person.name}
                    type="button"
                    className={`mobile-tree-item ${
                      focusName === person.name ? 'tree-node-active' : ''
                    }`}
                    onClick={() => handleNodeSelect(person)}
                  >
                    <strong>{person.name}</strong>
                    <span>{person.born || '—'}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </main>
  );
};

export default FamilyTreePage;
