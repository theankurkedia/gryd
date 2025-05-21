export enum DataSource {
  Manual = 'manual',
  GitHub = 'github',
}

export interface Habit {
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
}

export interface Completion {
  [key: string]: {
    [date: string]: number;
  };
}

export interface Storage {
  habits: Habit[];
  completions: Completion;
}
