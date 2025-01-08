// pages/api/webhooks.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { db, admin } from '~/common/firebase/firebaseAdmin';

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
    } catch (err: any) {
      console.error('⚠️  Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded':
        const invoicePaid = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoicePaid);
        break;
      case 'invoice.payment_failed':
        const invoiceFailed = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoiceFailed);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionEvent(subscription);
        break;
      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        await handleSubscriptionEvent(subscriptionDeleted, true);
        break;
      // ... handle other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

async function handleSubscriptionEvent(
  subscription: Stripe.Subscription,
  isDeleted: boolean = false
) {
  try {
    // Find the user associated with this subscription using Firestore queries
    const subscriptionsRef = db.collectionGroup('subscriptions').where('stripeSubscriptionId', '==', subscription.id);
    const subscriptionsSnapshot = await subscriptionsRef.get();

    if (subscriptionsSnapshot.empty) {
      console.warn(`No subscription found in Firestore for Stripe Subscription ID: ${subscription.id}`);
      return;
    }

    subscriptionsSnapshot.forEach(async (doc) => {
      const subscriptionData = doc.data();
      const userRef = doc.ref.parent.parent as FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;

      if (!userRef) {
        console.warn(`User reference not found for subscription ID: ${subscription.id}`);
        return;
      }

      // Update the subscription status in Firestore
      await doc.ref.update({
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
      });

      if (isDeleted) {
        // Optionally, handle user access removal or notification
        console.log(`Subscription ${subscription.id} has been canceled/deleted.`);
      }

      console.log(`Subscription ${subscription.id} updated to status ${subscription.status}.`);
    });
  } catch (error: any) {
    console.error('Error handling subscription event:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;

    // Find the subscription in Firestore
    const subscriptionsRef = db.collectionGroup('subscriptions').where('stripeSubscriptionId', '==', subscriptionId);
    const subscriptionsSnapshot = await subscriptionsRef.get();

    if (subscriptionsSnapshot.empty) {
      console.warn(`No subscription found in Firestore for Stripe Subscription ID: ${subscriptionId}`);
      return;
    }

    subscriptionsSnapshot.forEach(async (doc) => {
      // Optionally, update invoice payment status or notify the user
      console.log(`Invoice ${invoice.id} payment succeeded for subscription ${subscriptionId}.`);
      // Example: Update last payment timestamp
      await doc.ref.parent.parent!.update({
        lastPayment: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
  } catch (error: any) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;

    // Find the subscription in Firestore
    const subscriptionsRef = db.collectionGroup('subscriptions').where('stripeSubscriptionId', '==', subscriptionId);
    const subscriptionsSnapshot = await subscriptionsRef.get();

    if (subscriptionsSnapshot.empty) {
      console.warn(`No subscription found in Firestore for Stripe Subscription ID: ${subscriptionId}`);
      return;
    }

    subscriptionsSnapshot.forEach(async (doc) => {
      // Optionally, notify the user about the failed payment
      console.log(`Invoice ${invoice.id} payment failed for subscription ${subscriptionId}.`);
      // Example: Set a flag indicating payment failure
      await doc.ref.parent.parent!.update({
        paymentFailed: true,
      });
    });
  } catch (error: any) {
    console.error('Error handling invoice payment failed:', error);
  }
}