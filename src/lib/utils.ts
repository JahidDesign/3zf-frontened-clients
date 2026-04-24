import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const timeAgo = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: enUS });

export const formatDate = (date: string | Date, fmt = 'PPP') =>
  format(new Date(date), fmt);

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), 'PPp');

export const formatBDT = (amount: number) =>
  `৳${amount.toLocaleString('en-IN')}`;

export const truncate = (str: string, n: number) =>
  str.length > n ? `${str.substring(0, n)}...` : str;

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const fileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
