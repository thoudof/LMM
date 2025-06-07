import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy', { locale: ru });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return dateString;
  }
};

export const getCurrentDate = (): string => {
  return new Date().toISOString();
};

export const formatDateForInput = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};