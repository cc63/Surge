// IP信息查询脚本 - 使用ipinfo.io接口
const url = "https://ipinfo.io/json?token=bcda261f72039f";
$httpClient.get(url, (error, response, data) => {
    if (error) {
        console.error('请求错误：', error);
        return $done();
    }
    
    const jsonData = JSON.parse(data);
    const { country, city, org: isp, ip } = jsonData;
    
    const emoji = getFlagEmoji(country);
    const location = getLocationString(emoji, country, city);
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
    
    return String.fromCodePoint(
        ...countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt())
    );
}

// 生成位置显示字符串
function getLocationString(emoji, country, city) {
    // 特殊地区映射
    const specialRegions = {
        'HK': 'Hong Kong',
        'SG': 'Singapore', 
        'MO': 'Macau'
    };
    
    // 特殊地区直接显示地区名
    if (specialRegions[country]) {
        return `${emoji} │ ${specialRegions[country]}`;
    }
    
    // 普通情况：显示国家代码和城市
    return `${emoji} ${country} │ ${city}`;
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
