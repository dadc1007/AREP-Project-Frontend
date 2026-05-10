import { useState, useMemo } from "react";
import { Button, Switch, TextArea } from "@heroui/react";
import { useTenantConfig, useUpdateTenantConfig } from "../hooks/useRAG";
import { useQueryClient } from "@tanstack/react-query";
import { sileo } from "sileo";
import type { TenantConfig } from "../types/api";

interface Props {
  tenantId: string;
}

export function TenantConfigPanel({ tenantId }: Props) {
  const { data: config, isLoading } = useTenantConfig(tenantId);
  const updateMutation = useUpdateTenantConfig();
  const queryClient = useQueryClient();

  const [localConfig, setLocalConfig] = useState<Partial<TenantConfig>>({});
  const [initialized, setInitialized] = useState(false);

  const effectiveConfig = useMemo(() => {
    if (config && !initialized) {
      const initial: Partial<TenantConfig> = {
        chunk_size: config.chunk_size,
        chunk_overlap: config.chunk_overlap,
        use_hyde: config.use_hyde,
        use_reranking: config.use_reranking,
        temperature: config.temperature,
        system_prompt: config.system_prompt,
        max_tokens: config.max_tokens,
      };

      queueMicrotask(() => {
        setLocalConfig(initial);
        setInitialized(true);
      });
      return initial;
    }
    return localConfig;
  }, [config, initialized, localConfig]);

  const hasChanges = useMemo(() => {
    if (!config || !initialized) return false;
    return (
      effectiveConfig.chunk_size !== config.chunk_size ||
      effectiveConfig.chunk_overlap !== config.chunk_overlap ||
      effectiveConfig.use_hyde !== config.use_hyde ||
      effectiveConfig.use_reranking !== config.use_reranking ||
      effectiveConfig.temperature !== config.temperature ||
      effectiveConfig.system_prompt !== config.system_prompt ||
      effectiveConfig.max_tokens !== config.max_tokens
    );
  }, [effectiveConfig, config, initialized]);

  const updateField = <K extends keyof TenantConfig>(
    key: K,
    value: TenantConfig[K],
  ) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const savePromise = updateMutation
      .mutateAsync({ tenantId, config: effectiveConfig })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["tenant-config", tenantId],
        });
        setInitialized(false);
      });

    sileo.promise(savePromise, {
      loading: { title: "Guardando configuración..." },
      success: { title: "Configuración actualizada" },
      error: { title: "Error al guardar la configuración" },
    });
  };

  const handleReset = () => {
    if (config) {
      setLocalConfig({
        chunk_size: config.chunk_size,
        chunk_overlap: config.chunk_overlap,
        use_hyde: config.use_hyde,
        use_reranking: config.use_reranking,
        temperature: config.temperature,
        system_prompt: config.system_prompt,
        max_tokens: config.max_tokens,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse p-6 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-sm">
        <p className="text-red-500">No se pudo cargar la configuración.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Configuración del Tenant</h2>
        {hasChanges && (
          <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
            Sin guardar
          </span>
        )}
      </div>

      {/* Retrieval Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          Recuperación de Documentos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Chunk Size */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Chunk Size</label>
              <span className="text-sm text-slate-500 dark:text-zinc-400 font-mono">
                {effectiveConfig.chunk_size}
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={effectiveConfig.chunk_size ?? 500}
              onChange={(e) =>
                updateField("chunk_size", Number(e.target.value))
              }
              className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>100</span>
              <span>2000</span>
            </div>
          </div>

          {/* Chunk Overlap */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Chunk Overlap</label>
              <span className="text-sm text-slate-500 dark:text-zinc-400 font-mono">
                {effectiveConfig.chunk_overlap}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={effectiveConfig.chunk_overlap ?? 50}
              onChange={(e) =>
                updateField("chunk_overlap", Number(e.target.value))
              }
              className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>0</span>
              <span>500</span>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Switch
            isSelected={effectiveConfig.use_hyde ?? false}
            onChange={(isSelected: boolean) =>
              updateField("use_hyde", isSelected)
            }
            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer"
          >
            <Switch.Content>
              <div>
                <p className="text-sm font-medium">HyDE</p>
                <p className="text-xs text-slate-400">
                  Hypothetical Document Embeddings
                </p>
              </div>
            </Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch>

          <Switch
            isSelected={effectiveConfig.use_reranking ?? false}
            onChange={(isSelected: boolean) =>
              updateField("use_reranking", isSelected)
            }
            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer"
          >
            <Switch.Content>
              <div>
                <p className="text-sm font-medium">Reranking</p>
                <p className="text-xs text-slate-400">
                  Reordenar resultados por relevancia
                </p>
              </div>
            </Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch>
        </div>
      </div>

      {/* Generation Settings */}
      <div className="space-y-4 pt-4 border-t dark:border-zinc-800">
        <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          Generación de Respuestas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Temperature</label>
              <span className="text-sm text-slate-500 dark:text-zinc-400 font-mono">
                {(effectiveConfig.temperature ?? 0).toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={effectiveConfig.temperature ?? 0}
              onChange={(e) =>
                updateField("temperature", Number(e.target.value))
              }
              className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>0.0</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Max Tokens</label>
              <span className="text-sm text-slate-500 dark:text-zinc-400 font-mono">
                {(effectiveConfig.max_tokens ?? 10000).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={50000}
              step={500}
              value={effectiveConfig.max_tokens ?? 10000}
              onChange={(e) =>
                updateField("max_tokens", Number(e.target.value))
              }
              className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>500</span>
              <span>50,000</span>
            </div>
          </div>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium">System Prompt</label>
          <TextArea
            aria-label="System Prompt"
            placeholder="Escribe el prompt del sistema..."
            value={effectiveConfig.system_prompt ?? ""}
            onChange={(e) => updateField("system_prompt", e.target.value)}
            rows={4}
            fullWidth
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-800">
        <Button
          variant="outline"
          onPress={handleReset}
          isDisabled={!hasChanges}
        >
          Descartar
        </Button>
        <Button
          variant="primary"
          onPress={handleSave}
          isDisabled={!hasChanges}
          isPending={updateMutation.isPending}
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
