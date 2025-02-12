import { ActionExample } from "@elizaos/core";

export const vaultTransactions: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "I want to open safe vault",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me execute the safe vault transaction for you",
                action: "Safe vault transaction"
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Open the vault",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me open the safe vault for you",
                action: "Safe vault transaction"
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you open the safe vault?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Sure. Let me execute the transaction on safe vault for you",
                action: "Safe vault transaction"
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "How to open the vault",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me execute the transaction to opne the safe vault for you",
                action: "Safe vault transaction"
            },
        },
    ],
]
