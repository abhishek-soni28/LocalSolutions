import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  InputAdornment,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  ClickAwayListener,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, History as HistoryIcon, TrendingUp as TrendingIcon } from '@mui/icons-material';

const SearchWithSuggestions = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  recentSearches = [],
  popularSearches = [],
  loading = false
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [inputValue, setInputValue] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef(null);

  // Update local state when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Show suggestions when typing
    if (newValue.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    // Auto-search after a delay
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (newValue.trim()) {
        onSearch(newValue);
      }
    }, 500);
  };

  const handleFocus = (event) => {
    setAnchorEl(event.currentTarget);
    // Only show suggestions if there are recent or popular searches
    if (recentSearches.length > 0 || popularSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClickAway = () => {
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const open = Boolean(anchorEl) && showSuggestions;
  const id = open ? 'search-suggestions-popper' : undefined;

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          fullWidth
          label="Search"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SearchIcon color="action" />
                )}
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              },
              '&.Mui-focused': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }
            }
          }}
        />

        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl ? anchorEl.clientWidth : null, zIndex: 1300 }}
        >
          <Paper
            elevation={3}
            sx={{
              mt: 1,
              borderRadius: 2,
              overflow: 'hidden',
              maxHeight: 350,
              overflowY: 'auto'
            }}
          >
            {recentSearches.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Recent Searches
                  </Typography>
                </Box>
                <List dense disablePadding>
                  {recentSearches.map((search, index) => (
                    <ListItem
                      key={`recent-${index}`}
                      button
                      onClick={() => handleSuggestionClick(search)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemText primary={search} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {popularSearches.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
                  <TrendingIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Popular Searches
                  </Typography>
                </Box>
                <Box sx={{ px: 2, py: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {popularSearches.map((search, index) => (
                    <Chip
                      key={`popular-${index}`}
                      label={search}
                      size="small"
                      onClick={() => handleSuggestionClick(search)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                        }
                      }}
                    />
                  ))}
                </Box>
              </>
            )}

            {recentSearches.length === 0 && popularSearches.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No suggestions available
                </Typography>
              </Box>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchWithSuggestions;
