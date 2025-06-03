import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Match } from '../domain/match';
import { Job } from '../domain/job';
import MatchingDashboard from '../components/dashboard/MatchingDashboard';
import JobSelector from '../components/forms/JobSelector';

interface HomePageProps {
  initialJobs: Job[];
}

const HomePage: React.FC<HomePageProps> = ({ initialJobs }) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleJobSelect = async (jobId: string) => {
    setSelectedJobId(jobId);
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          maxResults: 20,
          minScore: 0.3,
          includeInternal: true,
          includeExternal: true
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMatches(result.data.matches);
      } else {
        setError(result.error || 'Failed to find matches');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Talent Sonar - AI-Powered Talent Matching</title>
        <meta name="description" content="Discover hidden talent with AI-powered matching" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  🎯 Talent Sonar
                </h1>
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  AI-Powered
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Discover • Match • Engage
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Find Perfect Candidates
            </h2>
            <p className="text-gray-600 mb-6">
              Select a job position to discover internal talent and re-engage past candidates using AI-powered matching.
            </p>
            
            <JobSelector
              jobs={initialJobs}
              selectedJobId={selectedJobId}
              onJobSelect={handleJobSelect}
              loading={loading}
            />
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="text-red-800">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            </div>
          )}

          {selectedJobId && (
            <MatchingDashboard
              jobId={selectedJobId}
              matches={matches}
              loading={loading}
            />
          )}
        </main>
      </div>
    </>
  );
};

export async function getStaticProps() {
  // In a real app, this would fetch from your database
  const initialJobs: Job[] = [
    {
      id: 'job_1',
      title: 'Senior Full-Stack Developer',
      department: 'Engineering',
      location: 'Budapest',
      description: 'We are looking for a senior full-stack developer to join our team',
      requirements: [
        { skill: 'JavaScript', level: 'advanced', required: true, weight: 9 },
        { skill: 'React', level: 'advanced', required: true, weight: 8 },
        { skill: 'Node.js', level: 'intermediate', required: true, weight: 7 }
      ],
      employmentType: 'full-time',
      experienceLevel: 'senior',
      isInternal: false,
      postedDate: new Date(),
      status: 'open',
      hiringManager: 'Jane Doe'
    },
    {
      id: 'job_2',
      title: 'AI/ML Engineer',
      department: 'Data Science',
      location: 'Budapest',
      description: 'Join our AI team to build cutting-edge machine learning solutions',
      requirements: [
        { skill: 'Python', level: 'advanced', required: true, weight: 10 },
        { skill: 'Machine Learning', level: 'advanced', required: true, weight: 9 },
        { skill: 'TensorFlow', level: 'intermediate', required: true, weight: 8 }
      ],
      employmentType: 'full-time',
      experienceLevel: 'senior',
      isInternal: false,
      postedDate: new Date(),
      status: 'open',
      hiringManager: 'Bob Wilson'
    }
  ];

  return {
    props: {
      initialJobs
    }
  };
}

export default HomePage;
