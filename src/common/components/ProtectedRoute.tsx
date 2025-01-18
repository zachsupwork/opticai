// components/ProtectedRoute.tsx

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useAuth } from '~/common/auth/AuthContext';
import { auth } from '../../../firebase';
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checkingStripe, setCheckingStripe] = useState<boolean>(true);

  useEffect(() => {
    const verifyStripeCustomer = async () => {
      if (!authLoading) {
        if (!user) {
          // User is not authenticated, redirect to /login
          await router.replace('/login');
          return;
        }

        try {
          // Get the current user's ID token
          const currentUser = auth.currentUser;
          if (!currentUser) {
            // User might have signed out in the meantime
            await router.replace('/login');
            return;
          }

          if (!currentUser.emailVerified) {
            // User has not verified their email, redirect to /verify-email
            await router.replace('/verify-email');
            return;
          }

          const idToken = await currentUser.getIdToken();

          // Call the API route to check Stripe customer status
          const response = await fetch('/api/check-stripe-customer', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (!data.hasStripeCustomer) {
              // User does not have a Stripe customer, redirect to /create-customer
              await router.replace('/create-customer');
              return;
            }
          } else if (response.status === 401) {
            // Unauthorized, possibly invalid token, redirect to /login
            await router.replace('/login');
            return;
          } else if (response.status === 404) {
            // Unauthorized, possibly invalid token, redirect to /login
            await router.replace('/create-customer');
            return;
          }
          else {
            // Handle other unexpected statuses
            console.error('Unexpected response status:', response.status);
            // Optionally, redirect to an error page
            await router.replace('/error');
            return;
          }
        } catch (error) {
          console.error('Error verifying Stripe customer:', error);
          // Optionally, redirect to an error page
          await router.replace('/error');
          return;
        } finally {
          setCheckingStripe(false);
        }
      }
    };

    verifyStripeCustomer();
  }, []);

  if (authLoading || checkingStripe) {
    // Optionally, display a loading spinner or placeholder
    return <div className='text-center'>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;