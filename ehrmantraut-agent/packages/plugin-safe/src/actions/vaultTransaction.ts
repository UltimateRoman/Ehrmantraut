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
    name: "NASA Mars photos",
    similes : [
        "Mars",
        "Martian"
    ],
    description: "Get random mars photo",
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
        const nasaService = createTransaction(config.NasaAPIKey);
        try {
            const MarsData = await nasaService.getAPOD();
            elizaLogger.success('Successfull');
            if (callback) {
                callback(
                    {
                        text: `Here's a Mars photo: ${MarsData.explanation} and ${MarsData}`,
                        action: "NASA Mars photos",
                    },
                    []
                );
            }
        } catch (error) {
            elizaLogger.error("Error getting Mars photo:", error);
            if (!callback) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            callback(
                {
                    text: `Failed to get Mars photo: ${errorMessage}`,
                    error: errorMessage,
                },
                []
            );
        }
    },
    examples: vaultTransactions as ActionExample[][],
} as Action;