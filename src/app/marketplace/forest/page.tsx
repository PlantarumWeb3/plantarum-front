// src/app/marketplace/forest/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";
import { provider as readProvider } from "@/utils/web3Config"; // 

export default function ForestPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
  (async () => {
    try {
      // 👇 Detectar si hay wallet conectada
      let activeProvider: any;

      if ((window as any).ethereum) {
        const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
        activeProvider = browserProvider;
      } else {
        activeProvider = readProvider; // ✅ fallback público
      }

      const contract = new ethers.Contract(
        addresses.Plantarum721,
        Plantarum721ABI,
        activeProvider
      );

      console.log("🔎 Buscando NFTs tipo forest...");
      const ids: number[] = await contract.getTokensByType("forest");
      const arr: any[] = [];

      for (const id of ids) {
        try {
          const [meta, uri] = await contract.getTokenFull(id);
          const url = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
          const res = await fetch(url);
          const data = await res.json();
          arr.push({ id, ...data, meta });
        } catch {
          console.warn(`⚠️ Token ${id} no existe o fue quemado → ignorado`);
        }
      }

      setTokens(arr.reverse());
    } catch (err) {
      console.error("❌ Error cargando Forest:", err);
    } finally {
      setLoading(false);
    }
  })();
}, []);

  if (loading) {
    return (
      <main className="p-10 text-center text-yellow-400">
        ⏳ Cargando activos Forest...
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-extrabold text-emerald-500 text-center mb-10">
        🌲 Marketplace – Activos Forestales
      </h1>

        <div className="flex justify-center mb-10">
        <Link
          href="/marketplace"
          className="text-green-300 hover:text-green-100 flex items-center gap-2"
        >
          ← Volver al Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {tokens.map((t) => {
          const imageFile = t.files?.find((f: any) => f.type && f.type.startsWith("image/"));

          return (
            <div
              key={t.id}
              className="relative bg-emerald-950 rounded-2xl shadow-lg shadow-emerald-800/50 border border-emerald-700 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/50"
            >
              {imageFile ? (
                <img
                  src={`https://ipfs.io/ipfs/${imageFile.IpfsHash}`}
                  alt={t.titulo}
                  className="w-full h-48 object-cover border-b border-emerald-800"
                />
              ) : (
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center border-b border-emerald-800 text-emerald-400">
                  📄 Sin imagen
                </div>
              )}

              <div className="p-5 text-center">
                <h2 className="text-lg font-bold text-emerald-300 mb-1">{t.titulo}</h2>
                <p className="text-emerald-400 text-sm">{t.comunidadAutonoma}</p>
                <p className="text-emerald-500 text-xs font-mono mb-4">📍 {t.meta.coords}</p>
                <Link
                  href={`/token/forest/${t.id}`}
                  className="inline-block bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Ver Activo
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
