import { useState, DragEvent, ChangeEvent } from 'react';
import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';
import { Match } from '../domain/match';

export default function Home() {
  const [candidate, setCandidate] = useState<Candidate>({
    id: 'temp',
    name: '',
    skills: [],
    experience: '',
    resumeText: ''
  });
  const [job, setJob] = useState<Job>({
    id: 'temp',
    title: '',
    description: '',
    requiredSkills: []
  });
  const [match, setMatch] = useState<Match | null>(null);
  const [outreach, setOutreach] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    const text = await file.text();
    setCandidate(prev => ({ ...prev, resumeText: text }));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const requestMatch = async () => {
    setLoading(true);
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidates: [{ ...candidate, skills: candidate.skills }],
        job
      })
    });
    const data = await res.json();
    setMatch(data.matches[0]);
    setLoading(false);
  };

  const requestOutreach = async () => {
    if (!match) return;
    const res = await fetch('/api/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate, job })
    });
    const data = await res.json();
    setOutreach(data.message);
  };

  const copyOutreach = async () => {
    await navigator.clipboard.writeText(outreach);
    alert('Copied to clipboard');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Talent Sonar</h1>
      <section style={{ marginBottom: '2rem' }}>
        <h2>Candidate Profile</h2>
        <input
          type="text"
          placeholder="Name"
          value={candidate.name}
          onChange={e => setCandidate({ ...candidate, name: e.target.value })}
          style={{ display: 'block', marginBottom: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={candidate.skills.join(', ')}
          onChange={e =>
            setCandidate({ ...candidate, skills: e.target.value.split(/,\s*/) })
          }
          style={{ display: 'block', marginBottom: '0.5rem' }}
        />
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          style={{
            border: '2px dashed #ccc',
            padding: '1rem',
            textAlign: 'center',
            marginBottom: '0.5rem'
          }}
        >
          Drag & drop resume here
          <input type="file" onChange={onFileChange} style={{ display: 'block', marginTop: '0.5rem' }} />
        </div>
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2>Job Description</h2>
        <input
          type="text"
          placeholder="Job Title"
          value={job.title}
          onChange={e => setJob({ ...job, title: e.target.value })}
          style={{ display: 'block', marginBottom: '0.5rem' }}
        />
        <textarea
          placeholder="Description"
          value={job.description}
          onChange={e => setJob({ ...job, description: e.target.value })}
          style={{ display: 'block', width: '100%', height: '100px', marginBottom: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Required Skills (comma separated)"
          value={job.requiredSkills.join(', ')}
          onChange={e =>
            setJob({ ...job, requiredSkills: e.target.value.split(/,\s*/) })
          }
          style={{ display: 'block', marginBottom: '0.5rem' }}
        />
      </section>
      <button onClick={requestMatch} disabled={loading} style={{ marginRight: '1rem' }}>
        {loading ? 'Matching...' : 'Match Candidate'}
      </button>
      {match && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Match Score: {(match.score * 100).toFixed(0)}%</h3>
          <p>{match.explanation}</p>
          <button onClick={requestOutreach} style={{ marginRight: '1rem' }}>
            Generate Outreach
          </button>
        </div>
      )}
      {outreach && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Outreach Message</h3>
          <textarea
            value={outreach}
            readOnly
            style={{ width: '100%', height: '100px' }}
          />
          <button onClick={copyOutreach}>Copy</button>
        </div>
      )}
    </div>
  );
}
