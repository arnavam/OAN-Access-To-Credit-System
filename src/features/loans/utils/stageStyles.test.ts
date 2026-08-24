import { describe, expect, it } from 'vitest';
import { getStageStyle, toStageFilterOptions } from './stageStyles';
import type { LoanStage } from '../types/loanStages.types';

describe('stageStyles utility', () => {
  const mockStages: LoanStage[] = [
    {
      name: 'stage-1',
      bank: 'HDFC Bank',
      stage_id: 'LSS-0001',
      label: 'Submitted',
      archetype_state: 'In Transition',
      sequence: 1,
      external_code: 'SUBMITTED',
      description: 'Initial submission',
      application_count: 12,
      creation: '2026-01-01',
      modified: '2026-01-01',
    },
    {
      name: 'stage-2',
      bank: 'HDFC Bank',
      stage_id: 'LSS-0002',
      label: 'Verified',
      archetype_state: 'In Transition',
      sequence: 2,
      external_code: 'DOC_VERIF',
      description: 'Document verification',
      application_count: 8,
      creation: '2026-01-01',
      modified: '2026-01-01',
    },
    {
      name: 'stage-3',
      bank: 'HDFC Bank',
      stage_id: 'LSS-0003',
      label: 'Disbursed',
      archetype_state: 'Completed',
      sequence: 3,
      external_code: 'DISBURSED',
      description: 'Loan disbursed',
      application_count: 14,
      creation: '2026-01-01',
      modified: '2026-01-01',
    },
    {
      name: 'stage-4',
      bank: 'HDFC Bank',
      stage_id: 'LSS-0004',
      label: 'Rejected',
      archetype_state: 'Rejected',
      sequence: 4,
      external_code: 'REJECTED',
      description: 'Application rejected',
      application_count: 2,
      creation: '2026-01-01',
      modified: '2026-01-01',
    },
  ];

  it('correctly maps styles from dynamic stage list', () => {
    const submittedStyle = getStageStyle('Submitted', mockStages);
    expect(submittedStyle.label).toBe('Submitted');
    expect(submittedStyle.tone).toBe('info');

    const verifiedStyle = getStageStyle('Verified', mockStages);
    expect(verifiedStyle.label).toBe('Verified');
    expect(verifiedStyle.tone).toBe('info');

    const disbursedStyle = getStageStyle('Disbursed', mockStages);
    expect(disbursedStyle.label).toBe('Disbursed');
    expect(disbursedStyle.tone).toBe('success');

    const rejectedStyle = getStageStyle('Rejected', mockStages);
    expect(rejectedStyle.label).toBe('Rejected');
    expect(rejectedStyle.tone).toBe('danger');
  });

  it('matches by stage_id or external_code as well as label', () => {
    const byId = getStageStyle('LSS-0002', mockStages);
    expect(byId.label).toBe('Verified');

    const byCode = getStageStyle('DISBURSED', mockStages);
    expect(byCode.label).toBe('Disbursed');
    expect(byCode.tone).toBe('success');
  });

  it('falls back to keyword-based detection when stages list is empty or status is not found', () => {
    const granted = getStageStyle('Granted');
    expect(granted.tone).toBe('success');

    const declined = getStageStyle('Declined');
    expect(declined.tone).toBe('danger');

    const pending = getStageStyle('Pending');
    expect(pending.tone).toBe('neutral');
  });

  it('converts LoanStage array to FilterOptions', () => {
    const filterOptions = toStageFilterOptions(mockStages);
    expect(filterOptions).toHaveLength(4);
    expect(filterOptions[0]).toMatchObject({
      value: 'Submitted',
      label: 'Submitted',
      archetype_state: 'In Transition',
      sequence: 1,
      stage_id: 'LSS-0001',
      application_count: 12,
    });
    expect(filterOptions[2]).toMatchObject({
      value: 'Disbursed',
      label: 'Disbursed',
      archetype_state: 'Completed',
      sequence: 3,
      application_count: 14,
    });
  });
});
