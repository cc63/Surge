const url = "https://ipinfo.io/json?token=bcda261f72039f";

$httpClient.get(url, (error, response, data) => {
    if (error) {
        console.error('请求错误：', error);
        return $done();
    }
    
    try {
        const jsonData = JSON.parse(data);
        const { country, city, org: isp, ip } = jsonData;
        
        // 防止必要字段为undefined
        if (!country || !ip) {
            console.error('API返回数据不完整');
            return $done();
        }
        
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
    } catch (e) {
        console.error('解析错误：', e);
        $done();
    }
});

function getFlagEmoji(countryCode) {
    // 特殊处理台湾的情况
    if (countryCode.toUpperCase() === 'TW') {
        countryCode = 'CN';
    }
    
    // 处理无效的country code
    if (!countryCode || countryCode.length !== 2) {
        return '🌐'; // 返回地球图标
    }
    
    return String.fromCodePoint(
        ...countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt())
    );
}

function getLocationString(emoji, country, city) {
    // 根据国家代码处理特殊地区
    const specialRegions = {
        'HK': 'Hong Kong',
        'SG': 'Singapore', 
        'MO': 'Macau'
    };
    
    // 如果是特殊地区，直接显示地区名
    if (specialRegions[country]) {
        return `${emoji} │ ${specialRegions[country]}`;
    }
    
    // 如果没有城市信息，只显示国家
    if (!city) {
        return `${emoji} │ ${country}`;
    }
    
    // 普通情况：显示国家代码和城市
    return `${emoji} ${country} │ ${city}`;
}

function cleanIspInfo(isp) {
    // 防止传入undefined或null
    if (!isp || typeof isp !== 'string') {
        return '未知运营商';
    }
    
    // 第一步：去除指定的字母组合和特殊字符
    let result = isp
        // 去除括号及其内容
        .replace(/\(.*?\)/g, '')
        // 去除特定词汇
        .replace(/\b(AS\d+|Hong Kong|Mass internet|Communications?|munications?|Company|information|international|Technolog(y|ies)|ESolutions?|Services Limited)\b/gi, '')
        // 去除特殊符号
        .replace(/[-,.]/g, '');
    
    // 第二步：将多个连续空格替换为单个空格
    result = result.replace(/\s+/g, ' ');
    
    // 第三步：去除开头和结尾的空格
    result = result.trim();
    
    // 如果清理后为空，返回原始值
    return result || isp;
}
