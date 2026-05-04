import { useState } from "react";
import { Button } from "@heroui/react";
import { useUploadDocument } from "../hooks/useRAG";
import { sileo } from "sileo";

interface Props {
  tenantId: string | null;
}

export function FileUploader({ tenantId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useUploadDocument();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!tenantId) {
      sileo.error({ title: "Selecciona un tenant primero" });
      return;
    }
    if (!file) {
      sileo.error({ title: "Selecciona un archivo" });
      return;
    }

    const uploadPromise = uploadMutation.mutateAsync({ tenantId, file });

    sileo
      .promise(uploadPromise, {
        loading: { title: "Subiendo archivo...", description: file.name },
        success: { title: "Archivo subido con éxito", description: file.name },
        error: { title: "Error al subir el archivo" },
      })
      .then(() => {
        setFile(null);
        const fileInput = document.getElementById(
          "file-upload",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-sm">
      <h3 className="text-lg font-medium">Subir Documento</h3>
      <p className="text-sm text-gray-500">
        Sube un archivo .pdf o .txt al tenant seleccionado para nutrir la base
        de conocimiento.
      </p>
      <div className="flex items-center gap-3 mt-2">
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100 dark:file:bg-zinc-800 dark:file:text-blue-400"
        />
        <Button
          onPress={handleUpload}
          isDisabled={!file || !tenantId || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? "Subiendo..." : "Subir"}
        </Button>
      </div>
    </div>
  );
}
