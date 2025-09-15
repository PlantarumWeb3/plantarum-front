// src/app/token/forest/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";
import { provider as readProvider } from "@/utils/web3Config";


interface Meta {
  id: number;
  title?: string;
  coords?: string;
  estado?: string;  
  legal?: string;
  certificacion?: string;
  price?: string;
  supply?: number;
  owner?: string;
  hashId?: string;
  uri?: string;
  listed?: boolean;
  image?: string;
  pdfs?: { type: string; IpfsHash: string }[];
  comunidadAutonoma?: string;
  provincia?: string;
}

export default function ForestAssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
  const loadMeta = async () => {
    try {
      if (!id) return;

      // 👇 Provider dual
      const activeProvider = (window as any).ethereum
        ? new ethers.BrowserProvider((window as any).ethereum)
        : readProvider;

      const contract = new ethers.Contract(
        addresses.Plantarum721,
        Plantarum721ABI,
        activeProvider
      );

      // 1️⃣ On-chain
      const data = await contract.getTokenMeta(id);
      const uri = await contract.tokenURI(id);

      // 2️⃣ Off-chain
      let offchain: any = {};
      try {
        const res = await fetch(uri.replace("ipfs://", "https://ipfs.io/ipfs/"));
        offchain = await res.json();
      } catch (e) {
        console.warn("⚠️ Error leyendo metadata IPFS", e);
      }

      setMeta({
        id: Number(id),
        title: offchain?.titulo || `Token #${id}`,
        coords: data.coords || offchain?.coords || "No definidas",
        legal: offchain?.estado || "No definido", // 👈 usamos campo estandarizado
        certificacion: offchain?.certificacion || "N/A",
        price: ethers.formatEther(data.price),
        owner: data.walletOwner,
        hashId: data.hashId,
        uri,
        listed: data.listed,
        image: offchain?.files?.find((f: any) => f.type?.startsWith("image/"))?.IpfsHash,
        pdfs: offchain?.files?.filter((f: any) => f.type === "application/pdf") || [],
        comunidadAutonoma: offchain?.comunidadAutonoma || "",
        provincia: offchain?.provincia || "",
      });
    } catch (err) {
      console.error("❌ Error cargando metadata:", err);
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
        addresses.Plantarum721,
        Plantarum721ABI,
        signer
      );

      const tx = await contract.buyNow(meta?.id, {
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

  if (loading) return <p className="text-center text-green-300">⏳ Cargando activo...</p>;
  if (!meta) return <p className="text-center text-red-400">⚠️ Activo no encontrado</p>;

  return (
    <main className="flex flex-col items-center px-4 py-8 min-h-[80vh]">
      {/* Título */}
      <h2 className="text-2xl md:text-3xl font-extrabold text-green-400 mb-6 text-center">
        🌲 Activo Forestal – {meta.title}
      </h2>

      {/* Grid compacta */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mb-8">
        {/* Cuadro 1: Foto + info básica */}
        <div className="bg-green-900/70 p-4 rounded-xl shadow-lg border border-green-500/30 flex flex-col items-center text-center">
          {meta.image ? (
            <img
              src={`https://ipfs.io/ipfs/${meta.image}`}
              alt={meta.title}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
          ) : (
            <div className="w-full h-40 bg-green-800 flex items-center justify-center rounded-lg mb-3 text-green-200">
              📷 Sin imagen
            </div>
          )}
          <h3 className="text-lg font-bold text-green-300 mb-2">📑 Información</h3>
          <p className="text-green-100 text-sm">ID: {meta.id}</p>
          <p className="text-green-100 text-sm">Título: {meta.title}</p>
          <p className="text-green-100 text-sm">Estado: {meta.estado}</p>
          <p className="text-green-100 text-sm">Coords: {meta.coords}</p>
          <p className="text-green-100 text-sm">CCAA: {meta.comunidadAutonoma}</p>
          <p className="text-green-100 text-sm">Provincia: {meta.provincia}</p>
          <p className="text-green-100 text-sm">Certificación: {meta.certificacion}</p>
        </div>

        {/* Cuadro 2: Económico */}
          <div className="bg-green-900/70 p-4 rounded-xl shadow-lg border border-green-500/30">
            <h3 className="text-lg font-bold text-green-300 mb-3">💰 Económico</h3>

            <p className="text-green-100 text-sm">Precio inicial: {meta.price} ETH</p>
            <p className="text-green-100 text-sm break-words">Propietario: {meta.owner}</p>
            <p className="text-green-100 text-sm break-words">Hash: {meta.hashId || "N/A"}</p>

            {/* Estado de venta */}
            <p className="text-green-100 text-sm mt-2">
              {meta.listed ? "📌 En venta directa" : "⛔ No listado"}
            </p>

            {/* Subasta */}
            {meta.listed && (meta as any).isAuction && (
              <div className="mt-2">
                <p className="text-green-100 text-sm">⚡ Subasta activa</p>
                <p className="text-green-100 text-sm">
                  ⏳ Deadline:{" "}
                  {new Date(Number((meta as any).auctionDeadline) * 1000).toLocaleString()}
                </p>
              </div>
            )}
          </div>


        {/* Cuadro 3: Documentos */}
          <div className="bg-green-900/70 p-4 rounded-xl shadow-lg border border-green-500/30">
            <h3 className="text-lg font-bold text-green-300 mb-3">📜 Documentos</h3>
            {meta.pdfs && meta.pdfs.length > 0 ? (
              <ul className="list-disc list-inside text-green-100 text-sm space-y-1">
                {meta.pdfs.map((pdf, i) => (
                  <li key={i}>
                    <a
                      href={`https://ipfs.io/ipfs/${pdf.IpfsHash}`}
                      target="_blank"
                      className="text-green-400 underline"
                    >
                      Documento {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-100 text-sm">No hay documentos PDF</p>
            )}
          </div>

        {/* Cuadro 4: Acción */}
        <div className="bg-green-900/70 p-4 rounded-xl shadow-lg border border-green-500/30 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-green-300 mb-3">🛒 Acción</h3>
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={handleBuyETH}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg shadow-md transition text-sm"
            >
              💸 Comprar con ETH
            </button>
          </div>
          {txHash && (
            <p className="mt-3 text-green-400 text-xs break-words">
              ✅ TX:{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                className="underline"
              >
                {txHash}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Botón volver */}
      <div className="mt-4">
        <Link
          href="/marketplace/forest"
          className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg shadow-md text-sm"
        >
          ← Volver al Marketplace Forest
        </Link>
      </div>
    </main>
  );
}
