import { useTenantConfig, useTenantMetrics } from "../hooks/useRAG";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function TenantDashboard({ tenantId }: { tenantId: string }) {
  const { data: config, isLoading: isConfigLoading } =
    useTenantConfig(tenantId);
  const { data: metrics, isLoading: isMetricsLoading } =
    useTenantMetrics(tenantId);

  if (isConfigLoading || isMetricsLoading) {
    return (
      <div className="animate-pulse flex space-x-4 p-4">
        Cargando métricas...
      </div>
    );
  }

  if (!config || !metrics) {
    return (
      <div className="text-red-500 p-4">
        No se pudieron cargar las métricas.
      </div>
    );
  }

  const { max_tokens } = config;
  const { tokens_used, queries_count } = metrics;

  const tokensAvailable = Math.max(0, max_tokens - tokens_used);
  const percentageUsed = max_tokens > 0 ? (tokens_used / max_tokens) * 100 : 0;

  let progressColor = "bg-green-500";
  if (percentageUsed >= 80) progressColor = "bg-red-500";
  else if (percentageUsed >= 50) progressColor = "bg-yellow-500";

  const efficiency =
    queries_count > 0 ? Math.round(tokens_used / queries_count) : 0;

  const chartData = [
    { name: "Tokens Usados", value: tokens_used, fill: "#ef4444" },
    { name: "Tokens Disponibles", value: tokensAvailable, fill: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* Progess Bar */}
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Consumo de Cuota
          </h3>
          <span className="text-sm font-semibold">
            {percentageUsed.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(100, percentageUsed)}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-right">
          {tokens_used.toLocaleString()} / {max_tokens.toLocaleString()} tokens
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">
            Total de Tokens
          </p>
          <p className="text-3xl font-bold text-slate-800 dark:text-zinc-100">
            {tokens_used.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">
            Total de Consultas
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {queries_count.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">
            Eficiencia Media
          </p>
          <p className="text-3xl font-bold text-amber-500">{efficiency}</p>
          <p className="text-xs text-slate-400 mt-1">tokens / consulta</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-5 shadow-sm h-[300px] flex flex-col items-center">
        <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400 self-start w-full mb-4">
          Distribución de Tokens
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
