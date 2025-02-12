import {
    type Action,
    type IAgentRuntime,
    type Memory,
    type HandlerCallback,
    type State,
    elizaLogger,
    ActionExample,
} from "@elizaos/core";
import { createTransaction } from "../services";
import { validateSafeConfig } from "../environment";
import { vaultTransactions } from "../examples";

export const vaultTransaction: Action = {
    name: "Safe transaction",
    similes : [
        "Safe Wallet",
        "Safe",
        "Safe transaction",
        "Safe Vault",
        "Transaction with safe"
    ],
    description: "Propose a transaction with safe",
    validate: async (runtime: IAgentRuntime) => {
        await validateSafeConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        _state?: State,
        _options?: Record<string, unknown>,
        callback?: HandlerCallback
    ) => {
        const config = await validateSafeConfig(runtime);
        const safeAddress = config.SAFE_ADDRESS;
        const agentAddress = config.AGENT_ADDRESS;
        const contractAddress = config.CONTRACT_ADDRESS;
        const agentPrivateKey = config.AGENT_PRIVATE_KEY;
        const evmProviderUrl = config.EVM_PROVIDER_URL;

        elizaLogger.info("Creating safe transaction");

        const proposedTransaction = await createTransaction(agentAddress, agentPrivateKey, safeAddress, contractAddress, evmProviderUrl);
        try {
            
            elizaLogger.success('Successfull');
            if (callback) {
                callback(
                    {
                        text: `Transaction for safe vault: ${proposedTransaction}`,
                        action: "NASA Mars photos",
                    },
                    []
                );
            }
        } catch (error) {
            elizaLogger.error("Error creating safe transaction :", error);
            if (!callback) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            callback(
                {
                    text: `Failed to create safe transaction: ${errorMessage}`,
                    error: errorMessage,
                },
                []
            );
        }
    },
    examples: vaultTransactions as ActionExample[][],
} as Action;