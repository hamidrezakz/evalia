"use client";
import { useEffect, useState } from "react";
import type { Question } from "@/assessment/types/question-banks.types";
import { TextQuestion } from "./renderers/TextQuestion";
import { BooleanQuestion } from "./renderers/BooleanQuestion";
import { ScaleQuestion } from "./renderers/ScaleQuestion";
import { SingleChoiceQuestion } from "./renderers/SingleChoiceQuestion";
import { MultiChoiceQuestion } from "./renderers/MultiChoiceQuestion";
import type { AnswerRecord, OptionItem } from "./types";

interface Props {
  question: Question;
  record: AnswerRecord;
  ensureOptions: (q: Question) => Promise<OptionItem[] | null>;
  getOptionsSync: (questionId: number) => OptionItem[] | null | undefined;
  setValue: (
    q: Question,
    value: any,
    strategy: "immediate" | "debounce"
  ) => void;
  onFirstVisible?: () => void; // triggers remote answer lazy load
}

export function QuestionRenderer(props: Props) {
  const {
    question,
    ensureOptions,
    getOptionsSync,
    setValue,
    record,
    onFirstVisible,
  } = props;
  const [options, setOptions] = useState<OptionItem[] | null>();

  useEffect(() => {
    onFirstVisible?.();
    (async () => {
      const existing = getOptionsSync(question.id);
      if (existing !== undefined) {
        setOptions(existing);
      } else {
        const loaded = await ensureOptions(question);
        setOptions(loaded);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  switch (question.type) {
    case "TEXT":
      return (
        <TextQuestion
          question={question}
          record={record}
          setValue={setValue as any}
        />
      );
    case "BOOLEAN":
      return (
        <BooleanQuestion
          question={question}
          record={record}
          options={options || []}
          setValue={setValue as any}
        />
      );
    case "SCALE":
      return (
        <ScaleQuestion
          question={question}
          record={record}
          options={options || []}
          setValue={setValue as any}
        />
      );
    case "SINGLE_CHOICE":
      return (
        <SingleChoiceQuestion
          question={question}
          record={record}
          options={options || []}
          setValue={setValue as any}
        />
      );
    case "MULTI_CHOICE":
      return (
        <MultiChoiceQuestion
          question={question}
          record={record}
          options={options || []}
          setValue={setValue as any}
        />
      );
    default:
      return <div>Unsupported question type</div>;
  }
}
