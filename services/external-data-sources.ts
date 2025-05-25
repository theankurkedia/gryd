import { DataSource } from '@/types';

/**
 * Fetches user contribution data from external service (ex. GitLab/Github)
 * @param username - The external service (ex. GitLab/Github) username to fetch contributions for
 * @returns Promise with user contribution data
 */
export async function fetchExternalContributionData(
  service: Exclude<DataSource, 'manual'>,
  username: string
) {
  try {
    let contributionEndpoint;

    switch (service) {
      case DataSource.GitLab:
        contributionEndpoint = process.env.EXPO_PUBLIC_GITLAB_ACTIVITY_ENDPOINT;
        break;
      case DataSource.GitHub:
        contributionEndpoint = process.env.EXPO_PUBLIC_GITHUB_ACTIVITY_ENDPOINT;
        break;
      default:
        throw new Error(`Unsupported service: ${service}`);
    }

    const response = await fetch(
      `${contributionEndpoint}?username=${username}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch contributions: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${service} user contributions:`, error);
    throw error;
  }
}
