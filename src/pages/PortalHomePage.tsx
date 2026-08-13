import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../context/AppContext';
import { getCurrentUserProfile } from '../api/users';
import { UserProfile } from '../types/api';

function PortalHomePage() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.roles?.includes('Admin');
  const isCreator = user?.roles?.includes('Creator');

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
        Admin Portal
      </Typography>
      <Typography variant="body1" paragraph>
        This portal is for administrators and creators. Use it to manage artworks, users, and portal-specific tasks.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {isCreator || isAdmin ? (
          <Button variant="contained" onClick={() => navigate('/portal/my-works')}>
            MyArtworks
          </Button>
        ) : null}
        {isAdmin ? (
          <Button variant="outlined" onClick={() => navigate('/portal/admin')}>
            Admin Panel
          </Button>
        ) : null}
      </Box>

      <Typography variant="subtitle1">Account</Typography>
      {loading ? (
        <Typography>Loading profile...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : profile ? (
        <>
          <Typography>
            Signed in as <strong>{profile.email}</strong>.
          </Typography>
          <Typography>
            Name: <strong>{profile.firstName} {profile.lastName}</strong>
          </Typography>
          {profile.roles && <Typography>Roles: {profile.roles.join(', ')}</Typography>}
        </>
      ) : (
        <Typography>Unable to load profile.</Typography>
      )}
    </Container>
  );
}

export default PortalHomePage;
