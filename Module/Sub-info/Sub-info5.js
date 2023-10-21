/*
 * 本模块由@Rabbit-Spec编写
 * 本人仅针对个人审美进行部分微调
 * 更新日期：2023.10.22
*/

(async () => {
  try {
    const args = getArgs();
    const info = await getDataInfo(args.url);

    if (!info) {
      $done();
      return;
    }

    const resetDayLeft = getRemainingDays(parseInt(args.reset_day));
    const expire = args.expire || info.expire;
    const content = [`用量：${bytesToSize(info.download + info.upload)} │ ${bytesToSize(info.total)}`];

    if (resetDayLeft && expire && expire !== "false") {
      content.push(`提醒：${resetDayLeft}天后重置，${getDaysUntilExpire(expire)}天后到期`);
    } else if (resetDayLeft) {
      content.push(`提醒：${resetDayLeft}天后重置`);
    } else if (expire && expire !== "false") {
      content.push(`提醒：${getDaysUntilExpire(expire)}天后到期`);
    }
  if (expire && expire !== "false") {
    if (/^[\d.]+$/.test(expire)) expire *= 1000;
    content.push(`到期：${formatTime(expire)}`);
  }

    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    $done({
      title: args.title,
      content: content.join("\n"),
      icon: args.icon || "icloud.fill",
      "icon-color": args.color || "#16AAF4",
    });
  } catch (error) {
    console.error(error);
    $done();
  }
})();

function getDaysUntilExpire(expireTime) {
  if (/^[\d.]+$/.test(expireTime)) {
    expireTime *= 1000;
  }
  const now = new Date();
  const expireDate = new Date(expireTime);
  const daysLeft = Math.floor((expireDate - now) / (24 * 60 * 60 * 1000));
  return daysLeft;
}

function getArgs() {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)]
    )
  );
}

function getUserInfo(url) {
  const request = { headers: { "User-Agent": "Quantumult%20X" }, url };
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
      const header = Object.keys(resp.headers).find((key) => key.toLowerCase() === "subscription-userinfo");
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
      .map(([k, v]) => [k, Number(v)]
    )
  );
}

function getRemainingDays(resetDay) {
  if (!resetDay) return;

  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();
  let daysInMonth;

  if (resetDay > today) {
    daysInMonth = 0;
  } else {
    daysInMonth = new Date(year, month + 1, 0).getDate();
  }

  return daysInMonth - today + resetDay;
}

function bytesToSize(bytes) {
  if (bytes === 0) return "0B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}
function formatTime(time) {
  let dateObj = new Date(time);
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  return year + "年" + month + "月" + day + "日";
}
