"use client";
import { logger } from '@/lib/logger';

import { Portal } from '@/components/Portal';
import { SelectField } from '@/components/ui/SelectField';
import { X } from 'lucide-react';
import { useId, useState } from 'react';

import { DatePickerField } from '@/components/ui/DatePickerField';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { TimePickerField } from '@/components/ui/TimePickerField';
import { useModalA11y } from '@/hooks/useModalA11y';
import { normalizeLeadId } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useParams, useRouter } from 'next/navigation';
import { scheduleVisitThunk, selectVisitState } from '../..';

export interface VisitScheduleDetails {
  date: string;
  time: string;
  location: string;
  agenda: string;
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
}

interface ScheduleNewVisitFormProps {
  asModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (scheduleDetails: VisitScheduleDetails) => void | Promise<void>;
}

const isTodayDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const selected = new Date(dateStr);
  const today = new Date();
  return (
    selected.getFullYear() === today.getFullYear() &&
    selected.getMonth() === today.getMonth() &&
    selected.getDate() === today.getDate()
  );
};

const isPastTimeForToday = (dateStr: string, timeStr: string): boolean => {
  if (!dateStr || !timeStr || !isTodayDate(dateStr)) return false;

  let hours = 0;
  let minutes = 0;
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12 && match12[1] && match12[2] && match12[3]) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    hours = h;
    minutes = m;
  } else {
    const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (match24 && match24[1] && match24[2]) {
      hours = parseInt(match24[1], 10);
      minutes = parseInt(match24[2], 10);
    } else {
      return false;
    }
  }

  const now = new Date();
  const visitTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  return visitTime.getTime() < now.getTime();
};

export const ScheduleNewVisitForm = ({
  asModal = false,
  isOpen = true,
  onClose,
  onSave
}: ScheduleNewVisitFormProps) => {
  const { visitSchedule } = useAppSelector(selectVisitState);

  const [date, setDate] = useState(visitSchedule?.date || '');
  const [time, setTime] = useState('');
  const [location] = useState('');
  const [agenda, setAgenda] = useState('');
  const [region, setRegion] = useState('');
  const [zone, setZone] = useState('');
  const [woreda, setWoreda] = useState('');
  const [kebele, setKebele] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const params = useParams();
  const router = useRouter();
  const dialogRef = useModalA11y<HTMLDivElement>(asModal && isOpen, () => onClose?.());
  const dialogTitleId = useId();

  // Body scroll lock is handled by useModalA11y (ref-counted so a stacked
  // modal underneath this one isn't unlocked prematurely).

  if (asModal && !isOpen) return null;

  const handleSave = async () => {
    if (!date || !woreda) {
      setErrorFeedback('Please fill in all required fields (Date, Woreda).');
      return;
    }

    if (isPastTimeForToday(date, time)) {
      setErrorFeedback('Cannot schedule a visit for a past time on today\'s date. Please select a future time.');
      return;
    }

    const payload = { date, time, location, agenda, region, zone, woreda, kebele };

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(payload);
      } else {
        const activeLeadId = params?.id as string;
        if (!activeLeadId) {
          setErrorFeedback('Lead ID not found');
          return;
        }
        await dispatch(scheduleVisitThunk({
          leadId: activeLeadId,
          ...payload
        })).unwrap();
        // Redirect back to lead details page
        router.push(`/leads/${normalizeLeadId(activeLeadId)}`);
      }
    } catch (err) {
      logger.error("Failed to save schedule:", err);
      setErrorFeedback(typeof err === 'string' ? err : (err instanceof Error && err.message) || 'Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const isPastTimeError = isPastTimeForToday(date, time);

  const formContent = (
    <>
      <div className={`flex flex-row items-center w-full px-6 py-[19.5px] border-b border-[#E5E7EB] ${asModal ? 'justify-between' : ''}`}>
        <h2 id={asModal ? dialogTitleId : undefined} className="font-roboto font-semibold text-lg leading-6 text-[#111827]">
          {asModal ? 'Schedule Visit' : 'Schedule New Visit'}
        </h2>
        {asModal && onClose && (
          <button
            onClick={onClose}
            className="flex flex-col items-start p-[4px_4px_0px] w-[28px] h-[28px] rounded-[4px] hover:bg-gray-100 transition-colors"
          >
            <X size={20} color="#0A0A0A" strokeWidth={1.66667} />
          </button>
        )}
      </div>

      <div className={`flex flex-col items-start px-6 pt-6 pb-6 gap-6 w-full ${asModal ? 'max-h-[80vh] overflow-y-auto' : ''}`}>
        <div className="flex flex-col items-start gap-6 w-full">

          {/* Date & Time Row */}
          <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
            <div className="flex-1 w-full">
              <DatePickerField
                label="Visit Date"
                value={date}
                onChange={setDate}
                minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                required
              />
            </div>
            <div className="flex-1 w-full">
              <TimePickerField
                label="Visit Time"
                value={time}
                onChange={setTime}
                {...(isPastTimeError ? { error: 'Visit time cannot be in the past' } : {})}
                required
              />
            </div>
          </div>

          {/* Agenda / Notes */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-inter font-medium text-sm text-[#374151]">Agenda / Notes</label>
            <textarea
              placeholder="What is the purpose of this visit?"
              rows={4}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] resize-none"
            />
          </div>

          {/* Region & Zone Row */}
          <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
            <div className="flex-1 w-full">
              <SelectField
                label="Region"
                placeholder="Select Region"
                options={['Oromia', 'Amhara']}
                value={region}
                onChange={setRegion}
                required
              />
            </div>
            <div className="flex-1 w-full">
              <SelectField
                label="Zone"
                placeholder="Select Zone"
                options={['Jimma']}
                value={zone}
                onChange={setZone}
                required
              />
            </div>
          </div>

          {/* Woreda & Kebele Row */}
          <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
            <div className="flex-1 w-full">
              <SelectField
                label="Woreda"
                placeholder="Select Woreda"
                options={['Limmu Kosa']}
                value={woreda}
                onChange={setWoreda}
                required
              />
            </div>
            <div className="flex-1 w-full">
              <SelectField
                label="Kebele"
                placeholder="Select Kebele"
                options={['Kebele 1']}
                value={kebele}
                onChange={setKebele}
                required
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex flex-row justify-end items-center pt-4 w-full gap-4 border-t border-[#E5E7EB] mt-4 font-semibold">
          <button
            onClick={asModal && onClose ? onClose : undefined}
            className="flex justify-center items-center px-4 py-3 bg-white border border-[#D1D5DC] rounded-md text-[#374151] font-inter font-semibold text-sm shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isPastTimeError}
            className="flex justify-center items-center px-4 py-3 bg-[#16A34A] rounded-md text-white font-inter font-semibold text-sm shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#15803d] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      <FeedbackModal
        isOpen={!!errorFeedback}
        onClose={() => setErrorFeedback(null)}
        type="error"
        title="Error"
        message={errorFeedback ?? ''}
      />
    </>
  );

  if (asModal) {
    if (!isOpen) return null;
    return (
      <Portal>
        <div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            tabIndex={-1}
            className="relative flex flex-col items-start p-0 w-[95%] sm:w-[640px] max-w-full h-auto bg-white rounded-[10px] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {formContent}
          </div>
        </div>
      </Portal>
    );
  }

  // Default inline view
  return (
    <div className="flex flex-col items-start w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
      {formContent}
    </div>
  );
};