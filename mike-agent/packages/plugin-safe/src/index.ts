import type { Plugin } from "@elizaos/core";
import { vaultTransaction } from "./actions/vaultTransaction";

export const safePlugin: Plugin = {
    name: "Safe Plugin",
    description: "Safe plugin for transactions",
    actions: [vaultTransaction],
    providers: [],
};
export default safePlugin;