import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import WorkerProfile from './pages/WorkerProfile';
import ClientDashboard from './pages/ClientDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import Chat from './pages/Chat';
import Account from './pages/Account';
import Admin from './pages/Admin';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/workers/:id" element={<WorkerProfile />} />
            <Route
              path="/client"
              element={<ProtectedRoute roles={['client']}><ClientDashboard /></ProtectedRoute>}
            />
            <Route
              path="/worker"
              element={<ProtectedRoute roles={['worker']}><WorkerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/chat"
              element={<ProtectedRoute roles={['client', 'worker']}><Chat /></ProtectedRoute>}
            />
            <Route
              path="/account"
              element={<ProtectedRoute roles={['client', 'worker']}><Account /></ProtectedRoute>}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>}
            />
          </Routes>
        </main>
        <footer className="border-t border-ink-700/10 bg-ink-800 py-8 text-ink-100/60">
          <div className="mx-auto max-w-6xl px-6 text-center font-mono text-xs">
            Sergiu Mind Find © {new Date().getFullYear()} — găsește meseriași de încredere.
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
