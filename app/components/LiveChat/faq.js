/**
 * 在线客服 UI 文案：不再内置私有 en/zh 词典，统一走公共多语言体系。
 * 文案存后端 config_languages_list 的 `chat.*` 节点，前端在根 layout 以
 * nameSpace "common.chat" 加载进共享 LANG，本文件只负责把扁平 LANG key
 * 重建成组件既有的 copy 形状（含 ratingLabels 数组、orderStatus 对象），
 * 并对每个字段保留英文兜底，避免库未灌时裸奔。
 *
 * key 约定：LANG["common.chat.<field>"]，数组/对象拍平为
 *   ratingLabels → common.chat.ratingLabels_0..4
 *   orderStatus  → common.chat.orderStatus_status0..5
 */

// 英文兜底（库缺失时使用）；与后端 chat.* 的 en 文案保持一致。
const FALLBACK = {
  panelTitle: "Help Center",
  panelStatusOnline: "Agents available",
  panelStatusOffline: "Agents offline",
  intro: "Browse common questions below, or talk to our team.",
  transferBtn: "Talk to an agent",
  backToStart: "Back",
  leadIntro:
    "Please share your name and email so our team can assist you better.",
  name: "Name",
  namePlaceholder: "Your name",
  continueBtn: "Continue",
  invalidName: "Please enter your name.",
  invalidEmail: "Please enter a valid email address.",
  // 进入人工客服的邮箱验证码
  codeLabel: "Verification code",
  codePlaceholder: "6-digit code",
  sendCode: "Send code",
  codeSending: "Sending…",
  codeRequired: "Please enter the verification code.",
  codeInvalid: "Invalid or expired code, please resend.",
  codeSendFailed: "Failed to send code, please try again.",
  // 人机验证未完成时的提示（本组件无 toast，挂在邮箱字段下）
  turnstileRequired: "Please complete the verification first.",
  offlineIntro:
    "Our team is currently offline. Leave your contact details and we will reply by email as soon as possible.",
  offlineBanner:
    "Our agents are currently offline. You can leave a message and we will reply by email.",
  offlineThreadPlaceholder: "Type your message...",
  offlineSuccessTitle: "Message received",
  offlineSuccessText:
    "Thank you. Our customer service team will get back to you by email shortly.",
  email: "Email",
  phone: "Phone (optional)",
  message: "Message",
  submit: "Submit",
  chatOnline: "Online support",
  chatEnded: "Chat ended",
  typing: "Agent is typing…",
  typePlaceholder: "Type a message...",
  chatEndedHint: "This conversation has ended.",
  startNewChat: "Start a new chat",
  rateTitle: "How was your experience?",
  rateSubtitle: "Your feedback helps us improve.",
  rateSubmit: "Submit rating",
  rateThanks: "Thank you for your feedback!",
  feedbackPlaceholder: "Tell us more (optional)",
  yourRating: "Your rating",
  ratingLabels: ["Very bad", "Bad", "Okay", "Good", "Excellent"],
  shareOrder: "Share an order",
  orderPickerTitle: "Share an order",
  orderPickerEmpty: "No orders to share yet.",
  sendOrderFailed: "Could not share this order. Please try again.",
  uploadTooLarge: "File exceeds the 5MB limit.",
  uploadFailed: "Upload failed. Please try again.",
  shareProduct: "Share a product",
  productPickerTitle: "Share a product",
  productTabCart: "Cart",
  productTabRecent: "Recently viewed",
  productTabSearch: "Search",
  productSearchPlaceholder: "Search products...",
  productCartEmpty: "Your cart is empty.",
  productRecentEmpty: "No recently viewed products yet.",
  productSearchEmpty: "No products found.",
  productSearchHint: "Type to search products.",
  viewProduct: "View product",
  orderStatus: {
    status0: "Awaiting payment",
    status1: "Awaiting delivery",
    status2: "Delivered",
    status3: "Completed",
    status4: "Closed",
    status5: "Error",
  },
};

// 简单字段列表（string），逐个从 LANG 取，缺失回退 FALLBACK。
const SIMPLE_KEYS = Object.keys(FALLBACK).filter(
  (k) => k !== "ratingLabels" && k !== "orderStatus"
);

/**
 * 从共享 LANG 字典构建客服组件所需的 copy 对象。
 * @param {Record<string,string>} LANG 根 layout 注入的多语言字典
 */
export function buildChatCopy(LANG) {
  const L = LANG || {};
  const pick = (field, fb) => {
    const v = L[`common.chat.${field}`];
    return v == null || v === "" ? fb : v;
  };

  const copy = {};
  for (const k of SIMPLE_KEYS) copy[k] = pick(k, FALLBACK[k]);

  copy.ratingLabels = FALLBACK.ratingLabels.map((fb, i) =>
    pick(`ratingLabels_${i}`, fb)
  );

  copy.orderStatus = {};
  for (const sk of Object.keys(FALLBACK.orderStatus)) {
    copy.orderStatus[sk] = pick(`orderStatus_${sk}`, FALLBACK.orderStatus[sk]);
  }

  return copy;
}



export function getFaqLocale(locale) {
  const code = String(locale || "en").toLowerCase();
  if (code.startsWith("zh")) return "zh";
  if (code.startsWith("ja")) return "ja";
  return "en";
}

