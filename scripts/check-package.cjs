const { spawn } = require('node:child_process');
const path = require('node:path');
const assert = require('node:assert/strict');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(path.resolve(process.argv[2] || 'dist/win-unpacked/XDCC Downloader.exe'), ['--remote-debugging-port=19224'], { env, windowsHide: true, stdio: 'ignore' });
  let socket;
  try {
    let pages;
    for (let i = 0; i < 60; i++) {
      try { pages = await (await fetch('http://127.0.0.1:19224/json/list')).json(); if (pages.some(page => page.type === 'page')) break; } catch {}
      await delay(250);
    }
    const page = pages?.find(page => page.type === 'page'); assert.ok(page, 'Finestra del pacchetto non disponibile');
    socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    const response = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout verifica pacchetto')), 30000);
      socket.onmessage = event => { const data = JSON.parse(event.data); if (data.id === 1) { clearTimeout(timer); resolve(data); } };
    });
    socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: `(async () => { const r = await window.downloader.search('ubuntu'); return {title:document.title, manual:!!document.getElementById('request'), search:r.ok, count:r.results?.length}; })()`, awaitPromise: true, returnByValue: true } }));
    const result = (await response).result?.result?.value;
    assert.equal(result?.title, 'XDCC Downloader'); assert.equal(result.manual, true); assert.equal(result.search, true); assert.ok(result.count > 0);
    console.log('Pacchetto Windows: interfaccia, download manuale e ricerca reale OK');
  } finally {
    socket?.close();
    if (child.pid && process.platform === 'win32') await new Promise(resolve => { const cleanup = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }); cleanup.on('exit', resolve); cleanup.on('error', resolve); });
    else child.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
