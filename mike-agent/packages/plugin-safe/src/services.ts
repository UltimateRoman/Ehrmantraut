import SafeApiKitImport from '@safe-global/api-kit'
import SafeProtocol from '@safe-global/protocol-kit'
import {
  MetaTransactionData,
  OperationType
} from '@safe-global/types-kit'
import { encodeFunctionData } from 'viem';
import SafeVaultAbi from "./SafeVaultAbi";

import { sepolia } from "viem/chains";
import { getAddress } from "ethers";


// @ts-ignore
const Safe = SafeProtocol.default;
// @ts-ignore
const SafeApiKit = SafeApiKitImport.default;

export async function createTransaction(AGENT_ADDRESS: any, AGENT_PRIVATE_KEY: any, SAFE_ADDRESS: any, CONTRACT_ADDRESS: any,
    EVM_PROVIDER_URL: any
) {
    const protocolKit = await Safe.init({
        provider: EVM_PROVIDER_URL,
        signer: AGENT_PRIVATE_KEY,
        safeAddress: SAFE_ADDRESS,
    }) as SafeProtocol;

    const encodedCall = encodeFunctionData({
        abi: SafeVaultAbi,
        functionName: "UnlockVault"
    });
    CONTRACT_ADDRESS = getAddress(CONTRACT_ADDRESS)

    const safeTransactionData: MetaTransactionData = {
        to: CONTRACT_ADDRESS,
        value: '0',
        data: encodedCall,
        operation: OperationType.Call
    }

    const safeTransaction = await protocolKit.createTransaction({
        transactions: [safeTransactionData]
    })

    const apiKit = new SafeApiKit({
        chainId: 11_155_111n
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

    return safeTxHash;
}