import { Link, useLocation } from "react-router-dom";
import type { FamilyDataset } from "../data/dataLoader";

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

  return (
    <header className="site-header">

      <div className="brand">
        🌳 Ættartré - {patriot}
      </div>

      <nav className="top-nav">
        <Link
          to="/"
          className={location.pathname === "/" ? "active" : ""}
        >
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
        <select
          className="family-select"
          value={currentFamilyDataset}
          onChange={(e) =>
            onFamilyDatasetChange(e.target.value as FamilyDataset)
          }
        >
          <option value="hallgrimurJonsson">
            Hallgrímur Jónsson
          </option>

          <option value="valgerdurEinarsdottir">
            Valgerður Einarsdóttir
          </option>
        </select>
      </div>

    </header>
  );
};

export default SiteHeader;