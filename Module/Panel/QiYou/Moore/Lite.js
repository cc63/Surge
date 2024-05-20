/**********
* 作者：cc63&ChatGPT
* 更新时间：2024年5月20日 
**********/
let region = 'shandong';

// 优化参数获取逻辑
region = $argument || readRegionFromStore() || region;

const queryAddr = `http://m.qiyoujiage.com/${region}.shtml`;

$httpClient.get({
    url: queryAddr,
    headers: {
        'referer': 'http://m.qiyoujiage.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    },
}, (error, response, data) => {
    if (error) {
        console.log(`解析油价信息失败, 请反馈至 @RS0485: URL=${queryAddr}`);
        return $done({});
    }
    
    try {
        const prices = parsePrices(data);
        
        // 确保仅包含汽油价格，排除柴油价格
        if (prices.length < 3) {
            console.log(`解析油价信息失败, 数量不足, 请反馈至 @RS0485: URL=${queryAddr}`);
            return $done({});
        }
        
        const body = {
            title: "汽油价格",
            content: prices.slice(0, 3).map(p => `${p.name}：${p.value}`).join('\n'),
            icon: "fuelpump.fill",
            'icon-color': '#CA3A05'
        };

        $done(body);
    } catch (e) {
        console.error(`解析过程中出现错误: ${e.message}`);
        $done({});
    }
});

function readRegionFromStore() {
    try {
        const regionPref = $persistentStore.read("yj");
        return regionPref || null;
    } catch (e) {
        console.error("读取区域偏好设置失败: ", e);
        return null;
    }
}

function parsePrices(data) {
    const regPrice = /<dl>[\s\S]+?<dt>(.*油)<\/dt>[\s\S]+?<dd>(.*)\(元\)<\/dd>/gm;
    let match;
    const prices = [];

    while ((match = regPrice.exec(data)) !== null) {
        prices.push({ name: match[1], value: `${match[2]} 元/升` });
    }

    // 返回仅前三个匹配项，通常对应汽油价格
    return prices.slice(0, 3);
}
