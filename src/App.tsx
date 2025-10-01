import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ResumeUploader from "./features/interviewee/ResumeUploader";
import Dashboard from "./features/interviewer/Dashboard";
import InterviewChat from "./features/interviewee/InterviewChat";
import CandidateView from "./features/interviewer/CandidateView";
import MissingInfoCollector from "./features/interviewee/MissingInfoCollector";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navbar */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-indigo-600">
              Interview Assistant
            </h1>
            <div className="space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-indigo-600"
              >
                Interviewee
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600"
              >
                Interviewer
              </Link>
            </div>
          </nav>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Routes>
            {/* Interviewee default route */}
            <Route
              path="/"
              element={<ResumeUploader />}
            />

            {/* Interviewer Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/interview/:id/chat"
              element={<InterviewChat />}
            />

            <Route
              path="/interviewer"
              element={<Dashboard />}
            />
            <Route
              path="/interviewer/:id"
              element={<CandidateView />}
            />

            <Route
              path="/collect/:id"
              element={<MissingInfoCollector />}
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 text-center py-4 text-gray-500 text-sm">
          © {new Date().getFullYear()} AI Interview Assistant
        </footer>
      </div>
    </Router>
  );
}

export default App;
