import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TestModeRadio from './components/TestModeRadio';

const BFF_HOST = 'https://bff.dummy.localhost';

interface UserInfo {
  isAuthenticated: boolean;
  sub?: string;
  name?: string;
  email?: string;
}

function App() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch(`${BFF_HOST}/me`, { credentials: 'include' })
      .then(r => r.json())
      .then((data: UserInfo) => setUser(data))
      .catch(() => setUser({ isAuthenticated: false }));
  }, []);

  const handleLogin = () => {
    window.location.href = `${BFF_HOST}/login`;
  };

  const handleLogout = () => {
    window.location.href = `${BFF_HOST}/logout`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        {/* Auth bar */}
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user === null ? (
            <span style={{ color: '#aaa' }}>Загрузка...</span>
          ) : user.isAuthenticated ? (
            <>
              <span style={{ color: '#85e89d' }}>
                Вошли как: <strong>{user.email ?? user.name ?? user.sub}</strong>
              </span>
              <button
                onClick={handleLogout}
                style={{ padding: '0.3rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #f97583', background: 'transparent', color: '#f97583', cursor: 'pointer' }}
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              style={{ padding: '0.3rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #61dafb', background: 'transparent', color: '#61dafb', cursor: 'pointer' }}
            >
              Войти
            </button>
          )}
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <TestModeRadio isAuthenticated={user?.isAuthenticated ?? false} />
        </div>
      </header>
    </div>
  );
}

export default App;
