// nsloon-redirect.js

let url = $request.url;
let pluginUrl = decodeURIComponent(url.match(/plugin=([^&]+)/)?.[1] || '');

if (pluginUrl.startsWith('http')) {
  $done({ status: 302, headers: { Location: pluginUrl } });
} else {
  // fallback: show error or redirect to a help page
  $done({ status: 302, headers: { Location: 'https://kelee.one/error' } });
}
