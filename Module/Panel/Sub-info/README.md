<div align="center">
<img src="https://raw.githubusercontent.com/cc63/Surge/main/Module/Panel/Sub-info/Moore/Sub-info.PNG" width="280" alt="面板预览">
<br>

</div>

## 🌟 动态显示

- 🪐 **流量使用情况、重置天数**
- ⛴️ **套餐到期时间、剩余天数**

## 📦 使用教程

**一、模块内容**

```python
#!name=面板-机场信息
#!desc=流量信息/智能提醒/到期日期
#!category=🌠 面板模块

[Panel]
Sub-info = script-name=1号机场,update-interval=7200

Sub-info = script-name=2号机场,update-interval=7200

[Script]
1号机场 = type=generic,timeout=5,script-path=https://raw.githubusercontent.com/cc63/Surge/main/Module/Panel/Sub-info/Moore/Sub-info.js,script-update-interval=86400,argument=url=编码后的订阅链接&title=机场名字&reset_day=重置日期&icon=tornado&color=#DF4688

2号机场 = type=generic,timeout=5,script-path=https://raw.githubusercontent.com/cc63/Surge/main/Module/Panel/Sub-info/Moore/Sub-info.js,script-update-interval=86400,argument=url=编码后的订阅链接&title=机场名字&reset_day=重置日期&icon=waveform&color=#EF6D20
```

**二、 开始安装**

1. 选择`新建本地模块`
2. 把上方的`模块内容`粘贴进去
3. 用 [URL编码](https://www.urlencoder.org/zh/) 将订阅链接 `Encode`
4. 填写到`[编码后的订阅链接]`处

## ⚙️ 可选参数

| 参数         | 描述              | 格式             |
|-------------|-------------------|-----------------|
| `reset_day`      | 重置日期           | `范围：1-31`   | 
| `icon`      | 图标样式           | `SF Symbols`   | 
| `color`     | 图标颜色           | `#FF0000`      | 

> **⚠️ Tip:** 上述参数非必填项，用不到的可以直接删掉。
