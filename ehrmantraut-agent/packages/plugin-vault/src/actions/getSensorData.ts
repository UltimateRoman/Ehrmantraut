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

export const getSensorData: Action = {
    name: "SAFEVAULT_GET_SENSOR_DATA",
    similes: [
        'I can get the sensor data for you.',
    ],
    description: "Get the the sensor data from the vault device.",
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
            var ldrResponse = await axios.get(`${process.env.VAULT_API_URL}/ldr`);
            var distanceResponse = await axios.get(`${process.env.VAULT_API_URL}/distance`);

            var isOpen = false;

            if (ldrResponse?.data?.light_value == "bright" &&
                distanceResponse?.data?.distance_cm > 10) {
                isOpen = true;
            }

            elizaLogger.success(
                `Successfully fetched sensor data`
            );
            if (callback) {
                callback({
                    text: `The vault is currently ${isOpen ? "open" : "closed"}.`,
                });
                return true;
            }
        } catch (error:any) {
            elizaLogger.error("Error in Vault plugin handler:", error);
            callback({
                text: `Error fetching sensor data: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [],
} as Action;