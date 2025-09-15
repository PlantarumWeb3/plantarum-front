// src/app/debug/page.tsx
"use client";

import { useEffect, useState } from "react";
import { provider } from "@/utils/web3Config";

export default function DebugPage() {
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const latest = await provider.getBlockNumber();
        setBlockNumber(Number(latest));
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, []);

  return (
    <main className="p-10 text-center text-green-400">
      <h1 className="text-2xl font-bold mb-6">🔎 Verificación RPC</h1>

      {blockNumber !== null ? (
        <p className="text-xl">
          ✅ RPC funcionando – Último bloque:{" "}
          <span className="font-mono text-green-200">{blockNumber}</span>
        </p>
      ) : error ? (
        <p className="text-red-400">❌ Error: {error}</p>
      ) : (
        <p className="text-yellow-400">⏳ Consultando RPC...</p>
      )}
    </main>
  );
}
