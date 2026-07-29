import type { ReactNode } from 'react';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import type { FamilyDataset } from '../data/dataLoader';

interface PageLayoutProps {
  patriot: string;
  children: ReactNode;
  familyDataset: FamilyDataset;
  onFamilyDatasetChange: (familyDataset: FamilyDataset) => void;
}

const PageLayout = ({
  patriot,
  children,
  familyDataset,
  onFamilyDatasetChange
}: PageLayoutProps) => {

  return (
    <div className="app-shell">

      <SiteHeader
        patriot={patriot}
        currentFamilyDataset={familyDataset}
        onFamilyDatasetChange={onFamilyDatasetChange}
      />

      {children}

      <SiteFooter />

    </div>
  );
};

export default PageLayout;