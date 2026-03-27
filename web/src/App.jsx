import React from "react";
import { useEffect, useState } from "react";

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  // Load tracks from API
  const loadTracks = async () => {
    const res = await fetch("http://192.99.63.54:3001/tracks");
    const data = await res.json();
    setTracks(data);
  };

  useEffect(() => {
    loadTracks();
  }, []);

  // Drag start
  const onDragStart = (track) => {
    event.dataTransfer.setData("track", track);
  };

  // Drop into playlist
const onDrop = async (e) => {
  e.preventDefault();
  const track = e.dataTransfer.getData("track");

  setPlaylist([...playlist, track]);

  await fetch("http://192.99.63.54:3001/enqueue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ track })
  });
};

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LIBRARY */}
      <div style={{ width: "40%", padding: 20, borderRight: "1px solid #ccc" }}>
        <h2>🎵 Library</h2>
        {tracks.map((track, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => onDragStart(track)}
            style={{
              padding: 10,
              marginBottom: 5,
              background: "#eee",
              cursor: "grab"
            }}
          >
            {track}
          </div>
        ))}
      </div>

      {/* PLAYLIST */}
      <div
        style={{ width: "60%", padding: 20 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <h2>📻 Playlist</h2>

        {playlist.map((track, i) => (
          <div
            key={i}
            style={{
              padding: 10,
              marginBottom: 5,
              background: "#d0f0ff"
            }}
          >
            {i + 1}. {track}
          </div>
        ))}
      </div>
    </div>
  );
}
