export enum DataSource {
  Manual = 'manual',
  GitHub = 'github',
  GitLab = 'gitlab',
}

export interface PersistentHabit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  dailyReminderTime: string;
  dataSource: DataSource;
  // Identifier for the data source (e.g., username for GitHub/GitLab, API key for other services)
  dataSourceIdentifier?: string;
  frequency?: number;
}

export interface Habit extends PersistentHabit {
  loading?: boolean;
  error?: string;
}

export interface Completion extends Record<string, Record<string, number>> {}

export interface Storage {
  habits: Habit[];
  completions: Completion;
}

export interface Settings {
  weekStartsOnSunday?: boolean;
}
