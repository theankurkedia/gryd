import { useState, useEffect } from 'react';

export function useGithubContribution(username: string, options?: any) {
  const [status, setStatus] = useState<{
    loading: boolean;
    error?: string;
    data?: any;
  }>({
    loading: false,
    data: undefined,
    error: undefined,
  });

  function fetchContributionData(username: string, options?: any) {
    setStatus({ loading: true });
    // Validate token
    const token = process.env.EXPO_PUBLIC_GITHUB_TOKEN;
    if (!token) {
      throw new Error(
        'GitHub token is not configured. Please set EXPO_PUBLIC_GITHUB_TOKEN in your .env file'
      );
    }

    fetch(`https://api.github.com/graphql`, {
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
      .then((res: any) => {
        setStatus({
          loading: false,
          data: res.data.user.contributionsCollection.contributionCalendar,
        });
      })
      .catch((err: Error) => {
        setStatus({
          loading: false,
          error:
            err instanceof Error
              ? err.message
              : 'Failed to fetch contribution data',
        });
      });
  }

  useEffect(() => {
    if (username) {
      fetchContributionData(username, options);
    }
  }, []);

  return { ...status, fetchNow: fetchContributionData };
}
