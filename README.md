### AI Interview Assistant (Interview)

An AI‑assisted mock interviewing app where candidates upload a resume, get auto‑generated questions, answer via text or voice, and receive an automatic summary and score. Interviewers can view candidate details, progress, and results.

### Tech Stack
- **Frontend framework**: React 19 + TypeScript
- **Build tooling**: Vite 7
- **UI library**: Ant Design 5, Lucide icons
- **Styling**: Tailwind CSS 4
- **State**: Redux Toolkit + Redux Persist (IndexedDB via localforage)
- **AI**: Google Gemini (`@google/generative-ai`) – requires API key
- **PDF/DOCX parsing**: `pdfjs-dist`, `mammoth`
- **Routing**: React Router 7

### Features
- **Resume upload (PDF/DOCX)** with basic validation and contact extraction
- **Auto question generation** (easy/medium/hard) using Gemini
- **Per‑question answering** with optional voice input and timers
- **Auto scoring and final summary** via Gemini
- **Interviewer dashboard** to review candidates, drill into details
- **Local persistence** so refresh doesn’t lose progress

### Quick Start
1. Install dependencies:
```bash
npm install
```
2. Create a `.env` file at project root with:
```bash
VITE_GEMINI_API_KEY=your_api_key_here
```
3. Run the dev server:
```bash
npm run dev
```
4. Open the app shown in the terminal (typically `http://localhost:5173`).

### Scripts
- `npm run dev`: start Vite dev server
- `npm run build`: type‑check and build production bundle
- `npm run preview`: preview the production build
- `npm run lint`: run ESLint

### Project Structure (high level)
- `src/app/store.ts`: Redux store with persistence
- `src/features/interviewee/ResumeUploader.tsx`: resume upload and parsing
- `src/features/interviewee/InterviewChat.tsx`: Q&A flow, timers, voice
- `src/features/interviewee/MissingInfoCollector.tsx`: capture missing contact fields
- `src/features/interviewer/Dashboard.tsx`: list candidates and statuses
- `src/features/interviewer/CandidateView.tsx`: candidate details and breakdown
- `src/api/gemini.ts`: Gemini integration for questions, scoring, summary
- `src/utils/*`: parsers and contact info extraction

### Environment & Notes
- Requires `VITE_GEMINI_API_KEY` for Google Gemini. Billing and access must be enabled.
- PDF parsing uses `pdfjs-dist`; DOCX uses `mammoth`. Complex resumes may parse imperfectly.
- Data persists locally in the browser (IndexedDB). Clear site data to reset.

### Accessibility & UX
- Keyboard and screen‑reader friendly UI via Ant Design components.
- Centered resume upload on the landing page for clear call‑to‑action.

### License
MIT (or update as appropriate).
