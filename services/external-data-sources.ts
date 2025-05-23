import { transformGithubContributionData } from '@/utils/transformer';

export function fetchGithubContributionData(username: string) {
  // Validate token
  const token = process.env.EXPO_PUBLIC_GITHUB_TOKEN;
  if (!token) {
    throw new Error('No token found');
  }

  return fetch(`https://api.github.com/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      query: `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    color
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        username,
      },
    }),
  })
    .then((res: any) => res.json())
    .then(
      (res: any) =>
        res.data.user.contributionsCollection.contributionCalendar.weeks
    )
    .then((data: any) => transformGithubContributionData(data))
    .catch((err: Error) => {
      console.error(err);
      throw err;
    });
}

/**
 * Fetches user contribution data from GitLab calendar
 * @param username - The GitLab username to fetch contributions for
 * @returns Promise with user contribution data
 */
export async function fetchGitlabContributionData(username: string) {
  try {
    const gitlabActivityEndpoint =
      process.env.EXPO_PUBLIC_GITLAB_ACTIVITY_ENDPOINT;
    const response = await fetch(
      `${gitlabActivityEndpoint}?username=${username}`
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
