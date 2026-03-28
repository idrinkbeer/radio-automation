set("log.stdout", true)

set("server.telnet", true)
set("server.telnet.port", 1234)
set("server.telnet.bind_addr", "0.0.0.0")

# SAFE PLAYLIST
radio = fallback([
  playlist(
    id="main_playlist",
    reload_mode="watch",
    "/storage/master.m3u"
  ),
  blank(duration=5.0)
])

output.icecast(
  %mp3(bitrate=128, stereo=true),
  host="icecast",
  port=8000,
  password="hackme",
  mount="/stream",
  name="My Radio Station",
  radio
)
