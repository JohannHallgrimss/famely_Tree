import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { FamilyDataset } from "../data/dataLoader";
import { familyList, getFamilyName } from "../data/dataLoader";

interface SiteHeaderProps {
  patriot: string;
  currentFamilyDataset: FamilyDataset;
  onFamilyDatasetChange: (familyDataset: FamilyDataset) => void;
}

const SiteHeader = ({
  patriot,
  currentFamilyDataset,
  onFamilyDatasetChange,
}: SiteHeaderProps) => {
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectFamily = (family: FamilyDataset) => {
    onFamilyDatasetChange(family);
    setOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="site-header" ref={menuRef}>
      <div className="header-left">
        <div className="brand" title={patriot}>
          🌳 Ættartré - {patriot}
        </div>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-expanded={mobileOpen}
          aria-label="Opna síðuvalmynd"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          ☰
        </button>
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
        <div className="family-dropdown">
          <button
            className="family-button"
            title={getFamilyName(currentFamilyDataset)}
            onClick={() => setOpen(!open)}
          >
            🌳 {getFamilyName(currentFamilyDataset)}
            <span className={open ? "arrow open" : "arrow"}>⌄</span>
          </button>

          {open && (
            <div className="family-menu">
              {familyList.map((family) => (
                <button
                  key={family.id}
                  className={`family-option ${
                    family.id === currentFamilyDataset ? "active" : ""
                  }`}
                  onClick={() => selectFamily(family.id)}
                >
                  {family.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav-panel">
          <div className="mobile-nav-links">
            <Link
              to="/"
              className={location.pathname === "/" ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >
              Heimasíða
            </Link>
            <Link
              to="/afmæli"
              className={location.pathname === "/afmæli" ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >
              Næstu afmæli
            </Link>
            <Link
              to="/ættarsaga"
              className={location.pathname === "/ættarsaga" ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >
              Ættarsaga
            </Link>
            <Link
              to="/vidartre"
              className={location.pathname === "/vidartre" ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >
              Viðartré
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;