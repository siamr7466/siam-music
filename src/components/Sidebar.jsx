import { Link, useLocation } from 'react-router-dom';
import { Music2, Users, Search, Home, UploadCloud } from 'lucide-react';
import './Sidebar.css';

const nav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/artists', icon: Users, label: 'Artists' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/upload', icon: UploadCloud, label: 'Upload' },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <Music2 size={24} />
        <span>Siam's Music</span>
      </div>
      <nav className="sidebar__nav">
        {nav.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar__link ${pathname === to ? 'sidebar__link--active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
