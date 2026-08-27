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

function getItemId(item: NotificationItem): string | undefined {
  return (
    item.name ||
    (item as { id?: string }).id ||
    (item as { notification_id?: string }).notification_id
  );
}

function isItemUnread(item: NotificationItem): boolean {
  const readVal = item.read as unknown;
  return (
    readVal === 0 ||
    readVal === false ||
    readVal === '0' ||
    readVal == null
  );
}

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
        
        const dataObj = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data) 
          ? payload.data as { notifications?: NotificationItem[]; unread_count?: number } 
          : null;

        const rawList = payload?.notifications ?? dataObj?.notifications ?? payload?.items ?? (Array.isArray(payload?.data) ? payload.data : undefined);
        
        const list: NotificationItem[] = Array.isArray(rawList)
          ? rawList
          : Array.isArray(payload)
            ? payload
            : [];
            
        state.items = list;
        state.unreadCount =
          typeof payload?.unread_count === 'number'
            ? payload.unread_count
            : typeof dataObj?.unread_count === 'number'
            ? dataObj.unread_count
            : list.filter(isItemUnread).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error fetching notifications';
      })
      // Mark Read (Optimistic on pending)
      .addCase(markNotificationsRead.pending, (state, action) => {
        const arg = action.meta.arg;
        if (arg.mark_all) {
          state.items.forEach((item) => {
            item.read = 1;
          });
          state.unreadCount = 0;
        } else if (arg.notification_ids?.length) {
          const ids = new Set(arg.notification_ids);
          state.items.forEach((item) => {
            const id = getItemId(item);
            if (id && ids.has(id)) {
              item.read = 1;
            }
          });
          state.unreadCount = state.items.filter(isItemUnread).length;
        }
      })
      // Clear Notifications (Optimistic on pending)
      .addCase(clearNotifications.pending, (state, action) => {
        const arg = action.meta.arg;
        if (arg.clear_all) {
          state.items = [];
          state.unreadCount = 0;
        } else if (arg.notification_ids?.length) {
          const ids = new Set(arg.notification_ids);
          state.items = state.items.filter((item) => {
            const id = getItemId(item);
            return !id || !ids.has(id);
          });
          state.unreadCount = state.items.filter(isItemUnread).length;
        }
      });
  },
});

export const notificationReducer = notificationSlice.reducer;
