import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../context/AppContext';
import { getCurrentUserProfile } from '../api/users';
import { UserProfile } from '../types/api';

function MyAccountPage() {
  const { user } = useAppContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentProfile = await getCurrentUserProfile();
        if (isMounted) {
          setProfile(currentProfile);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message ?? 'Unable to load profile data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Account
      </Typography>
      <Typography variant="body1" paragraph>
        Manage your profile information and account settings.
      </Typography>

      {loading ? (
        <Typography>Loading account details...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : profile ? (
        <Box>
          <Typography variant="subtitle1">Account information</Typography>
          <Typography>Email: {profile.email}</Typography>
          <Typography>First name: {profile.firstName}</Typography>
          <Typography>Last name: {profile.lastName}</Typography>
          <Typography>Roles: {profile.roles.join(', ')}</Typography>
          <Typography>Status: {profile.isActive ? 'Active' : 'Inactive'}</Typography>
        </Box>
      ) : (
        <Typography>Unable to load account details.</Typography>
      )}
    </Container>
  );
}

export default MyAccountPage;
