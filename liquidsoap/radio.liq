set("log.stdout", true)

# Main music playlist
music = playlist("/storage/music")

# Fallback (prevents crash if empty)
safe_music = fallback([music, blank(duration=5)])

# Crossfade safely
radio = crossfade(
  fade_in=3.0,
  fade_out=3.0,
  safe_music
)

output.icecast(
  %mp3,
  host="icecast",
  port=8000,
  password="hackme",
  mount="/stream",
  radio
)
