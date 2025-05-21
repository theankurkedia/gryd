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
