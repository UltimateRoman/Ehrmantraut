import { type Client, type IAgentRuntime, elizaLogger } from "@elizaos/core";
import { ethers } from "ethers";
import { safeVaultABI } from "./abi.ts";

export class AutoClient {
    interval: NodeJS.Timeout;
    runtime: IAgentRuntime;
    contract: ethers.Contract;
    lastProcessedBlock: number;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;

        const provider = new ethers.JsonRpcProvider(process.env.EVM_PROVIDER_URL);
        this.contract = new ethers.Contract(process.env.SAFEVAULT_CONTRACT_ADDRESS, safeVaultABI, provider);

        this.interval = setInterval(
            async () => {
                await this.checkForEvents();
            },
            5000
        );

        provider.getBlockNumber()
            .then((blockNumber) => {
                elizaLogger.info("AutoClient", `Current block: ${blockNumber}`);
                this.lastProcessedBlock = blockNumber - 1;
            });
    }

    async checkForEvents() {
        try {
            const filter = this.contract.filters.UnlockVaultSignal();
            const events = await this.contract.queryFilter(filter, this.lastProcessedBlock);

            events.forEach((event) => {
                if (event.blockNumber > this.lastProcessedBlock + 1) {
                    elizaLogger.info("AutoClient", `Event received: ${JSON.stringify(event)}`);
                    this.lastProcessedBlock = event.blockNumber - 1;
                }
            });
        } catch (error) {
            elizaLogger.error("AutoClient", `Error checking for events: ${error.message}`);
        }
    }
}

export const AutoClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        const client = new AutoClient(runtime);
        return client;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Direct client does not support stopping yet");
    },
};

export default AutoClientInterface;