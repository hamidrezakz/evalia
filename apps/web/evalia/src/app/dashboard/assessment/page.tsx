"use client";

import React from "react";
import { AssessmentForm } from "@/assessment/components/assessment";
import type { Question } from "@/assessment/types/question-banks.types";

// Temporary mock question list (replace with server fetch / query hook)
const mockQuestions: Question[] = [
  {
    id: 1,
    bankId: 10,
    text: "در یک جمله حال عمومی امروز خود را توصیف کنید",
    type: "TEXT",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    bankId: 10,
    text: "آیا از همکاری تیم فعلی خود رضایت دارید؟",
    type: "BOOLEAN",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    bankId: 10,
    text: "میزان تمرکز شما امروز",
    type: "SCALE",
    minScale: 1,
    maxScale: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    bankId: 10,
    text: "مهم‌ترین مانع هفته جاری چیست؟",
    type: "SINGLE_CHOICE",
    optionSetId: 101, // will be loaded
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    bankId: 10,
    text: "کدام موارد نیاز به بهبود دارند؟",
    type: "MULTI_CHOICE",
    optionSetId: 102,
    createdAt: new Date().toISOString(),
  },
];

// Simulated persistence (in-memory for demo)
const memoryStore: Record<number, { id: number; value: any }> = {};
let answerIdSeq = 1;

async function loadAnswer(question: Question) {
  await delay(150); // simulate latency
  const found = memoryStore[question.id];
  if (!found) return null;
  return { id: found.id, value: found.value };
}

async function submitAnswer(
  question: Question,
  value: any,
  ctx: { previous?: any }
) {
  await delay(300);
  // Interpret value per type
  let normalized = value;
  if (question.type === "BOOLEAN") {
    if (value === "true") normalized = true;
    else if (value === "false") normalized = false;
  } else if (question.type === "SCALE") {
    normalized = Number(value);
  }
  const existing = memoryStore[question.id];
  if (existing) {
    existing.value = normalized;
    return { id: existing.id, value: normalized };
  }
  const id = answerIdSeq++;
  memoryStore[question.id] = { id, value: normalized };
  return { id, value: normalized };
}

async function loadOptionSet(optionSetId: number) {
  await delay(120);
  if (optionSetId === 101) {
    return [
      { value: "FOCUS", label: "تمرکز" },
      { value: "TIME", label: "زمان" },
      { value: "PROCESS", label: "فرآیند" },
    ];
  }
  if (optionSetId === 102) {
    return [
      { value: "COMM", label: "ارتباطات" },
      { value: "ALIGN", label: "هم‌راستایی" },
      { value: "TOOLS", label: "ابزارها" },
      { value: "CLARITY", label: "وضوح نقش" },
    ];
  }
  return [];
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function AssessmentDemoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">آزمون نمونه</h1>
      <AssessmentForm
        questions={mockQuestions}
        loadAnswer={loadAnswer}
        submitAnswer={submitAnswer}
        loadOptionSet={loadOptionSet}
        generatedOptions={{ defaultScaleMin: 1, defaultScaleMax: 5 }}
        onQuestionStatusChange={(rec) => {
          // eslint-disable-next-line no-console
          console.log("STATUS", rec.questionId, rec.status, rec.value);
        }}
      />
    </div>
  );
}
