 /**********
* 作者：cc63&ChatGPT
* API：ipleak.net
**********/ 

const url = "https://ipleak.net/json/";

$httpClient.get(url, (error, response, data) => {
    if (error) {
        console.error('请求错误：', error);
        return $done();
    }

    try {
        const jsonData = JSON.parse(data);
        const { country_name: country, country_code: countryCode, city_name: city, isp_name: isp, ip } = jsonData;
        const emoji = getFlagEmoji(countryCode);
        const location = (!city || country === city) ? `${emoji} │ ${country}` : `${emoji} ${countryCode} │ ${city}`;
        const cleanedIsp = cleanIspInfo(isp);

        const body = {
            title: "节点信息",
            content: `IP地址：${ip}\n运营商：${cleanedIsp}\n所在地：${location}`,
            icon: "globe.asia.australia",
            'icon-color': '#3D90ED'
        };

        $done(body);
    } catch (e) {
        console.error('解析错误：', e);
        $done();
    }
});

function getFlagEmoji(countryCode) {
    // 特殊处理台湾的情况
    if (countryCode.toUpperCase() === 'TW') {
        countryCode = 'CN'; // 或根据需要修改
    }
    return String.fromCodePoint(...countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt()));
}

function cleanIspInfo(isp) {
    return isp.replace(/\s-|\s?,|\.$|(\b(AS\d+|Hong Kong|Mass internet|Communications?|Company|information|international|Technolog(y|ies)|ESolutions?|Services Limited)\b|\(.*\))\s?|munications?/gi, '');
}
