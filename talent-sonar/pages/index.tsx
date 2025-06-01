import React, { useState, useEffect } from 'react';
import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';
// Import sample data for now, later this could come from an API call
import { sampleCandidates, sampleJobs } from '../infrastructure/data';

export default function HomePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [matches, setMatches] = useState<any[]>([]); // Using any[] for matches for now
  const [outreachMessage, setOutreachMessage] = useState<string>('');

  useEffect(() => {
    // Load sample data on component mount
    setCandidates(sampleCandidates);
    setJobs(sampleJobs);
    if (sampleJobs.length > 0) {
      setSelectedJob(sampleJobs[0]); // Select the first job by default
    }
  }, []);

  const handleMatch = async () => {
    if (!selectedJob) {
      alert('Please select a job first.');
      return;
    }
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job: selectedJob, candidates }),
      });
      if (!response.ok) {
        throw new Error(`Match API failed: ${response.statusText}`);
      }
      const data = await response.json();
      setMatches(data.matches);
      setOutreachMessage(''); // Clear previous outreach message
    } catch (error) {
      console.error('Error matching candidates:', error);
      alert(`Error matching candidates: ${error instanceof Error ? error.message : String(error)}`);
      setMatches([]);
    }
  };

  const handleDraftOutreach = async (candidate: Candidate) => {
    if (!selectedJob) {
      alert('No job selected for outreach.'); // Should not happen if UI is correct
      return;
    }
    try {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, job: selectedJob }),
      });
      if (!response.ok) {
        throw new Error(`Outreach API failed: ${response.statusText}`);
      }
      const data = await response.json();
      setOutreachMessage(data.message);
    } catch (error) {
      console.error('Error drafting outreach:', error);
      alert(`Error drafting outreach: ${error instanceof Error ? error.message : String(error)}`);
      setOutreachMessage('Failed to draft outreach message.');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Talent Sonar</h1>

      <section style={{ marginBottom: '30px' }}>
        <h2>Select Job</h2>
        <select
          onChange={(e) => {
            const job = jobs.find(j => j.id === e.target.value) || null;
            setSelectedJob(job);
            setMatches([]); // Clear matches when job changes
            setOutreachMessage(''); // Clear outreach when job changes
          }}
          value={selectedJob?.id || ''}
          style={{ padding: '10px', minWidth: '300px' }}
        >
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
        {selectedJob && (
          <div style={{ marginTop: '10px' }}>
            <p><strong>Required Skills:</strong> {selectedJob.requiredSkills.join(', ')}</p>
            <p><strong>Minimum Experience:</strong> {selectedJob.minExperienceYears} years</p>
          </div>
        )}
      </section>

      <button
        onClick={handleMatch}
        disabled={!selectedJob}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginRight: '10px' }}
      >
        Match Candidates
      </button>

      {matches.length > 0 && (
        <section style={{ marginTop: '30px' }}>
          <h2>Matching Candidates</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {matches.map((match, index) => (
              <li key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                <p><strong>Candidate:</strong> {match.candidate.name} (Experience: {match.candidate.experienceYears} yrs)</p>
                <p><strong>Skills:</strong> {match.candidate.skills.join(', ')}</p>
                <p><strong>Match Score:</strong> {match.score}% {match.isStrongMatch ? '(Strong Match)' : ''}</p>
                <button
                  onClick={() => handleDraftOutreach(match.candidate)}
                  style={{ padding: '8px 15px', cursor: 'pointer' }}
                >
                  Draft Outreach
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outreachMessage && (
        <section style={{ marginTop: '30px', whiteSpace: 'pre-wrap', border: '1px solid #eee', padding: '15px', background: '#f9f9f9' }}>
          <h2>Outreach Message Draft</h2>
          <p>{outreachMessage}</p>
        </section>
      )}

      <footer style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '0.9em', color: '#777' }}>
        <p>Available Candidates:</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {candidates.map(c => (
            <li key={c.id}>{c.name} - Skills: {c.skills.join(', ')} - Exp: {c.experienceYears} yrs</li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
