/**********
* 作者：cc63&ChatGPT
* 更新时间：2024年2月1日
**********/

let url = "https://ipleak.net/json/"

$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let country = jsonData.country_name
    let countryCode = jsonData.country_code
    let emoji = getFlagEmoji(jsonData.country_code)
    let city = jsonData.city_name
    let isp = jsonData.isp_name
    let ip = jsonData.ip
// 避免City不存在
let location = (!city || country === city) ? `${emoji}${country}` : `${emoji}${countryCode} │ ${city}`;
// 去除ISP信息中的无意义信息
let cleanedIsp = isp.replace(/\s?[,]|\s\-|\.$|\(.*\)|(\b(Hong Kong|Mass internet|Communications?|information|Technolog(y|ies)|ESolutions?)\b)\s?|munications?/gi, '');    
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
