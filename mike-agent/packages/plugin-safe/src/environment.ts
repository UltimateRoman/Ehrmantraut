import { z } from "zod";
import type { IAgentRuntime } from "@elizaos/core";

export const safeEnvSchema = z.object({
    AGENT_PRIVATE_KEY: z.string().min(1, "AGENT_PRIVATE_KEY is required"),
    SAFE_ADDRESS: z.string().min(1, "SAFE_ADDRESS is required"),
    AGENT_ADDRESS: z.string().min(1, "AGENT_ADDRESS is required"),
    CONTRACT_ADDRESS: z.string().min(1, "CONTRACT_ADDRESS is required"),
});

export type safeConfig = z.infer<typeof safeEnvSchema>;

export async function validateSafeConfig(
    runtime: IAgentRuntime
): Promise<safeConfig> {
    try {
        const config = {
            AGENT_PRIVATE_KEY:
                runtime.getSetting("AGENT_PRIVATE_KEY") ||
                process.env.AGENT_PRIVATE_KEY,
            SAFE_ADDRESS:
                runtime.getSetting("SAFE_ADDRESS") ||
                process.env.SAFE_ADDRESS,
            AGENT_ADDRESS:
                runtime.getSetting("AGENT_ADDRESS") ||
                process.env.AGENT_ADDRESS,
            CONTRACT_ADDRESS:
                runtime.getSetting("CONTRACT_ADDRESS") ||
                process.env.CONTRACT_ADDRESS,
        };

        return safeEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Safe tranasaction configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}