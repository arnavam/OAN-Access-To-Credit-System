'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // document.body doesn't exist during SSR, so createPortal can't run until
    // after mount — this is the one legitimate source of this pattern in the
    // app; every other component should render through this shared <Portal>
    // instead of reimplementing its own mounted-gated createPortal call.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
