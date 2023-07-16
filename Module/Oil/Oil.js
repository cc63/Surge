var region = 'shanxi-3/xian'

if (typeof $argument !== 'undefined' && $argument !== '') {
    region = $argument
}

try{
//持久化适合远程引用不添加本地模块
//工具>脚本编辑器>左下角齿轮图标>$persistentStore
const region_pref = $persistentStore.read("yj");
	if (typeof region_pref !== 'undefined' && region_pref !== null) { //Surge Loon写法
		console.log("2")
    region = region_pref
}}catch(i){}

const query_addr = `http://m.qiyoujiage.com/${region}.shtml`

$httpClient.get(
    {
        url: query_addr,
        headers: {
            'referer': 'http://m.qiyoujiage.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        },
    }, (error, response, data) => {
        if (error) {
            console.log(`解析油价信息失败, 请反馈至 @RS0485: URL=${query_addr}`)
            done({});
        }
        else {
            const reg_price = /<dl>[\s\S]+?<dt>(.*油)<\/dt>[\s\S]+?<dd>(.*)\(元\)<\/dd>/gm

            var prices = []
            var m = null;

            while ((m = reg_price.exec(data)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === reg_price.lastIndex) {
                    reg_price.lastIndex++;
                }

                prices.push({
                    name: m[1],
                    value: `${m[2]} 元/升`
                })
            }

            if (prices.length !== 4) {
                console.log(`解析油价信息失败, 数量=${prices.length}, 请反馈至 @RS0485: URL=${query_addr}`)
                done({})
            }
            else {
                body = {
                    title: "汽油价格",
                    content: `${prices[0].name}  ${prices[0].value}\n${prices[1].name}  ${prices[1].value}\n${prices[2].name}  ${prices[2].value}`,
                    icon: "fuelpump.fill"
                               }

                $done(body);
            }
        }
    });
