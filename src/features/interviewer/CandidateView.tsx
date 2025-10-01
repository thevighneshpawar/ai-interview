import React from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, Tag } from "antd";
import type { RootState } from "../../app/store";

export default function CandidateView() {
  const { id } = useParams<{ id: string }>();
  const candidate = useSelector((s: RootState) =>
    id ? s.candidates.byId[id] : null
  );

  if (!candidate) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500">Candidate not found</p>
        <Link
          to="/interviewer"
          className="text-indigo-600 underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <Card>
        <h2 className="text-xl font-bold">{candidate.name || "Unnamed"}</h2>
        <p>{candidate.email}</p>
        <p>{candidate.phone}</p>
        <Tag
          color={candidate.status === "completed" ? "green" : "blue"}
          className="mt-2"
        >
          {candidate.status.toUpperCase()}
        </Tag>
      </Card>

      {candidate.finalSummary && (
        <Card className="bg-green-50">
          <h3 className="font-bold text-green-700">
            Final Score: {candidate.finalScore}
          </h3>
          <p className="mt-2 text-green-800">{candidate.finalSummary}</p>
        </Card>
      )}

      <Card>
        <h3 className="font-semibold mb-3">Question Breakdown</h3>
        {candidate.questions.map((q, i) => (
          <div
            key={q.id}
            className="border-b pb-3 mb-3"
          >
            <p className="font-medium">
              Q{i + 1}: {q.text}
            </p>
            <p className="mt-1 text-gray-700">
              <span className="font-semibold">Answer:</span>{" "}
              {q.answerText || "—"}
            </p>
            <p className="text-sm text-gray-500">
              Score: {q.score ?? "—"} {q.autoSubmitted ? "(auto)" : ""}
            </p>
          </div>
        ))}
      </Card>

      <Link
        to="/interviewer"
        className="text-indigo-600 underline"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
