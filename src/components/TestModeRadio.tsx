import React, { useState } from 'react';
import { BFF_HOST } from '../config';

const API_URL = `${BFF_HOST}/api/test/testX`;
const API_URL_X2 = `${BFF_HOST}/api/test/testX2`;
const API_URL_MESSAGE = `${BFF_HOST}/api/message`;

type Mode = 'R' | 'W';

interface Props {
  isAuthenticated: boolean;
}

function TestModeRadio({ isAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>('R');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [resultX2, setResultX2] = useState<string>('');
  const [loadingX2, setLoadingX2] = useState(false);
  const [errorX2, setErrorX2] = useState<string>('');

  const [message, setMessage] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(mode)}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      setResult(text || `Ответ получен: ${mode}`);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitX2 = async () => {
    setLoadingX2(true);
    setErrorX2('');
    setResultX2('');

    try {
      const response = await fetch(`${API_URL_X2}/${encodeURIComponent(mode)}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.status === 401) {
        throw new Error('Требуется авторизация (401). Войдите через кнопку "Войти".');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      setResultX2(JSON.stringify(json, null, 2));
    } catch (fetchError) {
      setErrorX2(fetchError instanceof Error ? fetchError.message : String(fetchError));
    } finally {
      setLoadingX2(false);
    }
  };

  const handleGetMessage = async () => {
    setLoadingMessage(true);
    setErrorMessage('');
    setMessage('');

    try {
      const response = await fetch(API_URL_MESSAGE, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      setMessage(json.message ?? JSON.stringify(json));
    } catch (fetchError) {
      setErrorMessage(fetchError instanceof Error ? fetchError.message : String(fetchError));
    } finally {
      setLoadingMessage(false);
    }
  };

  const radioSection = (
    <div>
      <div style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Выберите режим:</div>
      <label style={{ marginRight: '1rem', fontSize: '1rem' }}>
        <input type="radio" name="testMode" value="R" checked={mode === 'R'} onChange={() => setMode('R')} />
        {' '}R
      </label>
      <label style={{ fontSize: '1rem' }}>
        <input type="radio" name="testMode" value="W" checked={mode === 'W'} onChange={() => setMode('W')} />
        {' '}W
      </label>
    </div>
  );

  const buttonStyle = (disabled: boolean) => ({
    padding: '0.75rem 1.25rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #61dafb',
    background: disabled ? '#3d6f8b' : '#61dafb',
    color: '#0b1321',
    cursor: disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

      {/* testX – no auth required */}
      <div>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#aaa' }}>
          testX — без авторизации (client credentials, M2M)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {radioSection}
          <button type="button" onClick={handleSubmit} disabled={loading} style={buttonStyle(loading)}>
            {loading ? 'Запрос...' : 'Отправить testX'}
          </button>
        </div>
        <div style={{ minWidth: '220px', textAlign: 'center', marginTop: '0.5rem' }}>
          {result ? <pre style={{ color: '#85e89d', fontSize: '0.8rem', textAlign: 'left' }}>{result}</pre> : null}
          {error ? <div style={{ color: '#ffb3b3' }}>Ошибка: {error}</div> : null}
        </div>
      </div>

      {/* testX2 – requires user auth */}
      <div>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: isAuthenticated ? '#85e89d' : '#f97583' }}>
          testX2 — требует авторизации пользователя (PKCE + BFF)
          {!isAuthenticated && ' · Нажмите "Войти" выше'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSubmitX2}
            disabled={loadingX2}
            style={{
              ...buttonStyle(loadingX2),
              border: '1px solid #85e89d',
              background: loadingX2 ? '#3d6f8b' : (isAuthenticated ? '#85e89d' : '#444'),
            }}
          >
            {loadingX2 ? 'Запрос...' : 'Отправить testX2'}
          </button>
        </div>
        <div style={{ minWidth: '220px', textAlign: 'center', marginTop: '0.5rem' }}>
          {resultX2 ? <pre style={{ color: '#85e89d', fontSize: '0.8rem', textAlign: 'left' }}>{resultX2}</pre> : null}
          {errorX2 ? <div style={{ color: '#ffb3b3' }}>Ошибка: {errorX2}</div> : null}
        </div>
      </div>

      {/* Get Message – reads TestMessage from Key Vault via ApiGateway */}
      <div>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#aaa' }}>
          Get Message — читает TestMessage из Key Vault (через ApiGateway)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={handleGetMessage}
            disabled={loadingMessage}
            style={{
              ...buttonStyle(loadingMessage),
              border: '1px solid #e3b341',
              background: loadingMessage ? '#3d6f8b' : '#e3b341',
            }}
          >
            {loadingMessage ? 'Запрос...' : 'Get Message'}
          </button>
        </div>
        <div style={{ minWidth: '220px', textAlign: 'center', marginTop: '0.5rem' }}>
          {message ? <div style={{ color: '#e3b341', fontSize: '0.95rem' }}>{message}</div> : null}
          {errorMessage ? <div style={{ color: '#ffb3b3' }}>Ошибка: {errorMessage}</div> : null}
        </div>
      </div>

    </div>
  );
}

export default TestModeRadio;
