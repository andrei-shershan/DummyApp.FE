import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ArtworkDto } from '../types/api';

interface ArtworkCardProps {
  artwork: ArtworkDto;
  onViewDetails: () => void;
}

function ArtworkCard({ artwork, onViewDetails }: ArtworkCardProps) {
  return (
    <Card>
      {artwork.imgUrl ? (
        <Box sx={{ width: '100%', aspectRatio: '1 / 1.414', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={artwork.imgUrl}
            alt={artwork.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            aspectRatio: '1 / 1.414',
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            No image available
          </Typography>
        </Box>
      )}
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {artwork.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {artwork.description ?? 'No description available.'}
        </Typography>
        <Button sx={{ mt: 2 }} variant="outlined" size="small" onClick={onViewDetails}>
          View details
        </Button>
      </CardContent>
    </Card>
  );
}

export default ArtworkCard;
