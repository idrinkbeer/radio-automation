set("log.stdout", true)

set("server.telnet", true)
set("server.telnet.port", 1234)
set("server.telnet.bind_addr", "0.0.0.0")

# PLAYLIST (fallible)
p = playlist(
  id="main_playlist",
  reload_mode="watch",
  "/storage/master.m3u"
)

# MAKE IT SAFE
radio = fallback([
  p,
  blank(duration=5.0)
])

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
