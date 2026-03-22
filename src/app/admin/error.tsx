"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Error capturado en Admin:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-destructive/10 text-destructive">
      <AlertTriangle className="h-12 w-12 mb-4" />
      <h2 className="text-2xl font-bold">¡Algo salió mal en el Panel de Administrador!</h2>
      <p className="mt-2 text-sm opacity-80">{error.message}</p>
      <button onClick={() => reset()} className="mt-6 rounded bg-destructive px-4 py-2 text-white">
        Reintentar
      </button>
    </div>
  );
}
