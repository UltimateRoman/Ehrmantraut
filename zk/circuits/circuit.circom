pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template TimestampedTxHashVerifier() {
    signal input currentTimestamp;
    signal input poseidonHashResult;
    
    signal input txHash;
    signal input originalTimestamp;
    
    signal timeDifference;
    signal timeConstraintCheck1;
    signal timeConstraintCheck2;
    
    var DAY_IN_SECONDS = 86400;
    
    component hasher = Poseidon(2);
    hasher.inputs[0] <== txHash;
    hasher.inputs[1] <== originalTimestamp;
    
    hasher.out === poseidonHashResult;
    
    timeDifference <== currentTimestamp - originalTimestamp;
    timeConstraintCheck1 <== timeDifference + DAY_IN_SECONDS;
    timeConstraintCheck2 <== DAY_IN_SECONDS - timeDifference;
    
    component greaterEq1 = GreaterEqThan(252);
    component greaterEq2 = GreaterEqThan(252);
    
    greaterEq1.in[0] <== timeConstraintCheck1;
    greaterEq1.in[1] <== 0;
    
    greaterEq2.in[0] <== timeConstraintCheck2;
    greaterEq2.in[1] <== 0;
    
    1 === greaterEq1.out;
    1 === greaterEq2.out;
}

component main {public [poseidonHashResult, currentTimestamp]} = TimestampedTxHashVerifier();