// hooks/usePlantarum721.ts
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Plantarum721ABI from "../abi/Plantarum721.json";
import addresses from "../utils/addresses_eth";
import { useWallet } from "../src/context/WalletContext";

export function usePlantarum721() {
  const { account, signer } = useWallet();
  const [contract, setContract] = useState<any>(null);

  // --------------------------
  // Init contrato
  // --------------------------
  useEffect(() => {
    const init = async () => {
      try {
        let base: ethers.Provider;

        if (typeof window !== "undefined" && (window as any).ethereum) {
          base = new ethers.BrowserProvider((window as any).ethereum);
        } else {
          base = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        }

        const c = new ethers.Contract(
          addresses.Plantarum721,
          Plantarum721ABI,
          signer || base
        );
        setContract(c);
      } catch (err) {
        console.error("❌ Error inicializando Plantarum721:", err);
      }
    };

    init();
  }, [signer]);

  // --------------------------
  // Mint
  // --------------------------
  const mintConservation = useCallback(
    async (to: string, hashId: string, coords: string, tokenURI: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).mintConservation(to, hashId, coords, tokenURI);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const mintForestAsset = useCallback(
    async (to: string, hashId: string, coords: string, tokenURI: string, price: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const value = ethers.parseEther(price);
      const tx = await contract.connect(signer).mintForestAsset(to, hashId, coords, tokenURI, value);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  // --------------------------
  // Venta directa
  // --------------------------
  const listForSale = useCallback(
    async (tokenId: number, price: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const value = ethers.parseEther(price);
      const tx = await contract.connect(signer).listForSale(tokenId, value);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const cancelSale = useCallback(
    async (tokenId: number) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).cancelSale(tokenId);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const buyNow = useCallback(
    async (tokenId: number, price: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const value = ethers.parseEther(price);
      const tx = await contract.connect(signer).buyNow(tokenId, { value });
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  // --------------------------
  // Subastas
  // --------------------------
  const startAuction = useCallback(
    async (tokenId: number, basePrice: string, durationDays: number) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const value = ethers.parseEther(basePrice);
      const tx = await contract.connect(signer).startAuction(tokenId, value, durationDays);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const placeBid = useCallback(
    async (tokenId: number, bid: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const value = ethers.parseEther(bid);
      const tx = await contract.connect(signer).placeBid(tokenId, { value });
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const finalizeAuction = useCallback(
    async (tokenId: number) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).finalizeAuction(tokenId);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  // --------------------------
  // DAO control
  // --------------------------
  const daoBurn = useCallback(
    async (tokenId: number) => {
      if (!contract || !signer) throw new Error("⚠️ Solo DAO/SuperAdmin puede quemar");
      const tx = await contract.connect(signer).daoBurn(tokenId);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const pause = useCallback(async () => {
    if (!contract || !signer) throw new Error("⚠️ Solo SuperAdmin puede pausar");
    const tx = await contract.connect(signer).pause();
    await tx.wait();
    return tx.hash;
  }, [contract, signer]);

  const unpause = useCallback(async () => {
    if (!contract || !signer) throw new Error("⚠️ Solo SuperAdmin puede despausar");
    const tx = await contract.connect(signer).unpause();
    await tx.wait();
    return tx.hash;
  }, [contract, signer]);

  // --------------------------
  // Getters
  // --------------------------
  const getTokenMeta = useCallback(
    async (tokenId: number) => {
      if (!contract) return null;
      const meta = await contract.getTokenMeta(tokenId);
      return {
        walletOwner: meta.walletOwner,
        hashId: meta.hashId,
        coords: meta.coords,
        timestamp: Number(meta.timestamp),
        price: Number(meta.price),
        listed: meta.listed,
        isAuction: meta.isAuction,
        auctionDeadline: Number(meta.auctionDeadline),
        tipoActivo: meta.tipoActivo,
      };
    },
    [contract]
  );

  const getTokensByOwner = useCallback(
    async (owner: string) => {
      if (!contract) return [];
      const ids: bigint[] = await contract.getTokensByOwner(owner);
      return ids.map((id) => Number(id));
    },
    [contract]
  );

  const getAllTokens = useCallback(async () => {
    if (!contract) return [];
    const ids: bigint[] = await contract.getAllTokens();
    return ids.map((id) => Number(id));
  }, [contract]);

  const getTokensByType = useCallback(
    async (tipo: string) => {
      if (!contract) return [];
      const ids: bigint[] = await contract.getTokensByType(tipo);
      return ids.map((id) => Number(id));
    },
    [contract]
  );

  const getListedTokens = useCallback(async () => {
    if (!contract) return [];
    const ids: bigint[] = await contract.getListedTokens();
    return ids.map((id) => Number(id));
  }, [contract]);

  const getTokenFull = useCallback(
    async (tokenId: number) => {
      if (!contract) return null;
      const [meta, uri] = await contract.getTokenFull(tokenId);
      return {
        ...meta,
        tokenURI: uri,
      };
    },
    [contract]
  );

  return {
    account,
    contract,
    // Mint
    mintConservation,
    mintForestAsset,
    // Venta directa
    listForSale,
    cancelSale,
    buyNow,
    // Subastas
    startAuction,
    placeBid,
    finalizeAuction,
    // DAO Control
    daoBurn,
    pause,
    unpause,
    // Getters
    getTokenMeta,
    getTokensByOwner,
    getAllTokens,
    getTokensByType,
    getListedTokens,
    getTokenFull,
  };
}
