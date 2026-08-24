import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { describe, expect, it } from 'vitest';
import {
  bankApplicationsReducer,
  clearBankFilters,
  selectBankApplicationRows,
  selectBankQueryParams,
  setBankFilters,
  setBankPage,
  setBankPageSize,
  setBankSearchQuery,
} from './bankApplicationsSlice';

function createTestStore() {
  return configureStore({ reducer: { bankApplications: bankApplicationsReducer } });
}

/** The test store mounts one slice; the selectors are typed against the full RootState. */
const asRootState = (state: { bankApplications: unknown }) => state as unknown as RootState;

const baseFilters = {
  status: [],
  loanType: [],
  loanAmount: [],
  location: '',
  dateFrom: '',
  dateTo: '',
};

describe('selectBankQueryParams', () => {
  it('sends nothing but paging and the default sort when no filter is set', () => {
    const store = createTestStore();

    // Sort is not a filter: newest-first is the list's resting order, so it is
    // sent even with nothing selected. Asserted explicitly rather than allowing
    // extra keys, so a real filter leaking into the default request still fails.
    expect(selectBankQueryParams(asRootState(store.getState()))).toEqual({
      page: 1,
      page_size: 10,
      sort_by: 'creation',
      sort_order: 'desc',
    });
  });

  it('never sends a date window the page has no control for', () => {
    // The Development Agent's slice defaults to a 30-day window. Inheriting that
    // here would silently hide older applications on a screen with no date
    // control to explain the gap, so the bank list must send no from_date until
    // one is actually picked.
    const store = createTestStore();
    const params = selectBankQueryParams(asRootState(store.getState()));

    expect(params.from_date).toBeUndefined();
    expect(params.to_date).toBeUndefined();
  });

  it('sends the API status values, not their display labels', () => {
    const store = createTestStore();
    store.dispatch(setBankFilters({ ...baseFilters, status: ['Approved', 'Rejected'] }));

    expect(selectBankQueryParams(asRootState(store.getState())).status).toBe('Approved,Rejected');
  });

  it('collapses selected amount buckets into a single min/max span', () => {
    const store = createTestStore();
    store.dispatch(
      setBankFilters({ ...baseFilters, loanAmount: ['0 - 25,000', '25,001 - 50,000'] })
    );

    const params = selectBankQueryParams(asRootState(store.getState()));
    expect(params.min_loan_amount).toBe('0');
    expect(params.max_loan_amount).toBe('50000');
  });

  it('leaves the range open-ended when the top bucket is selected', () => {
    const store = createTestStore();
    store.dispatch(setBankFilters({ ...baseFilters, loanAmount: ['1,00,000 and above'] }));

    const params = selectBankQueryParams(asRootState(store.getState()));
    expect(params.min_loan_amount).toBe('100001');
    expect(params.max_loan_amount).toBeUndefined();
  });

  it('carries search, loan type, location and dates through', () => {
    const store = createTestStore();
    store.dispatch(setBankSearchQuery('ET-FRM-2026'));
    store.dispatch(
      setBankFilters({
        ...baseFilters,
        loanType: ['Crop Loan', 'Seed Loan'],
        location: 'Adama',
        dateFrom: '2026-01-01',
        dateTo: '2026-02-01',
      })
    );

    expect(selectBankQueryParams(asRootState(store.getState()))).toMatchObject({
      search_query: 'ET-FRM-2026',
      loan_type: 'Crop Loan,Seed Loan',
      location: 'Adama',
      from_date: '2026-01-01',
      to_date: '2026-02-01',
    });
  });
});

describe('paging resets', () => {
  it('returns to page 1 when a filter, the page size or the search changes', () => {
    const store = createTestStore();

    store.dispatch(setBankPage(4));
    store.dispatch(setBankFilters({ ...baseFilters, status: ['Rejected'] }));
    expect(store.getState().bankApplications.page).toBe(1);

    store.dispatch(setBankPage(4));
    store.dispatch(setBankSearchQuery('abebe'));
    expect(store.getState().bankApplications.page).toBe(1);

    store.dispatch(setBankPage(4));
    store.dispatch(setBankPageSize(50));
    expect(store.getState().bankApplications.page).toBe(1);
  });

  it('clears the search box along with the filters', () => {
    // One "Clear Filters" has to reset every filter surface, or a value the
    // person can no longer see keeps narrowing the request.
    const store = createTestStore();
    store.dispatch(setBankSearchQuery('abebe'));
    store.dispatch(setBankFilters({ ...baseFilters, status: ['Rejected'], location: 'Adama' }));

    store.dispatch(clearBankFilters());

    // Back to the resting request: paging and the default sort, nothing else.
    // Clearing filters must not clear the sort — that is a display preference,
    // not something the person set in the filter drawer.
    expect(selectBankQueryParams(asRootState(store.getState()))).toEqual({
      page: 1,
      page_size: 10,
      sort_by: 'creation',
      sort_order: 'desc',
    });
  });
});

describe('selectBankApplicationRows', () => {
  it('labels an Approved application as Granted while keeping the API status', () => {
    const store = createTestStore();
    // Stand in for a settled fetch; the mapper reads whatever `raw` holds.
    store.dispatch({
      type: 'bankApplications/fetch/pending',
      meta: { requestId: 'r1' },
    });
    store.dispatch({
      type: 'bankApplications/fetch/fulfilled',
      meta: { requestId: 'r1' },
      payload: {
        data: [
          {
            application_id: 'APP-0001',
            status: 'Approved',
            step: 5,
            loan_amount: 15000,
            loan_type: 'Crop Loan',
            loan_product_name: 'Harvest Plus',
            location: 'Adama',
            phone_number: '+251911000000',
            creation: '2026-05-28T10:42:00',
            first_name: 'Abebe',
            last_name: 'Girma',
          },
        ],
        pagination: { total: 1, total_pages: 1 },
      },
    });

    const rows = selectBankApplicationRows(asRootState(store.getState()));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'APP-0001',
      applicant: 'Abebe Girma',
      initials: 'AG',
      // Filters and the API speak `status`; only the badge shows `statusLabel`.
      status: 'Approved',
      statusLabel: 'Granted',
      statusTone: 'success',
      // The LOAN TYPE column filters server-side on `loan_type`, so that — not
      // the product name — has to be what it displays.
      type: 'Crop Loan',
      productName: 'Harvest Plus',
      loanAmount: '15,000',
    });
  });

  it('uses dynamic stage_label when provided in the payload', () => {
    const store = createTestStore();
    store.dispatch({
      type: 'bankApplications/fetch/pending',
      meta: { requestId: 'r2' },
    });
    store.dispatch({
      type: 'bankApplications/fetch/fulfilled',
      meta: { requestId: 'r2' },
      payload: {
        data: [
          {
            application_id: 'APP-2026-01482',
            status: 'In Transition',
            stage_id: 'LSS-00021',
            stage_label: 'Verified',
            step: 1,
            lead_id: null,
            loan_amount: 124.0,
            loan_type: null,
            loan_product: 'PROD-PB-0370-01218',
            loan_product_name: '123456',
            phone_number: '+18289997752',
            creation: '2026-08-23T14:37:01.408252+05:30',
          },
        ],
        pagination: { total: 1, total_pages: 1 },
      },
    });

    const rows = selectBankApplicationRows(asRootState(store.getState()));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'APP-2026-01482',
      statusLabel: 'Verified',
      statusTone: 'info',
    });
  });

  it('populates dynamic stages and derives stage options', () => {
    const store = createTestStore();
    store.dispatch({
      type: 'bankApplications/fetchStages/fulfilled',
      payload: {
        data: {
          bank: 'HDFC Bank',
          stages: [
            {
              name: 'c2f9d14a80',
              bank: 'HDFC Bank',
              stage_id: 'submitted-a8f3b2',
              label: 'Submitted',
              archetype_state: 'In Transition',
              sequence: 1,
              external_code: null,
              description: 'Initial application submission',
              application_count: 14,
            },
            {
              name: 'd3e8c25b91',
              bank: 'HDFC Bank',
              stage_id: 'disbursed-b9e4c3',
              label: 'Disbursed',
              archetype_state: 'Completed',
              sequence: 2,
              external_code: null,
              description: 'Loan disbursed',
              application_count: 20,
            },
          ],
        },
      },
    });

    const state = store.getState();
    expect(state.bankApplications.stages).toHaveLength(2);
    expect(state.bankApplications.stages[0]?.label).toBe('Submitted');
    expect(state.bankApplications.stages[1]?.label).toBe('Disbursed');
  });
});
