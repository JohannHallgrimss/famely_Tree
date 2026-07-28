import type { Person } from '../types';

interface PersonModalProps {
  person: Person;
  onClose: () => void;
  onImageError: () => void;
  imageUrl: string;
  displayName: string;
  bornLabel: string;
  relationList: string[];
  parentNames: string[];
  spouseName: string | null;
  age: number | null;
  daysUntilBirthday: number | null;
  onSelectPerson: (person: Person) => void;
}

const PersonModal = ({
  person,
  onClose,
  onImageError,
  imageUrl,
  displayName,
  bornLabel,
  relationList,
  parentNames,
  spouseName,
  age,  
  daysUntilBirthday,
  onSelectPerson
}: PersonModalProps) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-card" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" type="button" onClick={onClose}>
        Loka
      </button>

      <div className="modal-content">
        <div className="modal-portrait">
          <img
            className="person-image"
            src={imageUrl}
            alt={person.name}
            onError={onImageError}
          />
          <div className="portrait-badge">{person.gender === 'female' ? 'Kona' : 'Karl'}</div>
        </div>

        <div className="modal-text">
          <div className="modal-heading">
            <h2>{displayName}</h2>
            <p className="eyebrow">Persónuupplýsingar</p>
          </div>
          <div className="info-grid">
            <p><strong>Afmæli:</strong> {person.born || '—'}</p>
            <p><strong>Dagar í afmæli:</strong> {daysUntilBirthday !== null ? `${daysUntilBirthday} daga` : '—'}</p>
            <p><strong>Aldur:</strong> {age !== null ? age : '—'}</p>
            <p><strong>Heimilisfang:</strong> {person.address || '—'}</p>
            <p><strong>Sími:</strong> {person.phone || '—'}</p>
          </div>

          <div className="relations-block">
            <p><strong>Maki</strong></p>
            {spouseName ? (
              <button
                type="button"
                className="modal-link"
                onClick={() => onSelectPerson({ ...person, name: spouseName })}
              >
                {spouseName}
              </button>
            ) : <p>—</p>}
          </div>

          <div className="relations-block">
            <p><strong>Foreldrar</strong></p>
            {parentNames.length > 0 ? parentNames.map((name) => (
              <button
                key={name}
                type="button"
                className="modal-link"
                onClick={() => onSelectPerson({ ...person, name })}
              >
                {name}
              </button>
            )) : <p>—</p>}
          </div>

          <div className="relations-block">
            <p><strong>Börn</strong></p>
            {relationList.length > 0 ? relationList.map((child) => (
              <button
                key={child}
                type="button"
                className="modal-link"
                onClick={() => onSelectPerson({ ...person, name: child })}
              >
                {child}
              </button>
            )) : <p>—</p>}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PersonModal;
