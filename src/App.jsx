import { useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";

async function fetchHenrik(path) {
    const res = await fetch(`/api/henrik/${path}`);

    if (!res.ok) {
        if (res.status === 404) {
            throw new Error("Player not found. Check name, tag and region.");
        }
        if (res.status === 429) {
            throw new Error("Too many requests. Wait a minute and try again.");
        }
        throw new Error(`Request failed (${res.status})`);
    }

    return res.json();
}

function App() {
    const [name, setName] = useState("");
    const [tag, setTag] = useState("");
    const [region, setRegion] = useState("na");

    const [rank, setRank] = useState(null);
    const [match, setMatch] = useState(null);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setRank(null);
        setMatch(null);

        try {
            const playerPath = `${region}/pc/${encodeURIComponent(name.trim())}/${encodeURIComponent(tag.trim())}`;
            const [mmr, matches] = await Promise.all([
                fetchHenrik(`valorant/v3/mmr/${playerPath}`),
                fetchHenrik(`valorant/v4/matches/${playerPath}?size=1`),
            ]);

            const last = matches.data[0];
            if (!last) {
                throw new Error("No recent matches found for this player.");
            }

            const player = last.players.find(
                (p) =>
                    p.name.toLowerCase() === name.trim().toLowerCase() &&
                    p.tag.toLowerCase() === tag.trim().toLowerCase(),
            );
            const team = last.teams.find((t) => t.team_id === player?.team_id);
            if (!player || !team) {
                throw new Error("Couldn't read the player's last match.");
            }

            const { kills, deaths } = player.stats;
            setRank({
                tier: mmr.data.current.tier.name,
                rr: mmr.data.current.rr,
            });
            setMatch({
                score: `${team.rounds.won} - ${team.rounds.lost}`,
                kd: (kills / Math.max(deaths, 1)).toFixed(2),
            });
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                    required
                />
                <input
                    type="text"
                    name="tag"
                    placeholder="Tag"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    autoComplete="off"
                    required
                />
                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                >
                    <option value="na">North America</option>
                    <option value="eu">Europe</option>
                    <option value="ap">Asia-Pacific</option>
                    <option value="kr">Korea</option>
                    <option value="br">Brazil</option>
                    <option value="latam">Latin America</option>
                </select>
                <button type="submit">Look up</button>
            </form>
            {rank && (
                <p>
                    {rank.tier} - {rank.rr} RR
                </p>
            )}
            {match && (
                <>
                    <p>Last match: {match.score}</p>
                    <p>K/D: {match.kd}</p>
                </>
            )}
            {error && <p role="alert">{error}</p>}
        </main>
    );
}

export default App;
