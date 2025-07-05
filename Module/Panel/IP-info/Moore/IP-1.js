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
        
        // 防止undefined值
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
    // 特殊处理台湾的国旗情况
    if (countryCode.toUpperCase() === 'TW') {
        countryCode = 'CN';
    }
    
    // 处理无效的country code
    if (!countryCode || countryCode.length !== 2) {
        return '🏳️'; // 返回空白旗帜
    }
    
    return String.fromCodePoint(
        ...countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt())
    );
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
