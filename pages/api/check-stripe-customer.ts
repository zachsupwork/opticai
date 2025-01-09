// pages/api/check-stripe-customer.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db, admin } from '~/common/firebase/firebaseAdmin';


interface ResponseData {
  hasStripeCustomer?: boolean;
  stripeCustomerId?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return res.status(400).json({ error: 'Invalid token: Email not found.' });
    }

    // Query Firestore for the user document
    const userDoc = await db.collection('users').doc(userEmail).get();

    if (!userDoc.exists) {
      // User document doesn't exist or hasn't been set up yet
      return res.status(404).json({ hasStripeCustomer: false });
    }

    const userData = userDoc.data();

    if (userData?.stripeCustomerId) {
      // User has a Stripe customer
      return res.status(200).json({ hasStripeCustomer: true, stripeCustomerId: userData.stripeCustomerId });
    } else {
      // User does not have a Stripe customer
      return res.status(200).json({ hasStripeCustomer: false });
    }
  } catch (error: any) {
    console.error('Error verifying ID token or fetching user data:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
  }
}