// src/app/faucet/page.tsx
"use client";

import { useState } from "react";
import { usePlantarumToken } from "../../../hooks/usePlantarumToken";
import { useWallet } from "../../context/WalletContext";

export default function FaucetPage() {
  const { faucet } = usePlantarumToken();
  const { account, connectWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleFaucet = async () => {
    try {
      setLoading(true);
      const txHash = await faucet();
      alert(`✅ Faucet solicitado. Tx hash: ${txHash}`);
    } catch (err) {
      console.error(err);
      alert("❌ Error solicitando faucet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        💧 Faucet PLNTX
      </h2>

      <div className="flex justify-center mb-6">
        {account ? (
          <button onClick={handleFaucet} disabled={loading} className="btn-green">
            {loading ? "⏳ Solicitando..." : "💧 Solicitar 50 PLNTX"}
          </button>
        ) : (
          <button onClick={connectWallet} className="btn-green">
            🔗 Conectar Wallet
          </button>
        )}
      </div>

      {/* 🔹 Instrucciones para importar el token en MetaMask */}
      <div className="bg-green-900/50 p-4 rounded-lg border border-green-700 text-green-200 text-sm max-w-lg mx-auto">
        <p className="mb-2 font-bold">📌 Antes de usar el faucet:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Abre tu extensión de <strong>MetaMask</strong>.</li>
          <li>Posiciona la red de Pruebas Ethereum <strong>Sepolia</strong>.</li>
          <li>Haz clic en <em>"Importar token"</em>.</li>
          <li>Copia y Pega esta dirección de contrato en el campo correspondiente:</li>
        </ul>
        <p className="mt-2 text-green-400 break-all font-mono">
          0x14bb43297537ecAF30657216be7EC651c90a123f
        </p>
        <p className="mt-3">
          Así podrás visualizar los tokens <strong>PLNTX</strong> que recibas del faucet. 🚀
        </p>
      </div>
    </main>
  );
}
