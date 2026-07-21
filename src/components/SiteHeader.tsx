import { Link, useLocation } from 'react-router-dom';

interface SiteHeaderProps {
  patriot: string;
}

const SiteHeader = ({ patriot }: SiteHeaderProps) => {
  const location = useLocation();

  return (
    <header className="site-header">
      <div className="brand">Ættartré - {patriot}</div>
      <nav className="top-nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Heimasíða
        </Link>
        <Link to="/upplýsingar" className={location.pathname === '/upplýsingar' ? 'active' : ''}>
          Upplýsingar
        </Link>
        <Link to="/ættarsaga" className={location.pathname === '/ættarsaga' ? 'active' : ''}>
          Ættarsaga
        </Link>
        <Link to="/vidartre" className={location.pathname === '/vidartre' ? 'active' : ''}>
          Viðartré
        </Link>
      </nav>
    </header>
  );
};

export default SiteHeader;
