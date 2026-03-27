set("log.stdout", true)

music = playlist("/storage/music")

radio = crossfade(
  fade_in=3.0,
  fade_out=3.0,
  music
)

output.icecast(
  %mp3,
  host="icecast",
  port=8000,
  password="hackme",
  mount="/stream",
  radio
)
