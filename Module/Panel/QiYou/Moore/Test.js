/**********
* 作者：cc63&ChatGPT
* 更新时间：2024年1月31日
**********/

// 定义基本配置
const baseURL = 'http://m.qiyoujiage.com/';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';
let region = 'shanxi-3/xian';

// 从输入参数或持久化存储中获取地区设置
function getRegionFromArgumentOrPersistentStore() {
    if (typeof $argument !== 'undefined' && $argument !== '') {
        region = $argument;
    } else {
        try {
            const regionPref = $persistentStore.read("yj");
            if (typeof regionPref !== 'undefined' && regionPref !== null) {
                region = regionPref;
            }
        } catch (error) {
            console.error("Error reading region from persistent store:", error);
        }
    }
}

// 发起HTTP请求获取油价信息
function fetchGasPrices(region, callback) {
    const queryURL = `${baseURL}${region}.shtml`;
    $httpClient.get({
        url: queryURL,
        headers: {
            'referer': baseURL,
            'user-agent': userAgent
        }
    }, callback);
}

// 解析油价信息
function parseGasPrices(data) {
    const regPrice = /<dl>[\s\S]+?<dt>(.*油)<\/dt>[\s\S]+?<dd>(.*)\(元\)<\/dd>/gm;
    let prices = [];
    let m;

    while ((m = regPrice.exec(data)) !== null) {
        prices.push({
            name: m[1],
            value: `${m[2]} 元/升`
        });
    }

    return prices;
}

// 解析油价调整趋势
function parseAdjustmentTrend(data) {
    const regAdjustTips = /<div class="tishi"> <span>(.*)<\/span><br\/>([\s\S]+?)<br\/>/;
    const adjustTipsMatch = data.match(regAdjustTips);

    if (adjustTipsMatch && adjustTipsMatch.length === 3) {
        const adjustDate = adjustTipsMatch[1].split('价')[1].slice(0, -2).replace(/(?<=.*月)(24时|\(.*\))|.*\(|\)/g, '');
        const adjustValue = adjustTipsMatch[2];
        const adjustTrend = adjustValue.includes('下调') || adjustValue.includes('下跌') ? '下跌' : '上涨';

        return `${adjustDate} ${adjustTrend} ${adjustValue.replace(/[\d\.]+元\/吨/, '')}`;
    }

    return '';
}

// 主执行函数
function main() {
    getRegionFromArgumentOrPersistentStore();

    fetchGasPrices(region, (error, response, data) => {
        if (error || response.status !== 200) {
            console.error(`Failed to fetch gas prices: URL=${baseURL}${region}.shtml`, error);
            return;
        }

        const prices = parseGasPrices(data);
        const adjustmentTrend = parseAdjustmentTrend(data);

        if (prices.length !== 4) {
            console.error(`Failed to parse gas prices correctly, please check the parsing logic.`);
            return;
        }

        const responseContent = {
            title: "汽油价格",
            content: prices.map(price => `${price.name}：${price.value}`).join('\n') + '\n' + adjustmentTrend,
            icon: "fuelpump.fill",
            'icon-color': '#DC3131'
        };

        $done(responseContent);
    });
}

main();
