/**
 * @desc 函数防抖
 * @param func 回调函数
 * @param delay 延迟执行毫秒数
 */
export function debounce(func, delay) {
  let timer; // 定时器

  return function () {
    let context = this; // 记录 this 值,防止在回调函数中丢失
    let args = arguments; // 函数参数

    //如果定时器存在，则清除定时器(如果没有,也没必要进行处理)
    timer ? clearTimeout(timer) : null;

    timer = setTimeout(() => {
      // 防止 this 值变为 window
      func.apply(context, args);
    }, delay);
  };
}

/**
 * @desc 函数节流
 * @param func 回调函数
 * @param limit 时间限制
 */
export const throttle = (func, limit) => {
  let inThrottle; // 是否处于节流限制时间内

  return function () {
    const context = this;
    const args = arguments;

    // 跳出时间限制
    if (!inThrottle) {
      func.apply(context, args); // 执行回调
      inThrottle = true;
      // 开启定时器计时
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * @desc 判断用户UA是否为Mob段
 * @param ua 时间限制
 */
export function isUserMobile(ua) {
  return /mobile|android|iphone|ipod|phone|ipad/i.test(ua.toLowerCase());
}

/**
 * @desc 保留2位小数点
 * @param value 值
 * @param unit 小数位
 */
export function roundToDecimalPlaces(value, unit = 100) {
  // 确保输入是数字类型
  if (typeof value !== "number") {
    value = parseFloat(value);
  }
  if (typeof unit !== "number") {
    unit = unit || 100;
  }

  return Math.round(value * unit) / unit;
}

/**
 * @desc 分割金额
 * @param value 值
 * @param unit 小数位
 */
export function formatCurrency(value, unit = 100) {
  // 确保输入是数字类型
  if (typeof value !== "number") {
    value = parseFloat(value);
  }
  if (typeof unit !== "number") {
    unit = unit || 100;
  }

  // 使用 toFixed 方法保留两位小数并转换为字符串
  let formattedAmount = new String(roundToDecimalPlaces(value, unit));

  // 添加千位分隔符
  formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // 添加货币符号等其他格式化需求
  // 例如，如果需要添加货币符号，可以这样处理：
  // formattedAmount = '$' + formattedAmount;

  return formattedAmount;
}

/**
 * @desc 阿里云 OSS 图片处理：把 m_pad(等比缩放后用底色填充留白) 改成
 *       m_fill(等比缩放铺满目标框后居中裁切)，并去掉只对 pad 有效的 color_ 参数，
 *       让非正方形产品图占满正方形卡片、不再出现白边。
 * @param url 图片地址(可能带 ?x-oss-process=image/resize,m_pad,w_1000,h_1000,color_FFFFFF)
 */
export function fillOssImage(url) {
  if (typeof url !== "string" || !url.includes("x-oss-process")) return url;
  return url
    .replace(/m_pad/g, "m_fill")
    .replace(/,color_[0-9a-fA-F]+/g, "");
}

/**
 * @desc format JSON
 */
export function getJsonData(data) {
  try {
    return JSON.parse(data);
  } catch {
    console.log("【获取JSON数据失败】", data);
    return [];
  }
}

/**
 * @desc tracking Data
 */
export function trackingCustomClick({ click_type, click_data }) {
  dataLayer.push({
    event: "custom_click",
    click_type,
    click_data,
  });
}
