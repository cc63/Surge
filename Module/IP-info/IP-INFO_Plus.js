let url = "http://ip-api.com/json"

$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data);
    let country = jsonData.country;
    let emoji = getFlagEmoji(jsonData.countryCode);
    let city = jsonData.city;
    let isp = jsonData.isp;
    let ip = jsonData.query;

    let location = (country === city) ? `${emoji} │ ${country}` : `${emoji} │ ${country}`;

    // 获取入口 IP 信息
    let entryIp = entryIPAddress();

    // 获取入口运营商信息
    let entryIsp = entryISP();

    // 去除 isp 变量中的标点符号和 "Communications" 等过长的无意义词语(不区分大小写）
    let cleanedIsp = isp.replace(/[,]|(\.$)|\([^)]*\)|Communications|Information|Technology|Technologies|Television|Registration/gi, '');

    // 将运营商信息中的连续两个或多个空格替换为一个空格
    cleanedIsp = cleanedIsp.replace(/ {2,}/g, ' ');

    // 创建通知内容
    let body = {
        title: "节点信息",
        content: `IP地址：${ip}\n入口IP：${entryIp}\n入口运营商：${entryIsp}\n运营商：${cleanedIsp}\n所在地：${location}`,
        icon: "globe.asia.australia"
    }

    $done(body);
});

function getFlagEmoji(countryCode) {
    if (countryCode.toUpperCase() == 'TW') {
        countryCode = 'CN'
    }
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt())
    return String.fromCodePoint(...codePoints)
}

function entryIPAddress() {
    // 在此函数中编写获取入口 IP 的代码
    // 您可以使用各种方法，如请求头、代理服务器等来获取入口 IP
    // 返回入口 IP 的字符串
    // 例如：return $request.headers["X-Real-IP"] || $request.headers["x-real-ip"];
}

function entryISP() {
    // 在此函数中编写获取入口 IP 运营商的代码
    // 您可以使用各种方法，如请求头、代理服务器等来获取入口 IP 运营商信息
    // 返回入口 IP 运营商信息的字符串
}