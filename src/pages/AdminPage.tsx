import React, { useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import { useAppContext } from '../context/AppContext';
import InviteCreatorForm from '../components/InviteCreatorForm';

function AdminPage() {
  const { adminUsers, adminRoles, loading, error, refreshAdminData, toggleUserActive } = useAppContext();

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  async function handleToggle(userId: string, currentState: boolean) {
    try {
      await toggleUserActive(userId, !currentState);
    } catch {
      // error state is handled in context
    }
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      {loading && <Typography>Loading admin data...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
        Users
      </Typography>
      <Grid container spacing={2}>
        {adminUsers.map(user => (
          <Grid item xs={12} md={6} key={user.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {user.email}
                </Typography>
                <Typography variant="body2">{user.firstName} {user.lastName}</Typography>
                <Typography variant="body2">Roles: {user.roles.join(', ') || 'None'}</Typography>
                <FormControlLabel
                  control={<Switch checked={user.isActive} onChange={() => handleToggle(user.id, user.isActive)} />}
                  label={user.isActive ? 'Active' : 'Inactive'}
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom>
        Roles
      </Typography>
      <Grid container spacing={2}>
        {adminRoles.map(role => (
          <Grid item xs={12} sm={6} md={4} key={role.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">{role.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {role.id}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />
      <InviteCreatorForm />
    </Container>
  );
}

export default AdminPage;
