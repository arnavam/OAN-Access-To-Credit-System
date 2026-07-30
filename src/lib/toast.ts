export const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      console.log('[Toast Success]:', message);
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      console.error('[Toast Error]:', message);
    }
  },
};
