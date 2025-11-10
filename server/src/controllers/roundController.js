const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Round = require('../models/Round');
const {
    computeCommit,
    computeCombinedSeed,
    generatePegMapAndHash,
    computePathAndBin
} = require('../utils/hashUtils');
const { createPRNGFromHexSeed } = require('../utils/prng');

/**
 * POST /api/rounds/commit
 * Optional body: { nonce } to allow test vectors
 * Returns: { roundId, commitHex, nonce }
 */
async function commitRound(req, res) {
    try {
        const nonce = req.body?.nonce ?? (Date.now().toString());
        // generate serverSeed (32 bytes hex -> 64 hex chars)
        const serverSeed = crypto.randomBytes(32).toString('hex');
        const commitHex = computeCommit(serverSeed, nonce);

        const round = await Round.create({
            nonce,
            commitHex,
            serverSeed, // keep serverSeed server-side, do not reveal
            status: 'CREATED'
        });

        // Do not reveal serverSeed in response
        res.json({ roundId: round._id, commitHex, nonce });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'failed to create commit' });
    }
}

/**
 * POST /api/rounds/:id/start
 * body: { clientSeed, betCents, dropColumn }
 * - computes combinedSeed
 * - generates pegMap from PRNG seeded by combinedSeed
 * - computes path & binIndex
 * - persists combinedSeed (store), pegMapHash, pathJson, binIndex, status=STARTED
 * returns: { roundId, pegMapHash, rows }
 */
async function startRound(req, res) {
    const { id } = req.params;
    const { clientSeed = '', betCents = 0, dropColumn = 6 } = req.body;
    try {
        const round = await Round.findById(id);
        if (!round) return res.status(404).json({ error: 'round not found' });
        if (!round.serverSeed) {
            // serverSeed exists in DB but keep it secret until reveal — we stored it at commit time
        }
        // compute combinedSeed
        const combinedSeed = computeCombinedSeed(round.serverSeed, clientSeed, round.nonce);

        // PRNG seeded from combinedSeed
        const prng = createPRNGFromHexSeed(combinedSeed);

        // Peg map generation consumes PRNG numbers first
        const { pegMap, pegMapHash } = generatePegMapAndHash(prng, round.rows || 12);

        // Then compute path using PRNG continuation
        const { decisions, binIndex } = computePathAndBin(prng, pegMap, Number(dropColumn), round.rows || 12);

        // Calculate a simple payout multiplier example (symmetric, edges higher)
        const payoutMultiplier = 1 + Math.abs(binIndex - Math.floor((round.rows) / 2)) * 0.25; // example

        round.clientSeed = clientSeed;
        round.combinedSeed = combinedSeed;
        round.pegMapHash = pegMapHash;
        round.pathJson = decisions;
        round.binIndex = binIndex;
        round.betCents = Number(betCents);
        round.dropColumn = Number(dropColumn);
        round.payoutMultiplier = payoutMultiplier;
        round.status = 'STARTED';

        await round.save();

        res.json({
            roundId: round._id,
            pegMapHash,
            rows: round.rows,
            binIndex, // for UI to animate (server is authoritative)
            payoutMultiplier,
            pathJson: decisions // send for immediate UI animation; server still hasn't revealed seed
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'failed to start round' });
    }
}

/**
 * POST /api/rounds/:id/reveal
 * body: { }  - reveal uses stored serverSeed
 * returns: { roundId, serverSeed, revealedAt }
 */
async function revealRound(req, res) {
    const { id } = req.params;
    try {
        const round = await Round.findById(id);
        if (!round) return res.status(404).json({ error: 'round not found' });

        if (round.status === 'REVEALED') {
            return res.json({ roundId: round._id, serverSeed: round.serverSeed, revealedAt: round.revealedAt });
        }

        // move to revealed
        round.status = 'REVEALED';
        round.revealedAt = new Date();
        await round.save();

        res.json({ roundId: round._id, serverSeed: round.serverSeed, revealedAt: round.revealedAt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'failed to reveal' });
    }
}

/**
 * GET /api/rounds/:id
 */
async function getRound(req, res) {
    const { id } = req.params;
    try {
        const round = await Round.findById(id);
        if (!round) return res.status(404).json({ error: 'round not found' });

        // Do NOT expose serverSeed unless status=REVEALED
        const result = round.toObject();
        if (round.status !== 'REVEALED') {
            delete result.serverSeed;
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'failed to fetch round' });
    }
}

/**
 * GET /api/rounds?limit=20
 */
async function listRounds(req, res) {
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const rounds = await Round.find().sort({ createdAt: -1 }).limit(limit).lean();
    // hide serverSeed for not revealed rounds
    const safe = rounds.map(r => {
        if (r.status !== 'REVEALED') {
            delete r.serverSeed;
        }
        return r;
    });
    res.json(safe);
}

module.exports = {
    commitRound,
    startRound,
    revealRound,
    getRound,
    listRounds
};
