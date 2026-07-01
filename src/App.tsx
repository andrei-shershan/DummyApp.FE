import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TestModeRadio from './components/TestModeRadio';
import ArtworkUploadForm from './components/ArtworkUploadForm';
import ArtworkList from './components/ArtworkList';
import ArtworkDetails from './components/ArtworkDetails';
import AdminPanel from './components/AdminPanel';
import InviteRegisterRedirect from './components/InviteRegisterRedirect';
import { BFF_HOST } from './config';

interface UserInfo {
  isAuthenticated: boolean;
  id?: string;
  sub?: string;
  name?: string;
  email?: string;
  roles?: string[];
}

function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [creatorId, setCreatorId] = useState<string | undefined>(undefined);
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    fetch(`${BFF_HOST}/me`, { credentials: 'include' })
      .then(r => r.json())
      .then((data: UserInfo) => {
        setUser(data);
        setCreatorId(data.id ?? data.sub);
      })
      .catch(() => {
        setUser({ isAuthenticated: false });
        setCreatorId(undefined);
      });
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setRoute(path);
  };

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

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <button onClick={() => navigate('/')} style={navButtonStyle}>
            Home
          </button>
          <button onClick={() => navigate('/artworks')} style={navButtonStyle}>
            Artworks
          </button>
          {user?.isAuthenticated && creatorId ? (
            <button onClick={() => navigate('/my-works')} style={navButtonStyle}>
              My Works
            </button>
          ) : null}
          {user?.isAuthenticated && user.roles?.includes('Admin') ? (
            <button onClick={() => navigate('/admin')} style={navButtonStyle}>
              Admin Panel
            </button>
          ) : null}
        </div>

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

        {route.startsWith('/register/') ? (
          <InviteRegisterRedirect />
        ) : route === '/artworks' ? (
          <ArtworkList />
        ) : route === '/my-works' ? (
          <ArtworkList creatorId={creatorId} onSelect={id => navigate(`/my-works/${id}`)} />
        ) : route.startsWith('/my-works/') ? (
          <ArtworkDetails
            id={Number(route.replace('/my-works/', ''))}
            onBack={() => navigate('/my-works')}
          />
        ) : route === '/admin' ? (
          <AdminPanel />
        ) : (
          <>
            {user?.isAuthenticated && user.roles?.includes('Creator') ? (
              <ArtworkUploadForm />
            ) : (
              <div style={{ marginTop: '1.5rem', color: '#aaa', maxWidth: '480px' }}>
                <p>Добро пожаловать! Здесь авторизованные создатели могут загружать новые работы.</p>
                <p>Перейдите на страницу <strong>Artworks</strong>, чтобы просмотреть доступные работы.</p>
              </div>
            )}
          </>
        )}
      </header>
    </div>
  );
}

const navButtonStyle: React.CSSProperties = {
  padding: '0.35rem 0.75rem',
  borderRadius: '0.4rem',
  border: '1px solid #61dafb',
  background: 'transparent',
  color: '#61dafb',
  cursor: 'pointer',
};

export default App;
