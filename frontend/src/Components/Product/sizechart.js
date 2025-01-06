import React, { useState } from 'react';
import {  Button,  Dialog,  DialogTitle, DialogContent,  DialogActions,Table,TableBody, TableCell,TableContainer,TableHead,TableRow, Paper, IconButton, FormControl,  Select,  MenuItem,  InputLabel, Box,  Typography,  useTheme, useMediaQuery} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloseIcon from '@mui/icons-material/Close';


// Corrected size ranges for women's small category
const sizeRanges = {
  women: {
    small: {
      top: {
        bustChest: { min: 32, max: 34 },
        waist: { min: 24, max: 27 },
        hips: { min: 34, max: 37 },
        shoulderWidth: { min: 14, max: 15 },
        armLength: { min: 30, max: 31 },
        neckCircumference: { min: 13, max: 14 }
      },
      bottom: {
        waist: { min: 24, max: 27 },
        hips: { min: 34, max: 37 },
        inseam: { min: 29, max: 30 },
        thighLegOpening: { min: 19, max: 21 },
        rise: { min: 9, max: 10 }
      }
    },
    medium: {
      top: {
        bustChest: { min: 35, max: 38 },
        waist: { min: 28, max: 31 },
        hips: { min: 38, max: 41 },
        shoulderWidth: { min: 15, max: 16 },
        armLength: { min: 31, max: 32 },
        neckCircumference: { min: 14, max: 15 }
      },
      bottom: {
        waist: { min: 28, max: 31 },
        hips: { min: 38, max: 41 },
        inseam: { min: 30, max: 31 },
        thighLegOpening: { min: 21, max: 23 },
        rise: { min: 10, max: 11 }
      }
    },
    large: {
      top: {
        bustChest: { min: 39, max: 42 },
        waist: { min: 32, max: 35 },
        hips: { min: 42, max: 45 },
        shoulderWidth: { min: 16, max: 17 },
        armLength: { min: 32, max: 33 },
        neckCircumference: { min: 15, max: 16 }
      },
      bottom: {
        waist: { min: 32, max: 35 },
        hips: { min: 42, max: 45 },
        inseam: { min: 31, max: 32 },
        thighLegOpening: { min: 23, max: 25 },
        rise: { min: 11, max: 12 }
      }
    }
  },
    men: {
    small: {
      top: {
        bustChest: { min: 34, max: 36 },
        waist: { min: 28, max: 30 },
        shoulderWidth: { min: 16, max: 17 },
        armLength: { min: 32, max: 33 },
        neckCircumference: { min: 14, max: 15 }
      },
      bottom: {
        waist: { min: 28, max: 30 },
        hips: { min: 35, max: 37 },
        inseam: { min: 30, max: 31 },
        thighLegOpening: { min: 21, max: 22 },
        rise: { min: 10, max: 11 }
      }
    },
    medium: {
      top: {
        bustChest: { min: 37, max: 40 },
        waist: { min: 31, max: 34 },
        shoulderWidth: { min: 17, max: 18 },
        armLength: { min: 33, max: 34 },
        neckCircumference: { min: 15, max: 16 }
      },
      bottom: {
        waist: { min: 31, max: 34 },
        hips: { min: 38, max: 41 },
        inseam: { min: 31, max: 32 },
        thighLegOpening: { min: 22, max: 24 },
        rise: { min: 11, max: 12 }
      }
    },
    large: {
      top: {
        bustChest: { min: 41, max: 44 },
        waist: { min: 35, max: 38 },
        shoulderWidth: { min: 18, max: 19 },
        armLength: { min: 34, max: 35 },
        neckCircumference: { min: 16, max: 17 }
      },
      bottom: {
        waist: { min: 35, max: 38 },
        hips: { min: 42, max: 45 },
        inseam: { min: 32, max: 33 },
        thighLegOpening: { min: 24, max: 26 },
        rise: { min: 12, max: 13 }
      }
    }
  },
  kids: {
    small: {
      top: {
        bustChest: { min: 24, max: 26 },
        waist: { min: 22, max: 23 },
        shoulderWidth: { min: 12, max: 13 },
        armLength: { min: 20, max: 22 },
        neckCircumference: { min: 11, max: 12 }
      },
      bottom: {
        waist: { min: 22, max: 23 },
        hips: { min: 26, max: 28 },
        inseam: { min: 20, max: 22 },
        thighLegOpening: { min: 14, max: 15 },
        rise: { min: 7, max: 8 }
      }
    },
    medium: {
      top: {
        bustChest: { min: 27, max: 29 },
        waist: { min: 24, max: 25 },
        shoulderWidth: { min: 13, max: 14 },
        armLength: { min: 22, max: 24 },
        neckCircumference: { min: 12, max: 13 }
      },
      bottom: {
        waist: { min: 24, max: 25 },
        hips: { min: 29, max: 31 },
        inseam: { min: 22, max: 24 },
        thighLegOpening: { min: 15, max: 16 },
        rise: { min: 8, max: 9 }
      }
    },
    large: {
      top: {
        bustChest: { min: 30, max: 32 },
        waist: { min: 26, max: 27 },
        shoulderWidth: { min: 14, max: 15 },
        armLength: { min: 24, max: 26 },
        neckCircumference: { min: 13, max: 14 }
      },
      bottom: {
        waist: { min: 26, max: 27 },
        hips: { min: 32, max: 34 },
        inseam: { min: 24, max: 26 },
        thighLegOpening: { min: 16, max: 17 },
        rise: { min: 9, max: 10 }
      }
    }
  }
};

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
      <Button
        variant="outlined"
        size={isMobile ? "small" : "medium"}
        startIcon={<TableChartIcon />}
        onClick={handleOpen}
        sx={{ 
          minWidth: isMobile ? 'auto' : '120px',
          ml: isMobile ? 1 : 2,
          height: isMobile ? '40px' : '56px', 
          '& .MuiButton-startIcon': {
            mr: isMobile ? 0 : 1
          }
        }}
      >
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