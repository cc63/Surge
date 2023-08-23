let url = "http://ip-api.com/json/?lang=zh-CN"

$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let emoji = getFlagEmoji(jsonData.countryCode)
    let cnprovince = jsonData.province
    let cncity = jsonData.city
    let cnisp = jsonData.isp
    let cnip = jsonData.addr
    
    body = {
        title: "网络信息",
        content: `IP地址：${cnip}\n运营商：${emoji} │ ${cnprovince}${cnisp}`,
        icon: "personalhotspot"
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
