import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

// Define TypeScript interfaces for the contribution data
interface ContributionDay {
	date: string;
	contributionCount: number;
}

interface ContributionWeek {
	contributionDays: ContributionDay[];
}

interface ContributionCalendar {
	weeks: ContributionWeek[];
}

interface GitHubContributionsProps {
	username: string;
	token: string;
}

const GitHubContributions = ({ username, token }: GitHubContributionsProps) => {
	const [contributions, setContributions] = useState<
		ContributionCalendar | null
	>(null);

	useEffect(() => {
		const fetchContributions = async () => {
			const query = `
      {
        user(login: "${username}") {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }`;

			const response = await fetch("https://api.github.com/graphql", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query }),
			});

			const result = await response.json();
			setContributions(
				result.data.user.contributionsCollection.contributionCalendar,
			);
		};

		fetchContributions();
	}, [username, token]);

	if (!contributions) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: `repeat(7, 10px)`, // Smaller squares (10px wide)
					gap: "2px",
				}}
			>
				{contributions.weeks.map((week, i) => (
					<div key={i}>
						{week.contributionDays.map((day, j) => (
							<div
								key={j}
								style={{
									width: "6px",
									height: "6px",
									backgroundColor: getColorForContributions(
										day.contributionCount,
									),
									margin: "2px",
								}}
								title={`${day.date}: ${day.contributionCount} contributions`}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
};

// Helper function to color the boxes based on the number of contributions
const getColorForContributions = (count: number): string => {
	if (count > 10) return "#006d33"; // Dark green for high contributions
	if (count > 5) return "#006d33"; // Medium green
	if (count > 0) return "#0e4429"; // Light green
	return "#050505"; // Gray for no contributions
};

export default GitHubContributions;
