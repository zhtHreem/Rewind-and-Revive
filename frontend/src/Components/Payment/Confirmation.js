import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import SimCardRoundedIcon from '@mui/icons-material/SimCardRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Layout from '../Layout/layout';

import { styled } from '@mui/system';

const FormGrid = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export default function PaymentForm() {
  const [paymentType, setPaymentType] = React.useState('creditCard');
  const [cardNumber, setCardNumber] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [name, setName] = React.useState('');
  const [expirationDate, setExpirationDate] = React.useState('');
  const handlePaymentTypeChange = (event) => {
    setPaymentType(event.target.value);
  };

  const { productId } = useParams();

  const handleCardNumberChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    if (value.length <= 16) {
      setCardNumber(formattedValue);
    }
  };

  const handleCvvChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleExpirationDateChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{2})(?=\d{2})/, '$1/');
    if (value.length <= 4) {
      setExpirationDate(formattedValue);
    }
  };

  const validateFields = () => {
    if (!cardNumber || !cvv || !name || !expirationDate) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Information',
        text: 'Please fill in all required fields.',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    const formData = {
      productId,
      cardNumber,
      cvv,
      name,
      expirationDate,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/payment/add`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Payment Added',
        text: 'Your payment has been received!',
      });
      resetForm();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.message || 'Failed to add payment. Please try again.',
      });
      console.error('Payment submission error:', error);
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setCvv('');
    setName('');
    setExpirationDate('');
  };

  return (
    <>
    <Layout>
      <Box
        sx={{
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
        }}
      >
        <Box
          sx={{
            width: { xs: '95%', sm: '80%', md: '60%' }, // Adjusted for smaller screens
          }}
        >
          <Stack spacing={{ xs: 2, sm: 4 }} useFlexGap>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                aria-label="Payment options"
                name="paymentType"
                value={paymentType}
                onChange={handlePaymentTypeChange}
                sx={{
                  flexDirection: { sm: 'column', md: 'row' },
                  gap: 2,
                }}
              >
                <Card
                  raised={paymentType === 'creditCard'}
                  sx={{
                    maxWidth: { sm: '100%', md: '45%' },
                    flexGrow: 1,
                    outline: '1px solid',
                    outlineColor:
                      paymentType === 'creditCard' ? 'primary.main' : 'divider',
                  }}
                >
                  <CardActionArea onClick={() => setPaymentType('creditCard')}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardRoundedIcon color="primary" fontSize="small" />
                      <Typography fontWeight="medium">Card</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
                <Card
                  raised={paymentType === 'bankTransfer'}
                  sx={{
                    maxWidth: { sm: '100%', md: '45%' },
                    flexGrow: 1,
                    outline: '1px solid',
                    outlineColor:
                      paymentType === 'bankTransfer' ? 'primary.main' : 'divider',
                  }}
                >
                  <CardActionArea onClick={() => setPaymentType('bankTransfer')}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalanceRoundedIcon color="primary" fontSize="small" />
                      <Typography fontWeight="medium">Bank account</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </RadioGroup>
            </FormControl>
            {paymentType === 'creditCard' && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Credit card</Typography>
                    <CreditCardRoundedIcon sx={{ color: 'text.secondary' }} />
                  </Box>
                  <SimCardRoundedIcon
                    sx={{
                      fontSize: { xs: 48, sm: 56 },
                      transform: 'rotate(90deg)',
                      color: 'text.secondary',
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormGrid sx={{ flexGrow: 1 }}>
                      <FormLabel htmlFor="card-number">Card number</FormLabel>
                      <OutlinedInput
                        id="card-number"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                      />
                    </FormGrid>
                    <FormGrid sx={{ maxWidth: '20%' }}>
                      <FormLabel htmlFor="cvv">CVV</FormLabel>
                      <OutlinedInput
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={handleCvvChange}
                      />
                    </FormGrid>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormGrid sx={{ flexGrow: 1 }}>
                    <FormLabel htmlFor="card-name" required>
                      Name
                    </FormLabel>
                   <OutlinedInput
                     id="card-name"
                     autoComplete="card-name"
                     placeholder="John Smith"
                     value={name} // Bind the input value to state
                     onChange={(e) => setName(e.target.value)} // Update state on input change
                     required
                   />
                 </FormGrid>

                      </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormGrid sx={{ flexGrow: 1 }}>
                      <FormLabel htmlFor="expiration-date">Expiration date</FormLabel>
                      <OutlinedInput
                        id="expiration-date"
                        placeholder="MM/YY"
                        value={expirationDate}
                        onChange={handleExpirationDateChange}
                      />
                    </FormGrid>
                  </Box>
                </Box>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Remember credit card details for next time"
                />
              </Box> )}
              {paymentType === 'bankTransfer' && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Alert severity="warning" icon={<WarningRoundedIcon />}>
                    Your order will be processed once we receive the funds.
                  </Alert>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Bank account
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Please transfer the payment to the bank account details shown below.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="body1" color="text.secondary">
                      Bank:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      Mastercredit
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="body1" color="text.secondary">
                      Account number:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      123456789
                    </Typography>
                  </Box>       
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="body1" color="text.secondary">
                      Routing number:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      987654321
                    </Typography>
                  </Box>
                </Box>
              
            )}
            <Button variant="contained" onClick={handleSubmit} style={{marginBottom:'30px'}}>
              Submit
            </Button>
            {/* {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Payment submitted successfully!
              </Alert>
            )} */}
          </Stack>
        </Box>
      </Box>
      </Layout>
    </>
  );
}
