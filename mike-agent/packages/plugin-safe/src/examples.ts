import { ActionExample } from "@elizaos/core";

export const vaultTransactions: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "I wonder what Mars looks like today",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me fetch a pic to show you",
                action: "Masa rover photo"
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Give me mars photo",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me fetch a pic to show you",
                action: "Masa rover photo"
            },
        },
    ],
]
