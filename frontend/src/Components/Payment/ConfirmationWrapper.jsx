import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Confirmation from "./Confirmation";

const stripePromise = loadStripe("pk_test_51PD2kcP3KzYGyoDorCFJBWQkAWoUWQhvtUi9r7Cn94Ecp1Jd1hqpi2LOwL1NFeyg42oecytMOt4TlczueF879tbx00DUWqBMDx");

const ConfirmationWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <Confirmation />
    </Elements>
  );
};

export default ConfirmationWrapper;