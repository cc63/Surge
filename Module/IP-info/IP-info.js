let url = "http://ip-api.com/json/?fields=8450015&lang=zh-CN"

$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let country = jsonData.country
    let emoji = getFlagEmoji(jsonData.countryCode)
    let city = jsonData.city
    let isp = jsonData.isp
    let ip = jsonData.query
    
    let location = (country === city) ? `${emoji} │ ${country}` : `${emoji} │ ${country}-${city}`;

    body = {
        title: "节点信息",
        content: `IP地址：${ip}\n运营商：${isp}\n所在地：${location}`,
        icon: "network"
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
