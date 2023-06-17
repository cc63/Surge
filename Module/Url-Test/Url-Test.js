let $ = {
大陆直连:'http://wifi.vivo.com.cn/generate_204',
海外代理:'http://cp.cloudflare.com/generate_204',
}

!(async () => {
await Promise.all([http('大陆直连'),http('海外代理')]).then((x)=>{
	$done({
    title: '连通性测试',
    content: x.join('\n'),
    icon: 'personalhotspot',
    'icon-color': '#0DCB27',
  })
})
})();

function http(req) {
    return new Promise((r) => {
			let time = Date.now();
        $httpClient.post($[req], (err, resp, data) => {
            r(req +
'\xa0: ' +
(Date.now() - time)+' ms');
        });
    });
}
