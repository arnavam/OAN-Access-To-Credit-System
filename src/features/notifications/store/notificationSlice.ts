import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    ClearNotificationsParams,
    GetNotificationsParams,
    GetNotificationsResponse,
    MarkReadParams,
    NotificationItem,
    notificationService
} from '../api/notification.service';

export interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk<
  GetNotificationsResponse,
  GetNotificationsParams | undefined,
  { rejectValue: string }
>('notifications/fetchNotifications', async (params, { rejectWithValue }) => {
  try {
    return await notificationService.getNotifications(params);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return rejectWithValue(message);
  }
});

export const markNotificationsRead = createAsyncThunk<
  MarkReadParams,
  MarkReadParams,
  { rejectValue: string }
>('notifications/markNotificationsRead', async (params, { rejectWithValue }) => {
  try {
    await notificationService.markRead(params);
    return params;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark notifications as read';
    return rejectWithValue(message);
  }
});

export const clearNotifications = createAsyncThunk<
  ClearNotificationsParams,
  ClearNotificationsParams,
  { rejectValue: string }
>('notifications/clearNotifications', async (params, { rejectWithValue }) => {
  try {
    await notificationService.clearNotifications(params);
    return params;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to clear notifications';
    return rejectWithValue(message);
  }
});

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<GetNotificationsResponse>) => {
        state.loading = false;
        const payload = action.payload;
        const rawList = payload?.notifications ?? payload?.items ?? payload?.data;
        const list: NotificationItem[] = Array.isArray(rawList)
          ? rawList
          : Array.isArray(payload)
            ? payload
            : [];
        state.items = list;
        state.unreadCount =
          typeof payload?.unread_count === 'number'
            ? payload.unread_count
            : list.filter((i) => i.read === 0).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error fetching notifications';
      })
      // Mark Read
      .addCase(markNotificationsRead.fulfilled, (state, action: PayloadAction<MarkReadParams>) => {
        if (action.payload.mark_all) {
          state.items.forEach((item) => {
            item.read = 1;
          });
          state.unreadCount = 0;
        } else if (action.payload.notification_ids?.length) {
          const ids = new Set(action.payload.notification_ids);
          state.items.forEach((item) => {
            if (ids.has(item.name) && item.read === 0) {
              item.read = 1;
            }
          });
          state.unreadCount = Math.max(0, state.unreadCount - ids.size);
        }
      })
      // Clear
      .addCase(clearNotifications.fulfilled, (state, action: PayloadAction<ClearNotificationsParams>) => {
        if (action.payload.clear_all) {
          state.items = [];
          state.unreadCount = 0;
        } else if (action.payload.notification_ids?.length) {
          const ids = new Set(action.payload.notification_ids);
          state.items = state.items.filter((item) => !ids.has(item.name));
          state.unreadCount = state.items.filter((item) => item.read === 0).length;
        }
      });
  },
});

export const notificationReducer = notificationSlice.reducer;
