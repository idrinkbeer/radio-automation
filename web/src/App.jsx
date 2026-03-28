import React, { useEffect, useState } from "react";

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  const API = "http://192.99.63.54:3001";

  const loadTracks = async () => {
    const res = await fetch(`${API}/tracks`);
    const data = await res.json();
    setTracks(data);
  };

  const [savedPlaylists, setSavedPlaylists] = useState([]);

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
    body: JSON.stringify({ tracks: playlist })
  });

  alert("Playlist sent to automation!");
};

useEffect(() => {
  loadTracks();
  loadSavedPlaylists();
}, []);
  
  useEffect(() => {
    loadTracks();
  }, []);

  useEffect(() => {
  const saved = localStorage.getItem("playlist");
    if (saved) {
      setPlaylist(JSON.parse(saved));
    }
  }, []);
  
  // MULTI FILE UPLOAD
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

const onDrop = async (e) => {
  e.preventDefault();
  const track = e.dataTransfer.getData("track");

  const newTrack = {
    file: track,
    fadeIn: 2,
    fadeOut: 2
  };

  setPlaylist((prev) => {
    const updated = [...prev, newTrack];
    localStorage.setItem("playlist", JSON.stringify(updated));
    return updated;
  });
};

    await fetch(`${API}/enqueue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ track })
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

{playlist.map((item, i) => {
  // backward compatibility (old playlists)
  const trackObj =
    typeof item === "string"
      ? { file: item, fadeIn: 2, fadeOut: 2 }
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
        Fade In: {trackObj.fadeIn}s
        <input
          type="range"
          min="0"
          max="10"
          value={trackObj.fadeIn}
          onChange={(e) => {
            const updated = [...playlist];
            updated[i] = {
              ...trackObj,
              fadeIn: Number(e.target.value)
            };
            setPlaylist(updated);
            localStorage.setItem("playlist", JSON.stringify(updated));
          }}
        />
      </div>

      <div>
        Fade Out: {trackObj.fadeOut}s
        <input
          type="range"
          min="0"
          max="10"
          value={trackObj.fadeOut}
          onChange={(e) => {
            const updated = [...playlist];
            updated[i] = {
              ...trackObj,
              fadeOut: Number(e.target.value)
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
