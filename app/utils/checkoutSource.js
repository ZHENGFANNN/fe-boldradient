/** @format */

// ============================================================
// 结算来源（checkout source）
// 区分两条进入结算页的链路，各自使用独立 localStorage，互不污染：
//   - cart（默认）：从购物车 Drawer 结算，读写站内购物车 store_shopping。
//   - buy_now：从商品详情页「立即购买」进入，只结算当前商品，用独立
//     store_buy_now，绝不改动购物车里的既有商品。
// 结算页进入时用 resolveEffectiveSource() 决定读哪一份；标记缺失或立即购买
// 存储为空时一律回退到购物车来源。
// ============================================================

export const CHECKOUT_SOURCE_KEY = "checkout_source";

export const CHECKOUT_SOURCE = {
  CART: "cart",
  BUY_NOW: "buy_now",
};

// 各来源的购物车行存储 key
const CART_STORAGE_KEY = {
  [CHECKOUT_SOURCE.CART]: "store_shopping",
  [CHECKOUT_SOURCE.BUY_NOW]: "store_buy_now",
};

// 各来源的「已应用折扣码」存储 key
const DISCOUNT_STORAGE_KEY = {
  [CHECKOUT_SOURCE.CART]: "store_shopping_discount_codes",
  [CHECKOUT_SOURCE.BUY_NOW]: "store_buy_now_discount_codes",
};

function normalizeSource(value) {
  return value === CHECKOUT_SOURCE.BUY_NOW
    ? CHECKOUT_SOURCE.BUY_NOW
    : CHECKOUT_SOURCE.CART;
}

export function setCheckoutSource(source) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHECKOUT_SOURCE_KEY, normalizeSource(source));
  } catch {}
}

export function getCheckoutSource() {
  if (typeof window === "undefined") return CHECKOUT_SOURCE.CART;
  try {
    return normalizeSource(window.localStorage.getItem(CHECKOUT_SOURCE_KEY));
  } catch {
    return CHECKOUT_SOURCE.CART;
  }
}

// 来源 → 购物车行存储 key
export function cartStorageKey(source) {
  return CART_STORAGE_KEY[normalizeSource(source)];
}

// 来源 → 折扣码存储 key
export function discountStorageKey(source) {
  return DISCOUNT_STORAGE_KEY[normalizeSource(source)];
}

// 读取「有效来源」：结算页进入时使用。
// 标记为 buy_now 但立即购买存储为空（用户放弃了立即购买）时，回退到购物车来源，
// 避免直接访问 /order 时展示一份空的立即购买。
export function resolveEffectiveSource() {
  if (typeof window === "undefined") return CHECKOUT_SOURCE.CART;
  const source = getCheckoutSource();
  if (source !== CHECKOUT_SOURCE.BUY_NOW) return CHECKOUT_SOURCE.CART;
  try {
    const raw = window.localStorage.getItem(
      cartStorageKey(CHECKOUT_SOURCE.BUY_NOW)
    );
    const parsed = JSON.parse(raw ?? "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      return CHECKOUT_SOURCE.BUY_NOW;
    }
  } catch {}
  return CHECKOUT_SOURCE.CART;
}

const checkoutSource = {
  CHECKOUT_SOURCE_KEY,
  CHECKOUT_SOURCE,
  setCheckoutSource,
  getCheckoutSource,
  cartStorageKey,
  discountStorageKey,
  resolveEffectiveSource,
};

export default checkoutSource;
