import { GetLoansParams, LoanApplicationSummary, loanService, LoanSummaryMetrics } from '@/features/loans/api/loan.service';
import { loanStagesService } from '@/features/loans/api/loanStages.service';
import { getStageStyle, toStageFilterOptions } from '@/features/loans/utils/stageStyles';
import type { LoanStage } from '@/lib/api/api.schemas';
import type { ApiResponse } from '@/types/api';
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';

export const fetchLoans = createAsyncThunk(
  'loanDashboard/fetchLoans',
  async (params: GetLoansParams | undefined, { signal, rejectWithValue }) => {
    try {
      const response = await loanService.getLoans(params, { signal });
      return response;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch loans';
      return rejectWithValue(message);
    }
  }
);

export const fetchLoanStages = createAsyncThunk(
  'loanDashboard/fetchLoanStages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanStagesService.getStages();
      return response;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch loan stages';
      return rejectWithValue(message);
    }
  }
);

export const fetchLoanSummary = createAsyncThunk(
  'loanDashboard/fetchLoanSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanService.getLoanSummary();
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch loan summary';
      return rejectWithValue(message);
    }
  }
);

export const updateLoanStatus = createAsyncThunk(
  'loanDashboard/updateLoanStatus',
  async ({ id, status, reason, notes }: { id: string; status: string; reason?: string; notes?: string }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await loanService.updateLoanStatus(id, status, reason, notes);
      // Re-fetch with the user's current filters/pagination (not the defaults) so the view doesn't silently reset.
      dispatch(fetchLoans(selectQueryParams(getState() as RootState)));
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update loan status';
      return rejectWithValue(message);
    }
  }
);

export interface MappedLoanRow extends Omit<LoanApplicationSummary, 'status'> {
  id: string;
  applicant: string;
  initials?: string;
  productName?: string;
  phone: string;
  loanAmount: string;
  type: string;
  /** Region · Woreda, built from the hierarchy fields the endpoint returns. */
  location: string;
  /** The archetype state — what the status filter and the API speak. */
  status: string;
  /** What the badge shows: the owning bank's stage label, or the archetype. */
  statusLabel: string;
  statusTone: string;
  updated: string;
  timestamp: number;
  action: string;
}

export interface AdvancedFilters {
  status: string[];
  minLoan: number | null;
  maxLoan: number | null;
  type: string[];
  /** Prefix-matched against `region`. See BankApplicationFilters.region. */
  region: string;
  dateFrom: string;
  dateTo: string;
  sortBy?: 'loan_amount' | 'creation';
  sortOrder?: 'asc' | 'desc';
}

/** What the drawer can set — everything except the sort, which it does not own. */
export type AdvancedFilterValues = Omit<AdvancedFilters, 'sortBy' | 'sortOrder'>;

/**
 * The filter half of the current filter state, ready to hand back to
 * `setAdvancedFilters` with one field changed.
 *
 * Call sites that tweak a single filter used to spread the whole `AdvancedFilters`
 * object into the payload, which carried `sortBy`/`sortOrder` along with it and made
 * every one of them a place the sort could be reset by accident. Fields are listed
 * out rather than rest-destructured so adding one to `AdvancedFilters` is a type
 * error here instead of a value that silently stops being sent.
 */
export function advancedFilterValues(filters: AdvancedFilters): AdvancedFilterValues {
  return {
    status: filters.status,
    minLoan: filters.minLoan,
    maxLoan: filters.maxLoan,
    type: filters.type,
    region: filters.region,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };
}

interface LoanDashboardState {
  rawActivityData: ApiResponse<LoanApplicationSummary[]> | null;
  isLoading: boolean;
  loansError: string | null;
  // The most recently *dispatched* fetchLoans requestId — including the
  // untracked one updateLoanStatus fires after a status change, which has no
  // component-side abort to rely on. Gates .fulfilled/.rejected so a slower
  // older request can never overwrite a newer one's result, regardless of
  // which order they settle in.
  latestFetchRequestId: string | null;
  rawSummaryData: ApiResponse<LoanSummaryMetrics> | null;
  isSummaryLoading: boolean;
  summaryError: string | null;

  stages: LoanStage[];
  isStagesLoading: boolean;
  stagesError: string | null;

  // UI State
  activityPage: number;
  activeTab: 'all' | 'my' | 'unassigned';
  searchQuery: string;
  tableStatusFilters: string[];
  tableTypeFilters: string[];
  /**
   * Every `loan_type` seen so far, unioned across fetches and never pruned.
   *
   * The loan-type filters cannot be derived from the rows on screen: filtering is
   * server-side, so picking one type would shrink the option list to exactly that
   * type and leave no way back. Accumulating means the list only grows as pages are
   * visited, and a chosen value is always still selectable. (Same reasoning, and
   * the same mechanism, as `knownLoanTypes` on bankApplicationsSlice.)
   */
  knownLoanTypes: string[];
  pageSize: number;
  advancedFilters: AdvancedFilters;
}

// Shared by initialState and every "clear filters" reducer below, so the
// three can't silently drift apart when a field is added to AdvancedFilters.
const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  status: [],
  minLoan: null,
  maxLoan: null,
  type: [],
  region: '',
  dateFrom: '',
  dateTo: '',
};

/**
 * Replaces the filter values while carrying the current sort over.
 *
 * The drawer has no sort control, so the reducers below must not let its payload
 * decide the sort. Written as an explicit merge rather than a spread because
 * `exactOptionalPropertyTypes` rejects handing an optional field an explicit
 * `undefined`.
 */
function withCurrentSort(values: AdvancedFilterValues, current: AdvancedFilters): AdvancedFilters {
  const next: AdvancedFilters = { ...values };
  if (current.sortBy !== undefined) next.sortBy = current.sortBy;
  if (current.sortOrder !== undefined) next.sortOrder = current.sortOrder;
  return next;
}

const initialState: LoanDashboardState = {
  rawActivityData: null,
  isLoading: false,
  loansError: null,
  latestFetchRequestId: null,
  rawSummaryData: null,
  isSummaryLoading: false,
  summaryError: null,

  stages: [],
  isStagesLoading: false,
  stagesError: null,

  activityPage: 1,
  activeTab: 'all',
  searchQuery: '',
  tableStatusFilters: [],
  tableTypeFilters: [],
  knownLoanTypes: [],
  pageSize: 10,
  advancedFilters: { ...DEFAULT_ADVANCED_FILTERS },
};

const loanDashboardSlice = createSlice({
  name: 'loanDashboard',
  initialState,
  reducers: {
    toggleTableStatusFilter: (state, action: PayloadAction<string>) => {
      const val = action.payload;
      if (state.tableStatusFilters.includes(val)) {
        state.tableStatusFilters = state.tableStatusFilters.filter(s => s !== val);
      } else {
        state.tableStatusFilters.push(val);
      }
      state.activityPage = 1;
    },
    toggleTableTypeFilter: (state, action: PayloadAction<string>) => {
      const val = action.payload;
      if (state.tableTypeFilters.includes(val)) {
        state.tableTypeFilters = state.tableTypeFilters.filter(s => s !== val);
      } else {
        state.tableTypeFilters.push(val);
      }
      state.activityPage = 1;
    },
    setTableStatusFilters: (state, action: PayloadAction<string[]>) => {
      state.tableStatusFilters = action.payload;
      state.activityPage = 1;
    },
    setTableTypeFilters: (state, action: PayloadAction<string[]>) => {
      state.tableTypeFilters = action.payload;
      state.activityPage = 1;
    },
    clearTableFilters: (state) => {
      state.tableStatusFilters = [];
      state.tableTypeFilters = [];
      state.activityPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.activityPage = 1;
    },
    setActiveTab: (state, action: PayloadAction<'all' | 'my' | 'unassigned'>) => {
      state.activeTab = action.payload;
      state.activityPage = 1; // Reset pagination on tab change
    },
    setActivityPage: (state, action: PayloadAction<number>) => {
      state.activityPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.activityPage = 1; // reset to page 1
    },
    // Takes the filter values only, and keeps the current sort: the drawer has no
    // sort control, so replacing the whole object with its payload silently reset
    // the column sort every time someone pressed Apply.
    setAdvancedFilters: (state, action: PayloadAction<AdvancedFilterValues>) => {
      state.advancedFilters = withCurrentSort(action.payload, state.advancedFilters);
      state.activityPage = 1;
    },
    clearAdvancedFilters: (state) => {
      state.advancedFilters = withCurrentSort(DEFAULT_ADVANCED_FILTERS, state.advancedFilters);
      state.activityPage = 1;
    },
    // The toolbar's "Clear Filters" needs to reset every independent filter
    // surface (badges, column filters, advanced filters, search) in one go —
    // clearAdvancedFilters alone left tableStatusFilters/tableTypeFilters/
    // searchQuery untouched, so a bad value picked from a column filter survived
    // a "clear" and kept the same broken request firing.
    resetAllFilters: (state) => {
      state.searchQuery = '';
      state.tableStatusFilters = [];
      state.tableTypeFilters = [];
      state.advancedFilters = withCurrentSort(DEFAULT_ADVANCED_FILTERS, state.advancedFilters);
      state.activityPage = 1;
    },
    setLoanSort: (state, action: PayloadAction<{ sortBy?: 'loan_amount' | 'creation'; sortOrder?: 'asc' | 'desc' }>) => {
      if (action.payload.sortBy !== undefined) {
        state.advancedFilters.sortBy = action.payload.sortBy;
      } else {
        delete state.advancedFilters.sortBy;
      }
      if (action.payload.sortOrder !== undefined) {
        state.advancedFilters.sortOrder = action.payload.sortOrder;
      } else {
        delete state.advancedFilters.sortOrder;
      }
      state.activityPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLoans
      .addCase(fetchLoans.pending, (state, action) => {
        state.latestFetchRequestId = action.meta.requestId;
        state.isLoading = true;
        state.loansError = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        // Ignore a response for a request that's been superseded by a newer
        // one (e.g. updateLoanStatus's untracked refetch resolving after the
        // user has since changed filters) — only the latest dispatch may write.
        if (action.meta.requestId !== state.latestFetchRequestId) return;
        state.isLoading = false;
        state.rawActivityData = action.payload;

        // Union, never replace — see `knownLoanTypes`. A server-side filter on
        // loan_type would otherwise narrow its own option list to the one value
        // already chosen.
        for (const row of action.payload?.data ?? []) {
          const loanType = row.loan_type;
          if (loanType && !state.knownLoanTypes.includes(loanType)) {
            state.knownLoanTypes.push(loanType);
          }
        }
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        // Ignore aborted requests, and any response for a superseded request —
        // the newer request's pending/fulfilled owns the loading/error state.
        if (action.meta.aborted) return;
        if (action.meta.requestId !== state.latestFetchRequestId) return;
        state.isLoading = false;
        state.loansError = action.payload as string;
      })
      // fetchLoanSummary
      .addCase(fetchLoanSummary.pending, (state) => {
        state.isSummaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchLoanSummary.fulfilled, (state, action) => {
        state.isSummaryLoading = false;
        state.rawSummaryData = action.payload;
      })
      .addCase(fetchLoanSummary.rejected, (state, action) => {
        state.isSummaryLoading = false;
        state.summaryError = action.payload as string;
      });
  },
});

export const {
  setActivityPage,
  setActiveTab,
  setSearchQuery,
  toggleTableStatusFilter,
  toggleTableTypeFilter,
  setTableStatusFilters,
  setTableTypeFilters,
  clearTableFilters,
  setPageSize,
  setAdvancedFilters,
  clearAdvancedFilters,
  resetAllFilters,
  setLoanSort
} = loanDashboardSlice.actions;

// --- Basic Selectors ---
export const selectRawActivityData = (state: RootState) => state.loanDashboard.rawActivityData;
export const selectIsLoansLoading = (state: RootState) => state.loanDashboard.isLoading;
export const selectLoansError = (state: RootState) => state.loanDashboard.loansError;
export const selectRawSummaryData = (state: RootState) => state.loanDashboard.rawSummaryData;
export const selectLoanStages = (state: RootState) => state.loanDashboard.stages;
export const selectIsLoanStagesLoading = (state: RootState) => state.loanDashboard.isStagesLoading;
export const selectLoanStagesError = (state: RootState) => state.loanDashboard.stagesError;
export const selectActivityPage = (state: RootState) => state.loanDashboard.activityPage;
export const selectActiveTab = (state: RootState) => state.loanDashboard.activeTab;
export const selectSearchQuery = (state: RootState) => state.loanDashboard.searchQuery;
export const selectTableStatusFilters = (state: RootState) => state.loanDashboard.tableStatusFilters;
export const selectTableTypeFilters = (state: RootState) => state.loanDashboard.tableTypeFilters;
export const selectPageSize = (state: RootState) => state.loanDashboard.pageSize;
export const selectAdvancedFilters = (state: RootState) => state.loanDashboard.advancedFilters;
export const selectLoanSortBy = (state: RootState) => state.loanDashboard.advancedFilters.sortBy;
export const selectLoanSortOrder = (state: RootState) => state.loanDashboard.advancedFilters.sortOrder;
const selectKnownLoanTypes = (state: RootState) => state.loanDashboard.knownLoanTypes;

/**
 * Loan types offered by the LOAN TYPE column filter and the advanced-filters drawer.
 *
 * `loan_type` is a free-text `Data` field on A2C Loan Application, filled from
 * whatever the credit-information record carried — there is no enum to render, and
 * the six hardcoded strings that used to stand in for one matched no real record.
 * Everything seen so far, unioned with whatever is currently selected so a chosen
 * value is never missing from the list meant to let you unselect it.
 */
export const selectLoanTypeOptions = createSelector(
  [selectKnownLoanTypes, selectTableTypeFilters, selectAdvancedFilters],
  (known, tableTypes, advanced) =>
    Array.from(new Set([...known, ...tableTypes, ...advanced.type])).sort()
);

/** "Region · Woreda", skipping whichever levels the record has not reached yet. */
function formatLocation(row: LoanApplicationSummary): string {
  return [row.region, row.woreda].filter(Boolean).join(' · ');
}

export const selectLoanStageOptions = createSelector([selectLoanStages], (stages) => toStageFilterOptions(stages));

// --- Derived Memoized Selectors ---
export const selectPagedRowsData = createSelector(
  [selectRawActivityData, selectPageSize, selectLoanStages],
  (rawActivityData, _pageSize, stages) => {
    // fetchApi automatically unwraps the "message" envelope, so the data is directly on rawActivityData
    const rows = rawActivityData?.data || [];

    const totalCount = rawActivityData?.pagination?.total ?? 0;

    const mapped = rows.map((row: LoanApplicationSummary): MappedLoanRow => {
      const rawDate = row.creation ? new Date(row.creation) : new Date();
      const dateStr = rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = rawDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const appId = row.application_id || '';
      const formattedId = appId;

      const firstName = row.first_name || '';
      const lastName = row.last_name || '';
      const applicantName = `${firstName} ${lastName}`.trim();
      const location = formatLocation(row);
      // 'Active' is the state create_loan_application stamps, so it is the
      // fallback here — 'Draft' was never one of the four archetype states, and a
      // row falling back to it produced a status the filter could not express.
      const status = row.status || 'Active';

      // The badge text: the owning bank's label for the step when it has one,
      // otherwise the archetype. 'Draft' stood here as the fallback and was never
      // one of the four archetype states.
      const displayStatus = row.stage_label || status;
      const stageStyle = getStageStyle(row.stage_label || row.status || '', stages);

      return {
        ...row,
        id: formattedId,
        applicant: applicantName,
        phone: row.phone_number || '',
        loanAmount: row.loan_amount ? row.loan_amount.toLocaleString() : '—',
        type: row.loan_type || 'Unknown Type',
        // A dash, not an empty cell: the record genuinely carries no location yet.
        location: location || '—',
        // The archetype — what the status filter and the API speak. Kept distinct
        // from the badge text: assigning the stage label here made the value the
        // filter sends and the value the badge shows one and the same string, so
        // filtering by what you could see returned nothing.
        status,
        statusLabel: displayStatus,
        statusTone: stageStyle.tone,
        updated: `${dateStr} · ${timeStr}`,
        timestamp: rawDate.getTime(),
        action: 'View',
      };
    });

    const totalPages = rawActivityData?.pagination?.total_pages || 1;
    return { pagedRows: mapped, totalPages, totalCount };
  }
);

export const selectPagedRows = createSelector([selectPagedRowsData], (data) => data.pagedRows);
export const selectTotalPages = createSelector([selectPagedRowsData], (data) => data.totalPages);
export const selectTotalCount = createSelector([selectPagedRowsData], (data) => data.totalCount);

/**
 * KPI figures for the loan dashboard.
 */
export const selectLiveMetrics = createSelector(
  [selectRawSummaryData, selectLoanStages],
  (rawSummaryData, stages) => {
    // fetchApi automatically unwraps the "message" envelope
    const summaryData = rawSummaryData?.data;
    const byStatus = summaryData?.by_status;
    const show = (value: number | undefined) => (typeof value === 'number' ? value.toString() : '—');

    if (stages.length > 0) {
      let inTransition = 0;
      let completed = 0;
      let cancelled = 0;
      let total = 0;
      for (const stage of stages) {
        const count = stage.application_count ?? 0;
        total += count;
        if (stage.archetype_state === 'In Transition') inTransition += count;
        else if (stage.archetype_state === 'Completed') completed += count;
        else if (stage.archetype_state === 'Rejected' || stage.archetype_state === 'Cancelled') cancelled += count;
      }
      if (total > 0) {
        return {
          total: { value: total.toString() },
          in_transition: { value: inTransition.toString() },
          completed: { value: completed.toString() },
          cancelled: { value: cancelled.toString() },
        };
      }
    }

    return {
      total: { value: show(summaryData?.total) },
      in_transition: { value: show(byStatus?.['In Transition']) },
      completed: { value: show(byStatus?.['Completed']) },
      cancelled: { value: show(byStatus?.['Cancelled']) },
    };
  }
);

export const selectTabCounts = createSelector(
  [selectRawSummaryData],
  (rawSummaryData) => {
    const tc = rawSummaryData?.data?.tab_counts;
    return tc ?? null;
  }
);


export const selectQueryParams = createSelector(
  [selectActivityPage, selectPageSize, selectSearchQuery, selectActiveTab, selectTableStatusFilters, selectTableTypeFilters, selectAdvancedFilters],
  (activityPage, pageSize, searchQuery, activeTab, tableStatusFilters, tableTypeFilters, advancedFilters) => {
    const params: GetLoansParams = {
      page: activityPage,
      page_size: pageSize,
    };

    if (searchQuery) params.search_query = searchQuery;
    // Scope the queue server-side via loan_officer (get_all_loans): "My" → my
    // email, "Unassigned" → the literal 'unassigned', "All" → omit.
    if (activeTab === 'my') params.loan_officer = 'my';
    else if (activeTab === 'unassigned') params.loan_officer = 'unassigned';

    // The only date window is the one someone picked in the drawer. A default
    // "last 30 days" used to be applied here from a toolbar control that was never
    // rendered, so anything older was invisible with no filter chip to explain it.
    if (advancedFilters.dateFrom) {
      const datePart = advancedFilters.dateFrom.split('T')[0];
      if (datePart) params.from_date = datePart;
    }
    if (advancedFilters.dateTo) {
      const datePart = advancedFilters.dateTo.split('T')[0];
      if (datePart) params.to_date = datePart;
    }

    // Both status surfaces (the column dropdown and the drawer) send archetype
    // states straight through. They used to be mapped from badge *tones* into
    // display labels — 'Approved', 'Pending Review', 'Action Required' — none of
    // which are workflow states, so `GetAllLoansSchema` answered 400 and the list
    // showed an error instead of filtered rows. Sending nothing means "no status
    // filter", which is also what deselecting everything now means; the old
    // __NONE__ sentinel it sent instead was likewise rejected as an unknown state.
    const statuses = new Set([...tableStatusFilters, ...advancedFilters.status]);
    if (statuses.size > 0) {
      params.status = Array.from(statuses).join(',');
    }

    const types = new Set([...tableTypeFilters, ...advancedFilters.type]);
    if (types.size > 0) {
      params.loan_type = Array.from(types).join(',');
    }

    // `region`, not `location`: A2C Loan Application has no `location` column, and
    // naming one put a nonexistent column in the WHERE clause — a 500, not a filter.
    if (advancedFilters.region) {
      params.region = advancedFilters.region;
    }

    if (advancedFilters.minLoan !== null && advancedFilters.minLoan !== undefined) {
      params.min_loan_amount = String(advancedFilters.minLoan);
    }
    if (advancedFilters.maxLoan !== null && advancedFilters.maxLoan !== undefined) {
      params.max_loan_amount = String(advancedFilters.maxLoan);
    }

    if (advancedFilters.sortBy) {
      params.sort_by = advancedFilters.sortBy;
    }
    if (advancedFilters.sortOrder) {
      params.sort_order = advancedFilters.sortOrder;
    }

    return params;
  }
);

export const loanDashboardReducer = loanDashboardSlice.reducer;
