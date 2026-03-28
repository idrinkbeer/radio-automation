import React, { useEffect, useState, useRef } from "react";
import WaveSurfer from "wavesurfer.js/dist/wavesurfer.esm.js";

const API = "http://192.99.63.54:3001";

const Waveform = ({ trackObj, i, setPlaylist }) => {
  const containerRef = React.useRef(null);
  const waveRef = React.useRef(null);

  const [isReady, setIsReady] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [zoom, setZoom] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [, forceRender] = React.useState(0);

  React.useEffect(() => {
    if (!containerRef.current) return;

    waveRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#777",
      progressColor: "#00bcd4",
      cursorColor: "yellow",
      height: 80,
      url: `http://192.99.63.54:3001/music/${trackObj.file}`
    });

    waveRef.current.on("ready", () => {
      setDuration(waveRef.current.getDuration());
      setIsReady(true);
    });

    // CLICK → set segue
    waveRef.current.on("interaction", () => {
      const time = waveRef.current.getCurrentTime();

      setPlaylist((prev) => {
        const updated = [...prev];
        updated[i] = {
          ...updated[i],
          segueStart: Math.floor(time)
        };
        localStorage.setItem("playlist", JSON.stringify(updated));
        return updated;
      });

      forceRender(n => n + 1);
    });

    // keep marker aligned while scrolling
    waveRef.current.on("scroll", () => {
      forceRender(n => n + 1);
    });

    return () => waveRef.current.destroy();
  }, []);

  const togglePlay = () => {
    if (!waveRef.current) return;
    waveRef.current.playPause();
    setIsPlaying(!isPlaying);
  };

  const handleZoom = (value) => {
    setZoom(value);
    if (waveRef.current) {
      waveRef.current.zoom(Number(value));
      setTimeout(() => forceRender(n => n + 1), 50);
    }
  };

  // ✅ correct marker position
  const getMarkerPosition = () => {
    if (!waveRef.current || !duration) return 0;

    const container = waveRef.current.container;
    if (!container) return 0;

    const scrollWidth = container.scrollWidth;
    const scrollLeft = container.scrollLeft;

    const progress = (trackObj.segueStart || 0) / duration;

    return progress * scrollWidth - scrollLeft;
  };

  // ✅ DRAG LOGIC (container-based)
  const handleMouseDown = (e) => {
    const markerX = getMarkerPosition();
    const clickX = e.nativeEvent.offsetX;

    // only start drag if clicking near marker
    if (Math.abs(clickX - markerX) < 15) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !waveRef.current) return;

    const container = waveRef.current.container;
    const rect = container.getBoundingClientRect();

    const x = e.clientX - rect.left + container.scrollLeft;
    const totalWidth = container.scrollWidth;

    const percent = x / totalWidth;
    const newTime = percent * duration;

    setPlaylist((prev) => {
      const updated = [...prev];
      updated[i] = {
        ...updated[i],
        segueStart: Math.max(0, Math.floor(newTime))
      };
      localStorage.setItem("playlist", JSON.stringify(updated));
      return updated;
    });

    forceRender(n => n + 1);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div style={{ marginTop: 10 }}>
      
      {/* CONTROLS */}
      <div style={{ marginBottom: 5 }}>
        <button onClick={togglePlay} disabled={!isReady}>
          {isPlaying ? "⏸ Pause" : "▶️ Play"}
        </button>

        <span style={{ marginLeft: 10 }}>
          Zoom:
          <input
            type="range"
            min="0"
            max="200"
            value={zoom}
            onChange={(e) => handleZoom(e.target.value)}
          />
        </span>
      </div>

      {/* WAVEFORM + DRAG */}
      <div
        style={{ position: "relative" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div ref={containerRef} />

        {/* 🔴 MARKER */}
        {duration > 0 && (
          <div
            style={{
              position: "absolute",
              left: `${getMarkerPosition()}px`,
              top: 0,
              width: 6,
              height: "100%",
              background: "red",
              pointerEvents: "none",
              zIndex: 10
            }}
          />
        )}
      </div>

      <div style={{ marginTop: 5 }}>
        Segue: {trackObj.segueStart || 0}s
      </div>
    </div>
  );
};

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);

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
            ? { file: p, segueStart: 0 }
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

  // ADD TRACK TO PLAYLIST
  const onDrop = (e) => {
    e.preventDefault();
    const track = e.dataTransfer.getData("track");

    const newTrack = {
      file: track,
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
              ? { file: item, segueStart: 0 }
              : item;

          return (
            <div
              key={i}
              style={{
                padding: 10,
                marginBottom: 15,
                background: "#d0f0ff"
              }}
            >
              <div><b>{i + 1}. {trackObj.file}</b></div>

              <Waveform
                trackObj={trackObj}
                i={i}
                setPlaylist={setPlaylist}
              />

              <div style={{ marginTop: 5 }}>
                Segue starts at: {trackObj.segueStart || 0}s
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
