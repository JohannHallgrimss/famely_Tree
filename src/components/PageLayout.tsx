import type { ReactNode } from 'react';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

interface PageLayoutProps {
  patriot: string;
  children: ReactNode;
}

const PageLayout = ({ patriot, children }: PageLayoutProps) => (
  <div className="app-shell">
    <SiteHeader patriot={patriot} />
    {children}
    <SiteFooter />
  </div>
);

export default PageLayout;
