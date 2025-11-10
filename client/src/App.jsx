import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Verify from "./pages/Verify";

export default function App() {
  return (
    <div className="app">
      <header style={styles.header}>
        <Link to="/" style={styles.link}>🎮 Plinko Fair Game</Link>
        <nav>
          <Link to="/verify" style={styles.navLink}>Verify</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    background: "#111",
    color: "#fff",
  },
  link: {
    color: "white",
    fontWeight: "bold",
    fontSize: "1.2rem",
    textDecoration: "none",
  },
  navLink: {
    color: "#0ff",
    textDecoration: "none",
    marginLeft: "1rem",
  },
};
