set("server.telnet", true)
set("server.telnet.port", 1234)
set("log.stdout", true)

# Create a request queue
q = request.queue(id="radio_queue")

# Fallback if queue empty
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
