import {APODResponse} from './types'
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


const chain = sepolia;
// @ts-ignore
const Safe = SafeProtocol.default;
// @ts-ignore
const SafeApiKit = SafeApiKitImport.default;

export async function createTransaction(AGENT_ADDRESS: any, AGENT_PRIVATE_KEY: any, SAFE_ADDRESS: any, CONTRACT_ADDRESS: any) {
    const protocolKit = await Safe.init({
        // provider: chain.rpcUrls.default.http[0],
        provider: 'https://eth-sepolia.g.alchemy.com/v2/EFN5USY_3K58j09FBtOCH6lm8NHIl25T',
        signer: AGENT_PRIVATE_KEY,
        safeAddress: SAFE_ADDRESS,
    }) as SafeProtocol;
    const encodedCall = encodeFunctionData({
        abi: SafeVaultAbi,
        functionName: "UnlockVault"
    });
    console.log(encodedCall);
    console.log(CONTRACT_ADDRESS);
    CONTRACT_ADDRESS = getAddress(CONTRACT_ADDRESS)
    console.log(CONTRACT_ADDRESS);
    const safeTransactionData: MetaTransactionData = {
        to: CONTRACT_ADDRESS,
        value: '0',
        data: encodedCall,
        operation: OperationType.Call
    }
    console.log(safeTransactionData)
    const safeTransaction = await protocolKit.createTransaction({
        transactions: [safeTransactionData]
    })
    console.log(safeTransaction)
    const apiKit = new SafeApiKit({
        chainId: 11_155_111n
    });
    // Deterministic hash based on transaction parameters
    const safeTxHash = await protocolKit.getTransactionHash(safeTransaction)
    console.log(safeTxHash)

    // Sign transaction to verify that the transaction is coming from owner 1
    const senderSignature = await protocolKit.signHash(safeTxHash)
    console.log(senderSignature)

    await apiKit. proposeTransaction({
        safeAddress: SAFE_ADDRESS,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: AGENT_ADDRESS,
        senderSignature: senderSignature.data
    })
    console.log(safeTxHash)

    return safeTxHash;
}