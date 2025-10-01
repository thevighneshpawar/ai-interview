"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Card, Input, Button, Progress, Spin, message } from "antd";
import { Mic, StopCircle } from "lucide-react";
import type { RootState, AppDispatch } from "../../app/store";

import {
  setQuestions,
  startQuestion,
  submitAnswer,
  finalizeCandidate,
} from "../candidatesSlice";
import { generateQuestions, summarizeInterview } from "../../api/gemini";

const DIFFICULTY_TO_SECONDS: Record<string, number> = {
  easy: 20,
  medium: 60,
  hard: 120,
};

export default function InterviewChat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const candidate = useSelector((s: RootState) =>
    id ? s.candidates.byId[id] : null
  );

  const [localAnswer, setLocalAnswer] = useState("");
  const [loadingQ, setLoadingQ] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Voice recognition
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  const [remaining, setRemaining] = useState(0);

  // Refs to guard API calls and summarization
  const genForRef = useRef<string | null>(null);
  const summarizingRef = useRef(false);

  // 🎤 Setup speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = true; // faster feedback
    rec.continuous = true; // keep session alive
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsRecording(true);
    };

    rec.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + res[0].transcript;
        }
      }
      if (finalTranscript) {
        setLocalAnswer((prev) =>
          prev ? prev + " " + finalTranscript : finalTranscript
        );
      }
    };

    rec.onerror = (e: any) => {
      console.error("Speech recognition error", e);
      message.error("Speech recognition error");
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    return () => {
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      try {
        rec.stop();
      } catch {}
    };
  }, [candidate]); // Updated dependency array

  const startRecording = () => {
    if (!recognitionRef.current) {
      message.warning("Voice recording not supported in this browser.");
      return;
    }

    // start timer on first user action (recording)
    if (candidate && candidate.currentQuestionIndex !== undefined) {
      const qIndex = candidate.currentQuestionIndex;
      const currentQ = candidate.questions[qIndex];
      if (currentQ && !currentQ.startedAt) {
        dispatch(
          startQuestion({
            candidateId: candidate.id,
            qIndex,
            question: currentQ,
          })
        );
      }
    }

    try {
      recognitionRef.current.start();
    } catch (err: any) {
      // Ignore 'not-allowed' or 'already-started' errors gracefully
      if (
        err &&
        String(err.message || "")
          .toLowerCase()
          .includes("start")
      ) {
        console.warn("[v0] Recognition already started, ignoring");
      } else {
        console.error(err);
        message.error("Unable to start recording");
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      try {
        // ensure we fully end the session to avoid lingering delays
        recognitionRef.current.abort?.();
      } catch {}
    }
    setIsRecording(false);
  };

  // 🧭 Load questions on first mount
  useEffect(() => {
    if (!candidate) return;

    if (
      candidate.questions.length === 0 &&
      genForRef.current !== candidate.id
    ) {
      setLoadingQ(true);
      generateQuestions()
        .then((qs) => {
          const prepared = qs.map((q: any, idx: number) => ({
            id: `q-${idx}-${Date.now()}`,
            text: q.text,
            difficulty: q.difficulty,
            timeLimit: DIFFICULTY_TO_SECONDS[q.difficulty] || 60,
          }));
          dispatch(
            setQuestions({ candidateId: candidate.id, questions: prepared })
          );
          genForRef.current = candidate.id; // mark generated for this candidate
        })
        .finally(() => setLoadingQ(false));
    }
  }, [candidate, genForRef.current, dispatch]); // Updated dependency array

  // ⏳ Timer logic
  useEffect(() => {
    if (!candidate) return;
    const qIndex = candidate.currentQuestionIndex || 0;
    const q = candidate.questions[qIndex];
    if (!q || !q.startedAt) return; // only after start

    const startedAt = q.startedAt;
    const timeLimit = q.timeLimit;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const rem = Math.max(0, timeLimit - elapsed);
      setRemaining(rem);

      if (rem <= 0) {
        clearInterval(interval);
        handleSubmit(true); // auto-submit
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [candidate]); // Updated dependency array

  // Ensure remaining resets to full time when a question starts
  useEffect(() => {
    if (!candidate) return;
    const idx = candidate.currentQuestionIndex || 0;
    const q = candidate.questions[idx];
    if (q?.startedAt) {
      setRemaining(q.timeLimit);
    } else {
      setRemaining(0);
    }
  }, [candidate]); // Updated dependency array

  if (!candidate) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500">Candidate not found</p>
        <Button onClick={() => navigate("/")}>Back</Button>
      </div>
    );
  }

  if (loadingQ) {
    return (
      <div className="text-center mt-20">
        <Spin size="large" />
        <p className="mt-4">Generating interview questions…</p>
      </div>
    );
  }

  const qIndex = candidate.currentQuestionIndex || 0;
  const currentQ = candidate.questions[qIndex];

  // Submit handler
  const handleSubmit = async (auto = false) => {
    if (!currentQ) return;
    setSubmitting(true);

    stopRecording();

    try {
      dispatch(
        submitAnswer({
          candidateId: candidate.id,
          qIndex,
          answerText: localAnswer || "",
          score: 0,
          autoSubmitted: auto,
        })
      );

      const isLast = qIndex >= candidate.questions.length - 1;

      if (isLast) {
        if (!candidate.finalSummary && !summarizingRef.current) {
          summarizingRef.current = true;
          const qa = candidate.questions.map((q, i) => ({
            question: q.text,
            answer: i === qIndex ? localAnswer || "" : q.answerText || "",
            score: q.score ?? 0,
          }));
          const summary = await summarizeInterview(qa);
          dispatch(
            finalizeCandidate({
              candidateId: candidate.id,
              finalScore: summary.finalScore,
              finalSummary: summary.summary,
            })
          );
          message.success("Interview completed!");
          summarizingRef.current = false;
        }
      } else {
        // ✅ only change index, don’t start timer
        dispatch({
          type: "candidates/setCurrentQuestionIndex",
          payload: { candidateId: candidate.id, qIndex: qIndex + 1 },
        });
      }
    } finally {
      setSubmitting(false);
      setLocalAnswer("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!localAnswer && currentQ && !currentQ.startedAt) {
      dispatch(
        startQuestion({ candidateId: candidate.id, qIndex, question: currentQ })
      );
    }

    setLocalAnswer(e.target.value);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Card className="shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Interview — {candidate.name || "Candidate"}
          </h2>
          <Progress
            type="circle"
            percent={Math.round(
              ((qIndex + 1) / candidate.questions.length) * 100
            )}
            width={60}
            strokeColor="#6366f1"
          />
        </div>

        {currentQ && (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-gray-700">
                Q{qIndex + 1}: {currentQ.text}
              </span>
              <span
                role="status"
                aria-live="polite"
                className={`px-4 py-1 rounded-full text-white font-bold ${
                  remaining <= 5 && currentQ?.startedAt
                    ? "bg-red-500 animate-pulse"
                    : "bg-indigo-600"
                }`}
              >
                {currentQ?.startedAt ? `⏳ ${remaining}s` : "⏳ Waiting…"}
              </span>
            </div>

            <Input.TextArea
              rows={6}
              placeholder="Type your answer..."
              value={localAnswer}
              onChange={handleChange}
              className="mb-4 text-lg"
            />

            <div className="flex gap-4 items-center">
              {!isRecording ? (
                <Button
                  type="default"
                  icon={<Mic className="w-4 h-4" />}
                  onClick={startRecording}
                  aria-label="Start recording"
                >
                  Record
                </Button>
              ) : (
                <>
                  <Button
                    danger
                    icon={<StopCircle className="w-4 h-4" />}
                    onClick={stopRecording}
                    aria-label="Stop recording"
                  >
                    Stop
                  </Button>
                  {/* Recording status */}
                  <span
                    className="flex items-center gap-2 text-red-600 font-semibold"
                    aria-live="assertive"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    Recording…
                  </span>
                </>
              )}
              <Button
                type="primary"
                onClick={() => handleSubmit(false)}
                loading={submitting}
                className="ml-auto"
              >
                Submit
              </Button>
            </div>
          </>
        )}

        {candidate.finalSummary && (
          <div className="mt-8 p-6 bg-green-50 rounded-xl">
            <h3 className="text-2xl font-bold text-green-700">
              Final Score: {candidate.finalScore}
            </h3>
            <p className="mt-2 text-green-800">{candidate.finalSummary}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
