/**********
* 作者：cc63&ChatGPT
* 更新时间：2024年2月3日
**********/

const REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
    'Accept-Language': 'en',
    'Content-Type': 'application/json',
    Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
}

const STATUS = {
    COMING: 2,
    AVAILABLE: 1,
    NOT_AVAILABLE: 0,
    TIMEOUT: -1,
    ERROR: -2
}

const UA = REQUEST_HEADERS['User-Agent']

;(async () => {
    let panel_result = {
        title: '流媒体解锁检测',
        content: '',
        icon: 'play.tv.fill',
        'icon-color': '#FF2D55',
    }

    try {
        const [disney, youtube, netflix] = await Promise.all([testDisneyPlus(), checkYouTubePremium(), checkNetflix()])
        panel_result.content = [disney, youtube, netflix].join('\n')
    } catch (error) {
        panel_result.content = `检测失败：${error.message}`
    } finally {
        $done(panel_result)
    }
})()

async function checkYouTubePremium() {
    const url = 'https://www.youtube.com/premium'
    let result = 'YouTube: '

    try {
        const data = await fetchData(url)
        const match = data.match(/"countryCode":"(.*?)"/)
        const region = match ? match[1].toUpperCase() : (data.includes('www.google.cn') ? 'CN' : 'US')
        result += `已解锁 ➟ ${region}`
    } catch (error) {
        result += '不支持解锁'
    }

    return result
}

async function checkNetflix() {
    const filmIds = [80062035, 80018499]
    let result = 'Netflix: '

    for (const filmId of filmIds) {
        try {
            const region = await checkNetflixRegion(filmId)
            result += region === 'title' ? '仅解锁自制剧 ➟ US' : `已完整解锁 ➟ ${region.toUpperCase()}`
            break
        } catch (error) {
            if (error.message === 'Not Available') {
                result += '该节点不支持解锁'
                break
            }
        }
    }

    return result
}

async function checkNetflixRegion(filmId) {
    const url = `https://www.netflix.com/title/${filmId}`
    return fetchData(url)
        .then(data => {
            const match = data.match(/x-originating-url.*?\/title\/(\w+)/)
            if (!match) throw new Error('Not Available')
            return match[1]
        })
}

async function testDisneyPlus() {
    try {
        const { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)])
        if (cnbl == 2) return `Disney+: 即将登陆~${region.toUpperCase()}`

        const { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)])
        const finalRegion = countryCode ?? region
        const status = inSupportedLocation === 'false' ? STATUS.COMING : STATUS.AVAILABLE
        return `Disney+: ${status === STATUS.COMING ? '即将登陆~' : '已解锁 ➟ '}${finalRegion.toUpperCase()}`
    } catch (error) {
        return `Disney+: 检测失败，请刷新面板`
    }
}

function fetchData(url, options = {}) {
    return new Promise((resolve, reject) => {
        const opts = { url, headers: REQUEST_HEADERS, ...options }
        $httpClient.get(opts, (error, response, data) => {
            if (error || response.status !== 200) reject(new Error('Not Available'))
            else resolve(data)
        })
    })
}

function getLocationInfo() {
    const url = 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql'
    const body = JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
        variables: {
            input: {
                applicationRuntime: 'chrome',
                attributes: { browserName: 'chrome', browserVersion: '94.0.4606', manufacturer: 'apple', operatingSystem: 'macintosh', operatingSystemVersion: '10.15.7', osDeviceIds: [] },
                deviceFamily: 'browser',
                deviceLanguage: 'en',
                deviceProfile: 'macosx'
            }
        }
    })
    return fetchData(url, { method: 'POST', body })
        .then(data => JSON.parse(data).extensions.sdk)
        .then(({ session: { inSupportedLocation, location: { countryCode } } }) => ({ inSupportedLocation, countryCode }))
}

function testHomePage() {
    const url = 'https://www.disneyplus.com/'
    return fetchData(url)
        .then(data => {
            const match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
            return { region: match ? match[1] : '', cnbl: match ? match[2] : '' }
        })
}

function timeout(delay = 5000) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), delay))
}
