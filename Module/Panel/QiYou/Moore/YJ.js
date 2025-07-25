/**
 * 实时油价查询脚本 - 优化版
 * 兼容 Surge、Loon
 * 原作者：@RS0485，修改：@keywos
 * 优化版本
 */

class GasPriceQuery {
    constructor() {
        this.defaultRegion = 'shanxi-3/xian';
        this.baseUrl = 'http://m.qiyoujiage.com';
        this.storageKey = 'yj';
        this.headers = {
            'referer': 'http://m.qiyoujiage.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };
    }

    /**
     * 获取地区配置
     * 优先级：参数 > 持久化存储 > 默认值
     */
    getRegion() {
        // 1. 检查脚本参数
        if (typeof $argument !== 'undefined' && $argument.trim()) {
            return $argument.trim();
        }

        // 2. 检查持久化存储
        try {
            const storedRegion = $persistentStore?.read(this.storageKey);
            if (storedRegion && storedRegion.trim()) {
                console.log('使用存储的地区配置:', storedRegion);
                return storedRegion.trim();
            }
        } catch (error) {
            console.log('读取存储配置失败:', error.message);
        }

        // 3. 使用默认值
        return this.defaultRegion;
    }

    /**
     * 解析油价数据
     */
    parsePrices(htmlData) {
        const priceRegex = /<dl>[\s\S]*?<dt>(.*?油)<\/dt>[\s\S]*?<dd>(.*?)\(元\)<\/dd>/g;
        const prices = [];
        let match;

        while ((match = priceRegex.exec(htmlData)) !== null) {
            if (match[1] && match[2]) {
                prices.push({
                    name: match[1].trim(),
                    value: `${match[2].trim()} 元/升`
                });
            }
        }

        return prices;
    }

    /**
     * 解析价格调整信息
     */
    parseAdjustmentInfo(htmlData) {
        const adjustRegex = /<div class="tishi">\s*<span>(.*?)<\/span><br\/>([\s\S]*?)<br\//;
        const match = htmlData.match(adjustRegex);

        if (!match || match.length < 3) {
            return '暂无调价信息';
        }

        try {
            // 合并两部分信息进行整体解析
            const fullText = `${match[1].trim()} ${match[2].trim()}`;
            console.log('完整调价信息:', fullText);

            // 解析调价日期 - 匹配常见格式
            let adjustDate = '';
            
            // 格式: "下次油价7月29日24时调整"
            let dateMatch = fullText.match(/(\d{1,2}月\d{1,2}日)(?:\d{1,2}时)?调整/);
            if (dateMatch) {
                adjustDate = `${dateMatch[1]}24时`;
            } else {
                // 格式: "2024年7月29日24时"
                dateMatch = fullText.match(/(\d{4}年\d{1,2}月\d{1,2}日(?:\d{1,2}时)?)/);
                if (dateMatch) {
                    adjustDate = dateMatch[1];
                    if (!adjustDate.includes('时')) {
                        adjustDate += '24时';
                    }
                } else {
                    // 格式: "7月29日"
                    dateMatch = fullText.match(/(\d{1,2}月\d{1,2}日)/);
                    if (dateMatch) {
                        adjustDate = `${dateMatch[1]}24时`;
                    }
                }
            }

            // 解析调价趋势和幅度
            let trend = '';
            let adjustValue = '';
            let adjustStatus = '';

            // 判断调价方向
            if (/下降|下调|下跌|降低|降价/.test(fullText)) {
                trend = '下调';
            } else if (/上升|上调|上涨|升高|涨价/.test(fullText)) {
                trend = '上调';
            }

            // 提取调价幅度
            const valueMatch1 = fullText.match(/([\d.]+)元\/升\s*[-至到]\s*([\d.]+)元\/升/);
            if (valueMatch1) {
                adjustValue = `${valueMatch1[1]}-${valueMatch1[2]}元/升`;
            } else {
                const singleLiterMatch = fullText.match(/([\d.]+)元\/升/);
                if (singleLiterMatch) {
                    adjustValue = singleLiterMatch[0];
                } else {
                    const tonMatch = fullText.match(/([\d.]+)元\/吨/);
                    if (tonMatch) {
                        adjustValue = tonMatch[0];
                    }
                }
            }

            // 检查调价状态 - 只有原文中确实包含"搁浅"才显示
            if (/搁浅/.test(fullText)) {
                adjustStatus = '(搁浅)';
            }

            // 构建最终信息
            let result = [];
            
            if (adjustDate) {
                result.push(adjustDate);
            }
            
            if (trend && adjustValue) {
                result.push(`${trend}${adjustValue}${adjustStatus}`);
            } else if (adjustValue) {
                result.push(`${adjustValue}${adjustStatus}`);
            }

            const finalResult = result.join(' ') || '调价信息待更新';
            console.log('解析结果:', finalResult);
            
            return finalResult;
            
        } catch (error) {
            console.log('解析调价信息失败:', error.message);
            return '调价信息解析失败';
        }
    }

    /**
     * 格式化输出内容
     */
    formatContent(prices, adjustmentInfo) {
       const priceLines = prices.slice(0, 3).map(price => `${price.name}  ${price.value}`);
        return [...priceLines, adjustmentInfo].join('\n');
    }

    /**
     * 执行查询
     */
    async query() {
        const region = this.getRegion();
        const queryUrl = `${this.baseUrl}/${region}.shtml`;

        console.log('查询URL:', queryUrl);

        $httpClient.get({
            url: queryUrl,
            headers: this.headers,
            timeout: 10000 // 10秒超时
        }, (error, response, data) => {
            this.handleResponse(error, response, data, queryUrl);
        });
    }

    /**
     * 处理响应
     */
    handleResponse(error, response, data, queryUrl) {
        if (error) {
            console.log('网络请求失败:', error);
            this.sendError('网络请求失败，请检查网络连接');
            return;
        }

        if (!response || response.status !== 200) {
            console.log('HTTP响应异常:', response?.status);
            this.sendError('服务器响应异常');
            return;
        }

        if (!data || data.trim() === '') {
            console.log('响应数据为空');
            this.sendError('获取数据失败');
            return;
        }

        try {
            const prices = this.parsePrices(data);
            
            if (prices.length === 0) {
                console.log('未能解析到油价数据');
                this.sendError('数据解析失败，可能网站结构已变更');
                return;
            }

            if (prices.length < 4) {
                console.log(`油价数据不完整，只获取到${prices.length}条记录`);
            }

            const adjustmentInfo = this.parseAdjustmentInfo(data);
            const content = this.formatContent(prices, adjustmentInfo);

            const result = {
                title: '今日油价',
                content: content,
                icon: 'fuelpump.fill',
                'icon-color': '#CA3A05'
            };

            console.log('查询成功，返回结果');
            $done(result);

        } catch (parseError) {
            console.log('数据处理失败:', parseError.message);
            this.sendError('数据处理失败');
        }
    }

    /**
     * 发送错误信息
     */
    sendError(message) {
        const errorResult = {
            title: '油价查询失败',
            content: message,
            icon: 'exclamationmark.triangle.fill',
            'icon-color': '#FF3B30'
        };
        $done(errorResult);
    }
}

// 执行查询
try {
    const gasPrice = new GasPriceQuery();
    gasPrice.query();
} catch (error) {
    console.log('脚本执行失败:', error.message);
    $done({
        title: '油价查询失败',
        content: '脚本执行异常',
        icon: 'exclamationmark.triangle.fill',
        'icon-color': '#FF3B30'
    });
}
