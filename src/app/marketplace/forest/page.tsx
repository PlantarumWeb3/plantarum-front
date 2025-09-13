// src/app/marketplace/forest/page.tsx
// src/app/marketplace/forest/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";

interface Asset {
  id: number;
  owner: string;
  price: string;
  isAuction: boolean;
  tokenURI: string;
  image?: string;
  titulo?: string;
}

export default function ForestMarketplacePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        if (!(window as any).ethereum) return;
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(
          addresses.Plantarum721,
          Plantarum721ABI,
          provider
        );

        const tokenIds: bigint[] = await contract.getAllTokens();
        const listedAssets: Asset[] = [];

        for (const id of tokenIds) {
          const meta = await contract.getTokenMeta(id);
          if (meta.listed) {
            const tokenURI = await contract.tokenURI(id);

            // 🔹 Fetch metadata desde IPFS
            const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            const res = await fetch(url);
            const data = await res.json();

            const imageFile = data.files?.find(
              (f: any) => f.type && f.type.startsWith("image/")
            );

            listedAssets.push({
              id: Number(id),
              owner: meta.walletOwner,
              price: ethers.formatEther(meta.price),
              isAuction: meta.isAuction,
              tokenURI,
              image: imageFile ? `https://ipfs.io/ipfs/${imageFile.IpfsHash}` : undefined,
              titulo: data.titulo || "Activo Forestal",
            });
          }
        }

        setAssets(listedAssets);
      } catch (err) {
        console.error("❌ Error cargando activos forestales:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-3xl font-bold mb-4 text-center text-green-400">
        🌲 Marketplace – Activos Forestales
      </h2>
      <p className="text-center max-w-2xl mb-12 text-green-200">
        Explora los activos forestales tokenizados.  
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
        <p className="text-green-300 text-center">⏳ Cargando activos forestales...</p>
      ) : assets.length === 0 ? (
        <p className="text-green-400 text-center italic">
          ⚠️ No hay activos forestales disponibles en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-green-950 rounded-2xl shadow-lg border border-green-700 overflow-hidden 
                         hover:shadow-green-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Imagen */}
              {asset.image ? (
                <img
                  src={asset.image}
                  alt={asset.titulo}
                  className="w-full h-48 object-cover border-b border-green-700"
                />
              ) : (
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-green-400">
                  📄 Sin imagen
                </div>
              )}

              <div className="p-5 text-center">
                {/* 🔹 Mostrar título del activo */}
                <h2 className="text-lg font-bold text-green-300 mb-2">
                  {asset.titulo}
                </h2>

                <h3 className="text-green-200 font-semibold mb-1">
                  🌳 Token #{asset.id}
                </h3>
                <p className="text-green-100 mb-1">
                  👤 {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
                </p>
                <p className="text-green-200 mb-2">💰 {asset.price} ETH</p>
                <p className="text-green-400 text-sm mb-4">
                  {asset.isAuction
                    ? "⏳ En subasta (ver detalles en ficha)."
                    : "✅ Disponible para inversión directa."}
                </p>

                {/* Botón hacia [id]/page */}
                <Link
                  href={`/token/forest/${asset.id}`}
                  className="block w-full text-center py-2 bg-green-500 hover:bg-green-400 
                             text-black font-bold rounded-xl shadow-md"
                >
                  💸 Ver Activo
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
