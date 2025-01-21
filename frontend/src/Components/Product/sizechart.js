import React, { useState } from 'react';
import {  Button,  Dialog,  DialogTitle, DialogContent,  DialogActions,Table,TableBody, TableCell,TableContainer,TableHead,TableRow, Paper, IconButton, FormControl,  Select,  MenuItem,  InputLabel, Box,  Typography,  useTheme, useMediaQuery} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloseIcon from '@mui/icons-material/Close';

import sizeRanges from '../Utils/sizeRange';


const SizeChartMUI = () => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('women');
  const [type, setType] = useState('top');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
 
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const formatMeasurementName = (name) => {
    return name.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + 
           name.replace(/([A-Z])/g, ' $1').trim().slice(1);
  };

  return (
    <>
      <Button   variant="outlined"  size={isMobile ? "small" : "medium"} startIcon={<TableChartIcon />} onClick={handleOpen}  sx={{   minWidth: isMobile ? 'auto' : '120px',  ml: isMobile ? 1 : 2,height: isMobile ? '40px' : '56px',  '& .MuiButton-startIcon': {  mr: isMobile ? 0 : 1} }}>
        {isMobile ? "Size Guide " : "Size Guide"}
      </Button>

      <Dialog   fullScreen={fullScreen}  maxWidth="md" fullWidth    open={open} onClose={handleClose} >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Size Chart</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box p={2} sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select value={category}  label="Category" onChange={(e) => setCategory(e.target.value)} >
                <MenuItem value="women">Women</MenuItem>
                <MenuItem value="men">Men</MenuItem>
                <MenuItem value="kids">Kids</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select value={type}  label="Type" onChange={(e) => setType(e.target.value)} >
                <MenuItem value="top">Top</MenuItem>
                <MenuItem value="bottom">Bottom</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Measurement</TableCell>
                  <TableCell>Small</TableCell>
                  <TableCell>Medium</TableCell>
                  <TableCell>Large</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(sizeRanges[category].small[type]).map(([measurement, _]) => (
                  <TableRow key={measurement}>
                    <TableCell component="th" scope="row">
                      {formatMeasurementName(measurement)}
                    </TableCell>
                    {['small', 'medium', 'large'].map(size => (
                      <TableCell key={size}>
                        {sizeRanges[category][size][type][measurement].min}" - {sizeRanges[category][size][type][measurement].max}"
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            All measurements are in inches. For best results, measure yourself and compare with the chart above.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SizeChartMUI;