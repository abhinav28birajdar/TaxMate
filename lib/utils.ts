import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for display
 * @param amount - The amount to format
 * @param currency - The currency code (default: INR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for display
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-IN', options).format(d);
}

/**
 * Format time for display
 * @param date - The date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date | string) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(d);
}

/**
 * Truncate text to a specific length
 * @param text - The text to truncate
 * @param length - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, length: number) {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Generate a random ID
 * @returns Random ID string
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Capitalize the first letter of each word
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export function capitalizeWords(str: string) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Convert minutes to hours and minutes format
 * @param minutes - The number of minutes
 * @returns Formatted string like "2 hrs 30 mins"
 */
export function minutesToHoursAndMinutes(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hrs === 0) return `${mins} mins`;
  if (mins === 0) return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
  
  return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ${mins} mins`;
}