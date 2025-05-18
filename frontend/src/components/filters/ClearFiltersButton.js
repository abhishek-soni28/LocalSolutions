import React from 'react';
import { Button, Box } from '@mui/material';

const ClearFiltersButton = ({
  selectedCategories,
  selectedStatus,
  setSelectedCategories,
  setSelectedStatus
}) => {
  // Only show if filters are active
  if (selectedCategories[0] === 'ALL' && selectedStatus === 'ALL') {
    return null;
  }

  // Calculate active filters count
  let activeFiltersCount = 0;

  // Count selected category (excluding ALL)
  if (selectedCategories[0] !== 'ALL') {
    activeFiltersCount += 1;
  }

  // Add status filter if active
  if (selectedStatus !== 'ALL') {
    activeFiltersCount += 1;
  }

  return (
    <Button
      variant="outlined"
      size="small"
      color="primary"
      onClick={() => {
        setSelectedCategories(['ALL']);
        setSelectedStatus('ALL');
        // Trigger a reload of posts
        setTimeout(() => window.dispatchEvent(new Event('filter-changed')), 0);
      }}
      sx={{
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
        }
      }}
    >
      Clear Filters
      <Box
        component="span"
        sx={{
          ml: 1,
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: '50%',
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 'bold',
        }}
      >
        {activeFiltersCount}
      </Box>
    </Button>
  );
};

export default ClearFiltersButton;
