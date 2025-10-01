import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export interface Question {
  id: string;
  text: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  startedAt?: number;
  answeredAt?: number;
  answerText?: string;
  score?: number;
  autoSubmitted?: boolean;
}

export interface Candidate {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  resumeText: string;
  questions: Question[];
  currentQuestionIndex: number;
  status: "in-progress" | "completed";
  finalScore?: number;
  finalSummary?: string;
  createdAt: number;
  updatedAt: number;
}

interface CandidatesState {
  byId: Record<string, Candidate>;
  allIds: string[];
}

const initialState: CandidatesState = {
  byId: {},
  allIds: [],
};

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    addCandidate: {
      reducer: (state, action: PayloadAction<Candidate>) => {
        const c = action.payload;
        state.byId[c.id] = c;
        state.allIds.unshift(c.id);
      },
      prepare: (data: {
        name: string | null;
        email: string | null;
        phone: string | null;
        resumeText: string;
      }) => {
        const id = uuidv4();
        return {
          payload: {
            id,
            ...data,
            questions: [],
            currentQuestionIndex: 0,
            status: "in-progress",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          } as Candidate,
        };
      },
    },

    updateCandidate(
      state,
      action: PayloadAction<{
        id: string;
        name?: string;
        email?: string;
        phone?: string;
      }>
    ) {
      const { id, name, email, phone } = action.payload;
      const candidate = state.byId[id];
      if (candidate) {
        if (name) candidate.name = name;
        if (email) candidate.email = email;
        if (phone) candidate.phone = phone;
      }
    },

    setQuestions: (
      state,
      action: PayloadAction<{ candidateId: string; questions: Question[] }>
    ) => {
      const { candidateId, questions } = action.payload;
      const c = state.byId[candidateId];
      if (!c) return;
      c.questions = questions;
      c.currentQuestionIndex = 0;
      c.updatedAt = Date.now();
    },

    // ⏱️ mark a question as started
    startQuestion: (
      state,
      action: PayloadAction<{
        candidateId: string;
        qIndex: number;
        question: Question;
      }>
    ) => {
      const { candidateId, qIndex } = action.payload;
      const c = state.byId[candidateId];
      if (!c) return;
      if (c.questions[qIndex]) {
        c.questions[qIndex].startedAt = Date.now();
        c.currentQuestionIndex = qIndex;
        c.updatedAt = Date.now();
      }
    },

    // 📝 submit or auto-submit an answer
    submitAnswer: (
      state,
      action: PayloadAction<{
        candidateId: string;
        qIndex: number;
        answerText: string;
        score: number;
        autoSubmitted: boolean;
      }>
    ) => {
      const { candidateId, qIndex, answerText, score, autoSubmitted } =
        action.payload;
      const c = state.byId[candidateId];
      if (!c) return;
      const q = c.questions[qIndex];
      if (!q) return;
      q.answeredAt = Date.now();
      q.answerText = answerText;
      q.score = score;
      q.autoSubmitted = autoSubmitted;
      c.updatedAt = Date.now();
    },

    // ✅ finalize interview
    finalizeCandidate: (
      state,
      action: PayloadAction<{
        candidateId: string;
        finalScore: number;
        finalSummary: string;
      }>
    ) => {
      const { candidateId, finalScore, finalSummary } = action.payload;
      const c = state.byId[candidateId];
      if (!c) return;
      c.finalScore = finalScore;
      c.finalSummary = finalSummary;
      c.status = "completed";
      c.updatedAt = Date.now();
    },

    setCurrentQuestionIndex: (
      state,
      action: PayloadAction<{ candidateId: string; qIndex: number }>
    ) => {
      const { candidateId, qIndex } = action.payload;
      const candidate = state.byId[candidateId];
      if (candidate) {
        candidate.currentQuestionIndex = qIndex;
      }
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  setQuestions,
  startQuestion,
  submitAnswer,
  finalizeCandidate,
  setCurrentQuestionIndex,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;
