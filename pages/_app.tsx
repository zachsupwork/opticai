import * as React from 'react';
import Head from 'next/head';
import { MyAppProps } from 'next/app';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next';

import { Brand } from '~/common/app.config';
import { apiQuery } from '~/common/util/trpc.client';

import 'katex/dist/katex.min.css';
import '~/common/styles/CodePrism.css';
import '~/common/styles/GithubMarkdown.css';
import '~/common/styles/NProgress.css';
import '~/common/styles/agi.effects.css';
import '~/common/styles/app.styles.css';

import { Is } from '~/common/util/pwaUtils';
import { OverlaysInsert } from '~/common/layout/overlays/OverlaysInsert';
import { ProviderBackendCapabilities } from '~/common/providers/ProviderBackendCapabilities';
import { ProviderBootstrapLogic } from '~/common/providers/ProviderBootstrapLogic';
import { ProviderSingleTab } from '~/common/providers/ProviderSingleTab';
import { ProviderTheming } from '~/common/providers/ProviderTheming';
import { SnackbarInsert } from '~/common/components/snackbar/SnackbarInsert';
import { hasGoogleAnalytics, OptionalGoogleAnalytics } from '~/common/components/GoogleAnalytics';
import ProtectedRoute from '~/common/components/ProtectedRoute';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AuthContextProvider } from '../src/common/auth/AuthContext';
import { useRouter } from 'next/router'

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const noAuthRequired = ['/login', '/signup', '/reset-password', '/verify-email', '/recover-email', '/email-verification-check', '/404', '/500'];


const Big_AGI_App = ({ Component, emotionCache, pageProps }: MyAppProps) => {

  // We are using a nextjs per-page layout pattern to bring the (Optima) layout creation to a shared place
  // This reduces the flicker and the time switching between apps, and seems to not have impact on
  // the build. This is a good trade-off for now.
  const router = useRouter()
  const getLayout = Component.getLayout ?? ((page: any) => page);

  return <>

    <Head>
      <title>{Brand.Title.Common}</title>
      <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no' />
    </Head>

    <ProviderTheming emotionCache={emotionCache}>
      <ProviderSingleTab>
        <ProviderBackendCapabilities>
          {/* ^ Backend capabilities & SSR boundary */}
          <ProviderBootstrapLogic>
            <SnackbarInsert />
            {getLayout(
              <Elements stripe={stripePromise}>
                <AuthContextProvider>{
                  noAuthRequired.includes(router.pathname) ? (
                    <Component {...pageProps} />
                  ) : (
                    <ProtectedRoute>
                      <Component {...pageProps} />
                    </ProtectedRoute>
                  )
                }
                </AuthContextProvider>
              </Elements>
            )}
            <OverlaysInsert />
          </ProviderBootstrapLogic>
        </ProviderBackendCapabilities>
      </ProviderSingleTab>
    </ProviderTheming>

    {Is.Deployment.VercelFromFrontend && <VercelAnalytics debug={false} />}
    {Is.Deployment.VercelFromFrontend && <VercelSpeedInsights debug={false} sampleRate={1 / 2} />}
    {hasGoogleAnalytics && <OptionalGoogleAnalytics />}

  </>;
};

// Initializes React Query and tRPC, and enables the tRPC React Query hooks (apiQuery).
export default apiQuery.withTRPC(Big_AGI_App);