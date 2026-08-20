/**
 * Date and time utilities for BuzzerBet in Indochina Time (GMT/UTC +7).
 */

export const GMT7_OFFSET_MS = 7 * 60 * 60 * 1000;

export function getIndochinaDate(date = new Date()): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + GMT7_OFFSET_MS);
}

export function formatIndochinaTime(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatIndochinaDateOnly(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function calculateOpenTime(startTime: Date): Date {
  // 7 days before start time
  return new Date(startTime.getTime() - 7 * 24 * 60 * 60 * 1000);
}

export function calculateLockTime(startTime: Date): Date {
  // Exact tip-off start time
  return new Date(startTime.getTime());
}

export function isPredictionOpen(startTime: Date, now = new Date()): boolean {
  const openTime = calculateOpenTime(startTime);
  const lockTime = calculateLockTime(startTime);
  return now >= openTime && now < lockTime;
}

export function isMatchLocked(startTime: Date, now = new Date()): boolean {
  const lockTime = calculateLockTime(startTime);
  return now >= lockTime;
}
