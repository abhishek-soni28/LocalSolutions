import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Chip,
  Typography,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Post categories - counts will be added dynamically
const categoryDefinitions = [
  { value: 'ALL', label: 'All' },
  { value: 'GENERAL', label: 'General' },
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'CARPENTRY', label: 'Carpentry' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'FOOD', label: 'Food' },
  { value: 'GROCERY', label: 'Grocery' },
  { value: 'OTHER', label: 'Other' },
];

// Post statuses - counts will be added dynamically
const statusDefinitions = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

// Custom Chip component that explicitly handles the selected state
const CustomChip = ({ label, onClick, selected, ...props }) => {
  console.log('CustomChip - label:', label, 'selected:', selected);
  return (
    <Chip
      label={label}
      onClick={onClick}
      sx={{
        margin: (theme) => theme.spacing(0.5),
        fontWeight: selected ? 600 : 400,
        backgroundColor: (theme) => selected ? theme.palette.primary.main : theme.palette.background.paper,
        color: (theme) => selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
        '&:hover': {
          backgroundColor: (theme) => selected ? theme.palette.primary.dark : theme.palette.action.hover,
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        boxShadow: (theme) => selected ? '0 2px 5px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
        borderRadius: '16px',
        height: '32px',
      }}
      {...props}
    />
  );
};

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  },
  border: `1px solid ${theme.palette.divider}`,
}));

const CategoryFilter = ({
  selectedCategories,
  setSelectedCategories,
  selectedStatus,
  setSelectedStatus,
  categoryCounts = {}, // Object with category counts: { GENERAL: 5, PLUMBING: 3, ... }
  statusCounts = {} // Object with status counts: { OPEN: 10, IN_PROGRESS: 5, ... }
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCategoryChange = (category) => {
    console.log('Category clicked:', category);
    console.log('Current selected categories:', selectedCategories);

    // Special case for ALL: if ALL is clicked, clear all other selections
    if (category === 'ALL') {
      console.log('ALL category clicked, clearing other selections');
      setSelectedCategories(['ALL']);
      // Trigger a reload of posts
      setTimeout(() => window.dispatchEvent(new Event('filter-changed')), 0);
      return;
    }

    // Create a copy of the current selections
    let newSelectedCategories = [...selectedCategories];
    console.log('Copy of selected categories:', newSelectedCategories);

    // If ALL is currently selected, remove it
    if (newSelectedCategories.includes('ALL')) {
      console.log('ALL is currently selected, removing it');
      newSelectedCategories = newSelectedCategories.filter(cat => cat !== 'ALL');
      console.log('After removing ALL:', newSelectedCategories);
    }

    // Toggle the selected category
    if (newSelectedCategories.includes(category)) {
      console.log('Category already selected, removing it');
      // If this is the last category and we're removing it, select ALL
      if (newSelectedCategories.length === 1) {
        console.log('Last category being removed, selecting ALL');
        newSelectedCategories = ['ALL'];
      } else {
        // Otherwise just remove this category
        console.log('Removing category from selections');
        newSelectedCategories = newSelectedCategories.filter(cat => cat !== category);
      }
    } else {
      // Add the category
      console.log('Adding category to selections');
      newSelectedCategories.push(category);
    }

    console.log('Final selected categories:', newSelectedCategories);

    console.log('Setting selected categories to:', newSelectedCategories);
    setSelectedCategories(newSelectedCategories);
    // Trigger a reload of posts
    setTimeout(() => {
      console.log('Dispatching filter-changed event');
      window.dispatchEvent(new Event('filter-changed'));
    }, 0);
  };

  const handleStatusChange = (status) => {
    // Toggle selection: if already selected, unselect it (set to ALL)
    if (selectedStatus === status) {
      console.log('Setting status to ALL');
      setSelectedStatus('ALL');
    } else {
      console.log('Setting status to:', status);
      setSelectedStatus(status);
    }
    // Trigger a reload of posts
    setTimeout(() => {
      console.log('Dispatching filter-changed event for status change');
      window.dispatchEvent(new Event('filter-changed'));
    }, 0);
  };

  // Prepare categories with counts and filter out those with no posts
  const categories = categoryDefinitions
    .map(category => {
      const count = category.value === 'ALL' ?
        Object.values(categoryCounts).reduce((sum, count) => sum + count, 0) :
        categoryCounts[category.value] || 0;

      return {
        ...category,
        count,
        label: `${category.label} ${count > 0 ? `[${count}]` : ''}`
      };
    })
    // Filter out categories with no posts, but always keep ALL
    .filter(cat => cat.value === 'ALL' || cat.count > 0);

  // Show all categories (don't filter by selection)
  const displayedCategories = categories;

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FilterSection>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Categories
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}
            >
              {displayedCategories.map((category) => (
                <CustomChip
                  key={category.value}
                  label={category.label}
                  onClick={() => handleCategoryChange(category.value)}
                  selected={selectedCategories.includes(category.value)}
                  // Add a data attribute for debugging
                  data-selected={selectedCategories.includes(category.value)}
                />
              ))}
            </Box>
          </FilterSection>
        </Grid>

        <Grid item xs={12} md={6}>
          <FilterSection>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Status
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}
            >
              {(() => {
                // Prepare statuses with counts and filter out those with no posts
                const statuses = statusDefinitions
                  .map(status => {
                    const count = status.value === 'ALL' ?
                      Object.values(statusCounts).reduce((sum, count) => sum + count, 0) :
                      statusCounts[status.value] || 0;

                    return {
                      ...status,
                      count,
                      label: `${status.label} ${count > 0 ? `[${count}]` : ''}`
                    };
                  })
                  // Filter out statuses with no posts, but always keep ALL
                  .filter(stat => stat.value === 'ALL' || stat.count > 0);

                // Show all statuses (don't filter by selection)
                return statuses.map((status) => (
                  <CustomChip
                    key={status.value}
                    label={status.label}
                    onClick={() => handleStatusChange(status.value)}
                    selected={selectedStatus === status.value}
                  />
                ));
              })()}
            </Box>
          </FilterSection>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CategoryFilter;
