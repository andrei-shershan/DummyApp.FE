import React, { useEffect, useState } from 'react';
import { BFF_HOST } from '../config';
import InviteCreatorForm from './InviteCreatorForm';

interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
}

interface RoleDto {
  id: string;
  name: string;
}

function AdminPanel() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function toggleUserActive(userId: string, currentState: boolean) {
    setError('');

    try {
      const response = await fetch(`${BFF_HOST}/api/admin/users/${encodeURIComponent(userId)}/active`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const updatedUser = await response.json();
      setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
    } catch (err: any) {
      setError(err?.message ?? 'Unable to update user status.');
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          fetch(`${BFF_HOST}/api/admin/users`, { credentials: 'include' }),
          fetch(`${BFF_HOST}/api/admin/roles`, { credentials: 'include' }),
        ]);

        if (!usersResponse.ok) {
          const text = await usersResponse.text();
          throw new Error(`Users: HTTP ${usersResponse.status}: ${text}`);
        }

        if (!rolesResponse.ok) {
          const text = await rolesResponse.text();
          throw new Error(`Roles: HTTP ${rolesResponse.status}: ${text}`);
        }

        const usersData = await usersResponse.json();
        const rolesData = await rolesResponse.json();

        setUsers(usersData);
        setRoles(rolesData);
      } catch (err: any) {
        setError(err?.message ?? 'Unable to load admin data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <section style={{ width: '100%', maxWidth: '900px', marginTop: '1.5rem', textAlign: 'left' }}>
      <h2 style={{ color: '#61dafb' }}>Admin Panel</h2>
      {loading && <p>Loading admin data...</p>}
      {error && <p style={{ color: '#f97583' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#85e89d' }}>Users</h3>
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {users.map(user => (
                  <article key={user.id} style={{ padding: '1rem', borderRadius: '0.6rem', border: '1px solid #444', background: '#111827' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>{user.email}</strong></p>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa' }}>
                        <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                        <input
                          type="checkbox"
                          checked={user.isActive}
                          onChange={() => toggleUserActive(user.id, user.isActive)}
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
            {roles.length === 0 ? (
              <p>No roles found.</p>
            ) : (
              <ul style={{ color: '#aaa', marginTop: '0.75rem' }}>
                {roles.map(role => (
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
