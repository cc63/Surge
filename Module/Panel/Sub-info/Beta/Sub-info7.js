const regions = ['HK', 'SG', 'JP', 'TW', 'US', 'UK'];
const area = $request.headers['http_x_forwarded_for'].split(',')[0];
const ip = $request.headers['x_real_ip'];
const region = (() => {
  for (const r of regions) {
    if ($request.url.indexOf(r) != -1) return r;
  }
  return 'GLOBAL';
})();

(async () => {
  const isSurge = typeof $httpClient !== 'undefined';
  const isp = await new Promise(resolve =>
    (isSurge ? $httpClient : $node.httpClient).request({
      method: 'GET',
      url: `http://ip-api.com/json/${ip}?fields=isp`,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    }, (err, response, body) => {
      if (err) return resolve('');
      try {
        resolve(JSON.parse(body).isp || '');
      } catch (e) {
        resolve('');
      }
    })
  );
  // 仅保留查询入口相关内容
  const title = `入口信息`;
  const content = [
    `入口IP: ${ip}`,
    `入口ISP: ${isp}`,
  ].join('\n');
  $done({ title, content, icon: 'network', 'icon-color': '#5EC8F4' });
})();