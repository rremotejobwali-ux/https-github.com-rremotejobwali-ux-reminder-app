export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO 8601 string
  completed: boolean;
  createdAt: string;
}

export interface AIReminderResponse {
  title: string;
  description?: string;
  dueDate?: string; // ISO 8601 string
  priority?: 'low' | 'medium' | 'high';
}

export enum FilterType {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}
