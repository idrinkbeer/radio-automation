import React, { useEffect, useState } from "react";

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);

  const API = "http://192.99.63.54:3001";

  const loadTracks = async () => {
    const res = await fetch(`${API}/tracks`);
    const data = await res.json();
    setTracks(data);
  };

  const loadSavedPlaylists = async () => {
    const res = await fetch(`${API}/playlists`);
    const data = await res.json();
    setSavedPlaylists(data);
  };

  const loadPlaylist = async (name) => {
    const res = await fetch(`${API}/playlist/${name}`);
    const data = await res.json();

    setPlaylist(data);
    localStorage.setItem("playlist", JSON.stringify(data));
  };

  const playPlaylist = async () => {
    await fetch(`${API}/playlist/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tracks: playlist.map(p =>
          typeof p === "string"
            ? { file: p, cueIn: 0, cueOut: 0, segueStart: 0 }
            : p
        )
      })
    });

    alert("Playlist sent to automation!");
  };

  useEffect(() => {
    loadTracks();
    loadSavedPlaylists();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("playlist");
    if (saved) {
      setPlaylist(JSON.parse(saved));
    }
  }, []);

  // UPLOAD
  const uploadFiles = async (files) => {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    await fetch(`${API}/upload`, {
      method: "POST",
      body: formData
    });

    loadTracks();
  };

  const handleFileSelect = (e) => {
    uploadFiles(e.target.files);
  };

  const handleDropUpload = async (e) => {
    e.preventDefault();
    uploadFiles(e.dataTransfer.files);
  };

  const onDragStart = (track, e) => {
    e.dataTransfer.setData("track", track);
  };

  // DROP INTO PLAYLIST (SEGUE MODE)
  const onDrop = (e) => {
    e.preventDefault();
    const track = e.dataTransfer.getData("track");

    const newTrack = {
      file: track,
      cueIn: 0,
      cueOut: 0,
      segueStart: 0
    };

    setPlaylist((prev) => {
      const updated = [...prev, newTrack];
      localStorage.setItem("playlist", JSON.stringify(updated));
      return updated;
    });
  };

  const savePlaylist = async () => {
    const name = prompt("Playlist name?");
    if (!name) return;

    await fetch(`${API}/playlist/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        tracks: playlist
      })
    });

    alert("Saved!");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LIBRARY */}
      <div
        style={{ width: "40%", padding: 20, borderRight: "1px solid #ccc" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropUpload}
      >
        <h2>🎵 Library</h2>

        <input type="file" multiple onChange={handleFileSelect} />
        <p>Drag & drop files here to upload</p>

        <hr />

        {tracks.map((track, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => onDragStart(track, e)}
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

        <select onChange={(e) => loadPlaylist(e.target.value)}>
          <option value="">Load Playlist</option>
          {savedPlaylists.map((name, i) => (
            <option key={i} value={name}>{name}</option>
          ))}
        </select>

        <button onClick={savePlaylist}>💾 Save Playlist</button>
        <button onClick={playPlaylist}>▶️ Play Playlist</button>

        <hr />

        {playlist.map((item, i) => {
          const trackObj =
            typeof item === "string"
              ? { file: item, cueIn: 0, cueOut: 0, segueStart: 0 }
              : item;

          return (
            <div
              key={i}
              style={{
                padding: 10,
                marginBottom: 10,
                background: "#d0f0ff"
              }}
            >
              <div><b>{i + 1}. {trackObj.file}</b></div>

              <div>
                Cue In: {trackObj.cueIn}s
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={trackObj.cueIn}
                  onChange={(e) => {
                    const updated = [...playlist];
                    updated[i] = {
                      ...trackObj,
                      cueIn: Number(e.target.value)
                    };
                    setPlaylist(updated);
                    localStorage.setItem("playlist", JSON.stringify(updated));
                  }}
                />
              </div>

              <div>
                Segue Start: {trackObj.segueStart}s
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={trackObj.segueStart}
                  onChange={(e) => {
                    const updated = [...playlist];
                    updated[i] = {
                      ...trackObj,
                      segueStart: Number(e.target.value)
                    };
                    setPlaylist(updated);
                    localStorage.setItem("playlist", JSON.stringify(updated));
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
