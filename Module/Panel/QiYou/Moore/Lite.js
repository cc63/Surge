/**********
* 作者：cc63&ChatGPT
* 更新时间：2024年5月20日 
**********/
let region = 'shanxi-3/xian';

// 优化参数获取逻辑
region = $argument || readRegionFromStore() || region;

const queryAddr = `http://m.qiyoujiage.com/${region}.shtml`;

async function fetchData() {
    try {
        const response = await $httpClient.get({
            url: queryAddr,
            headers: {
                'referer': 'http://m.qiyoujiage.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            }
        });
        
        const prices = parsePrices(response.data);
        
        if (prices.length < 3) {
            console.log(`解析油价信息失败, 数量不足, 请反馈至 @RS0485: URL=${queryAddr}`);
            return $done({});
        }
        
        const body = {
            title: "汽油价格",
            content: prices.map(p => `${p.name}：${p.value}`).join('\n'),
            icon: "fuelpump.fill",
            'icon-color': '#CA3A05'
        };

        $done(body);
    } catch (error) {
        console.log(`解析油价信息失败: ${error.message}, 请反馈至 @RS0485: URL=${queryAddr}`);
        $done({});
    }
}

function readRegionFromStore() {
    try {
        return $persistentStore.read("yj") || null;
    } catch (error) {
        console.error("读取区域偏好设置失败: ", error);
        return null;
    }
}

function parsePrices(data) {
    const regPrice = /<dl>[\s\S]+?<dt>(.*油)<\/dt>[\s\S]+?<dd>(.*)\(元\)<\/dd>/gm;
    const prices = [];
    let match;

    while ((match = regPrice.exec(data)) !== null) {
        prices.push({ name: match[1], value: `${match[2]} 元/升` });
    }

    return prices.slice(0, 3);
}

fetchData();
