const url = "http://ip-api.com/json";
$httpClient.get(url, (error, response, data) => {
    if (error) {
        console.error('请求错误：', error);
        return $done();
    }
    
    try {
        const jsonData = JSON.parse(data);
        
        // 检查API响应状态
        if (jsonData.status === 'fail') {
            console.error('API返回错误：', jsonData.message);
            return $done();
        }
        
        const { country, countryCode, city, isp, query: ip } = jsonData;
        
        // 只需要一次完整性检查
        if (!country || !countryCode || !city || !isp || !ip) {
            console.error('API返回数据不完整');
            return $done();
        }
        
        const emoji = getFlagEmoji(countryCode);
        const location = (country === city) ? `${emoji} │ ${country}` : `${emoji} ${countryCode} │ ${city}`;
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
    // 特殊处理台湾
    if (countryCode.toUpperCase() === 'TW') {
        countryCode = 'CN';
    }
    
    // 既然上面已经验证过countryCode，这里直接转换
    return String.fromCodePoint(
        ...countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt())
    );
}

function cleanIspInfo(isp) {
    // 直接处理，不需要额外检查
    return isp
        .replace(/\(.*?\)/g, '')
        .replace(/\b(AS\d+|Hong Kong|Mass internet|Communications?|munications?|Company|information|international|Technolog(y|ies)|ESolutions?|Services Limited)\b/gi, '')
        .replace(/[-,.]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
