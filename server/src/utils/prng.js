const crypto = require('crypto');

/**
 * Create a deterministic PRNG from a hex seed.
 * xorshift32 implementation. Returns an object with rand() in [0,1).
 * Seed is taken from first 4 bytes of hex (big-endian).
 */
function createPRNGFromHexSeed(hexSeed) {
    if (!/^[0-9a-fA-F]+$/.test(hexSeed)) throw new Error('seed must be hex string');

    const buf = Buffer.from(hexSeed, 'hex');
    // pad to at least 4 bytes
    const seedBuf = Buffer.alloc(4);
    buf.copy(seedBuf, 4 - Math.min(buf.length, 4), 0, Math.min(buf.length, 4));
    const seed = seedBuf.readUInt32BE(0) >>> 0;

    let x = seed || 0xdeadbeef;

    function next() {
        // xorshift32
        x ^= (x << 13) >>> 0;
        x ^= (x >>> 17) >>> 0;
        x ^= (x << 5) >>> 0;
        x = x >>> 0;
        return x;
    }

    return {
        // 32-bit uint
        nextUint32() {
            return next();
        },
        // float in [0,1)
        rand() {
            return next() / 0x100000000; // 2^32
        }
    };
}

module.exports = { createPRNGFromHexSeed };
