module.exports.setSSEHeader = function setSSEHeaders(res) {
  res.set('Content-Type', 'text/event-stream')
  res.set('Cache-Control', 'no-cache')
  res.set('Connection', 'keep-alive')
}

module.exports.constructSSE = function constructSSE(res, status, content) {
  res.status(status)
  res.write("data: " + JSON.stringify(content) + "\n\n")
}

