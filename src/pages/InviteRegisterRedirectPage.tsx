import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { BFF_HOST } from '../config';

function InviteRegisterRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const token = pathSegments.length > 1 ? pathSegments[1] : undefined;
    const frontendUrl = window.location.origin;

    if (!token) {
      navigate('/');
      return;
    }

    window.location.href = `${BFF_HOST}/register/${encodeURIComponent(token)}?returnUrl=${encodeURIComponent(frontendUrl)}`;
  }, [navigate]);

  return (
    <Container sx={{ pt: 3 }}>
      <Typography variant="h5">Redirecting to registration...</Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Please wait while we forward you to the registration flow.
      </Typography>
    </Container>
  );
}

export default InviteRegisterRedirectPage;
