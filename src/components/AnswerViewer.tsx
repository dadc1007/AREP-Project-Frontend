import type { AskResponse } from "../types/api";

interface Props {
  answerData: AskResponse | null;
}

export function AnswerViewer({ answerData }: Props) {
  if (!answerData) return null;

  return (
    <div className="flex flex-col gap-4 p-6 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-sm mt-4">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Pregunta
        </h4>
        <p className="text-lg font-medium">{answerData.question}</p>
      </div>

      <div className="flex flex-col gap-1 mt-2">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Respuesta
        </h4>
        <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
          {answerData.answer}
        </p>
      </div>

      {answerData.sources && answerData.sources.length > 0 && (
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t dark:border-zinc-800">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Fuentes
          </h4>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {answerData.sources.map((source, index) => (
              <li key={index} className="truncate" title={source}>
                {source}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
