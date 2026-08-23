import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { getCurrentUserProfile, updateCurrentUserProfile } from '../api/users';
import { UpdateCurrentUserProfileRequest, UserProfile } from '../types/api';

function MyAccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleEdit = () => {
    if (!profile) {
      return;
    }

    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setSuccess(null);
    setError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data: UpdateCurrentUserProfileRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };

      const updatedProfile = await updateCurrentUserProfile(data);
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Account
      </Typography>
      <Typography variant="body1" paragraph>
        Manage your profile information and account settings.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Loading account details...</Typography>
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : profile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">Account information</Typography>
            {!editing && (
              <Button variant="contained" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </Box>

          <Typography>Email: {profile.email}</Typography>

          {editing ? (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
              <TextField
                fullWidth
                label="First name"
                value={firstName}
                onChange={event => setFirstName(event.target.value)}
              />
              <TextField
                fullWidth
                label="Last name"
                value={lastName}
                onChange={event => setLastName(event.target.value)}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button disabled={saving} variant="contained" onClick={handleSave}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button disabled={saving} variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography>First name: {profile.firstName}</Typography>
              <Typography>Last name: {profile.lastName}</Typography>
            </>
          )}

          <Typography>Roles: {profile.roles.join(', ')}</Typography>
          <Typography>Status: {profile.isActive ? 'Active' : 'Inactive'}</Typography>

          {success && <Typography color="success.main">{success}</Typography>}
          {error && !loading && <Typography color="error">{error}</Typography>}
        </Box>
      ) : (
        <Typography>Unable to load account details.</Typography>
      )}
    </Container>
  );
}

export default MyAccountPage;
