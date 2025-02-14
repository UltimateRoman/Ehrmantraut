import { type Client, type IAgentRuntime, elizaLogger } from "@elizaos/core";
import { ethers } from "ethers";
import { safeVaultABI } from "./abi.ts";
import axios from "axios";
import { buildPoseidonOpt } from 'circomlibjs';
import { groth16 } from '../../node_modules/snarkjs/main.js';


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
                await this.checkSensorData();
            },
            5000
        );

        provider.getBlockNumber()
            .then((blockNumber) => {
                elizaLogger.info("AutoClient", `Listener current block: ${blockNumber}`);
                this.lastProcessedBlock = blockNumber - 1;
            });
    }

    async checkForEvents() {
        try {
            const filter = this.contract.filters.UnlockVaultSignal();
            const events = await this.contract.queryFilter(filter, this.lastProcessedBlock);

            events.forEach(async (event) => {
                if (event.blockNumber > this.lastProcessedBlock + 1) {
                    elizaLogger.info("AutoClient", `Unlock event received`);
                    this.triggerVaultOpen();
                    this.lastProcessedBlock = event.blockNumber - 1;
                    await this.generateAndSendProof(event.transactionHash);
                }
            });
        } catch (error) {
            elizaLogger.error("AutoClient", `Error checking for events: ${error.message}`);
        }
    }

    async checkSensorData() {
        try {
            var response = await axios.get(`${process.env.VAULT_API_BASE_URL}/motion`, {
                headers: {
                    'client-id': process.env.VAULT_API_CLIENT_ID,
                    'client-secret': process.env.VAULT_API_CLIENT_SECRET
                }
            });

            if (response?.data?.motion === true) {
                elizaLogger.info("AutoClient", `Vault unlock detected`);
            }
        }
        catch (error) {
            elizaLogger.error("AutoClient", `Error getting sensor data: ${error.message}`);
        }
    }

    async triggerVaultOpen() {
        try {
            var response = await axios.post(`${process.env.VAULT_API_BASE_URL}/toggle`, {}, {
                headers: {
                    'client-id': process.env.VAULT_API_CLIENT_ID,
                    'client-secret': process.env.VAULT_API_CLIENT_SECRET
                }
            });

            if (response?.data?.status !== "success") {
                throw new Error("Failed to trigger vault open");
            }

            elizaLogger.info(
                `Successfully triggered vault open`
            );
        }
        catch (error) {
            elizaLogger.error("AutoClient", `Error triggering vault open: ${error.message}`);
        }
    }

    async generateAndSendProof(txHash: string) {
        try {
            const poseidon = await buildPoseidonOpt();
            const timestamp = Math.floor(Date.now() / 1000);
            const poseidonHash = poseidon([txHash, timestamp]);
            const hash = poseidon.F.toString(poseidonHash);

            const { proof, publicSignals } = await groth16.fullProve(
                {
                    currentTimestamp: timestamp,
                    poseidonHashResult: hash,
                    txHash: txHash,
                    originalTimestamp: timestamp
                },
                "src/custom-clients/circuit.wasm", 
                "src/custom-clients/circuit_0001.zkey"
            );

            const proofData = {
                proof: JSON.stringify(proof),
                publicSignals: publicSignals
            };

            elizaLogger.info("AutoClient", `Generated ZK proof: ${JSON.stringify(proofData)}`);

            var response = await axios.post(`${process.env.AVS_OPERATOR_URL}/task`, proofData);

            if (response?.data?.success !== true) {
                throw new Error("Failed to send proof");
            }

            elizaLogger.info(
                `Successfully sent proof to operator`
            );
        }
        catch (error) {
            elizaLogger.error("AutoClient", `Error generating proof: ${error.message}`);
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