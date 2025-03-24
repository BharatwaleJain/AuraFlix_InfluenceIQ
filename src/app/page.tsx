"use client";
import React, { useState } from 'react';
import Image from 'next/image';

interface CelebrityScore {
  familiarity: number;
  popularity: number;
  qScore: number;
}

interface SocialProfile {
  name: string;
  link: string;
  image?: string;
}

interface Celebrity {
  name: string;
  description: string;
  image: string;
  facts: string[];
  socialProfiles: SocialProfile[];
  score: CelebrityScore;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/celebrity?name=${encodeURIComponent(searchTerm)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API error response:', errorData);
        throw new Error(errorData?.error || 'Failed to fetch celebrity data');
      }

      const data = await response.json();
      setCelebrity(data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Could not find information for this celebrity');
      setCelebrity(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="pt-12 pb-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-indigo-600">InfluenceAI</h1>
          <p className="mt-2 text-gray-600">AI-Powered System That Ranks Who Really Matters!</p>
        </div>
      </header>

      {/* Search Section */}
      <main className="max-w-3xl mx-auto px-4 pb-16">
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter a celebrity name..."
              className="w-full px-6 py-4 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-center text-red-500">{error}</div>
          )}
        </div>

        {/* Results Section */}
        {celebrity && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:shrink-0">
                <div className="h-48 w-full md:h-full md:w-48 bg-gray-200 relative">
                  {celebrity.image ? (
                    <Image
                      src={celebrity.image}
                      alt={celebrity.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900">{celebrity.name}</h2>
                <p className="mt-2 text-gray-600">{celebrity.description || 'No description available'}</p>

                {/* Score Section */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">InfluenceAI Score</h3>

                  <div className="mt-4 space-y-4">
                    {/* Familiarity Score */}
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Familiarity</span>
                        <span className="text-sm font-medium text-gray-900">{celebrity.score.familiarity}%</span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-indigo-600 rounded-full transition-all duration-1000"
                          style={{ width: `${celebrity.score.familiarity}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Popularity Score */}
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Popularity</span>
                        <span className="text-sm font-medium text-gray-900">{celebrity.score.popularity}%</span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-indigo-600 rounded-full transition-all duration-1000"
                          style={{ width: `${celebrity.score.popularity}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Q-Score */}
                    <div className="mt-6 text-center">
                      <span className="text-sm font-medium text-gray-600">Q-Score</span>
                      <div className="text-4xl font-bold text-indigo-600 mt-1">{celebrity.score.qScore}</div>
                    </div>
                  </div>
                </div>

                {/* Facts Section */}
                {celebrity.facts && celebrity.facts.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Facts</h3>
                    <ul className="mt-4 space-y-2 text-gray-600">
                      {celebrity.facts.map((fact, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-indigo-600 mr-2">•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Social Profiles Section */}
                {celebrity.socialProfiles && celebrity.socialProfiles.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Social Profiles</h3>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {celebrity.socialProfiles.map((profile, index) => (
                        <a
                          key={index}
                          href={profile.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          {profile.image && (
                            <Image src={profile.image} alt={profile.name} width={20} height={20} className="w-5 h-5 mr-2" />
                          )}
                          <span>{profile.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
