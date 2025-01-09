import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import {
  CardElement,
  useStripe,
  useElements,
  CardElementProps,
} from '@stripe/react-stripe-js';
import { StripeError, PaymentMethod, PaymentIntentResult } from '@stripe/stripe-js';
import { useRouter } from 'next/router';

interface CreateCustomerFormProps {}

const CreateCustomerForm: React.FC<CreateCustomerFormProps> = () => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();


    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setStatus('Processing...');
    setErrorMessage(null);

    try {
      // Create a payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentMethod }: { error?: StripeError; paymentMethod?: PaymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: { email, name },
        });

      if (error) {
        setErrorMessage(error.message || 'An error occurred while creating the payment method.');
        setStatus('');
        return;
      }

      if (!paymentMethod) {
        setErrorMessage('Payment method creation failed.');
        setStatus('');
        return;
      }

      // Send customer data to the API route
      const response = await axios.post('/api/create-customer', {
        email,
        name,
        payment_method: paymentMethod.id,
      });

      if (response.data.customer && response.data.subscription) {
        // Check if additional action is needed for payment confirmation
        if (response.data.clientSecret) {
          setStatus('Awaiting payment confirmation...');
          const { error: confirmError } = await stripe.confirmCardPayment(response.data.clientSecret);
          if (confirmError) {
            setErrorMessage(confirmError.message || 'Payment confirmation failed.');
            setStatus('');
            return;
          }
          setStatus('Subscription created and payment confirmed!');
        } else {
          setStatus('Subscription created successfully!');
          router.push('/');
        }
        console.log('Customer:', response.data.customer);
        console.log('Subscription:', response.data.subscription);
        // Optionally, reset the form
        setEmail('');
        setName('');
        // Optionally, clear the card details
      } else {
        setErrorMessage('Failed to create customer or subscription.');
        setStatus('');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setStatus('');
    }
  };

  // Optional: Customize the CardElement appearance
  const CARD_ELEMENT_OPTIONS: CardElementProps['options'] = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '10px 12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={fieldStyle}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <div style={fieldStyle}>
        <label>Card Details:</label>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <button type="submit" disabled={!stripe} style={buttonStyle}>
        Create Subscription
      </button>
      {status && <div style={statusStyle}>{status}</div>}
      {errorMessage && <div style={errorStyle}>{errorMessage}</div>}
    </form>
  );
};

// Optional: Add some basic styling
const formStyle: React.CSSProperties = {
  width: '400px',
  margin: 'auto',
  padding: '1em',
  border: '1px solid #ccc',
  borderRadius: '1em',
  backgroundColor: '#f9f9f9',
};

const fieldStyle: React.CSSProperties = {
  margin: '1em 0',
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle: React.CSSProperties = {
  padding: '0.5em',
  fontSize: '1em',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.75em 1.5em',
  fontSize: '1em',
  color: '#fff',
  backgroundColor: '#6772e5',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const statusStyle: React.CSSProperties = {
  marginTop: '1em',
  color: 'green',
};

const errorStyle: React.CSSProperties = {
  marginTop: '1em',
  color: 'red',
};

export default CreateCustomerForm;