import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Confirmation from "./Confirmation";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const ConfirmationWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <Confirmation />
    </Elements>
  );
};

export default ConfirmationWrapper;