import React from 'react';
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
      {artwork.imgUrl && (
        <CardMedia component="img" height="160" image={artwork.imgUrl} alt={artwork.name} />
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
