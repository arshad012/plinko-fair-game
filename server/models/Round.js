const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
    status: { type: String, enum: ['CREATED', 'STARTED', 'REVEALED'], default: 'CREATED' },

    // Fairness
    nonce: { type: String, required: true },
    commitHex: { type: String, required: true },
    serverSeed: { type: String }, // revealed post-round
    clientSeed: { type: String },
    combinedSeed: { type: String },
    pegMapHash: { type: String },

    // Game
    rows: { type: Number, default: 12 },
    dropColumn: { type: Number },
    binIndex: { type: Number },
    payoutMultiplier: { type: Number },
    betCents: { type: Number, default: 0 },
    pathJson: { type: Object }, // decisions per row
    revealedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Round', roundSchema);
