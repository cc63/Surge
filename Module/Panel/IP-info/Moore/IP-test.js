/**********
* 作者：cc63&ChatGPT
* 更新时间：2024年2月1日
**********/

let url = "http://ip-api.com/json";

$httpClient.get(url, function(error, response, data) {
    if (error || response.statusCode !== 200) {
        console.error("请求失败", error);
        return;
    }

    let jsonData = JSON.parse(data);
    let { country, countryCode, city, isp, query: ip } = jsonData;
    let emoji = getFlagEmoji(countryCode);
    let location = (country === city) ? `${emoji} │ ${country}` : `${emoji} ${countryCode} │ ${city}`;
    let cleanedIsp = cleanIsp(isp);

    let body = {
        title: "节点信息",
        content: `IP地址：${ip}\n运营商：${cleanedIsp}\n所在地：${location}`,
        icon: "globe.asia.australia",
        'icon-color': '#3D90ED'
    };
    $done(body);
});

function getFlagEmoji(countryCode) {
    countryCode = countryCode.toUpperCase() === 'TW' ? 'CN' : countryCode.toUpperCase();
    return String.fromCodePoint(...[...countryCode].map(char => 127397 + char.charCodeAt()));
}

function cleanIsp(isp) {
    return isp.replace(/\s?[,]|\s\-|\.$|\(.*\)|(\b(Hong Kong|Mass internet|Communication[s]?|information|Technology|ESolutions?|Services Limited)\b)\s?/gi, '')
              .replace(/\s+/g, ' ');
}