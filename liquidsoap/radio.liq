set("log.stdout", true)

# Enable TCP control server (NOT unix socket)
set("server.telnet", true)
set("server.telnet.port", 1234)
set("server.telnet.bind_addr", "0.0.0.0")

# IMPORTANT: disable socket mode
set("server.socket", false)

# Queue
q = request.queue(id="radio_queue")

radio = fallback([
  q,
  blank(duration=5.0)
])

output.icecast(
  %mp3,
  host="icecast",
  port=8000,
  password="hackme",
  mount="/stream",
  radio
)
