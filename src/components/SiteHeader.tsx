import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { FamilyDataset } from "../data/dataLoader";

interface SiteHeaderProps {
  patriot: string;
  currentFamilyDataset: FamilyDataset;
  onFamilyDatasetChange: (familyDataset: FamilyDataset) => void;
}

const familyNames: Record<FamilyDataset, string> = {
  hallgrimurJonsson: "Hallgrímur Jónsson",
  valgerdurEinarsdottir: "Valgerður Einarsdóttir",
};

const SiteHeader = ({
  patriot,
  currentFamilyDataset,
  onFamilyDatasetChange,
}: SiteHeaderProps) => {
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectFamily = (family: FamilyDataset) => {
    onFamilyDatasetChange(family);
    setOpen(false);
  };

  return (
    <header className="site-header">
      <div className="brand">
        🌳 Ættartré - {patriot}
      </div>

      <nav className="top-nav">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Heimasíða
        </Link>

        <Link
          to="/afmæli"
          className={location.pathname === "/afmæli" ? "active" : ""}
        >
          Næstu afmæli
        </Link>

        <Link
          to="/ættarsaga"
          className={location.pathname === "/ættarsaga" ? "active" : ""}
        >
          Ættarsaga
        </Link>

        <Link
          to="/vidartre"
          className={location.pathname === "/vidartre" ? "active" : ""}
        >
          Viðartré
        </Link>
      </nav>

      <div className="header-actions">
        <div className="family-dropdown" ref={menuRef}>
          <button
            className="family-button"
            onClick={() => setOpen(!open)}
          >
            🌳 {familyNames[currentFamilyDataset]}
            <span className={open ? "arrow open" : "arrow"}>⌄</span>
          </button>

          {open && (
            <div className="family-menu">
              {(Object.keys(familyNames) as FamilyDataset[]).map((family) => (
                <button
                  key={family}
                  className={`family-option ${
                    family === currentFamilyDataset ? "active" : ""
                  }`}
                  onClick={() => selectFamily(family)}
                >
                  {familyNames[family]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;