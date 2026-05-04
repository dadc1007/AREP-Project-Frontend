import { useState } from "react";
import { TenantSelector } from "../components/TenantSelector";
import { FileUploader } from "../components/FileUploader";
import { QuestionBox } from "../components/QuestionBox";
import { AnswerViewer } from "../components/AnswerViewer";
import type { AskResponse } from "../types/api";

function App() {
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<AskResponse | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            RAG Multitenant
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Sube documentos y haz preguntas sobre tu base de conocimiento.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Configuración de Contexto</h2>
            <TenantSelector
              selectedTenant={selectedTenant}
              onTenantChange={(t) => {
                setSelectedTenant(t);
                setLastAnswer(null);
              }}
            />

            {selectedTenant && (
              <div className="pt-4 border-t dark:border-zinc-800">
                <FileUploader tenantId={selectedTenant} />
              </div>
            )}
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Asistente Virtual</h2>
            <QuestionBox
              tenantId={selectedTenant}
              onAnswerReceived={setLastAnswer}
            />
          </div>

          <AnswerViewer answerData={lastAnswer} />
        </div>
      </div>
    </div>
  );
}

export default App;
