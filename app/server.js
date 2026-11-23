const http = require("http");

const PORT = Number(process.env.PORT || 3000);
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const FAIL_MODE = process.env.FAIL_MODE || "false";

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

log(`ConectaNorte iniciado na porta ${PORT}`);
log(`LOG_LEVEL=${LOG_LEVEL}`);

const server = http.createServer((req, res) => {
  log(`${req.method} ${req.url}`);

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({
      status: "ok",
      service: "ConectaNorte",
      pid: process.pid,
      uid: process.getuid ? process.getuid() : "n/a"
    }));
  }

  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(`
      <h1>ConectaNorte</h1>
      <p>Serviço HTTP executando em container Docker.</p>
      <p>Use <a href="/health">/health</a> para verificar o serviço.</p>
    `);
  }

  if (req.url === "/fail") {
    log("Falha controlada solicitada. Encerrando com código 1.");
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Falha controlada. O container será reiniciado pelo Docker.\n");
    setTimeout(() => process.exit(1), 100);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Rota não encontrada.\n");
});

server.listen(PORT, "0.0.0.0", () => {
  log(`Servidor HTTP pronto em http://0.0.0.0:${PORT}`);
});

if (FAIL_MODE === "true") {
  log("FAIL_MODE=true: falha controlada será acionada após 15 segundos.");
  setTimeout(() => {
    log("Encerrando para testar a recuperação automática.");
    process.exit(1);
  }, 15000);
}

process.on("SIGTERM", () => {
  log("SIGTERM recebido. Encerrando normalmente.");
  server.close(() => process.exit(0));
});
