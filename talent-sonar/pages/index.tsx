import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';
import { Match } from '../domain/match';
import { matchCandidatesToJob } from '../application/matchCandidates';
import { draftOutreachMessage } from '../application/draftOutreach';
import { mockCandidates, mockJobs, getAllCandidates, getAllJobs, getJobById } from '../infrastructure/data'; // Using mock data

// Basic styling (can be moved to globals.css or a component-specific CSS module)
const styles = `
  .container {
    padding: 2rem;
    font-family: sans-serif;
  }
  .section {
    margin-bottom: 2rem;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 8px;
  }
  .section h2 {
    margin-top: 0;
  }
  .job-select, .candidate-list, .match-list {
    margin-bottom: 1rem;
  }
  .list-item {
    padding: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
  }
  .list-item:last-child {
    border-bottom: none;
  }
  .match-item {
    background-color: #f9f9f9;
  }
  .match-item strong {
    color: #0070f3;
  }
  .outreach-preview {
    white-space: pre-wrap;
    background-color: #fafafa;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
  }
  .button {
    background-color: #0070f3;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 0.5rem;
  }
  .button:hover {
    background-color: #005bb5;
  }
  .select {
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
`;

export default function HomePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchForOutreach, setSelectedMatchForOutreach] = useState<Match | null>(null);
  const [outreachMessage, setOutreachMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const fetchedCandidates = await getAllCandidates();
      const fetchedJobs = await getAllJobs();
      setCandidates(fetchedCandidates);
      setJobs(fetchedJobs);
      if (fetchedJobs.length > 0) {
        setSelectedJobId(fetchedJobs[0].id); // Select the first job by default
      }
    }
    loadData();
  }, []);

  const handleJobSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = event.target.value;
    setSelectedJobId(jobId);
    setMatches([]); // Clear previous matches
    setSelectedMatchForOutreach(null);
    setOutreachMessage(null);
  };

  const handleFindMatches = async () => {
    if (!selectedJobId) {
      alert('Please select a job first.');
      return;
    }
    const selectedJob = await getJobById(selectedJobId);
    if (selectedJob) {
      const currentMatches = matchCandidatesToJob(selectedJob, candidates);
      setMatches(currentMatches);
      setSelectedMatchForOutreach(null);
      setOutreachMessage(null);
    } else {
      alert('Selected job not found.');
    }
  };

  const handleDraftOutreach = (match: Match) => {
    const message = draftOutreachMessage(match);
    setSelectedMatchForOutreach(match);
    setOutreachMessage(`Subject: ${message.subject}\n\nTo: ${message.recipientEmail}\n\n${message.body}`);
  };

  const selectedJobDetails = jobs.find(j => j.id === selectedJobId);

  return (
    <>
      <Head>
        <title>Talent Sonar - Candidate Matching</title>
        <meta name="description" content="Find the best candidates for your jobs" />
        <style>{styles}</style>
      </Head>
      <div className="container">
        <h1>Talent Sonar</h1>

        <div className="section">
          <h2>Select Job</h2>
          {jobs.length > 0 ? (
            <select className="select" onChange={handleJobSelection} value={selectedJobId || ''}>
              <option value="" disabled>-- Select a Job --</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
          ) : (
            <p>Loading jobs...</p>
          )}
          {selectedJobDetails && (
            <div>
              <h3>{selectedJobDetails.title}</h3>
              <p>{selectedJobDetails.description}</p>
              <p><strong>Required Skills:</strong> {selectedJobDetails.requiredSkills.join(', ')}</p>
              <p><strong>Required Experience:</strong> {selectedJobDetails.requiredExperience} years</p>
            </div>
          )}
        </div>

        {selectedJobId && (
          <div className="section">
            <h2>Find Matches</h2>
            <button className="button" onClick={handleFindMatches} disabled={!selectedJobId}>
              Find Matches for "{selectedJobDetails?.title || 'Selected Job'}"
            </button>

            {matches.length > 0 && (
              <div className="match-list">
                <h3>Top Matches</h3>
                {matches.map(match => (
                  <div key={match.id} className="list-item match-item">
                    <p>
                      <strong>{match.candidate.name}</strong> - Score: {match.score}%
                    </p>
                    <p>Skills: {match.candidate.skills.join(', ')} | Experience: {match.candidate.experience} years</p>
                    <button className="button" onClick={() => handleDraftOutreach(match)}>Draft Outreach</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedMatchForOutreach && outreachMessage && (
          <div className="section">
            <h2>Outreach Message Preview</h2>
            <p>
              For: <strong>{selectedMatchForOutreach.candidate.name}</strong> <br />
              Job: <strong>{selectedMatchForOutreach.job.title}</strong>
            </p>
            <pre className="outreach-preview">{outreachMessage}</pre>
          </div>
        )}

        <div className="section">
          <h2>Available Candidates</h2>
          {candidates.length > 0 ? (
            <ul className="candidate-list">
              {candidates.map(candidate => (
                <li key={candidate.id} className="list-item">
                  {candidate.name} ({candidate.email}) - {candidate.skills.join(', ')} - Exp: {candidate.experience}
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading candidates...</p>
          )}
        </div>
      </div>
    </>
  );
}
