// src/app/marketplace/carbon/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";
import { provider as readProvider } from "@/utils/web3Config"; // 


interface CarbonAsset {
  id: number;
  creator: string;
  price: string;
  supply: number;
  standard: string;
  projectType: string;
  vintage: number;
  verificationBody: string;
  expiryDate: number;
  listed: boolean;
}

export default function CarbonMarketplacePage() {
  const [credits, setCredits] = useState<CarbonAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadCarbonCredits = async () => {
    try {
      // 👇 provider: signer (si hay wallet) o público
      let activeProvider: any;
      if ((window as any).ethereum) {
        const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
        activeProvider = browserProvider;
      } else {
        activeProvider = readProvider; // ✅ fallback público
      }

      const contract = new ethers.Contract(
        addresses.Plantarum1155,
        Plantarum1155ABI,
        activeProvider
      );

      const ids: bigint[] = await contract.getAllTokens();
      const results: CarbonAsset[] = [];

      for (const id of ids) {
        try {
          const meta = await contract.getCarbonMeta(id);
          if (meta.listed) {
            results.push({
              id: Number(id),
              creator: meta.creator,
              price: ethers.formatEther(meta.price),
              supply: Number(meta.supply),
              standard: meta.standard,
              projectType: meta.projectType,
              vintage: Number(meta.vintage),
              verificationBody: meta.verificationBody,
              expiryDate: Number(meta.expiryDate),
              listed: meta.listed,
            });
          }
        } catch {
          console.warn(`⚠️ Crédito ${id} ignorado, metadata inválida`);
        }
      }

      setCredits(results);
    } catch (err) {
      console.error("❌ Error cargando créditos de carbono:", err);
    } finally {
      setLoading(false);
    }
  };

  loadCarbonCredits();
}, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        🌍 Marketplace – Créditos de Carbono
      </h2>
      <p className="text-center max-w-2xl mb-12 text-green-200">
        Explora créditos de carbono tokenizados bajo estándares internacionales.  
        Haz clic en <span className="font-bold text-green-400">Invertir</span> para ver el detalle
        y proceder con la compra desde su ficha.
      </p>

      {/* Botón volver */}
      <div className="flex justify-center mb-10">
        <Link
          href="/marketplace"
          className="px-6 py-2 bg-green-700 hover:bg-green-600 rounded-xl text-white shadow-md"
        >
          ← Volver al Marketplace
        </Link>
      </div>

      {loading ? (
        <p className="text-green-300 text-center">⏳ Cargando créditos...</p>
      ) : credits.length === 0 ? (
        <p className="text-green-400 text-center italic">
          ⚠️ No hay créditos de carbono disponibles en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
          {credits.map((c) => (
            <div
              key={c.id}
              className="backdrop-blur-md bg-green-800/40 p-8 rounded-2xl shadow-lg border border-green-500/20 hover:border-green-400/40 hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <h3 className="text-green-300 font-bold text-xl mb-3">
                🌱 Crédito #{c.id}
              </h3>
              <p className="text-green-100 mb-2">
                👤 {c.creator.slice(0, 6)}...{c.creator.slice(-4)}
              </p>
              <p className="text-green-200 mb-2">💰 {c.price} ETH</p>
              <p className="text-green-200 mb-2">📦 Supply: {c.supply}</p>
              <p className="text-green-200 mb-2">📜 Estándar: {c.standard}</p>
              <p className="text-green-200 mb-2">🌱 Tipo: {c.projectType}</p>
              <p className="text-green-200 mb-2">📆 Vintage: {c.vintage}</p>
              <p className="text-green-200 mb-2">
                ✅ Certificado por: {c.verificationBody}
              </p>
              <p className="text-green-200 mb-6">
                ⏳ Expira:{" "}
                {new Date(c.expiryDate * 1000).toLocaleDateString()}
              </p>

              {/* Botón hacia page [id] */}
              <Link
                  href={`/token/carbon/${c.id}`}
                  className="block w-full text-center py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-md"
                >
                  💸 Invertir
              </Link>

            </div>
          ))}
        </div>
      )}
    </main>
  );
}
