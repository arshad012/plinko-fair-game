const crypto = require('crypto');
const { createPRNGFromHexSeed } = require('./prng');

/** SHA256 hex digest */
function sha256Hex(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Given serverSeed, nonce produce commitHex
 * commitHex = SHA256(serverSeed + ":" + nonce)
 */
function computeCommit(serverSeed, nonce) {
    return sha256Hex(`${serverSeed}:${nonce}`);
}

/**
 * combinedSeed = SHA256(serverSeed + ":" + clientSeed + ":" + nonce)
 */
function computeCombinedSeed(serverSeed, clientSeed, nonce) {
    return sha256Hex(`${serverSeed}:${clientSeed}:${nonce}`);
}

/**
 * Generate peg map for rows R.
 * Each peg has leftBias = 0.5 + (rand() - 0.5) * 0.2
 * Round to 6 decimals per spec.
 *
 * Return { pegMap, pegMapHash }
 */
function generatePegMapAndHash(PRNG, rows = 12) {
    const pegMap = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let p = 0; p < r + 1; p++) {
            // rand used for pegMap generation
            const rnd = PRNG.rand();
            let leftBias = 0.5 + (rnd - 0.5) * 0.2;
            // round to 6 decimals
            leftBias = Math.round(leftBias * 1e6) / 1e6;
            row.push(leftBias);
        }
        pegMap.push(row);
    }
    const pegMapHash = sha256Hex(JSON.stringify(pegMap));
    return { pegMap, pegMapHash };
}

/**
 * Deterministic run: given PRNG, pegMap, dropColumn, returns path and binIndex
 * - pos is number of right moves so far
 * - use a consistent PRNG stream: first pegMap generation above must have consumed those numbers,
 *   so caller should ensure PRNG usage order matches (we follow the assignment: peg map first, then row decisions)
 */
function computePathAndBin(PRNG, pegMap, dropColumn, rows = 12) {
    let pos = 0;
    const decisions = []; // array of { row, pegIndex, leftBiasBeforeAdj, adj, bias, rnd, decision }
    const mid = Math.floor(rows / 2); // 6 for rows=12
    const adj = (dropColumn - mid) * 0.01;

    for (let r = 0; r < rows; r++) {
        const pegIndex = Math.min(pos, r);
        const leftBias = pegMap[r][pegIndex];
        let biasPrime = Math.max(0, Math.min(1, leftBias + adj));
        // draw rand for decision
        const rnd = PRNG.rand();
        const decision = rnd < biasPrime ? 'L' : 'R';
        if (decision === 'R') pos += 1;
        decisions.push({
            row: r,
            pegIndex,
            leftBias,
            adj: Number(adj.toFixed(6)),
            biasPrime: Math.round(biasPrime * 1e6) / 1e6,
            rnd: Number(rnd.toFixed(10)),
            decision
        });
    }

    const binIndex = pos; // per spec
    return { decisions, binIndex };
}

module.exports = {
    sha256Hex,
    computeCommit,
    computeCombinedSeed,
    generatePegMapAndHash,
    computePathAndBin
};
