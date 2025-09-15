// src/app/token/conservation/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";
import { provider } from "@/utils/web3Config"; // 🔹 provider de solo lectura

interface Meta {
  id: number;
  title?: string;
  coords?: string;
  estado?: string;
  price?: string;
  owner?: string;
  hashId?: string;
  uri?: string;
  listed?: boolean;
  image?: string;
  pdfs?: { type: string; IpfsHash: string }[];
  comunidadAutonoma?: string;
  provincia?: string;
  descripcion?:string;
}

export default function ConservationAssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        if (!id) return;

        const contract = new ethers.Contract(
          addresses.Plantarum721,
          Plantarum721ABI,
          provider // 🔹 lectura con provider público
        );

        // On-chain
        const data = await contract.getTokenMeta(id);
        const uri = await contract.tokenURI(id);

        // Off-chain
        let offchain: any = {};
        try {
          const res = await fetch(uri.replace("ipfs://", "https://ipfs.io/ipfs/"));
          offchain = await res.json();
        } catch (e) {
          console.warn("⚠️ Error leyendo metadata IPFS", e);
        }

        setMeta({
          id: Number(id),
          title: offchain?.titulo || `Conservación #${id}`,
          coords: offchain?.coords || "No definidas",
          estado: offchain?.estado || "No definido",
          price: ethers.formatEther(data.price),
          owner: data.walletOwner,
          hashId: data.hashId,
          uri,
          listed: data.listed,
          image: offchain?.files?.find((f: any) =>
            f.type?.startsWith("image/")
          )?.IpfsHash,
          pdfs:
            offchain?.files?.filter((f: any) =>
              f.type?.includes("pdf")
            ) || [],
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

  // 🟢 Comprar con ETH (requiere wallet)
  const handleBuyETH = async () => {
    try {
      if (!(window as any).ethereum) throw new Error("Instala MetaMask");
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });

      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await browserProvider.getSigner();
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

  if (loading)
    return (
      <p className="text-center text-green-300">
        ⏳ Cargando activo de conservación...
      </p>
    );
  if (!meta)
    return (
      <p className="text-center text-red-400">
        ⚠️ Activo no encontrado
      </p>
    );

  return (
    <main className="flex flex-col items-center px-4 py-8 min-h-[80vh]">
      {/* Título */}
      <h2 className="text-2xl md:text-3xl font-extrabold text-green-400 mb-6 text-center">
        🌱 Activo de Conservación – {meta.title}
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
          <h3 className="text-lg font-bold text-green-300 mb-2">
            📑 Información
          </h3>
          <p className="text-green-100 text-sm">ID: {meta.id}</p>
          <p className="text-green-100 text-sm">Estado: {meta.estado}</p>
          <p className="text-green-100 text-sm">Coords: {meta.coords}</p>
          <p className="text-green-100 text-sm">CCAA: {meta.comunidadAutonoma}</p>
          <p className="text-green-100 text-sm">Provincia: {meta.provincia}</p>
        </div>

        {/* Cuadro 2: Económico */}
        <div className="bg-green-900/70 p-4 rounded-xl shadow-lg border border-green-500/30">
          <h3 className="text-lg font-bold text-green-300 mb-3">💰 Económico</h3>
          <p className="text-green-100 text-sm">Precio: {meta.price} ETH</p>
          <p className="text-green-100 text-sm break-words">
            Propietario: {meta.owner}
          </p>
          <p className="text-green-100 text-sm break-words">
            Hash: {meta.hashId || "N/A"}
          </p>
          <p className="text-green-100 text-sm">
            Estado venta: {meta.listed ? "En venta" : "No listado"}
          </p>
        </div>

        {/* Cuadro 3: Documentos */}
        <div className="bg-green-900/70 p-4 rounded-xl shadow-lg border border-green-500/30">
          <h3 className="text-lg font-bold text-green-300 mb-3">📜 Documentos</h3>
          {meta.pdfs && meta.pdfs.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-green-200">
              {meta.pdfs.map((f, i) => (
                <li key={i}>
                  <a
                    href={`https://ipfs.io/ipfs/${f.IpfsHash}`}
                    target="_blank"
                    className="text-green-400 underline"
                  >
                    Documento {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-100 text-sm">No disponibles</p>
          )}
        </div>

        {/* Cuadro 4: Acción */}
        {/* Cuadro 4: Detalles de Conservación */}
        <div className="bg-green-900/70 p-4 rounded-xl shadow-lg border border-green-500/30">
          <h3 className="text-lg font-bold text-green-300 mb-3">🌱 Detalles de Conservación</h3>
          <p className="text-green-100 text-sm">
            {meta.descripcion || "Proyecto de conservación sin descripción adicional"}
          </p>
        </div>
      </div>

      {/* Botón volver */}
      <div className="mt-4">
        <Link
          href="/token/conservation/natura"
          className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg shadow-md text-sm"
        >
          ← Volver a Natura
        </Link>
      </div>
    </main>
  );
}
