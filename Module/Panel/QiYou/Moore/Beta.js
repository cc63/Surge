/**********
* 作者：cc63&ChatGPT (优化版)
* 更新时间：2025年5月3日 
**********/

// 配置信息
const CONFIG = {
  DEFAULT_REGION: 'shanxi-3/xian',
  BASE_URL: 'http://m.qiyoujiage.com',
  PERSISTENT_KEY: 'yj',
  ICON: {
    NAME: 'fuelpump.fill',
    COLOR: '#CA3A05'
  },
  MAX_GAS_TYPES: 3  // 只显示前三种汽油类型
};

// 主函数
async function fetchAndDisplayOilPrices() {
  try {
    // 获取地区设置
    const region = $argument || readRegionFromStore() || CONFIG.DEFAULT_REGION;
    const queryUrl = `${CONFIG.BASE_URL}/${region}.shtml`;
    
    // 发起网络请求
    $httpClient.get({
      url: queryUrl,
      headers: {
        'referer': CONFIG.BASE_URL + '/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
    }, handleResponse.bind(null, queryUrl));
  } catch (error) {
    handleError(error, '初始化失败');
  }
}

// 处理响应
function handleResponse(queryUrl, error, response, data) {
  if (error || !data) {
    return handleError(error, `解析油价信息失败, URL=${queryUrl}`);
  }
  
  try {
    // 提取价格信息
    const prices = parsePrices(data);
    
    // 验证数据有效性
    if (prices.length < CONFIG.MAX_GAS_TYPES) {
      return handleError(null, `解析油价信息失败, 数量不足, URL=${queryUrl}`);
    }
    
    // 提取调整信息
    const { date, trend, value } = parseAdjustment(data);
    const adjustmentInfo = formatAdjustmentInfo(date, trend, value);
    
    // 构建显示内容
    const gasPrices = prices
      .slice(0, CONFIG.MAX_GAS_TYPES)
      .map(p => `${p.name}：${p.value}`)
      .join('\n');
    
    // 完成请求
    $done({
      title: "汽油价格",
      content: `${gasPrices}\n${adjustmentInfo}`,
      icon: CONFIG.ICON.NAME,
      'icon-color': CONFIG.ICON.COLOR
    });
  } catch (e) {
    handleError(e, '解析过程中出现错误');
  }
}

// 读取持久化存储的地区
function readRegionFromStore() {
  try {
    return $persistentStore.read(CONFIG.PERSISTENT_KEY) || null;
  } catch (e) {
    console.error("读取区域偏好设置失败: ", e);
    return null;
  }
}

// 解析价格信息
function parsePrices(data) {
  const priceRegex = /<dl>[\s\S]+?<dt>(.*油)<\/dt>[\s\S]+?<dd>(.*)\(元\)<\/dd>/gm;
  const prices = [];
  let match;

  while ((match = priceRegex.exec(data)) !== null) {
    prices.push({ 
      name: match[1].trim(), 
      value: `${match[2].trim()} 元/升` 
    });
  }

  return prices;
}

// 解析价格调整信息
function parseAdjustment(data) {
  const adjustmentRegex = /<div class="tishi"> <span>(.*?)<\/span><br\/>([\s\S]+?)<br\/>/;
  const match = data.match(adjustmentRegex);
  
  if (!match || match.length < 3) {
    return { date: '', trend: '', value: '' };
  }
  
  // 提取日期信息
  const rawDate = match[1] || '';
  const date = extractDate(rawDate);
  
  // 提取调整值和趋势信息
  const adjustmentText = match[2] || '';
  const trend = determineAdjustmentTrend(adjustmentText);
  const value = extractAdjustmentValue(adjustmentText);
  
  return { date, trend, value };
}

// 从原始文本中提取日期
function extractDate(rawDate) {
  if (!rawDate) return '';
  
  // 提取"价"之后的文本，去掉末尾的"起"和其他无关内容
  const dateMatch = rawDate.split('价')[1];
  if (!dateMatch) return '';
  
  return dateMatch
    .replace(/24时|\(.*\)/g, '')  // 删除"24时"和括号内容
    .replace(/起.*$/, '')         // 删除"起"及之后的内容
    .trim();
}

// 确定价格调整趋势
function determineAdjustmentTrend(text) {
  if (!text) return '';
  
  if (text.includes('下调') || text.includes('下跌')) {
    return '下跌';
  } else if (text.includes('上调') || text.includes('上涨')) {
    return '上涨';
  }
  
  return '';
}

// 提取调整值
function extractAdjustmentValue(text) {
  if (!text) return '';
  
  // 尝试匹配范围值 (例如: 0.17元/升-0.19元/升)
  const rangeMatch = text.match(/([\d\.]+)元\/升-([\d\.]+)元\/升/);
  if (rangeMatch && rangeMatch.length >= 3) {
    return `${rangeMatch[1]}-${rangeMatch[2]}元`;
  }
  
  // 尝试匹配单个值 (例如: 0.17元/升)
  const singleMatch = text.match(/([\d\.]+)元\/升/);
  if (singleMatch && singleMatch.length >= 2) {
    return `${singleMatch[1]}元`;
  }
  
  return '';
}

// 格式化调整信息
function formatAdjustmentInfo(date, trend, value) {
  if (!date && !trend && !value) {
    return '';
  }
  return `${date} ${trend} ${value}`.trim();
}

// 统一错误处理
function handleError(error, message) {
  if (error) {
    console.error(`${message}: ${error.message || error}`);
  } else {
    console.error(message);
  }
  $done({});
}

// 执行主函数
fetchAndDisplayOilPrices();
