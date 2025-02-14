import { ethers } from "ethers";
import * as dotenv from "dotenv";

const express = require('express');

const cors = require('cors');
const fs = require('fs');
const path = require('path');
const groth16 = require('snarkjs').groth16;

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());

const vKey = {
    "protocol": "groth16",
    "curve": "bn128",
    "nPublic": 2,
    "vk_alpha_1": [
     "846306915589539293395398494888719080820429513572224002775765798705424558682",
     "10408885344929095851125862412129921361616829368594431049960063927598026148245",
     "1"
    ],
    "vk_beta_2": [
     [
      "20418165869982504631129073824985813503276227024650951192075686325014535015519",
      "9317986687406786078643738794519581519322224280214408679358455282644452340753"
     ],
     [
      "3739210089012711051817426962384102941542739661095233291884171993123423505752",
      "10376791315246383583634540166867814604248911519701294485716598215341216015804"
     ],
     [
      "1",
      "0"
     ]
    ],
    "vk_gamma_2": [
     [
      "10857046999023057135944570762232829481370756359578518086990519993285655852781",
      "11559732032986387107991004021392285783925812861821192530917403151452391805634"
     ],
     [
      "8495653923123431417604973247489272438418190587263600148770280649306958101930",
      "4082367875863433681332203403145435568316851327593401208105741076214120093531"
     ],
     [
      "1",
      "0"
     ]
    ],
    "vk_delta_2": [
     [
      "7054286421198693811397609219890241661259774132732898301259142138716219825998",
      "14449852519646602593455066817277627663044181196695105022986896536488543111813"
     ],
     [
      "3487432524537488036745735977203181327821707875784325814581925421645744318241",
      "2654211860007528156443495945296931598534046294056397134821907325007846082959"
     ],
     [
      "1",
      "0"
     ]
    ],
    "vk_alphabeta_12": [
     [
      [
       "19773374155482792915102164324818394815015379949061298906703801115144639507899",
       "9580372767715179124188066772980383545290316299815842108152266797274193171785"
      ],
      [
       "4920201351261284560802989905591220850150871606068144950807365426229445371918",
       "3042157196942039011940393177056040474840084954455667650657461313819268188531"
      ],
      [
       "16376989832293726401698630808294004613206562021008417018103844073491561764397",
       "4077030869785460268290556276130635060866908316522616825719788405065599411917"
      ]
     ],
     [
      [
       "624764416830380759237212936482121716944789771198171169490221744716914184287",
       "21267569066336610709113921560265564161872586054718628046057471954486612996171"
      ],
      [
       "21449155912251111383780052597109234380247476725637048016114022220982035595846",
       "5951773870287360413539162455181679352371084583050804040293559402275308490269"
      ],
      [
       "10254907022514821833892582260879707477350079021907097811955855519503817885999",
       "10599808446935108142638609981955249872097629144322349195596973978339355263377"
      ]
     ]
    ],
    "IC": [
     [
      "11101583517898245923734966810941094196797094248590937992759829023582252798775",
      "8721759986384344759456963299348009571720886118085233160324790139786981271550",
      "1"
     ],
     [
      "7156276672957993330665152106292740001144387756631838881706363093709051036288",
      "2768718227811503290307125716243016314681572624748327722968100581594397087621",
      "1"
     ],
     [
      "20106329315321783846393476616032655144499948764108914422807562716410828041424",
      "10165302879677056784294196632220660492190104578624005324123759717854138278819",
      "1"
     ]
    ]
};

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
let chainId = 31337;

const avsDeploymentData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../contracts/deployments/safe-vault/${chainId}.json`), 'utf8'));
const safeVaultServiceManagerAddress = avsDeploymentData.addresses.safeVaultServiceManager;
const safeVaultServiceManagerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../abis/SafeVaultServiceManager.json'), 'utf8'));
const safeVaultServiceManager = new ethers.Contract(safeVaultServiceManagerAddress, safeVaultServiceManagerABI, wallet);

async function createNewTask(proof: string): Promise<string> {
    const tx = await safeVaultServiceManager.createNewTask(proof);
    const receipt = await tx.wait();
    return receipt.transactionHash;
}

app.post('/task', async (req: any, res: any) => {
    try {
        const { proof, publicSignals } = req.body as any;
        
        if (!proof) {
            return res.status(400).json({ error: 'Proof is required' });
        }

        const isValid = await groth16.verify(
            vKey,
            publicSignals,
            JSON.parse(proof)
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid zk proof' });
        }

        console.log('ZK proof received is valid');

        const txHash = await createNewTask(JSON.stringify(proof));

        return res.status(200).json({ 
            success: true,
            transactionHash: txHash
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Internal server error'
        });
    }
});

const PORT = 3005;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});