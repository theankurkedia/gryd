export function transformGithubContributionData(ghData: any) {
  const result: { [key: string]: number } = {};

  ghData.forEach((week: any) => {
    week.contributionDays.forEach((day: any) => {
      if (day.contributionCount > 0) {
        result[day.date] = day.contributionCount;
      }
    });
  });

  return result;
}
