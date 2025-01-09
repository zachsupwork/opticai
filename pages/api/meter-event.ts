import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

interface ResponseData {
    success?: boolean;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2024-12-18.acacia',
    });

    const { tokenCount, stripeCustomerId } = req.body;

    try {
        const meterEvent = await stripe.billing.meterEvents.create({
            event_name: 'optic_ai_tokens',
            payload: {
                value: tokenCount,
                stripe_customer_id: stripeCustomerId,
            },
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'error occured' });
    }
}