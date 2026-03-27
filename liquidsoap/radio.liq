set("log.stdout", true)

# Enable control server (THIS is the correct way)
set("server.socket", true)
set("server.socket.port", 1234)
set("server.socket.bind_addr", "0.0.0.0")

# Request queue
q = request.queue(id="radio_queue")

# Safe fallback
radio = fallback([
  q,
  blank(duration=5.0)
])

# Output stream
output.icecast(
  %mp3,
  host="icecast",
  port=8000,
  password="hackme",
  mount="/stream",
  radio
)
