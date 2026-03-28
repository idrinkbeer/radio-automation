set("log.stdout", true)

# Enable control (keep it for later)
set("server.telnet", true)
set("server.telnet.port", 1234)
set("server.telnet.bind_addr", "0.0.0.0")

# LOOPING PLAYLIST
radio = playlist(
  id="main_playlist",
  reload_mode="watch",
  "/storage/master.m3u"
)

output.icecast(
  %mp3(bitrate=128, stereo=true),
  host="icecast",
  port=8000,
  password="hackme",
  mount="/stream",
  name="Radio X",
  description="Eclectic online rock radio",
  url="https://usradiox.com",
  genre="Eclectic rock",
  radio
)
