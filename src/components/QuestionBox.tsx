import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { useAskQuestion } from "../hooks/useRAG";
import { sileo } from "sileo";
import type { AskResponse } from "../types/api";

interface Props {
  tenantId: string | null;
  onAnswerReceived: (answer: AskResponse | null) => void;
}

export function QuestionBox({ tenantId, onAnswerReceived }: Props) {
  const [question, setQuestion] = useState("");
  const askMutation = useAskQuestion();

  const handleAsk = () => {
    if (!tenantId) {
      sileo.error({ title: "Selecciona un tenant primero" });
      return;
    }
    if (!question.trim()) {
      sileo.error({ title: "Escribe una pregunta" });
      return;
    }

    const askPromise = askMutation.mutateAsync({
      tenant_id: tenantId,
      question,
    });

    onAnswerReceived(null);

    sileo
      .promise(askPromise, {
        loading: { title: "Pensando..." },
        success: { title: "Respuesta generada" },
        error: { title: "Error al generar la respuesta" },
      })
      .then((res) => {
        onAnswerReceived(res);
        setQuestion("");
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 w-full">
        <Input
          className="flex-1"
          placeholder="Haz una pregunta sobre los documentos..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAsk();
          }}
        />
        <Button
          onPress={handleAsk}
          isDisabled={!question.trim() || !tenantId || askMutation.isPending}
        >
          Preguntar
        </Button>
      </div>
    </div>
  );
}
