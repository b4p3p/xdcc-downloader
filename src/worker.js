const XDCC = require('xdccjs').default;
const path = require('node:path');
const { t, setLanguage } = require('./i18n');
// Validate offers before the library checks existing files or opens a stream.
const { CtcpParser } = require('xdccjs/dist/ctcp_parser');
const originalBuilder = CtcpParser.prototype.fileInfoBuilder;
const Downloader = require('xdccjs/dist/downloader').default;
const originalClose = Downloader.prototype.onClose;
Downloader.prototype.onClose = function (args, error) {
  if (finished) return;
  if (args.received !== args.fileInfo.length) {
    args.stream.end();
    finish({ state: 'error', message: t('err.truncated') });
    return;
  }
  // Report success only after the file stream has finished flushing to disk.
  args.stream.once('finish', () => originalClose.call(this, args, error));
  args.stream.end();
};
CtcpParser.prototype.fileInfoBuilder = function (parts, resume) {
  const name = (parts[2] || '').replace(/"/g, '');
  if (!name || name === '.' || name === '..' || /[\\/:<>|?*\x00-\x1f]/.test(name) || /[. ]$/.test(name) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) {
    throw new Error(t('err.fileName'));
  }
  const info = originalBuilder.call(this, parts, resume);
  if (path.dirname(path.resolve(info.filePath)) !== path.resolve(this.path)) throw new Error(t('err.filePath'));
  return info;
};
const send = data => { if (process.connected) process.send(data); };
let client;
let finished = false;
let downloading = false;
const QUEUE = /queued|queue position|position in.*queue|coda/i;
process.on('uncaughtException', error => finish({ state: 'error', message: error.message }));
process.on('unhandledRejection', error => finish({ state: 'error', message: String(error?.message || error) }));
function finish(data, code = 0) {
  if (finished) return;
  finished = true;
  send(data);
  setTimeout(() => process.exit(code), 150);
  if (client) client.quit();
}
process.once('message', ({ request: r, destination, language }) => {
  setLanguage(language);
  try {
    client = new XDCC({ host: r.host, port: r.port, chan: [r.channel], nickname: 'XDCCDownloader', randomizeNick: true, path: destination, tls: { enable: r.secure, rejectUnauthorized: true }, retry: 0, timeout: 120, botNameMatch: true, queue: QUEUE });
    send({ state: 'connecting', key: 'worker.connecting', params: { host: r.host }, message: t('worker.connecting', { host: r.host }) });
    client.on('error', error => finish({ state: 'error', message: String(error.message || error) }));
    client.on('debug', message => send({ log: String(message) }));
    client.on('notice', event => send({ log: `${event.nick || 'Server'}: ${event.message || ''}` }));
    const fromBot = event => event.nick?.toLowerCase() === r.bot.toLowerCase();
    // Surface queue notices as a state so the window can show the parcel waiting at the bot.
    const queueNotice = event => { if (fromBot(event) && !downloading && QUEUE.test(event.message || '')) send({ state: 'queued', message: `${event.nick}: ${event.message}` }); };
    client.on('notice', queueNotice);
    client.on('message', event => { if (fromBot(event)) { send({ log: `${event.nick}: ${event.message || ''}` }); queueNotice(event); } });
    client.once('ready', async () => {
      send({ state: 'waiting', key: 'worker.waiting', params: { bot: r.bot, pack: r.pack }, message: t('worker.waiting', { bot: r.bot, pack: r.pack }) });
      try {
        const job = await client.download(r.bot, r.pack);
        job.on('error', message => finish({ state: 'error', message: String(message) }));
        job.on('done', () => { if (job.show().failed.length) finish({ state: 'error', message: t('err.incompleteTransfer') }); });
      } catch (error) { finish({ state: 'error', message: error.message }); }
    });
    let lastTime = Date.now(), lastReceived = 0;
    client.on('downloading', (file, received, percentage) => {
      downloading = true;
      const now = Date.now();
      if (now - lastTime < 250) return;
      const speed = Math.max(0, (received - lastReceived) * 1000 / (now - lastTime));
      lastTime = now; lastReceived = received;
      send({ state: 'downloading', message: file.file, received, total: file.length, percentage: Number(percentage), speed });
    });
    client.once('downloaded', file => finish({ state: 'done', key: 'worker.done', params: { file: file.file }, message: t('worker.done', { file: file.file }), percentage: 100, received: file.length, total: file.length }));
  } catch (error) { finish({ state: 'error', message: error.message }); }
});
