import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { getCurrentUserProfile, uploadCurrentUserAvatar, updateCurrentUserProfile } from '../api/users';
import { UpdateCurrentUserProfileRequest, UserProfile } from '../types/api';

function MyAccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
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

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          const commaIndex = result.indexOf(',');
          resolve(commaIndex >= 0 ? result.substring(commaIndex + 1) : result);
        } else {
          reject(new Error('Unable to read file.'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedAvatarFile(file);
    setSuccess(null);
    setError(null);
    if (file) {
      setAvatarPreviewUrl(URL.createObjectURL(file));
    } else {
      setAvatarPreviewUrl(null);
    }
  };

  const handleUploadAvatar = async () => {
    if (!profile || !selectedAvatarFile) {
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    try {
      const base64Image = await readFileAsBase64(selectedAvatarFile);
      const updatedProfile = await uploadCurrentUserAvatar({
        fileName: selectedAvatarFile.name,
        base64Image,
      });

      setProfile(updatedProfile);
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl(null);
      setSuccess('Avatar uploaded successfully.');
    } catch (err: any) {
      setError(err?.message ?? 'Unable to upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Avatar
              src={profile.avatarSmallUrl ?? profile.avatarUrl ?? undefined}
              alt="User avatar"
              sx={{ width: 100, height: 100 }}
            >
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography>Email: {profile.email}</Typography>
              {profile.avatarUrl && <Typography variant="body2">Current avatar is displayed above.</Typography>}
            </Box>
          </Box>

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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Button variant="contained" component="label">
                    Select avatar
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                    />
                  </Button>
                  {selectedAvatarFile && (
                    <Typography sx={{ mt: 1 }}>{selectedAvatarFile.name}</Typography>
                  )}
                </Box>

                {avatarPreviewUrl && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={avatarPreviewUrl} alt="Avatar preview" sx={{ width: 80, height: 80 }} />
                    <Typography>Preview of the selected file.</Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button disabled={saving} variant="contained" onClick={handleSave}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button disabled={saving} variant="outlined" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    disabled={uploadingAvatar || !selectedAvatarFile}
                    variant="outlined"
                    onClick={handleUploadAvatar}
                  >
                    {uploadingAvatar ? 'Uploading...' : 'Upload avatar'}
                  </Button>
                </Box>
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
