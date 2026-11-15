const { t } = require('./i18n');
function parseRequest(text) {
  if (typeof text !== 'string' || text.length > 8000) throw new Error(t('err.request'));
  const link = text.match(/ircs?:\/\/[^\s]+/i);
  const serverField = text.match(/^\s*Server:\s*([^\s]+)[ \t]*$/im);
  const channelField = text.match(/^\s*Channel:\s*([^\s]+)[ \t]*$/im);
  const command = text.match(/^[ \t]*(?:Command:[ \t]*)?\/msg\s+([^\s,\x00-\x20]+)\s+xdcc\s+send\s+#?(\d+)[ \t]*\r?$/im);
  let address = link?.[0];
  if (serverField && channelField) {
    if (!/^(?:ircs?:\/\/)?(?:[a-z0-9.-]+|\[[a-f0-9:]+\])(?::\d+)?\/?$/i.test(serverField[1])) throw new Error(t('err.server'));
    const server = serverField[1].replace(/\/$/, '');
    address = `${/^ircs?:\/\//i.test(server) ? server : 'irc://' + server}/${encodeURIComponent(channelField[1].replace(/^#/, ''))}`;
  }
  if (address && !command) throw new Error(t('err.noCommand'));
  if (!address && command) throw new Error(t('err.noServer'));
  if (!address || !command) throw new Error(t('err.incomplete'));
  const url = new URL(address);
  const channel = decodeURIComponent(url.pathname.slice(1) + url.hash).replace(/^#/, '');
  if (!url.hostname || url.username || url.password || url.search || !channel || /[\s,\x00-\x20]/.test(channel)) throw new Error(t('err.link'));
  const pack = Number(command[2]);
  const port = Number(url.port || (url.protocol === 'ircs:' ? 6697 : 6667));
  if (!Number.isSafeInteger(pack) || pack < 1 || port < 1 || port > 65535) throw new Error(t('err.pack'));
  return { host: url.hostname, port, secure: url.protocol === 'ircs:', channel: '#' + channel, bot: command[1], pack };
}
module.exports = { parseRequest };
