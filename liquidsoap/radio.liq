set("log.stdout", true)

music = playlist("/storage/music")

safe_music = fallback([music, blank(duration=5.0)])

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
