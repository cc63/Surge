// IP信息查询脚本 - 使用api.ip.sb接口
const url = "https://api.ip.sb/geoip";
$httpClient.get(url, (error, response, data) => {
    if (error) {
        console.error('请求错误：', error);
        return $done();
    }
    
    const jsonData = JSON.parse(data);
    const { country, country_code: countryCode, city, isp, ip } = jsonData;
    
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
});

// 根据国家代码生成国旗emoji
function getFlagEmoji(countryCode) {
    // 特殊处理台湾
    if (countryCode.toUpperCase() === 'TW') {
        countryCode = 'CN';
    }
    return String.fromCodePoint(...countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt()));
}

// 清理ISP信息，去除多余的描述文字
function cleanIspInfo(isp) {
    return isp
        // 去除括号内容
        .replace(/\(.*?\)/g, '')
        // 去除特定词汇
        .replace(/\b(AS\d+|Hong Kong|Mass internet|Communications?|munications?|Company|information|international|Technolog(y|ies)|ESolutions?|Services Limited)\b/gi, '')
        // 去除特殊符号
        .replace(/[-,.]/g, '')
        // 合并多余空格
        .replace(/\s+/g, ' ')
        .trim();
}
