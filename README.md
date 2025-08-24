# Talent Sonar

Talent Sonar is a simple recruiting assistant built with Next.js and TypeScript. It matches candidates to jobs and drafts AI-powered outreach messages using Google's Gemini models.

## Features
- Upload candidate resumes via drag & drop
- Enter job descriptions and required skills
- See match scores and explanations
- Generate personalized outreach messages
- Copy outreach content for external use

## Project Structure
```
talent-sonar/
┣ domain/
┃ ┣ candidate.ts
┃ ┣ job.ts
┃ ┗ match.ts
┣ application/
┃ ┣ matchCandidates.ts
┃ ┗ draftOutreach.ts
┣ infrastructure/
┃ ┣ data.ts
┃ ┗ geminiClient.ts
┣ pages/
┃ ┣ index.tsx
┃ ┗ api/
┃    ┣ match.ts
┃    ┗ outreach.ts
┣ public/
┣ README.md
┣ package.json
┣ tsconfig.json
```

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Provide a Gemini API key:
   ```bash
   export GEMINI_API_KEY="your-key"
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Example Data
Sample candidate and job data are available in `infrastructure/data.ts` for experimentation.

## Testing
Type checking is provided through the build script:
```bash
npm run build
```

## Deployment
The project uses standard Next.js commands. After building, deploy the `.next` output using your preferred hosting provider.
