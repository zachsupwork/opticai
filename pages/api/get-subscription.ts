// pages/api/get-subscription.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/common/firebase/firebaseAdmin';

interface SubscriptionData {
  stripeSubscriptionId: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  priceId: string;
  createdAt: FirebaseFirestore.Timestamp;
  paymentFailed?: boolean;
}

interface Data {
  subscription?: SubscriptionData;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const userDoc = await db.collection('users').doc(email).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data()!;

      // Assuming one subscription per user
      const subscriptionsSnapshot = await userDoc.ref.collection('subscriptions').limit(1).get();

      if (subscriptionsSnapshot.empty) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      const subscriptionDoc = subscriptionsSnapshot.docs[0];
      const subscriptionData = subscriptionDoc.data() as SubscriptionData;

      res.status(200).json({ subscription: subscriptionData });
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}