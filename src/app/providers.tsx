'use client';
import { logger } from '@/lib/logger';

import { getMeThunk } from '@/features/auth/store/authSlice';
import { store } from '@/store';
import { useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

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
    return null; // Or a loading spinner
  }

  return (
    <ReduxProvider store={store}>
      {children}
    </ReduxProvider>
  );
}
