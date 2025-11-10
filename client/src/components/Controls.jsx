export default function Controls({
    bet,
    setBet,
    dropColumn,
    setDropColumn,
    muted,
    setMuted,
    onDrop,
    loading,
}) {
    return (
        <div style={styles.controls}>
            <label>
                Drop Column:
                <input
                    type="number"
                    min="0"
                    max="12"
                    value={dropColumn}
                    onChange={(e) => setDropColumn(Number(e.target.value))}
                    style={styles.input}
                />
            </label>

            <label>
                Bet:
                <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Number(e.target.value))}
                    style={styles.input}
                />
            </label>

            <button onClick={onDrop} disabled={loading} style={styles.button}>
                {loading ? "Dropping..." : "Drop Ball"}
            </button>

            <button onClick={() => setMuted(!muted)} style={styles.mute}>
                {muted ? "🔇" : "🔊"}
            </button>
        </div>
    );
}

const styles = {
    controls: {
        display: "flex",
        justifyContent: "center",
        gap: "1rem",
        marginBottom: "1rem",
    },
    input: {
        marginLeft: "0.5rem",
        width: "80px",
    },
    button: {
        padding: "0.5rem 1rem",
        background: "#0f0",
        border: "none",
        borderRadius: "6px",
        fontWeight: "bold",
    },
    mute: {
        background: "transparent",
        border: "none",
        fontSize: "1.4rem",
    },
};
