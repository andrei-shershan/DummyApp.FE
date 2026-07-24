import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import InviteCreatorForm from './InviteCreatorForm';

function AdminPanel() {
  const { adminUsers, adminRoles, refreshAdminData, toggleUserActive } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function handleToggleUserActive(userId: string, currentState: boolean) {
    setError('');

    try {
      await toggleUserActive(userId, !currentState);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to update user status.');
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');

      try {
        await refreshAdminData();
      } catch (err: any) {
        setError(err?.message ?? 'Unable to load admin data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [refreshAdminData]);

  return (
    <section style={{ width: '100%', maxWidth: '900px', marginTop: '1.5rem', textAlign: 'left' }}>
      <h2 style={{ color: '#61dafb' }}>Admin Panel</h2>
      {loading && <p>Loading admin data...</p>}
      {error && <p style={{ color: '#f97583' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#85e89d' }}>Users</h3>
            {adminUsers.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {adminUsers.map(user => (
                  <article key={user.id} style={{ padding: '1rem', borderRadius: '0.6rem', border: '1px solid #444', background: '#111827' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>{user.email}</strong></p>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa' }}>
                        <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                        <input
                          type="checkbox"
                          checked={user.isActive}
                          onChange={() => handleToggleUserActive(user.id, user.isActive)}
                        />
                      </label>
                    </div>
                    <p style={{ margin: '0.25rem 0', color: '#aaa' }}><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                    <p style={{ margin: '0.25rem 0', color: '#aaa' }}><strong>Roles:</strong> {user.roles.join(', ') || 'None'}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 style={{ color: '#85e89d' }}>Roles</h3>
            {adminRoles.length === 0 ? (
              <p>No roles found.</p>
            ) : (
              <ul style={{ color: '#aaa', marginTop: '0.75rem' }}>
                {adminRoles.map(role => (
                  <li key={role.id} style={{ marginBottom: '0.35rem' }}>
                    <strong>{role.name}</strong> ({role.id})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <InviteCreatorForm />
        </>
      )}
    </section>
  );
}

export default AdminPanel;
