# Talent Sonar Project

This project is a Talent Sonar application built with Next.js.

## Project Structure

```markdown
talent-sonar/
┣ .env.example
┣ .eslintrc.json
┣ .gitignore
┣ next.config.mjs
┣ package.json
┣ postcss.config.mjs
┣ README.md
┣ tailwind.config.ts
┣ tsconfig.json
┣ application/
┃ ┣ .gitkeep
┃ ┣ services/
┃ ┃ ┣ matchingService.ts
┃ ┃ ┣ outreachService.ts
┃ ┃ ┗ talentAnalysisService.ts
┃ ┗ useCases/
┃   ┣ findInternalCandidates.ts
┃   ┗ rediscoverPastCandidates.ts
┣ components/
┃ ┣ .gitkeep
┃ ┣ dashboard/
┃ ┃ ┗ .gitkeep
┃ ┣ matching/
┃ ┃ ┗ .gitkeep
┃ ┗ outreach/
┃   ┗ .gitkeep
┣ data/
┃ ┣ .gitkeep
┃ ┣ sampleCandidates.json
┃ ┣ sampleEmployees.json
┃ ┗ sampleJobs.json
┣ domain/
┃ ┣ .gitkeep
┃ ┣ candidate.ts
┃ ┣ employee.ts
┃ ┣ job.ts
┃ ┗ match.ts
┣ infrastructure/
┃ ┣ .gitkeep
┃ ┣ ai/
┃ ┃ ┣ embeddingService.ts
┃ ┃ ┣ geminiClient.ts
┃ ┃ ┗ langchainOrchestrator.ts
┃ ┣ database/
┃ ┃ ┣ dataRepository.ts
┃ ┃ ┗ vectorDb.ts
┃ ┗ external/
┃   ┗ atsIntegration.ts
┣ lib/
┃ ┣ .gitkeep
┃ ┣ constants.ts
┃ ┣ types.ts
┃ ┗ utils.ts
┣ public/
┃ ┣ favicon.ico
┃ ┣ next.svg
┃ ┗ vercel.svg
┗ src/
  ┗ app/
    ┣ api/
    ┃ ┣ candidates/
    ┃ ┃ ┣ external/
    ┃ ┃ ┃ ┗ route.ts
    ┃ ┃ ┗ internal/
    ┃ ┃   ┗ route.ts
    ┃ ┣ matching/
    ┃ ┃ ┣ find-matches/
    ┃ ┃ ┃ ┗ route.ts
    ┃ ┃ ┗ rank-candidates/
    ┃ ┃   ┗ route.ts
    ┃ ┗ outreach/
    ┃   ┣ generate/
    ┃   ┃ ┗ route.ts
    ┃   ┗ send/
    ┃     ┗ route.ts
    ┣ dashboard/
    ┃ ┗ page.tsx
    ┣ favicon.ico
    ┣ globals.css
    ┣ layout.tsx
    ┗ page.tsx
```
