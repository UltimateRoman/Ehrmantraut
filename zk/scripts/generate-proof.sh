#!/bin/bash

cd circuits/build

# compile the witness with webassembly
node circuit_js/generate_witness.js circuit_js/circuit.wasm input.json witness.wtns
snarkjs groth16 prove circuit_0000.zkey witness.wtns proof.json public.json
