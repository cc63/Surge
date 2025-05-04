<div align="center">
 <img src="https://raw.githubusercontent.com/cc63/Surge/main/Conf/Conf.PNG" width="200">
</div>

## 📦 配置示例

```python
[General]
loglevel = notify
udp-priority = true
exclude-simple-hostnames = true
show-error-page-for-reject = true
udp-policy-not-supported-behaviour = REJECT
skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, localhost, *.local, iosapps.itunes.apple.com, seed-sequoia.siri.apple.com, sequoia.apple.com
ipv6 = true
ipv6-vif = auto
internet-test-url = http://223.5.5.5
proxy-test-url = http://1.1.1.1
test-timeout = 2
dns-server = 223.5.5.5
doh-skip-cert-verification = true
geoip-maxmind-url = https://raw.githubusercontent.com/Loyalsoldier/geoip/release/Country.mmdb
compatibility-mode = 1
encrypted-dns-server = https://dns.alidns.com/dns-query

[Proxy Group]
Proxy = select, "🇯🇵 日本节点", "🇸🇬 新加坡节点", include-other-group=订阅-手动节点, policy-regex-filter=🇭🇰|🇸🇬|🇯🇵, no-alert=0, hidden=0, include-all-proxies=0

YouTube = select, "🇭🇰 香港节点", "🇯🇵 日本节点", include-other-group=订阅-手动节点, policy-regex-filter=🇭🇰|🇯🇵, no-alert=0, hidden=0, include-all-proxies=0

Netflix = select, "🇸🇬 新加坡节点", include-other-group=订阅-手动节点, no-alert=0, hidden=0, include-all-proxies=0, policy-regex-filter=🇸🇬

ChatGPT = select, "🇺🇸 美国节点", include-other-group=订阅-手动节点, policy-regex-filter=🇺🇸, no-alert=0, hidden=0, include-all-proxies=0

TikTok = select, "🇯🇵 日本节点", "🇺🇸 美国节点", include-other-group=订阅-手动节点, policy-regex-filter=🇯🇵|🇺🇸, no-alert=0, hidden=0, include-all-proxies=0

Speedtest = select, DIRECT, Proxy, no-alert=0, hidden=0, include-all-proxies=0

订阅-手动节点 = select, policy-path=🔴这里填写订阅链接, update-interval=0, hidden=1, no-alert=0, include-all-proxies=0

订阅-Smart节点 = select, policy-path=🔴这里填写订阅链接, update-interval=0, hidden=1, no-alert=0, include-all-proxies=0

🇭🇰 香港节点 = smart, policy-regex-filter=^(?!.*0\.).*(🇭🇰), no-alert=0, hidden=1, include-all-proxies=0, include-other-group=订阅-Smart节点

🇯🇵 日本节点 = smart, policy-regex-filter=^(?!.*0\.).*(🇯🇵), no-alert=0, hidden=1, include-all-proxies=0, include-other-group=订阅-Smart节点

🇺🇸 美国节点 = smart, policy-regex-filter=^(?!.*0\.).*(🇺🇸), no-alert=0, hidden=1, include-all-proxies=0, include-other-group=订阅-Smart节点

🇸🇬 新加坡节点 = smart, policy-regex-filter=^(?!.*0\.).*(🇸🇬), no-alert=0, hidden=1, include-all-proxies=0, include-other-group=订阅-Smart节点

[Rule]
# >>> inline
RULE-SET,LAN,DIRECT,extended-matching,no-resolve
RULE-SET,SYSTEM,DIRECT,extended-matching,no-resolve
# >>> AD-BLOCK
RULE-SET,https://ruleset.skk.moe/List/non_ip/reject-no-drop.conf,REJECT-NO-DROP,pre-matching,extended-matching,no-resolve
RULE-SET,https://ruleset.skk.moe/List/non_ip/reject-drop.conf,REJECT-DROP,pre-matching,extended-matching,no-resolve
RULE-SET,https://ruleset.skk.moe/List/ip/reject.conf,REJECT-DROP,pre-matching,extended-matching,no-resolve
DOMAIN-SET,https://ruleset.skk.moe/List/domainset/reject.conf,REJECT,pre-matching,extended-matching
DOMAIN-SET,https://ruleset.skk.moe/List/domainset/reject_extra.conf,REJECT,pre-matching,extended-matching
RULE-SET,https://ruleset.skk.moe/List/non_ip/reject.conf,REJECT,pre-matching,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/cc63/Surge/main/Module/Apple_AD.list,REJECT,pre-matching,extended-matching,no-resolve
# >>> Apple
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Surge/FitnessPlus/FitnessPlus.list,Proxy,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Apple/Apple_All.list,DIRECT,extended-matching,no-resolve
# >>> AI
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/OpenAI/OpenAI.list,ChatGPT,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/cc63/Surge/refs/heads/main/Module/Grok.list,ChatGPT,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Claude/Claude.list,ChatGPT,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Copilot/Copilot.list,ChatGPT,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Gemini/Gemini.list,ChatGPT,extended-matching,no-resolve
# >>> General
RULE-SET,https://raw.githubusercontent.com/cc63/Surge/main/Module/Speedtest.list,Speedtest,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/WeChat/WeChat.list,DIRECT,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Twitter/Twitter.list,Proxy,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Telegram/Telegram.list,Proxy,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Instagram/Instagram.list,Proxy,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/GitHub/GitHub.list,Proxy,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Microsoft/Microsoft.list,Proxy,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/TikTok/TikTok.list,TikTok,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Google/Google.list,YouTube,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/YouTube/YouTube.list,YouTube,extended-matching,no-resolve
# >>> Streaming
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Netflix/Netflix.list,Netflix,extended-matching,no-resolve
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Disney/Disney.list,Netflix,extended-matching,no-resolve
# >>> Final
GEOIP,CN,DIRECT
FINAL,Proxy,dns-failed

[Header Rewrite]
http-request (raw|gist|avatars)\.githubusercontent\.com header-replace Accept-Language en-us

[MITM]
skip-server-cert-verify = true
tcp-connection = true
h2 = true
hostname = -*.apple.com, -*.icloud.com, -*.itunes.com, *.githubusercontent.com
```

## 🧩 配置建议


☁️ **阿里云DNS** 

```
quic://223.5.5.5:853
```

```
h3://223.5.5.5/dns-query
```

```
https://223.5.5.5/dns-query
```

☁️ **腾讯云DNS** 

```
https://1.12.12.12/dns-query
```
 
```
https://120.53.53.53/dns-query
```

---

🚀 **直连延迟测试** 

```
http://223.5.5.5
```

```
http://wifi.vivo.com.cn/generate_204
```


🚀 **代理延迟测试** 

```
http://1.1.1.1
```

```
http://www.gstatic.com/generate_204
```

```
http://cp.cloudflare.com/generate_204
```

---

🌍 **Geo-IP数据库**

```
https://raw.githubusercontent.com/Loyalsoldier/geoip/release/Country.mmdb
```

```
https://github.com/xream/geoip/releases/latest/download/ipinfo.country.mmdb
```
