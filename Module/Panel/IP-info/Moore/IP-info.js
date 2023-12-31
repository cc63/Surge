//作者：cc63
//更新时间：2023年12月31日

let url = "http://ip-api.com/json"

$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let country = jsonData.country
    let countryCode = jsonData.countryCode
    let emoji = getFlagEmoji(jsonData.countryCode)
    let city = jsonData.city
    let isp = jsonData.isp
    let ip = jsonData.query
// 避免City与Country重复
let location = (country === city) ? `${emoji}${country}` : `${emoji}${countryCode} │ ${city}`;
// 去除ISP变量中的无意义的内容
let cleanedIsp = isp.replace(/[,-]|\.$|\(.*\)|\b(hong kong|mass internet|communications?|information|technolog(y|ies)|chunghwa|taiwan)\b/gi, '');
// 去除连续空格
    cleanedIsp = cleanedIsp.replace(/ {2,}/g, ' ');
// 去除开头空格
    cleanedIsp = cleanedIsp.replace(/^ /g, '');
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
