import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../context/context';
import { Sun, Moon, LogOut, History, PenTool, LogIn, UserPlus } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="logo-icon">✨</span>
          <span className="logo-text">Insta Line Breaker</span>
        </Link>

        <div className="navbar-menu">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <>
              <Link to="/" className="nav-link">
                <PenTool size={18} /> Editor
              </Link>
              <Link to="/history" className="nav-link">
                <History size={18} /> History
              </Link>
              <div className="user-profile">
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn-logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <LogIn size={18} /> Login
              </Link>
              <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <UserPlus size={18} /> Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
