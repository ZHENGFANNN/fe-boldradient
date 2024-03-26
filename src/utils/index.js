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
