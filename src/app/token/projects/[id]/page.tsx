// src/app/token/projects/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

interface Meta {
  id: number;
  title?: string;
  coords?: string;
  price?: string;
  supply?: number;
  creator?: string;
  hashId?: string;
  maturityDate?: string;
  yieldPercent?: string;
  phases?: number;
  uri?: string;
  listed?: boolean;
}

export default function ProjectAssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        if (!id || !(window as any).ethereum) return;

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(
          addresses.Plantarum1155,
          Plantarum1155ABI,
          provider
        );

        // 🔹 Obtenemos el URI y leemos metadata desde IPFS
        const uri = await contract.uri(id);
        let offchain: any = {};
        try {
          const res = await fetch(uri.replace("ipfs://", "https://ipfs.io/ipfs/"));
          offchain = await res.json();
        } catch (e) {
          console.warn("⚠️ Error leyendo metadata IPFS", e);
        }

        setMeta({
          id: Number(id),
          title: offchain?.titulo || `Proyecto #${id}`,
          coords: offchain?.coords || "No definidas",
          price: offchain?.price || "0",
          supply: offchain?.supply || 0,
          creator: offchain?.creator || "N/A",
          hashId: offchain?.hashId || "",
          maturityDate: offchain?.maturityDate
            ? new Date(offchain.maturityDate * 1000).toLocaleDateString()
            : "N/A",
          yieldPercent: offchain?.yieldPercent?.toString() || "0",
          phases: offchain?.phases || 0,
          uri,
          listed: offchain?.listed || false,
        });
      } catch (err) {
        console.error("❌ Error cargando metadata del proyecto:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMeta();
  }, [id]);

  // 🟢 Comprar con ETH
  const handleBuyETH = async () => {
    try {
      if (!(window as any).ethereum) throw new Error("Instala MetaMask");
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.Plantarum1155,
        Plantarum1155ABI,
        signer
      );

      const tx = await contract.buyProject(meta?.id, 1, {
        value: ethers.parseEther(meta?.price || "0"),
      });
      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      alert("✅ Compra realizada con éxito (ETH)");
    } catch (err: any) {
      console.error("❌ Error en compra ETH:", err);
      alert("❌ Error en compra ETH: " + err.message);
    }
  };

  if (loading) return <p className="text-center text-green-300">⏳ Cargando proyecto...</p>;
  if (!meta) return <p className="text-center text-red-400">⚠️ Proyecto no encontrado</p>;

  return (
    <main className="flex flex-col items-center px-6 py-10 min-h-[80vh]">
      {/* Título */}
      <h2 className="text-3xl font-extrabold text-green-400 mb-8 text-center">
        🏭 Proyecto – {meta.title}
      </h2>

      {/* Cuatro recuadros grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full mb-10">
        <div className="bg-green-900/70 p-6 rounded-2xl shadow-lg border border-green-500/30 min-h-[360px]">
          <h3 className="text-xl font-bold text-green-300 mb-4">📑 Información</h3>
          <p className="text-green-100">ID: {meta.id}</p>
          <p className="text-green-100">Coordenadas: {meta.coords}</p>
          <p className="text-green-100">Fases: {meta.phases}</p>
          <p className="text-green-100">Hash: {meta.hashId || "N/A"}</p>
        </div>

        <div className="bg-green-900/70 p-6 rounded-2xl shadow-lg border border-green-500/30 min-h-[360px]">
          <h3 className="text-xl font-bold text-green-300 mb-4">💰 Económico</h3>
          <p className="text-green-100">Precio: {meta.price} ETH</p>
          <p className="text-green-100">Supply: {meta.supply}</p>
          <p className="text-green-100">Rendimiento: {meta.yieldPercent}%</p>
          <p className="text-green-100">Vencimiento: {meta.maturityDate}</p>
        </div>

        <div className="bg-green-900/70 p-6 rounded-2xl shadow-lg border border-green-500/30 min-h-[360px]">
          <h3 className="text-xl font-bold text-green-300 mb-4">👤 Creador</h3>
          <p className="text-green-100">{meta.creator}</p>
        </div>

        <div className="bg-green-900/70 p-6 rounded-2xl shadow-lg border border-green-500/30 min-h-[360px]">
          <h3 className="text-xl font-bold text-green-300 mb-4">🌐 IPFS</h3>
          {meta.uri ? (
            <a
              href={meta.uri.replace("ipfs://", "https://ipfs.io/ipfs/")}
              target="_blank"
              className="text-green-400 underline"
            >
              Ver Metadata completa en IPFS
            </a>
          ) : (
            <p className="text-green-100">No disponible</p>
          )}
        </div>
      </div>

      {/* Botón de compra */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <button
          onClick={handleBuyETH}
          className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl shadow-md transition"
        >
          💸 Comprar con ETH
        </button>
      </div>

      {/* Feedback TX */}
      {txHash && (
        <p className="mt-4 text-green-400">
          ✅ TX enviada:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            className="underline"
          >
            {txHash}
          </a>
        </p>
      )}

      {/* Botón volver */}
      <div className="mt-10">
        <Link
          href="/marketplace/projects"
          className="px-6 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl shadow-md"
        >
          ← Volver al Marketplace Projects
        </Link>
      </div>
    </main>
  );
}
