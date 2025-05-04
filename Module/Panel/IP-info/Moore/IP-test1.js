/**********
* 作者：cc63&ChatGPT (优化: Claude)
* 更新时间：2025年5月4日
**********/ 

// 配置参数集中管理
const CONFIG = {
  API_URL: "http://ip-api.com/json",
  TITLE: "节点信息",
  ICON: "globe.asia.australia",
  ICON_COLOR: '#3D90ED',
  SPECIAL_REGIONS: {
    'TW': 'CN' // 台湾地区的国旗映射
  }
};

/**
 * 获取IP信息并处理
 */
function fetchIpInfo() {
  $httpClient.get(CONFIG.API_URL, (error, response, data) => {
    if (error) {
      handleError('请求错误', error);
      return;
    }

    if (!data || response.status !== 200) {
      handleError('无效响应', `状态码: ${response?.status || '未知'}`);
      return;
    }

    try {
      const result = processIpData(data);
      $done(result);
    } catch (e) {
      handleError('解析错误', e);
    }
  });
}

/**
 * 处理错误情况
 */
function handleError(type, error) {
  console.error(`${type}:`, error);
  $done({
    title: "获取节点信息失败",
    content: `${type}: ${error.message || error}`,
    icon: "exclamationmark.triangle",
    'icon-color': '#FF3B30'
  });
}

/**
 * 处理IP数据并格式化输出
 */
function processIpData(data) {
  const jsonData = JSON.parse(data);
  const { country, countryCode, city, isp, query: ip } = jsonData;
  
  const emoji = getFlagEmoji(countryCode);
  const location = formatLocation(country, countryCode, city, emoji);
  const cleanedIsp = cleanIspInfo(isp);

  return {
    title: CONFIG.TITLE,
    content: `IP地址：${ip}\n运营商：${cleanedIsp}\n所在地：${location}`,
    icon: CONFIG.ICON,
    'icon-color': CONFIG.ICON_COLOR
  };
}

/**
 * 格式化位置信息
 */
function formatLocation(country, countryCode, city, emoji) {
  return (country === city) 
    ? `${emoji} │ ${country}` 
    : `${emoji} ${countryCode} │ ${city}`;
}

/**
 * 将国家代码转换为旗帜Emoji
 */
function getFlagEmoji(countryCode) {
  if (!countryCode) return '🌐';
  
  // 特殊区域映射处理
  const mappedCode = CONFIG.SPECIAL_REGIONS[countryCode.toUpperCase()] || countryCode;
  
  return String.fromCodePoint(
    ...mappedCode.toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt())
  );
}

/**
 * 清理ISP信息中的冗余部分
 * 分两步进行：1.按类别清理特殊字符和术语 2.处理空格问题
 */
function cleanIspInfo(isp) {
  if (!isp) return '未知';
  
  let result = isp;
  
  // 第一步：按类别清理特殊字符和无意义术语
  
  // 1.1 清理标点和连接符
  result = result.replace(/\s-|\s?,|\.$|\(.*?\)/g, '');
  
  // 1.2 清理编号
  result = result.replace(/\b(AS\d+)\b/g, '');
  
  // 1.3 清理地区冗余信息
  result = result.replace(/\b(Hong Kong|Mass internet)\b/g, '');
  
  // 1.4 清理通信相关术语
  result = result.replace(/\b(Communications?|munications?)\b/g, '');
  
  // 1.5 清理公司相关术语
  result = result.replace(/\b(Company|information|international)\b/g, '');
  
  // 1.6 清理技术服务相关术语
  result = result.replace(/\b(Technolog(y|ies)|ESolutions?|Services Limited)\b/g, '');
  
  // 第二步：处理空格问题
  result = result.replace(/\s{2,}/g, ' '); // 将连续多个空格替换为一个
  
  // 最后使用trim()确保没有首尾空格
  return result.trim();
}

// 执行脚本
fetchIpInfo();
