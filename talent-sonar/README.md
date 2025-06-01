# Talent Sonar

This project is a talent sourcing application designed to help recruiters find and reach out to suitable candidates for job openings.

## Features (Planned)

- Candidate matching based on skills and experience
- AI-powered outreach message drafting
- Vector database for semantic search of candidates and jobs

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install` (or `yarn install`)
3. Run the development server: `npm run dev` (or `yarn dev`)
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `domain/`: Core business logic and type definitions (Candidate, Job, Match).
- `application/`: Use cases and application-specific logic (matchCandidates, draftOutreach).
- `infrastructure/`: Data sources, external service clients (Gemini, VectorDB).
- `pages/`: Next.js pages and API routes.
  - `pages/api/`: Serverless functions for backend logic.
- `public/`: Static assets.
