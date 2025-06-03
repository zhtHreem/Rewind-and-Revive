import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Button,
  FormGroup
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';

const FilterDrawer = ({
  isOpen,
  onClose,
  categories = ['men', 'women', 'kids'],
  sizes = ['small', 'medium', 'large'],
  productTypes = ['top', 'bottom', 'top/bottom', 'accessories'],
  priceRanges = [100, 200, 300],
  category,
  selectedSizes,
  selectedTypes,
  priceRange,
  setCategory,
  setSelectedSizes,
  setSelectedTypes,
  setPriceRange
}) => {
  return (
    <>
      {/* Mobile Filter Button */}
      <Button
        variant="outlined"
        fullWidth
        sx={{ 
          mb: 2, 
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'space-between'
        }}
        onClick={() => onClose(true)}
        endIcon={<ExpandMoreIcon />}
        startIcon={<TuneIcon />}
      >
        Filters
      </Button>

      {/* Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={isOpen}
        onClose={() => onClose(false)}
        PaperProps={{
          sx: {
            height: '90vh',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => onClose(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Filter Content */}
        <Box sx={{ 
          p: 2, 
          overflowY: 'auto',
          pb: '80px' // Space for the apply button
        }}>
          {/* Category Filter */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Category</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <FormControlLabel
                    key={cat}
                    value={cat}
                    control={<Radio />}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                  />
                ))}
              </RadioGroup>
            </AccordionDetails>
          </Accordion>

          {/* Size Filter */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Size</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {sizes.map((size) => (
                  <FormControlLabel
                    key={size}
                    control={
                      <Checkbox
                        checked={selectedSizes.includes(size)}
                        onChange={() => {
                          setSelectedSizes(prev =>
                            prev.includes(size)
                              ? prev.filter(s => s !== size)
                              : [...prev, size]
                          );
                        }}
                      />
                    }
                    label={size.toUpperCase()}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* Product Type Filter */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Product Type</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {productTypes.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={selectedTypes.includes(type)}
                        onChange={() => {
                          setSelectedTypes(prev =>
                            prev.includes(type)
                              ? prev.filter(t => t !== type)
                              : [...prev, type]
                          );
                        }}
                      />
                    }
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* Price Range Filter */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Price Range</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                {priceRanges.map((price) => (
                  <FormControlLabel
                    key={price}
                    value={price.toString()}
                    control={<Radio />}
                    label={`Up to Rs.${price}`}
                  />
                ))}
              </RadioGroup>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Apply Button */}
        <Box sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => onClose(false)}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default FilterDrawer;