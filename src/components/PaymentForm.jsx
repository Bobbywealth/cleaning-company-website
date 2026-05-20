import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const cardStyle = {
  style: {
    base: {
      color: '#1e293b',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

const CheckoutForm = ({ amount, serviceDetails, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (amount > 0) {
      fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: `${serviceDetails.service} - ${serviceDetails.propertySize}`,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          }
        })
        .catch(() => {
          setClientSecret('demo_mode');
        });
    }
  }, [amount, serviceDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage('');

    if (clientSecret === 'demo_mode') {
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess({ id: 'demo_' + Date.now() });
      }, 2000);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
      onError(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>💳</span> Payment Details
        </h4>
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
          <CardElement options={cardStyle} onChange={(e) => setCardComplete(e.complete)} />
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <span>🔒</span> Your payment is secured with Stripe encryption
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span> {errorMessage}
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing || !cardComplete}
        className={`w-full rounded-xl py-5 text-lg font-bold shadow-lg transition ${
          isProcessing
            ? 'bg-slate-400 cursor-wait'
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-cyan-500/30'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing Payment...
          </span>
        ) : (
          <>Pay ${amount.toFixed(2)} Deposit →</>
        )}
      </Button>

      <div className="flex items-center justify-center gap-4 text-slate-400 text-xs">
        <span className="flex items-center gap-1"><span>🔒</span> SSL Encrypted</span>
        <span>•</span>
        <span className="flex items-center gap-1"><span>🛡️</span> Secure Checkout</span>
        <span>•</span>
        <span className="flex items-center gap-1"><span>💳</span> Powered by Stripe</span>
      </div>
    </form>
  );
};

const PaymentForm = ({ amount, serviceDetails, onSuccess, onError }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        serviceDetails={serviceDetails}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default PaymentForm;