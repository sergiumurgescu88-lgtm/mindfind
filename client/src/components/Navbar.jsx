import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'worker' ? '/worker' : '/client';

  return (
    <header className="sticky top-0 z-30 border-b border-ink-700/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-lg font-bold tracking-tight text-ink-800">
            Sergiu Mind<span className="text-brass-600">Find</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 font-body text-sm font-medium text-ink-600 md:flex">
          <Link to="/search" className="hover:text-brass-600">Găsește un meseriaș</Link>
          {user?.role === 'worker' && (
            <Link to="/worker/requests" className="hover:text-brass-600">Cereri deschise</Link>
          )}
          {user && (
            <Link to="/chat" className="hover:text-brass-600">Mesaje</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" className="font-display text-sm font-semibold text-ink-700 hover:text-brass-600">
                Autentificare
              </Link>
              <Link to="/register" className="btn-primary">Creează cont</Link>
            </>
          ) : (
            <>
              <Link to={dashboardPath} className="font-display text-sm font-semibold text-ink-700 hover:text-brass-600">
                Contul meu
              </Link>
              <button onClick={handleLogout} className="btn-ghost-dark">Ieșire</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
