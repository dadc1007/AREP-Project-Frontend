import { useState, useMemo } from "react";
import { useEvaluationResults, useRunEvaluation } from "../hooks/useRAG";
import { useQueryClient } from "@tanstack/react-query";
import { Button, TextArea } from "@heroui/react";
import { sileo } from "sileo";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

export function EvaluationDashboard() {
  const { data, isLoading, error } = useEvaluationResults();

  const [dataset, setDataset] = useState([
    { question: "", expected_answer: "" },
  ]);

  const { latestResults, timelineData, tenants } = useMemo(() => {
    if (!data?.history) {
      return { latestResults: [], timelineData: [], tenants: [] };
    }

    const history = [...data.history].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    // Get unique tenants
    const tenantSet = new Set<string>();
    history.forEach((item) => tenantSet.add(item.tenant_id));
    const tenants = Array.from(tenantSet);

    // Latest results per tenant for Bar Chart and Table
    const latestMap = new Map<string, (typeof history)[0]>();
    history.forEach((item) => {
      latestMap.set(item.tenant_id, item);
    });
    const latestResults = Array.from(latestMap.values());

    // Format data for Line Chart (Historical)

    const timelineData = history.map((item) => ({
      timestamp: new Date(item.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      [item.tenant_id]: item.avg_relevance,
      rawTime: new Date(item.timestamp).getTime(),
    }));

    return { latestResults, timelineData, tenants };
  }, [data]);

  const { mutateAsync: runEvaluation, isPending: isRunning } =
    useRunEvaluation();
  const queryClient = useQueryClient();

  const updateDatasetItem = (
    index: number,
    field: "question" | "expected_answer",
    value: string,
  ) => {
    const newDataset = [...dataset];
    newDataset[index][field] = value;
    setDataset(newDataset);
  };

  const addDatasetItem = () => {
    setDataset([...dataset, { question: "", expected_answer: "" }]);
  };

  const removeDatasetItem = (index: number) => {
    setDataset(dataset.filter((_, i) => i !== index));
  };

  const handleRunEvaluation = () => {
    if (
      dataset.some(
        (item) => !item.question.trim() || !item.expected_answer.trim(),
      )
    ) {
      sileo.error({
        title: "Error",
        description: "Todos los campos de evaluación son obligatorios.",
      });
      return;
    }

    const runPromise = runEvaluation({ dataset }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-results"] });
    });

    sileo.promise(runPromise, {
      loading: { title: "Ejecutando evaluación..." },
      success: { title: "Evaluación completada exitosamente." },
      error: { title: "Error al ejecutar evaluación." },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse">
        Cargando resultados de evaluación...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        Error al cargar resultados de evaluación.
      </div>
    );
  }

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-8">
      {/* Dataset Editor */}
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">
          Configurar Dataset de Evaluación
        </h3>
        <p className="text-sm text-slate-500">
          Define las preguntas y las respuestas esperadas (Ground Truth) para
          medir la calidad de cada tenant.
        </p>

        <div className="space-y-3">
          {dataset.map((item, index) => (
            <div
              key={index}
              className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg"
            >
              <div className="flex-1 space-y-3">
                <TextArea
                  aria-label="Pregunta"
                  placeholder="Pregunta"
                  value={item.question}
                  onChange={(e) =>
                    updateDatasetItem(index, "question", e.target.value)
                  }
                  rows={2}
                  fullWidth
                />
                <TextArea
                  aria-label="Respuesta Esperada"
                  placeholder="Respuesta Esperada"
                  value={item.expected_answer}
                  onChange={(e) =>
                    updateDatasetItem(index, "expected_answer", e.target.value)
                  }
                  rows={2}
                  fullWidth
                />
              </div>
              <Button
                isIconOnly
                variant="danger"
                onPress={() => removeDatasetItem(index)}
                isDisabled={dataset.length === 1}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button onPress={addDatasetItem}>+ Añadir Pregunta</Button>
          <Button
            onPress={handleRunEvaluation}
            isPending={isRunning}
            isDisabled={dataset.length === 0}
          >
            Ejecutar Evaluación
          </Button>
        </div>
      </div>

      {latestResults.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl">
          No hay datos de evaluación disponibles. Configura el dataset y haz
          clic en "Ejecutar Evaluación" para generar métricas.
        </div>
      ) : (
        <>
          {/* 1. Bar Chart: Quality */}
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              Comparativa de Calidad (Relevancia)
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Últimos resultados de relevancia por tenant (Escala 1-5).
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latestResults}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#3f3f46"
                    opacity={0.2}
                  />
                  <XAxis dataKey="tenant_id" tick={{ fill: "#71717a" }} />
                  <YAxis domain={[0, 5]} tick={{ fill: "#71717a" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    cursor={{ fill: "transparent" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="avg_relevance"
                    name="Relevancia Media"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="avg_faithfulness"
                    name="Fidelidad Media"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Line Chart: Historical Evolution */}
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              Evolución Histórica de Relevancia
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Cómo ha cambiado la precisión a lo largo del tiempo.
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#3f3f46"
                    opacity={0.2}
                  />
                  <XAxis dataKey="timestamp" tick={{ fill: "#71717a" }} />
                  <YAxis domain={[0, 5]} tick={{ fill: "#71717a" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  {tenants.map((tenant, index) => (
                    <Line
                      key={tenant}
                      type="monotone"
                      dataKey={tenant}
                      name={tenant}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      connectNulls
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Scatter Plot: Quality vs Time */}
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              Matriz de Calidad vs. Rendimiento
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Analiza el trade-off entre tiempo de respuesta y relevancia.
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#3f3f46"
                    opacity={0.2}
                  />
                  <XAxis
                    type="number"
                    dataKey="avg_time_ms"
                    name="Tiempo (ms)"
                    unit="ms"
                    tick={{ fill: "#71717a" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="avg_relevance"
                    name="Relevancia"
                    domain={[0, 5]}
                    tick={{ fill: "#71717a" }}
                  />
                  <ZAxis type="category" dataKey="tenant_id" name="Tenant" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  {latestResults.map((result, index) => (
                    <Scatter
                      key={result.tenant_id}
                      name={result.tenant_id}
                      data={[result]}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Details Table */}
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 shadow-sm overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Detalles Exactos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-lg">
                      Tenant
                    </th>
                    <th className="px-4 py-3 font-medium">Relevancia</th>
                    <th className="px-4 py-3 font-medium">Fidelidad</th>
                    <th className="px-4 py-3 font-medium rounded-tr-lg">
                      Tiempo (ms)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {latestResults.map((result) => (
                    <tr
                      key={result.tenant_id}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        {result.tenant_id}
                      </td>
                      <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-semibold">
                        {result.avg_relevance.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-green-600 dark:text-green-400 font-semibold">
                        {result.avg_faithfulness.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-amber-600 dark:text-amber-400">
                        {result.avg_time_ms.toFixed(0)} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
