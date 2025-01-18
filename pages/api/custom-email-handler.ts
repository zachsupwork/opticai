import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { mode, oobCode, lang } = req.query;
    switch (mode) {
      case 'resetPassword':
        res.redirect(`/reset-password?mode=${mode}&oobCode=${oobCode}&lang=${lang}`);
        break;
      case 'recoverEmail':
        // Display email recovery handler and UI.
        res.redirect(`/recover-email?mode=${mode}&oobCode=${oobCode}&lang=${lang}`);
        break;
      case 'verifyEmail':
        // Display email verification handler and UI.
        res.redirect(`/email-verification-check?mode=${mode}&oobCode=${oobCode}&lang=${lang}`);
        break;
      default:
        res.status(400).send('Invalid mode');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}