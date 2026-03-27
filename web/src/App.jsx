import React, { useEffect, useState } from "react";
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

    setPlaylist([...playlist, track]);

    await fetch(`${API}/enqueue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ track })
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
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
