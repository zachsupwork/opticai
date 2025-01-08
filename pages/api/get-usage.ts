// pages/api/get-usage.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/common/firebase/firebaseAdmin';

interface UsageRecord {
  quantity: number;
  timestamp: number;
  createdAt: FirebaseFirestore.Timestamp;
}

interface Data {
  usageRecords?: UsageRecord[];
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

      const subscriptionsSnapshot = await userDoc.ref.collection('subscriptions').limit(1).get();

      if (subscriptionsSnapshot.empty) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      const subscriptionDoc = subscriptionsSnapshot.docs[0];
      const usageSnapshot = await subscriptionDoc.ref.collection('usageRecords').orderBy('timestamp', 'desc').get();

      const usageRecords: UsageRecord[] = usageSnapshot.docs.map(doc => ({
        quantity: doc.data().quantity,
        timestamp: doc.data().timestamp,
        createdAt: doc.data().createdAt,
      }));

      res.status(200).json({ usageRecords });
    } catch (error: any) {
      console.error('Error fetching usage records:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}