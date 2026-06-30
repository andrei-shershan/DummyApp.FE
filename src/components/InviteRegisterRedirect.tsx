import React, { useEffect, useState } from 'react';

function InviteRegisterRedirect() {
  const [identityUrl, setIdentityUrl] = useState<string>('');

  useEffect(() => {
    const path = window.location.pathname;
    const token = path.split('/').pop();
    if (!token) {
      return;
    }

    const frontendUrl = window.location.origin;
    const identityBase = window.location.origin.includes('localhost')
      ? 'https://identity.dummy.localhost'
      : `${window.location.protocol}//identity.${window.location.host}`;

    const url = `${identityBase}/account/register/${encodeURIComponent(token)}?returnUrl=${encodeURIComponent(frontendUrl)}`;
    setIdentityUrl(url);
    window.location.href = url;
  }, []);

  return (
    <div style={{ fontFamily: 'Segoe UI, Arial, Helvetica, sans-serif', padding: '2rem' }}>
      <h2>Переход к регистрации...</h2>
      <p>Если перенаправление не произошло автоматически, пожалуйста, нажмите на ссылку ниже:</p>
      <p>
        <a href={identityUrl || '#'}>Перейти на страницу регистрации</a>
      </p>
    </div>
  );
}

export default InviteRegisterRedirect;
