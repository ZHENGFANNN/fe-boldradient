"use client";

import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import Loading from "@/components/Loading";
import styles from "./index.module.scss";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function CheckoutForm({ onSuccess, onError, LANG, returnUrl }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });

      if (error) {
        onError?.(error);
        return;
      }

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "processing")
      ) {
        onSuccess?.();
      }
    } catch (error) {
      onError?.(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        className={styles.submit_btn}
        disabled={!stripe || !elements || submitting}
      >
        {submitting
          ? LANG["common.pay.pay_button.paying"] || "Processing..."
          : LANG["common.pay.pay_button.pay_now"] || "Pay now"}
      </button>
    </form>
  );
}

export default function StripePay({
  clientSecret,
  locale,
  onSuccess,
  onError,
  LANG,
  returnUrl,
}) {
  const stripeLocale = React.useMemo(() => {
    if (locale === "zh-cn" || locale === "zh-hk") return "zh";
    return locale || "auto";
  }, [locale]);

  if (!clientSecret) {
    return <Loading height={108} />;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        locale: stripeLocale,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <CheckoutForm
        LANG={LANG}
        onSuccess={onSuccess}
        onError={onError}
        returnUrl={returnUrl}
      />
    </Elements>
  );
}
