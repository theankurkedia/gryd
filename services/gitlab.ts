/**
 * Fetches user contribution data from GitLab calendar
 * @param username - The GitLab username to fetch contributions for
 * @returns Promise with user contribution data
 */
export async function fetchGitlabContributionData(username: string) {
  try {
    const response = await fetch(
      `https://gitlab.com/users/${username}/calendar.json`,
      {
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch contributions: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching GitLab user contributions:', error);
    throw error;
  }
}
