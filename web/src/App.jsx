import React, { useEffect, useState, useRef } from "react";
import WaveSurfer from "wavesurfer.js/dist/wavesurfer.esm.js";

const API = "http://192.99.63.54:3001";

// 🎵 WAVEFORM COMPONENT (FINAL CLEAN VERSION)
const Waveform = ({ trackObj, i, setPlaylist }) => {
  const containerRef = useRef(null);
  const waveRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    if (waveRef.current) {
      waveRef.current.destroy();
      waveRef.current = null;
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#777",
      progressColor: "#00bcd4",
      cursorColor: "yellow",
      height: 80,
      url: `${API}/music/${trackObj.file}`
    });

    waveRef.current = ws;

ws.on("ready", () => {
  const dur = ws.getDuration();
  setDuration(dur);
  setIsReady(true);

  // ✅ FORCE DEFAULT TO END
  if (trackObj.segueStart == null || trackObj.segueStart === 0) {
    setPlaylist((prev) => {
      const updated = [...prev];
      updated[i] = {
        ...updated[i],
        segueStart: Math.max(0, Math.floor(dur - 5))
      };

      localStorage.setItem("playlist", JSON.stringify(updated));
      return updated;
    });
  }
});

    ws.on("scroll", () => forceRender(n => n + 1));

    return () => ws.destroy();
  }, [trackObj.file]);

  // ✅ PLAY BUTTON BACK
  const togglePlay = () => {
    if (!waveRef.current) return;

    if (isPlaying) {
      waveRef.current.pause();
      setIsPlaying(false);
    } else {
      waveRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleZoom = (value) => {
    setZoom(value);
    waveRef.current?.zoom(Number(value));
    setTimeout(() => forceRender(n => n + 1), 50);
  };

  // ✅ CORRECT POSITION
const getMarkerPosition = () => {
  if (!waveRef.current || !duration) return 0;

  const progress = (trackObj.segueStart || 0) / duration;

  // use wrapper width instead of scrollWidth
  const wrapper = waveRef.current.getWrapper();
  if (!wrapper) return 0;

  const width = wrapper.clientWidth;

  return progress * width;
};

  // ✅ DRAG WORKING 100%
  const startDrag = (e) => {
    e.preventDefault();

    const onMove = (moveEvent) => {
      const ws = waveRef.current;
      if (!ws || !duration) return;

      const container = ws.container;
      const rect = container.getBoundingClientRect();

      const x = moveEvent.clientX - rect.left + container.scrollLeft;
      const width = container.clientWidth || 1;
      const percent = x / width;
      const newTime = percent * duration;

      setPlaylist((prev) => {
        const updated = [...prev];

        updated[i] = {
          ...updated[i],
          segueStart: Math.max(0, Math.min(duration, newTime))
        };

        localStorage.setItem("playlist", JSON.stringify(updated));
        return updated;
      });

      forceRender(n => n + 1);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div style={{ marginTop: 10 }}>
      
      {/* CONTROLS */}
      <div style={{ marginBottom: 5 }}>
        <button onClick={togglePlay} disabled={!isReady}>
          {isPlaying ? "⏸ Pause" : "▶️ Preview"}
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

      {/* WAVEFORM */}
      <div style={{ position: "relative" }}>
        <div ref={containerRef} />

        {/* 🔴 DRAGGABLE MARKER */}
        {isReady && (
          <div
            onMouseDown={startDrag}
            style={{
              position: "absolute",
              left: `${getMarkerPosition()}px`,
              top: 0,
              width: 6,
              height: "100%",
              background: "red",
              cursor: "ew-resize",
              zIndex: 10
            }}
          />
        )}
      </div>

      <div style={{ marginTop: 5 }}>
        Segue: {Math.floor(trackObj.segueStart || 0)}s
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
      file: track
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
