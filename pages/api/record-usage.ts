import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { db, admin } from '~/common/firebase/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

interface Data {
  usageRecord?: Stripe.UsageRecord;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { email, quantity } = req.body;

    try {
      // Validate input
      if (!email || typeof quantity !== 'number' || quantity <= 0) {
        throw new Error('Invalid input: email and positive quantity are required.');
      }

      // Find user in Firestore
      const userRef = db.collection('users').doc(email);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found.');
      }

      const userData = userDoc.data()!;
      const stripeSubscriptionId = userData.stripeSubscriptionId;

      // Find the subscription in Firestore
      const subscriptionRef = userRef.collection('subscriptions').doc(stripeSubscriptionId);
      const subscriptionDoc = await subscriptionRef.get();

      if (!subscriptionDoc.exists) {
        throw new Error('Subscription not found.');
      }

      const subscriptionData = subscriptionDoc.data()!;
      const subscriptionId = subscriptionData.stripeSubscriptionId;

      // Retrieve subscription from Stripe to get Subscription Item ID
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (!subscription.items.data.length) {
        throw new Error('No subscription items found.');
      }

      const subscriptionItemId = subscription.items.data[0].id;

      // Create a usage record in Stripe
      const usageRecord: Stripe.UsageRecord = await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
        quantity,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment', // Options: 'increment', 'set'
      });

      // Optionally, store usage records in Firestore
      await db
        .collection('users')
        .doc(email)
        .collection('subscriptions')
        .doc(subscriptionId)
        .collection('usageRecords')
        .add({
          quantity,
          timestamp: usageRecord.timestamp,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      res.status(200).json({ usageRecord });
    } catch (error: any) {
      console.error('Error recording usage:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}