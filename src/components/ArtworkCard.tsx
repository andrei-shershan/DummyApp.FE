import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { ArtworkDto } from '../types/api';

interface ArtworkCardProps {
  artwork: ArtworkDto;
  onViewDetails: () => void;
}

function ArtworkCard({ artwork, onViewDetails }: ArtworkCardProps) {
  return (
    <Card
      onClick={onViewDetails}
      sx={{
        width: 250,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
        '& img': {
          transition: 'transform 0.3s ease',
        },
        '&:hover': {
          boxShadow: '0 12px 24px rgba(15, 23, 42, 0.24)',
          '& img': {
            transform: 'scale(1.10)',
          },
        },
      }}
    >
      {(artwork.thumbnailUrl || artwork.imgUrl) ? (
        <Box sx={{ width: 250, height: 354, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={artwork.thumbnailUrl || artwork.imgUrl}
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
          {artwork.creationDate ? new Date(artwork.creationDate).getFullYear() : 'Unknown year'}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ArtworkCard;
