'use client';

import {
  ConsentFinalizationSection,
  ConsentManagementSection,
  clearConsentState,
  clearFarmerState,
  fetchLeadDetailsThunk,
} from '@/features/new-lead';
import { logger } from '@/lib/logger';
import { useAppDispatch } from '@/store/hooks';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { startConsent } from '../../api/farmerApi';

/**
 * The consent step of the farmer's own loan application.
 *
 * Deliberately thin: the consent flow is not reimplemented here. It is the same
 * pair of sections the Development Agent drives from `/leads/[id]`, hitting the
 * same request_otp -> verify_otp -> submit_consent endpoints against the same
 * Redux slice. All this component contributes is the piece the agent gets from
 * the route and the farmer has to be given — the lead the consent is anchored on
 * — plus the `audience` flag that switches the copy from third-person ("the
 * farmer is present and has agreed") to first-person.
 */
export default function ConsentManagement() {
  const dispatch = useAppDispatch();
  const [leadId, setLeadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Consent state is global (one `consent` slice shared with the agent flow), so
    // clear anything a previous visit left behind before adopting this lead —
    // otherwise a stale "OTP verified" would skip straight to the finalize step.
    dispatch(clearConsentState());
    dispatch(clearFarmerState());

    const bootstrap = async () => {
      try {
        const res = await startConsent();
        if (!isMounted) return;
        const context = res.data;
        setLeadId(context.lead_id);

        // Consent may already be done from an earlier application — it belongs to
        // the farmer, not to one product, and it carries its own validity window.
        // Loading the lead's details lets the sections render their verified state
        // instead of asking for an OTP that is not needed.
        if (context.consent_completed) {
          dispatch(fetchLeadDetailsThunk(context.lead_id));
        }
      } catch (e) {
        if (!isMounted) return;
        logger.error('Failed to start the consent flow', e);
        setError(
          e instanceof Error
            ? e.message
            : 'Could not start the consent step. Please refresh and try again.'
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <section className="flex flex-col items-center py-12 gap-3 w-full bg-white border border-[#F1F3F4] rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Loader2 className="animate-spin text-[#16A34A]" size={32} />
        <p className="text-sm font-medium text-[#4B5563]">Preparing your consent request...</p>
      </section>
    );
  }

  if (error || !leadId) {
    return (
      <section
        role="alert"
        className="flex flex-col items-center py-8 px-6 gap-3 w-full bg-white border border-red-100 rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <AlertCircle className="text-red-500" size={32} />
        <p className="text-sm font-semibold text-red-700 text-center">
          {error ?? 'Could not start the consent step. Please refresh and try again.'}
        </p>
      </section>
    );
  }

  return (
    <>
      <ConsentManagementSection leadId={leadId} audience="farmer" />
      <ConsentFinalizationSection leadId={leadId} audience="farmer" />
    </>
  );
}
