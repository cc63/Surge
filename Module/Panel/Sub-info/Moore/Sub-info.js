/**********
* 作者：cc63&ChatGPT&Claude
* 更新时间：2025年5月3日
**********/

(async () => {
  try {
    // 获取参数并处理数据
    const args = getArgs();
    const info = await getDataInfo(args.url);
    
    // 如果没有信息，则直接结束
    if (!info) return $done({});

    // 处理重置日和到期日
    const resetDayLeft = args.reset_day ? getRemainingDays(parseInt(args.reset_day)) : null;
    const expireDate = args.expire || info.expire;
    const expireDaysLeft = getExpireDaysLeft(expireDate);

    // 计算流量使用情况
    const used = info.download + info.upload;
    const total = info.total;
    const content = [`用量：${bytesToSize(used)} / ${bytesToSize(total)}`];

    // 构建提示信息
    buildNotifications(content, used, total, resetDayLeft, expireDaysLeft, expireDate);

    // 返回结果
    $done({
      title: args.title,
      content: content.join("\n"),
      icon: args.icon || "tornado",
      "icon-color": args.color || "#DF4688",
    });
  } catch (error) {
    console.log(`发生错误: ${error}`);
    $done({
      title: "订阅信息获取失败",
      content: `错误信息: ${error}`,
      icon: "exclamationmark.triangle",
      "icon-color": "#CB1B45",
    });
  }
})();

/**
 * 构建通知内容
 */
function buildNotifications(content, used, total, resetDayLeft, expireDaysLeft, expireDate) {
  // 判断是否为不限时套餐
  if (!resetDayLeft && !expireDaysLeft) {
    const percentage = ((used / total) * 100).toFixed(1);
    content.push(`提醒：流量已使用${percentage}%`);
    return;
  }
  
  // 添加重置和到期提醒
  if (resetDayLeft && expireDaysLeft) {
    content.push(`提醒：${resetDayLeft}天后重置，${expireDaysLeft}天后到期`);
  } else if (resetDayLeft) {
    content.push(`提醒：流量将在${resetDayLeft}天后重置`);
  } else if (expireDaysLeft) {
    content.push(`提醒：套餐将在${expireDaysLeft}天后到期`);
  }
  
  // 添加到期日期
  if (expireDaysLeft) {
    content.push(`到期：${formatTime(expireDate)}`);
  }
}

/**
 * 解析参数
 */
function getArgs() {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => {
        const [key, value] = item.split("=");
        return [key, value ? decodeURIComponent(value) : null];
      })
      .filter(([key]) => key) // 过滤无效参数
  );
}

/**
 * 获取用户信息
 */
function getUserInfo(url) {
  if (!url) {
    return Promise.reject("未提供有效的订阅链接");
  }
  
  const request = { 
    headers: { "User-Agent": "Quantumult%20X" }, 
    url 
  };
  
  return new Promise((resolve, reject) => {
    $httpClient.get(request, (err, resp) => {
      if (err) {
        return reject(`网络请求错误: ${err}`);
      }
      
      if (resp.status !== 200) {
        return reject(`服务器返回非200状态码: ${resp.status}`);
      }
      
      const header = Object.keys(resp.headers).find(
        (key) => key.toLowerCase() === "subscription-userinfo"
      );
      
      if (header) {
        return resolve(resp.headers[header]);
      }
      
      reject("链接响应头不带有流量信息");
    });
  });
}

/**
 * 获取数据信息
 */
async function getDataInfo(url) {
  try {
    const data = await getUserInfo(url);
    
    // 使用正则提取数据
    const matches = data.match(/\w+=[\d.eE+-]+/g);
    if (!matches || matches.length === 0) {
      throw new Error("无法解析返回的数据");
    }
    
    // 解析键值对
    return Object.fromEntries(
      matches.map((item) => {
        const [key, value] = item.split("=");
        return [key, Number(value)];
      })
    );
  } catch (error) {
    console.log(`获取数据失败: ${error}`);
    return null;
  }
}

/**
 * 计算剩余天数
 */
function getRemainingDays(resetDay) {
  // 验证重置日
  if (!resetDay || resetDay < 1 || resetDay > 31) return null;

  const now = new Date();
  const today = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // 计算当月天数
  const daysInThisMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // 调整重置日，如果超出当月天数则使用当月最后一天
  const adjustedResetDay = Math.min(resetDay, daysInThisMonth);
  
  // 如果重置日在当月还未过
  if (adjustedResetDay > today) {
    return adjustedResetDay - today;
  }
  
  // 如果重置日已过，计算到下月重置日的天数
  const daysInNextMonth = new Date(currentYear, currentMonth + 2, 0).getDate();
  const nextMonthResetDay = Math.min(resetDay, daysInNextMonth);
  
  return daysInThisMonth - today + nextMonthResetDay;
}

/**
 * 计算到期剩余天数
 */
function getExpireDaysLeft(expire) {
  if (!expire) return null;

  const now = new Date().getTime();
  let expireTime;

  // 处理时间戳或日期字符串
  if (typeof expire === 'number' || /^[\d.]+$/.test(expire)) {
    // 确保时间戳为毫秒
    expireTime = parseInt(expire);
    if (expireTime < 1000000000000) {
      expireTime *= 1000; // 如果是秒，转换为毫秒
    }
  } else {
    // 尝试解析日期字符串
    expireTime = new Date(expire).getTime();
    if (isNaN(expireTime)) {
      console.log("无效的到期日期格式");
      return null;
    }
  }

  const daysLeft = Math.ceil((expireTime - now) / (1000 * 60 * 60 * 24));
  return daysLeft > 0 ? daysLeft : null;
}

/**
 * 字节转换为可读大小
 */
function bytesToSize(bytes) {
  if (bytes === 0) return "0B";
  
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + units[i];
}

/**
 * 格式化时间
 */
function formatTime(time) {
  if (!time) return "未知日期";
  
  // 处理时间戳
  let timestamp = time;
  if (typeof time !== 'number' && /^[\d.]+$/.test(time)) {
    timestamp = parseInt(time);
  }
  
  // 确保时间戳为毫秒
  if (timestamp < 1000000000000) {
    timestamp *= 1000;
  }
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      // 尝试作为日期字符串解析
      const stringDate = new Date(time);
      if (isNaN(stringDate.getTime())) {
        return "无效日期";
      }
      date = stringDate;
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}年${month}月${day}日`;
  } catch (error) {
    console.log(`日期格式化错误: ${error}`);
    return "日期解析错误";
  }
}
