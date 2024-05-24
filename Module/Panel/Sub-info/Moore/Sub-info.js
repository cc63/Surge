/**********
* 作者：cc63&ChatGPT
* 更新时间：2024年1月20日
**********/

(async () => {
  let args = getArgs();
  let info = await getDataInfo(args.url);
  
  // 如果没有信息，则直接结束
  if (!info) return $done();

  let resetDayLeft = getRemainingDays(parseInt(args["reset_day"]));
  let expireDaysLeft = getExpireDaysLeft(args.expire || info.expire);

  let used = info.download + info.upload;
  let total = info.total;
  let content = [`用量：${bytesToSize(used)} / ${bytesToSize(total)}`];

  // 判断是否为不限时套餐
  if (!resetDayLeft && !expireDaysLeft) {
    let percentage = ((used / total) * 100).toFixed(1);
    content.push(`提醒：流量已使用${percentage}%`);
  } else {
    if (resetDayLeft && expireDaysLeft) {
      content.push(`提醒：${resetDayLeft}天后重置，${expireDaysLeft}天后到期`);
    } else if (resetDayLeft) {
      content.push(`提醒：流量将在${resetDayLeft}天后重置`);
    } else if (expireDaysLeft) {
      content.push(`提醒：套餐将在${expireDaysLeft}天后到期`);
    }
    
    // 到期时间（日期）显示
    if (expireDaysLeft) {
      content.push(`到期：${formatTime(args.expire || info.expire)}`);
    }
  }

  $done({
    title: `${args.title}`,
    content: content.join("\n"),
    icon: args.icon || "tornado",
    "icon-color": args.color || "#DF4688",
  });
})();

function getArgs() {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

function getUserInfo(url) {
  let request = { headers: { "User-Agent": "Quantumult%20X" }, url };
  return new Promise((resolve, reject) =>
    $httpClient.get(request, (err, resp) => {
      if (err != null) {
        reject(err);
        return;
      }
      if (resp.status !== 200) {
        reject(resp.status);
        return;
      }
      let header = Object.keys(resp.headers).find((key) => key.toLowerCase() === "subscription-userinfo");
      if (header) {
        resolve(resp.headers[header]);
        return;
      }
      reject("链接响应头不带有流量信息");
    })
  );
}

async function getDataInfo(url) {
  const [err, data] = await getUserInfo(url)
    .then((data) => [null, data])
    .catch((err) => [err, null]);
  if (err) {
    console.log(err);
    return;
  }

  return Object.fromEntries(
    data
      .match(/\w+=[\d.eE+-]+/g)
      .map((item) => item.split("="))
      .map(([k, v]) => [k, Number(v)])
  );
}

function getRemainingDays(resetDay) {
  if (!resetDay || resetDay < 1 || resetDay > 31) return;

  let now = new Date();
  let today = now.getDate();
  let month = now.getMonth();
  let year = now.getFullYear();

  // 计算当前月份和下个月份的天数
  let daysInThisMonth = new Date(year, month + 1, 0).getDate();
  let daysInNextMonth = new Date(year, month + 2, 0).getDate();

  // 如果重置日大于当前月份的天数，则在当月的最后一天重置
  resetDay = Math.min(resetDay, daysInThisMonth);

  if (resetDay > today) {
    // 如果重置日在本月内
    return resetDay - today;
  } else {
    // 如果重置日在下个月，确保不超过下个月的天数
    resetDay = Math.min(resetDay, daysInNextMonth);
    return daysInThisMonth - today + resetDay;
  }
}

function getExpireDaysLeft(expire) {
  if (!expire) return;

  let now = new Date().getTime();
  let expireTime;

  // 检查是否为时间戳
  if (/^[\d.]+$/.test(expire)) {
    expireTime = parseInt(expire) * 1000;
  } else {
    // 尝试解析YYYY-MM-DD格式的日期
    expireTime = new Date(expire).getTime();
  }

  let daysLeft = Math.ceil((expireTime - now) / (1000 * 60 * 60 * 24));
  return daysLeft > 0 ? daysLeft : null;
}

function bytesToSize(bytes) {
  if (bytes === 0) return "0B";
  let k = 1024;
  let sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatTime(time) {
  // 检查时间戳是否为秒单位，如果是，则转换为毫秒
  if (time < 1000000000000) time *= 1000;

  let dateObj = new Date(time);
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  return year + "年" + month + "月" + day + "日";
}
