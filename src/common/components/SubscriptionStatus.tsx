// components/SubscriptionStatus.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Subscription {
  stripeSubscriptionId: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  priceId: string;
  createdAt: FirebaseFirestore.Timestamp;
  paymentFailed?: boolean;
}

interface SubscriptionStatusProps {
  email: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ email }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axios.get('/api/get-subscription', {
          params: { email },
        });

        if (response.data.subscription) {
          setSubscription(response.data.subscription);
        } else {
          setError('No subscription found.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch subscription.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [email]);

  if (loading) return <p>Loading subscription status...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!subscription) return null;

  return (
    <div style={statusContainerStyle}>
      <h2>Subscription Status</h2>
      <p><strong>Subscription ID:</strong> {subscription.stripeSubscriptionId}</p>
      <p><strong>Status:</strong> {subscription.status}</p>
      <p>
        <strong>Current Period:</strong> {new Date(subscription.current_period_start * 1000).toLocaleDateString()} -{' '}
        {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
      </p>
      {subscription.paymentFailed && (
        <p style={{ color: 'red' }}>Payment failed on your last invoice. Please update your payment method.</p>
      )}
    </div>
  );
};

const statusContainerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '2em auto',
  padding: '1em',
  border: '1px solid #ccc',
  borderRadius: '1em',
  backgroundColor: '#f0f0f0',
};

export default SubscriptionStatus;