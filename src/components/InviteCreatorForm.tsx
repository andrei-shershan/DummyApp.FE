import React, { useState } from 'react';
import { BFF_HOST } from '../config';

function InviteCreatorForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const response = await fetch(`${BFF_HOST}/api/admin/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      setStatus('Invite sent successfully.');
      setEmail('');
    } catch (err: any) {
      setStatus(`Failed to send invite: ${err?.message ?? 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: '#85e89d' }}>Invite Creator</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: '400px' }}>
        <label style={{ color: '#aaa' }}>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="creator@example.com"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #444', background: '#0f172a', color: '#fff' }}
          />
        </label>
        <button
          type="submit"
          disabled={loading || email.trim() === ''}
          style={{ padding: '0.6rem 1rem', borderRadius: '0.4rem', border: '1px solid #61dafb', background: '#111827', color: '#61dafb', cursor: 'pointer' }}
        >
          {loading ? 'Sending...' : 'Send Invite'}
        </button>
        {status && <p style={{ color: status.startsWith('Failed') ? '#f97583' : '#85e89d' }}>{status}</p>}
      </form>
    </section>
  );
}

export default InviteCreatorForm;
