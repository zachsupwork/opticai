// Example: pages/api/cancel-subscription.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { db, admin } from '~/common/firebase/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

interface Data {
  subscription?: Stripe.Subscription;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      if (!email || typeof email !== 'string') {
        throw new Error('Invalid input: email is required.');
      }

      // Find user and subscription
      const userDoc = await db.collection('users').doc(email).get();

      if (!userDoc.exists) {
        throw new Error('User not found.');
      }

      const userData = userDoc.data()!;
      const subscriptionRef = userDoc.ref.collection('subscriptions').where('stripeSubscriptionId', '==', userData.stripeSubscriptionId).limit(1);
      const subscriptionSnapshot = await subscriptionRef.get();

      if (subscriptionSnapshot.empty) {
        throw new Error('Subscription not found.');
      }

      const subscriptionDoc = subscriptionSnapshot.docs[0];
      const subscriptionData = subscriptionDoc.data();

      // Cancel subscription in Stripe
      const canceledSubscription = await stripe.subscriptions.cancel(subscriptionData.stripeSubscriptionId);

      // Update subscription status in Firestore
      await subscriptionDoc.ref.update({
        status: canceledSubscription.status,
      });

      res.status(200).json({ subscription: canceledSubscription });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}