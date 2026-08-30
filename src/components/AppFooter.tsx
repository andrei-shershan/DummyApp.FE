import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import logo from '../logo.svg';

function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        py: 3,
        px: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      <Box component="img" src={logo} alt="DummyDruk" sx={{ width: 30, height: 30 }} />
      <Typography variant="body2" color="text.secondary">
        DummyDruk · Made by Humans
      </Typography>
    </Box>
  );
}

export default AppFooter;
