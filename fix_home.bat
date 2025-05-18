cd C:\Users\28son\IdeaProjects\LocalSolutions\frontend\src\pages
echo import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'; > Home.js.new
echo import { useNavigate } from 'react-router-dom'; >> Home.js.new
echo import { >> Home.js.new
echo   Box, >> Home.js.new
echo   Container, >> Home.js.new
echo   Grid, >> Home.js.new
echo   Typography, >> Home.js.new
echo   Button, >> Home.js.new
echo   TextField, >> Home.js.new
echo   MenuItem, >> Home.js.new
echo   Pagination, >> Home.js.new
echo   CircularProgress, >> Home.js.new
echo   Alert, >> Home.js.new
echo   Paper, >> Home.js.new
echo   Card, >> Home.js.new
echo   CardContent, >> Home.js.new
echo   Chip, >> Home.js.new
echo   Divider, >> Home.js.new
echo   IconButton, >> Home.js.new
echo   Tooltip, >> Home.js.new
echo   FormControl, >> Home.js.new
echo   InputLabel, >> Home.js.new
echo   Select, >> Home.js.new
echo   InputAdornment, >> Home.js.new
echo } from '@mui/material'; >> Home.js.new
echo import { >> Home.js.new
echo   Add as AddIcon, >> Home.js.new
echo   Refresh as RefreshIcon, >> Home.js.new
echo   FilterAlt as FilterIcon, >> Home.js.new
echo   Search as SearchIcon, >> Home.js.new
echo   Comment as CommentIcon, >> Home.js.new
echo   ThumbUp as ThumbUpIcon, >> Home.js.new
echo   FilterAlt as FilterAltIcon, >> Home.js.new
echo } from '@mui/icons-material'; >> Home.js.new
type Home.js | findstr /v /C:"import React" /C:"import { useNavigate" /C:"  Box," /C:"  Container," /C:"  Grid," /C:"  Typography," /C:"  Button," /C:"  TextField," /C:"  MenuItem," /C:"  Pagination," /C:"  CircularProgress," /C:"  Alert," /C:"  Paper," /C:"  Card," /C:"  CardContent," /C:"  Chip," /C:"  Divider," /C:"  IconButton," /C:"  Tooltip," /C:"  FormControl," /C:"  InputLabel," /C:"  Select," /C:"  InputAdornment," /C:"} from '@mui/material';" /C:"import {" /C:"  Add as AddIcon," /C:"  Refresh as RefreshIcon," /C:"  FilterAlt as FilterIcon," /C:"  Search as SearchIcon," /C:"  Comment as CommentIcon," /C:"  ThumbUp as ThumbUpIcon," /C:"} from '@mui/icons-material';" >> Home.js.new
move Home.js.new Home.js
