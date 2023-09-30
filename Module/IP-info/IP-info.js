let url = "https://ipinfo.io/json?token=bcda261f72039f"

$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let country = jsonData.country
    let emoji = getFlagEmoji(jsonData.country)
    let city = jsonData.region
    let isp = jsonData.asn.name
    let ip = jsonData.ip
    
    let location = (country === city) ? `${emoji} │ ${country}` : `${emoji} ${country}-${city}`;

    body = {
        title: "节点信息",
        content: `IP地址：${ip}\n运营商：${isp}\n所在地：${location}`,
        icon: "globe.asia.australia"
    }
    $done(body);
});

function getFlagEmoji(country) {
    if (country.toUpperCase() == 'TW') {
        country = 'CN'
    }
    const codePoints = country
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt())
    return String.fromCodePoint(...codePoints)
}
