
import React, { useState, useCallback } from 'react';
import { summarizeGitHubProfile } from './services/geminiService';
import { GithubIcon, SparklesIcon } from './components/Icons';
import { SummaryDisplay } from './components/SummaryDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';

const App: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username.');
      return;
    }
    setIsLoading(true);
    setSummary(null);
    setError(null);
    try {
      const result = await summarizeGitHubProfile(username);
      setSummary(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate summary. ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8 animate-fade-in-down">
          <div className="flex justify-center items-center gap-4 mb-2">
            <GithubIcon className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
              GitHub Skill Synthesizer
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Let Gemini AI summarize your developer skills from your public repositories.
          </p>
        </header>

        <main className="space-y-8">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username..."
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAnalyze()}
                className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-200"
                disabled={isLoading}
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>{isLoading ? 'Analyzing...' : 'Analyze Profile'}</span>
              </button>
            </div>
          </div>
          
          <div className="min-h-[300px]">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {summary && (
              <div className="animate-fade-in-up">
                 <SummaryDisplay summary={summary} />
              </div>
            )}
             {!isLoading && !error && !summary && (
                <div className="text-center text-gray-500 pt-16">
                    <p>Your skill summary will appear here.</p>
                </div>
            )}
          </div>
        </main>
      </div>
       <footer className="text-center mt-auto pt-8 text-gray-600 text-sm">
        <p>Powered by Gemini API. Analyzes public data from GitHub.</p>
      </footer>
    </div>
  );
};

export default App;
