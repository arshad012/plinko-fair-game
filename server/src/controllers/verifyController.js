const Round = require('../models/Round');
const { computeCommit, computeCombinedSeed, generatePegMapAndHash, computePathAndBin } = require('../utils/hashUtils.js');
const { createPRNGFromHexSeed } = require('../utils/prng.js');

/**
 * GET /api/verify?serverSeed=&clientSeed=&nonce=&dropColumn=&roundId=
 * If roundId provided, fetch stored round and compare.
 */
async function verifyQuery(req, res) {
    try {
        const { serverSeed, clientSeed, nonce, dropColumn, roundId } = req.query;

        let serverSeedUsed = serverSeed;
        let nonceUsed = nonce;
        let clientSeedUsed = clientSeed ?? '';

        if (roundId) {
            const round = await Round.findById(roundId).lean();
            if (!round) return res.status(404).json({ error: 'round not found' });
            // override provided seeds with stored values for comparison
            serverSeedUsed = round.serverSeed;
            nonceUsed = round.nonce;
            clientSeedUsed = round.clientSeed;
        }

        if (!serverSeedUsed || !nonceUsed) {
            return res.status(400).json({ error: 'serverSeed and nonce are required (or provide roundId)' });
        }

        const commitHex = computeCommit(serverSeedUsed, nonceUsed);
        const combinedSeed = computeCombinedSeed(serverSeedUsed, clientSeedUsed || '', nonceUsed);
        const prng = createPRNGFromHexSeed(combinedSeed);
        const { pegMap, pegMapHash } = generatePegMapAndHash(prng, 12);
        const { decisions, binIndex } = computePathAndBin(prng, pegMap, Number(dropColumn ?? 6), 12);

        const result = { commitHex, combinedSeed, pegMapHash, binIndex, decisions };

        // If roundId was provided, compare pegMapHash & binIndex against stored
        if (roundId) {
            const round = await Round.findById(roundId).lean();
            result.matches = {
                commitHex: commitHex === round.commitHex,
                pegMapHash: pegMapHash === round.pegMapHash,
                binIndex: binIndex === round.binIndex
            };
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'verify failed' });
    }
}

module.exports = { verifyQuery };
