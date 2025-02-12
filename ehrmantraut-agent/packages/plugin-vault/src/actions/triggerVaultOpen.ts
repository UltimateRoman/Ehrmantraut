import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import axios from "axios";

export const triggerVaultOpen: Action = {
    name: "SAFEVAULT_TRIGGER_VAULT_OPEN",
    similes: [
        'I can get the sensor data for you.',
    ],
    description: "Trigger the vault device open.",
    validate: async (runtime: IAgentRuntime) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {

        try {
            var response = await axios.get(`${process.env.VAULT_API_URL}/toggle`);

            if (response.data.status !== "success") {
                throw new Error("Failed to trigger vault open");
            }

            elizaLogger.success(
                `Successfully triggered vault open`
            );
            if (callback) {
                callback({
                    text: `The vault is now open.`,
                });
                return true;
            }
        } catch (error:any) {
            elizaLogger.error("Error in Vault plugin handler:", error);
            callback({
                text: `Error triggering vault open: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [],
} as Action;