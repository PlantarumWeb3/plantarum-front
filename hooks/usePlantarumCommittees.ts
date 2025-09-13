// hooks/usePlantarumCommittees.ts
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import PlantarumCommitteesABI from "../abi/PlantarumCommittees.json";
import addresses from "../utils/addresses_eth";
import { useWallet } from "../src/context/WalletContext";

export function usePlantarumCommittees() {
  const { account, signer } = useWallet();
  const [contract, setContract] = useState<any | null>(null); // 👈 contrato como any

  // Inicializar contrato con fallback seguro
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
          addresses.PlantarumCommittees,
          PlantarumCommitteesABI,
          signer || base
        ) as any; // 👈 cast a any

        setContract(c);
      } catch (err) {
        console.error("❌ Error inicializando Committees:", err);
      }
    };

    init();
  }, [signer]);

  // --------------------
  // Write
  // --------------------
  const createCommittee = useCallback(
    async (name: string, description: string, image: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).createCommittee(name, description, image);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const approveCommittee = useCallback(
    async (id: bigint) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).approveCommittee(id);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const rejectCommittee = useCallback(
    async (id: bigint) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).rejectCommittee(id);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const updateCommitteeImage = useCallback(
    async (id: bigint, newImage: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).updateCommitteeImage(id, newImage);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const requestJoinCommittee = useCallback(
    async (id: bigint) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).requestJoinCommittee(id);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const approveJoinCommittee = useCallback(
    async (id: bigint, applicant: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).approveJoinCommittee(id, applicant);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const rejectJoinCommittee = useCallback(
    async (id: bigint, applicant: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).rejectJoinCommittee(id, applicant);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const removeCommitteeMember = useCallback(
    async (id: bigint, member: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).removeCommitteeMember(id, member);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const createCommitteeProposal = useCallback(
    async (
      committeeId: bigint,
      title: string,
      description: string,
      durationIndex: bigint,
      hashId: string,
      fileHash: string
    ) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).createCommitteeProposal(
        committeeId,
        title,
        description,
        durationIndex,
        hashId,
        fileHash
      );
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const voteCommitteeProposal = useCallback(
    async (proposalId: bigint, support: boolean) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).voteCommitteeProposal(proposalId, support);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  const executeCommitteeProposal = useCallback(
    async (proposalId: bigint) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      const tx = await contract.connect(signer).executeCommitteeProposal(proposalId);
      await tx.wait();
      return tx.hash;
    },
    [contract, signer]
  );

  // --------------------
  // Read
  // --------------------
  const getAllCommittees = useCallback(async () => {
    if (!contract) return [];
    return await contract.getAllCommittees();
  }, [contract]);

  const getCommitteeById = useCallback(async (id: bigint) => {
    if (!contract) return null;
    return await contract.getCommitteeById(id);
  }, [contract]);

  const getAllCommitteeProposals = useCallback(
    async (committeeId: bigint) => {
      if (!contract) return [];
      return await contract.getAllCommitteeProposals(committeeId);
    },
    [contract]
  );

  const getCommitteeProposalById = useCallback(async (id: bigint) => {
    if (!contract) return null;
    return await contract.getCommitteeProposalById(id);
  }, [contract]);

  return {
    account,
    contract,
    createCommittee,
    approveCommittee,
    rejectCommittee,
    updateCommitteeImage,
    requestJoinCommittee,
    approveJoinCommittee,
    rejectJoinCommittee,
    removeCommitteeMember,
    createCommitteeProposal,
    voteCommitteeProposal,
    executeCommitteeProposal,
    getAllCommittees,
    getCommitteeById,
    getAllCommitteeProposals,
    getCommitteeProposalById,
  };
}
