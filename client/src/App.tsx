import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FocusModeProvider, useFocusMode } from './context/FocusModeContext';
import { Login } from './components/Login';
import { ArcTimer } from './components/ArcTimer';
import { Dashboard } from './components/Dashboard';
import { Tasks } from './components/Tasks';
import './styles/index.css';

function AppContent(): JSX.Element {
  const { token, email, logout } = useAuth();
  const { isInFocusMode } = useFocusMode();
  const [view, setView] = useState<'timer' | 'dashboard' | 'tasks'>('timer');

  // Show login if not authenticated
  if (!token) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Navigation - Hidden during deep focus */}
      {!isInFocusMode && (
        <nav className="border-b-[1px] border-[#52525b] bg-[#09090b] px-8 py-4 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#fafafa]">Arc</h1>
              <p className="text-[#52525b] text-xs">Focus, Quantified</p>
            </div>

            <div className="flex gap-4 items-center">
              <button
                onClick={() => setView('timer')}
                className={`border-[1px] px-4 py-2 font-bold uppercase text-xs tracking-[0.1em] transition-all ${
                  view === 'timer'
                    ? 'border-[#dc2626] text-[#dc2626]'
                    : 'border-[#52525b] text-[#52525b] hover:border-[#dc2626] hover:text-[#dc2626]'
                }`}
              >
                Timer
              </button>

              <button
                onClick={() => setView('dashboard')}
                className={`border-[1px] px-4 py-2 font-bold uppercase text-xs tracking-[0.1em] transition-all ${
                  view === 'dashboard'
                    ? 'border-[#dc2626] text-[#dc2626]'
                    : 'border-[#52525b] text-[#52525b] hover:border-[#dc2626] hover:text-[#dc2626]'
                }`}
              >
                Analytics
              </button>

              <button
                onClick={() => setView('tasks')}
                className={`border-[1px] px-4 py-2 font-bold uppercase text-xs tracking-[0.1em] transition-all ${
                  view === 'tasks'
                    ? 'border-[#dc2626] text-[#dc2626]'
                    : 'border-[#52525b] text-[#52525b] hover:border-[#dc2626] hover:text-[#dc2626]'
                }`}
              >
                Tasks
              </button>

              <div className="border-l-[1px] border-[#52525b] pl-4 ml-4 flex items-center gap-4">
                <span className="text-[#52525b] text-xs">{email}</span>
                <button
                  onClick={logout}
                  className="border-[1px] border-[#52525b] text-[#52525b] px-3 py-2 font-bold uppercase text-xs tracking-[0.1em] hover:border-[#dc2626] hover:text-[#dc2626] transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Content */}
      {view === 'timer' ? (
        <ArcTimer />
      ) : view === 'dashboard' ? (
        <Dashboard />
      ) : (
        <Tasks />
      )}
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <FocusModeProvider>
        <AppContent />
      </FocusModeProvider>
    </AuthProvider>
  );
}
