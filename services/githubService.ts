
import { Repo } from '../types';

const GITHUB_API_URL = 'https://api.github.com';

// This function fetches a user's public repositories from the GitHub API.
export const fetchUserRepos = async (username: string): Promise<Repo[]> => {
  try {
    const response = await fetch(`${GITHUB_API_URL}/users/${username}/repos?sort=updated&per_page=50`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`GitHub user "${username}" not found.`);
      }
      throw new Error(`Failed to fetch repositories. Status: ${response.status}`);
    }

    const data: any[] = await response.json();
    
    // Map the extensive data from GitHub API to our simpler Repo type
    const repos: Repo[] = data.map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
    }));

    return repos;
  } catch (error) {
    console.error("Error fetching from GitHub API:", error);
    if (error instanceof Error) {
        // Re-throw the specific error message for the UI to display
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while fetching GitHub data.");
  }
};
