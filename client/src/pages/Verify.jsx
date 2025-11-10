import { useState } from "react";
import { verifyRound } from "../utils/api";

export default function Verify() {
    const [form, setForm] = useState({
        serverSeed: "",
        clientSeed: "",
        nonce: "",
        dropColumn: 6,
    });
    const [result, setResult] = useState(null);

    async function handleVerify(e) {
        e.preventDefault();
        try {
            const res = await verifyRound(form);
            setResult(res);
        } catch (err) {
            alert("Verification failed");
        }
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h2>🔍 Verify Round</h2>
            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
                {["serverSeed", "clientSeed", "nonce"].map((f) => (
                    <input
                        key={f}
                        required
                        placeholder={f}
                        value={form[f]}
                        onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    />
                ))}
                <input
                    type="number"
                    placeholder="dropColumn"
                    value={form.dropColumn}
                    onChange={(e) => setForm({ ...form, dropColumn: Number(e.target.value) })}
                />
                <button type="submit" style={{ padding: "0.5rem", background: "#0ff", border: "none", borderRadius: "6px" }}>Verify</button>
            </form>

            {result && (
                <div style={{ marginTop: "1rem", textAlign: "left" }}>
                    <p><b>commitHex:</b> {result.commitHex}</p>
                    <p><b>combinedSeed:</b> {result.combinedSeed}</p>
                    <p><b>pegMapHash:</b> {result.pegMapHash}</p>
                    <p><b>binIndex:</b> {result.binIndex}</p>
                </div>
            )}
        </div>
    );
}
