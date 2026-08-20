'use client';
import { logger } from '@/lib/logger';

import { GlobalLoader } from '@/components/GlobalLoader';
import { FullPageLoader } from '@/components/ui/Loader';
import { AuthBootstrapGate } from '@/features/auth/components/AuthBootstrapGate';
import { getMeThunk } from '@/features/auth/store/authSlice';
import { store } from '@/store';
import { Suspense, useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {

  const [mswReady, setMswReady] = useState(
    process.env.NEXT_PUBLIC_API_MOCKING !== 'true'
  );

  useEffect(() => {
    store.dispatch(getMeThunk());

    if (process.env.NEXT_PUBLIC_API_MOCKING === 'true') {
      import('@/lib/mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass', // ignore requests to unmocked endpoints
        }).then(() => {
          setMswReady(true);
        }).catch((err) => {
          // Ignore 'already enabled' error in React Strict Mode double-invocation
          if (err.message && err.message.includes('already enabled')) {
            setMswReady(true);
          } else {
            logger.error(err);
          }
        });
      });
    }
  }, []);

  if (!mswReady) {
    // Mock-mode only, and previously `null` — a blank white page for as long as
    // the service worker took to register, with nothing to say it was working.
    return <FullPageLoader label="Starting mock API…" />;
  }

  return (
    <ReduxProvider store={store}>
      {/* One activity bar and one blocking overlay for the whole app, mounted
          above the routed tree so neither is torn down by a navigation.
          `GlobalLoader` reads the URL, so it sits behind a Suspense boundary. */}
      <Suspense fallback={null}>
        <GlobalLoader />
      </Suspense>
      <AuthBootstrapGate>{children}</AuthBootstrapGate>
      <Toaster position="top-right" richColors closeButton />
    </ReduxProvider>
  );
}
