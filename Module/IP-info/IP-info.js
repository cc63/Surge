let url = "http://ip-api.com/json"

$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let country = jsonData.country
    let emoji = getFlagEmoji(jsonData.countryCode)
    let city = jsonData.city
    let isp = jsonData.isp
    let ip = jsonData.query
// 避免City与Country重复出现
//（暂时舍弃，改用不带City的）let location = (country === city) ? `${emoji} │ ${country}` : `${emoji} │ ${country}-${city}`;
let location = (country === city) ? `${emoji} │ ${country}` : `${emoji} │ ${country}`;
// 去除 isp 变量中的标点符号和 "Communications" 等过长的无意义词语
let cleanedIsp = isp.replace(/[,]|\s(\.$)|\sCommunications|\sInformation|\sTechnology|\sTechnologies|\sTelevision|\sRegistration/g, '');

// 然后将 cleanedIsp 用于通知内容
let body = {
    title: "节点信息",
    content: `IP地址：${ip}\n运营商：${cleanedIsp}\n所在地：${location}`,
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
