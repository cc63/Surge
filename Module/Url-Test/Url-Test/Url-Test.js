/*
感谢@小白脸 重写脚本原脚本
原作者@yibeizipeini来自于https://raw.githubusercontent.com/yibeizipeini/JavaScript/Surge/ConnectivityTest.js
*/
let $ = {
百度:'https://www.baidu.com',
谷歌:'https://www.google.com/generate_204',
}

!(async () => {
await Promise.all([http('百度'),http('谷歌')]).then((x)=>{
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
						'\xa0\xa0\xa0\t: ' +
						(Date.now() - time)+' ms');
        });
    });
}
