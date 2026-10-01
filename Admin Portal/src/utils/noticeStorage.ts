import type { AdminNotice } from '../types/adminNotice';
import { mockAdminNotices } from '../data/mockAdminNotices';

export const NOTICES_STORAGE_KEY = 'icem_notices_v1';
const BROADCAST_CHANNEL_NAME = 'icem_notices_channel';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  broadcastChannel = null;
}

/**
 * Format helper: Converts ISO YYYY-MM-DD into "Oct 24, 2024"
 */
export const isoToDisplayDate = (isoStr?: string): string => {
  if (!isoStr) {
    const today = new Date();
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) {
    const d = new Date(isoStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return isoStr;
  }
  const [y, m, d] = isoStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format helper: Converts "Oct 24, 2024" or Date string into "2024-10-24" for <input type="date">
 */
export const displayDateToIso = (dateStr?: string): string => {
  if (!dateStr) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Format helper: Converts 12h "04:30 PM" into 24h "16:30" for <input type="time">
 */
export const time12To24 = (time12?: string): string => {
  if (!time12) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  const match = time12.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?$/);
  if (!match) return time12;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const modifier = match[3]?.toUpperCase();

  if (modifier) {
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
  }
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

/**
 * Format helper: Converts 24h "16:30" into 12h "04:30 PM"
 */
export const time24To12 = (time24?: string): string => {
  if (!time24) {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  const match = time24.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time24;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Retrieves all stored notices with fallback to default mock notices
 */
export const getStoredNotices = (): AdminNotice[] => {
  try {
    if (typeof window === 'undefined') return mockAdminNotices;
    const raw = localStorage.getItem(NOTICES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(mockAdminNotices));
      return mockAdminNotices;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return mockAdminNotices;
  } catch (err) {
    console.error('Failed to parse stored notices:', err);
    return mockAdminNotices;
  }
};

/**
 * Saves notices list and broadcasts updates
 */
export const saveStoredNotices = (notices: AdminNotice[]): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(notices));

    // Custom window event for same-window components
    window.dispatchEvent(
      new CustomEvent('icem-notices-update', {
        detail: notices,
      })
    );

    // Cross-tab broadcast
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'NOTICES_UPDATED',
        notices,
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error('Failed to save notices to localStorage:', err);
  }
};
