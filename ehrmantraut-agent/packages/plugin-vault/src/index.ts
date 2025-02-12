import type { Plugin } from "@elizaos/core";
import { getSensorData } from "./actions/getSensorData";
import { triggerVaultOpen } from "./actions/triggerVaultOpen";

export const vaultPlugin: Plugin = {
    name: "Vault Plugin",
    description: "",
    actions: [getSensorData, triggerVaultOpen],
    providers: [],
};
export default vaultPlugin;