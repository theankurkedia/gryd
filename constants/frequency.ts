import { DataSource } from '@/types';

// Using the default frequency for the data source
export const DEFAULT_FREQUENCY = {
  [DataSource.GitHub]: 7,
  [DataSource.GitLab]: 30,
  [DataSource.Manual]: 1,
};
