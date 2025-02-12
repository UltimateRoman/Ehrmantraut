import { z } from "zod";
import type { IAgentRuntime } from "@elizaos/core";

export const safeEnvSchema = z.object({
    NasaAPIKey: z.string().min(1, "Nasa API token is required"),
});

export type safeConfig = z.infer<typeof safeEnvSchema>;

export async function validateSafeConfig(
    runtime: IAgentRuntime
): Promise<safeConfig> {
    try {
        const config = {
            NasaAPIKey:
                runtime.getSetting("NASA_API_KEY") ||
                process.env.NASA_API_KEY,
        };

        return safeEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `NASA API KEY configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}