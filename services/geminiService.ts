import { GoogleGenAI } from "@google/genai";
import { Repo } from '../types';
import { fetchUserRepos } from './githubService';

const buildPrompt = (username: string, repos: Repo[]): string => {
  if (repos.length === 0) {
    return `
      You are an expert tech recruiter.
      The user with GitHub username "${username}" has no public repositories.
      Please write a friendly message encouraging them to make some repositories public to be analyzed.
    `;
  }

  const repoDetails = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count) // Prioritize popular repos
    .map(repo => 
      `- **${repo.name}**: (Language: ${repo.language || 'N/A'}, Stars: ${repo.stargazers_count}) ${repo.description || ''}`
    )
    .join('\n');

  return `
    You are an expert tech recruiter and software engineering manager, skilled at analyzing developer profiles to understand their strengths.
    
    Your task is to generate a professional summary of a developer's skills and qualifications based on their GitHub repositories.
    The developer's username is "${username}".

    Here is a list of their repositories:
    ${repoDetails}

    Based on this information, generate a comprehensive summary. Structure your response with the following sections using Markdown formatting:

    ### Overall Summary
    A brief, one-paragraph overview of the developer's profile, highlighting their primary areas of expertise and estimated experience level (e.g., Junior, Mid-level, Senior).

    ### Key Technical Skills
    A bulleted list of the main programming languages, frameworks, and technologies demonstrated in the repositories. Group related skills (e.g., Frontend, Backend, etc.).
    
    ### Common Tools & Platforms
    A short paragraph identifying the most frequently used tools, libraries, and platforms across the projects (e.g., Node.js, React, MongoDB, Python data science stack).

    ### Project Breakdown
    Provide a detailed, bulleted list for the most significant repositories. For each repository, provide a more robust description that covers:
    - The project's main purpose and key features.
    - The specific skills and technologies the project demonstrates. Elaborate beyond just listing the language. For example, instead of just "JavaScript", you could say "Advanced JavaScript (ES6+), including asynchronous programming and DOM manipulation".
    Example:
    * **react-dashboard-pro**: This project is a professional dashboard template that demonstrates the developer's ability to build complex, data-driven user interfaces. It showcases strong skills in React for component-based architecture, TypeScript for building scalable and type-safe applications, and Recharts for creating interactive data visualizations. The project structure suggests a good understanding of modern frontend development practices.

    ### Estimated Skill Level
    Provide an estimated skill level (e.g., Mid-level, Senior) and a brief justification based on the project variety, technologies used, and code structure suggested by the repository descriptions.

    Be positive, professional, and use strong action verbs. Do not invent skills not supported by the repository data.
  `;
};

export const summarizeGitHubProfile = async (username: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const repos = await fetchUserRepos(username); 
  const prompt = buildPrompt(username, repos);
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not get a response from the AI model.");
  }
};