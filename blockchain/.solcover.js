// this is a workaround to a known problem that affect code coverage when the compiler optimizer is enabled
module.exports = {
    configureYulOptimizer: true,
    solcOptimizerDetails: {
        yul: true,
        yulDetails: {
            optimizerSteps:
                'dhfoDgvlfnTUtnIf' + // None of these can make stack problems worse
                '[' +
                'xa[r]EsLM' + // Turn into SSA and simplify
                'CTUtTOntnfDIl' + // Perform structural simplification
                'Ll' + // Simplify again
                'Vl [j]' + // Reverse SSA
                // should have good "compilability" property here.

                'Tpel' + // Run functional expression inliner
                'xa[rl]' + // Prune a bit more in SSA
                'xa[r]L' + // Turn into SSA again and simplify
                'gvf' + // Run full inliner
                'CTUa[r]LSsTFOtfDna[r]Il' + // SSA plus simplify
                ']' +
                'jml[jl] VTOl jml : fDnTO'
        }
    }
};
