import { useState } from "react";
import { commitRound, startRound, revealRound } from "../utils/api";
import GameBoard from "../components/GameBoard";
import Controls from "../components/Controls";
import ConfettiGenerator from "confetti-js";

export default function Home() {
    const [roundId, setRoundId] = useState(null);
    const [dropColumn, setDropColumn] = useState(6);
    const [bet, setBet] = useState(100);
    const [binIndex, setBinIndex] = useState(null);
    const [path, setPath] = useState([]);
    const [loading, setLoading] = useState(false);
    const [muted, setMuted] = useState(false);

    const playSound = (src) => {
        if (!muted) {
            const audio = new Audio(src);
            audio.play();
        }
    };

    async function handleDrop() {
        try {
            setLoading(true);
            // 1️⃣ Commit phase
            const commit = await commitRound();
            setRoundId(commit.roundId);

            // 2️⃣ Start round
            const clientSeed = "user-seed-" + Math.random().toString(36).slice(2);
            const start = await startRound(commit.roundId, {
                clientSeed,
                betCents: bet,
                dropColumn,
            });

            setPath(start.pathJson);
            setBinIndex(start.binIndex);

            playSound("/sounds/peg.mp3");

            // 3️⃣ Reveal server seed
            await revealRound(commit.roundId);

            // 🎉 Confetti effect
            const confetti = new ConfettiGenerator({ target: "confetti-canvas" });
            confetti.render();
            setTimeout(() => confetti.clear(), 3000);

            playSound("/sounds/win.mp3");
        } catch (err) {
            alert("Error playing: " + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Provably Fair Plinko 🎯</h2>
            <canvas id="confetti-canvas" style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}></canvas>
            <Controls
                bet={bet}
                setBet={setBet}
                dropColumn={dropColumn}
                setDropColumn={setDropColumn}
                muted={muted}
                setMuted={setMuted}
                onDrop={handleDrop}
                loading={loading}
            />
            <GameBoard rows={12} path={path} binIndex={binIndex} />
            {binIndex !== null && (
                <p style={{ fontSize: "1.2rem" }}>🎯 Landed in bin #{binIndex}</p>
            )}
        </div>
    );
}
