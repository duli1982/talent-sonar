import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';
import { Match } from '../domain/match';
// getAllCandidates and getAllJobs will still be used directly for initial data loading
// as these are read-only operations and simplify the example.
// In a full app, these might also be API calls.
import { getAllCandidates, getAllJobs } from '../infrastructure/data';

// Basic styling (can be moved to globals.css or a component-specific CSS module)
const styles = `
  .container {
    padding: 2rem;
    font-family: sans-serif;
    max-width: 1000px;
    margin: 0 auto;
  }
  .section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  .section h2 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #0070f3;
    padding-bottom: 0.5rem;
  }
  .job-select-section, .match-results-section, .outreach-section, .candidate-list-section {
    margin-top: 1rem;
  }
  .job-details {
    background-color: #fff;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #eee;
    margin-top: 1rem;
  }
  .list-item {
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
    background-color: #fff;
  }
  .list-item:last-child {
    border-bottom: none;
  }
  .list-item:hover {
    background-color: #f0f8ff;
  }
  .match-item strong {
    color: #005bb5;
  }
  .outreach-preview {
    white-space: pre-wrap;
    background-color: #fff;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
    max-height: 300px;
    overflow-y: auto;
  }
  .button {
    background-color: #0070f3;
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 0.5rem;
    transition: background-color 0.2s ease;
  }
  .button:hover {
    background-color: #005bb5;
  }
  .button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  .select {
    padding: 0.6rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    min-width: 300px;
  }
  .error-message {
    color: red;
    margin: 1rem 0;
  }
  .loading-message {
    color: #555;
    margin: 1rem 0;
  }
`;

export default function HomePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchForOutreach, setSelectedMatchForOutreach] = useState<Match | null>(null);
  const [outreachMessage, setOutreachMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial jobs and candidates on component mount
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedJobs, fetchedCandidates] = await Promise.all([
          getAllJobs(),       // Direct call for simplicity
          getAllCandidates()  // Direct call for simplicity
        ]);
        setJobs(fetchedJobs);
        setCandidates(fetchedCandidates);
        if (fetchedJobs.length > 0) {
          setSelectedJobId(fetchedJobs[0].id);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load initial job and candidate data. Please try refreshing.");
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleJobSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = event.target.value;
    setSelectedJobId(jobId);
    setMatches([]); // Clear previous matches
    setSelectedMatchForOutreach(null);
    setOutreachMessage(null);
    setError(null); // Clear previous errors
  };

  const handleFindMatches = async () => {
    if (!selectedJobId) {
      setError('Please select a job first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMatches([]);
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selectedJobId }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to find matches (status ${response.status})`);
      }
      const currentMatches: Match[] = await response.json();
      setMatches(currentMatches);
      if (currentMatches.length === 0) {
        setError('No matches found for the selected job.');
      }
    } catch (err: any) {
      console.error("Failed to find matches:", err);
      setError(err.message || "An unexpected error occurred while finding matches.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftOutreach = async (match: Match) => {
    setIsLoading(true);
    setError(null);
    setOutreachMessage(null);
    setSelectedMatchForOutreach(match);
    try {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match }), // Send the whole match object
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to draft outreach (status ${response.status})`);
      }
      const message = await response.json();
      setOutreachMessage(`Subject: ${message.subject}\n\nTo: ${message.recipientEmail}\n\n${message.body}`);
    } catch (err: any) {
      console.error("Failed to draft outreach:", err);
      setError(err.message || "An unexpected error occurred while drafting outreach.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedJobDetails = jobs.find(j => j.id === selectedJobId);

  return (
    <>
      <Head>
        <title>Talent Sonar - Candidate Matching</title>
        <meta name="description" content="Find the best candidates for your jobs" />
        <style>{styles}</style> {/* For simplicity in this example */}
      </Head>
      <div className="container">
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1>Talent Sonar</h1>
          <p>AI-Powered Candidate Sourcing (Demo)</p>
        </header>

        {error && <p className="error-message">{error}</p>}
        {isLoading && <p className="loading-message">Loading...</p>}

        <div className="section job-select-section">
          <h2>1. Select a Job</h2>
          {jobs.length > 0 ? (
            <select className="select" onChange={handleJobSelection} value={selectedJobId || ''} disabled={isLoading}>
              <option value="" disabled>-- Select a Job --</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} at {job.company}
                </option>
              ))}
            </select>
          ) : (
            !isLoading && <p>No jobs available.</p>
          )}
          {selectedJobDetails && (
            <div className="job-details">
              <h3>{selectedJobDetails.title}</h3>
              <p>{selectedJobDetails.description}</p>
              <p><strong>Required Skills:</strong> {selectedJobDetails.requiredSkills.join(', ')}</p>
              <p><strong>Required Experience:</strong> {selectedJobDetails.requiredExperience} years</p>
            </div>
          )}
        </div>

        {selectedJobId && (
          <div className="section match-results-section">
            <h2>2. Find Candidate Matches</h2>
            <button className="button" onClick={handleFindMatches} disabled={!selectedJobId || isLoading}>
              Find Matches for "{selectedJobDetails?.title || 'Selected Job'}"
            </button>

            {matches.length > 0 && (
              <div className="match-list" style={{marginTop: '1rem'}}>
                <h3>Top Matches</h3>
                {matches.map(match => (
                  <div key={match.id} className="list-item match-item">
                    <p style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>
                        <strong>{match.candidate.name}</strong> (Score: {match.score}%)
                        <br />
                        <small>Skills: {match.candidate.skills.join(', ')} | Exp: {match.candidate.experience} yrs</small>
                      </span>
                      <button className="button" onClick={() => handleDraftOutreach(match)} disabled={isLoading}>
                        Draft Outreach
                      </button>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedMatchForOutreach && outreachMessage && (
          <div className="section outreach-section">
            <h2>3. Outreach Message Preview</h2>
            <p>
              For: <strong>{selectedMatchForOutreach.candidate.name}</strong> for the role of <strong>{selectedMatchForOutreach.job.title}</strong>
            </p>
            <pre className="outreach-preview">{outreachMessage}</pre>
          </div>
        )}

        <div className="section candidate-list-section">
          <h2>Available Candidates Pool</h2>
          {candidates.length > 0 ? (
            <ul className="candidate-list">
              {candidates.map(candidate => (
                <li key={candidate.id} className="list-item">
                  {candidate.name} ({candidate.email})
                  <br />
                  <small>Skills: {candidate.skills.join(', ')} | Exp: {candidate.experience} | Edu: {candidate.education}</small>
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && <p>No candidates available in the pool.</p>
          )}
        </div>
      </div>
    </>
  );
}
