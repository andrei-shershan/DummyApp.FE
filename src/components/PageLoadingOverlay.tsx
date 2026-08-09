import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

interface PageLoadingOverlayProps {
  open: boolean;
}

export default function PageLoadingOverlay({ open }: PageLoadingOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
