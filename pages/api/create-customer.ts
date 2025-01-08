import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { db, admin } from '~/common/firebase/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

interface Data {
  customer?: Stripe.Customer;
  subscription?: Stripe.Subscription;
  clientSecret?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { email, name, payment_method } = req.body;

    try {
      // Validate input
      if (!email || !name || !payment_method) {
        throw new Error('Missing required fields: email, name, payment_method');
      }

      // Check if user already exists
      const userRef = db.collection('users').doc(email);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        throw new Error('User with this email already exists.');
      }

      // Create a new customer in Stripe
      const customer: Stripe.Customer = await stripe.customers.create({
        email,
        name,
        payment_method,
        invoice_settings: {
          default_payment_method: payment_method,
        },
      });

      // Create a metered subscription for the customer
      const subscription: Stripe.Subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: process.env.SUBSCRIPTION_PRICE_ID || '',
            // Metadata or additional settings can be added here
          },
        ],
        expand: ['latest_invoice.payment_intent'],
        payment_behavior: 'default_incomplete', // To handle payment confirmation
      });

      // Store user and subscription in Firestore
      await userRef.set({
        name,
        stripeCustomerId: customer.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const subscriptionRef = userRef.collection('subscriptions').doc(subscription.id);
      await subscriptionRef.set({
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        priceId: subscription.items.data[0].price.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Check if PaymentIntent requires action (e.g., SCA)
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      let clientSecret: string | undefined;

      if (
        paymentIntent &&
        paymentIntent.status === 'requires_action' &&
        paymentIntent.next_action?.type === 'use_stripe_sdk'
      ) {
        clientSecret = paymentIntent.client_secret ?? undefined;
      }

      res.status(200).json({ customer, subscription, clientSecret });
    } catch (error: any) {
      console.error('Error creating customer or subscription:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}