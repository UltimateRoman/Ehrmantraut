import SafeApiKit from '@safe-global/api-kit'
import SafeProtocol from '@safe-global/protocol-kit'
import {
  MetaTransactionData,
  OperationType
} from '@safe-global/types-kit'
import { encodeFunctionData } from 'viem';
import SafeVaultAbi from "./SafeVaultAbi";

import { sepolia } from "viem/chains";

const chain = sepolia;

const AGENT_ADDRESS = process.env.AGENT_ADDRESS || "";
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || "";
const SAFE_ADDRESS = process.env.SAFE_ADDRESS || "";

// @ts-ignore
const Safe = SafeProtocol.default;

export async function propposeTx() {
    const protocolKit = await Safe.init({
        provider: chain.rpcUrls.default.http[0],
        signer: AGENT_PRIVATE_KEY,
        safeAddress: SAFE_ADDRESS,
    }) as SafeProtocol;
    const encodedCall = encodeFunctionData({
        abi: SafeVaultAbi,
        functionName: "UnlockVault",
        args: [],
    });

    const safeTransactionData: MetaTransactionData = {
        to: '0x0',
        value: '0',
        data: encodedCall,
        operation: OperationType.Call
    }
    const safeTransaction = await protocolKit.createTransaction({
        transactions: [safeTransactionData]
    })
    const apiKit = new SafeApiKit({
        chainId: BigInt(chain.id)
    });
    // Deterministic hash based on transaction parameters
    const safeTxHash = await protocolKit.getTransactionHash(safeTransaction)

    // Sign transaction to verify that the transaction is coming from owner 1
    const senderSignature = await protocolKit.signHash(safeTxHash)

    await apiKit.proposeTransaction({
        safeAddress: SAFE_ADDRESS,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: AGENT_ADDRESS,
        senderSignature: senderSignature.data
    })
}
