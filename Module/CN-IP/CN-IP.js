let url = "http://api.bilibili.com/x/web-interface/zone"

$httpClient.get(url, function(error, response, data){
    let cnjsonData = JSON.parse(data)
    let cnemoji = getFlagEmoji(jsonData.countryCode)
    let cnprovince = jsonData.province
    let cnisp = jsonData.isp
    let cnip = jsonData.addr
    
    body = {
        title: "网络信息",
        content: `IP地址：${cnip}\n运营商：${cnemoji} │ ${cnprovince}${cnisp}`,
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
