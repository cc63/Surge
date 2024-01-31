/**********
* 作者：cc63&ChatGPT
* 更新时间：2024年2月1日
**********/

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
// 去除ISP信息中的无意义信息
let cleanedIsp = isp.replace(/\s?[,]|\s\-|\.$|\(.*\)|(\b(Hong Kong|Mass internet|Communications?|information|Technolog(y|ies)|Chunghwa|Taiwan|ESolutions?)\b)\s?|munications?/gi, '');    
// 避免可能出现的连续空格
cleanedIsp = cleanedIsp.replace(/\s+/g, ' ');    
// 然后将 cleanedIsp 用于通知内容
let body = {
    title: "节点信息",
    content: `IP地址：${ip}\n运营商：${cleanedIsp}\n所在地：${location}`,
    icon: "globe.asia.australia",
   'icon-color': '#089F15'
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
