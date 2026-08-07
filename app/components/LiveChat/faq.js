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
  backToFaq: "Back to FAQ",
  leadIntro:
    "Please share your name and email so our team can assist you better.",
  name: "Name",
  namePlaceholder: "Your name",
  continueBtn: "Continue",
  invalidName: "Please enter your name.",
  invalidEmail: "Please enter a valid email address.",
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


export const FAQ_ITEMS = {
  en: [
    {
      id: "shipping",
      question: "How long does shipping take?",
      answer:
        "Most US orders ship within 3–5 business days after production. International delivery times vary by destination; you will see an estimated timeline at checkout.",
    },
    {
      id: "returns",
      question: "What is your return policy?",
      answer:
        "Unworn items in original condition may be returned within 30 days of delivery. Custom or engraved pieces may have different terms — contact us before ordering if you need details.",
    },
    {
      id: "lab-grown",
      question: "Are your diamonds lab-grown?",
      answer:
        "Yes. BoldRadiant specializes in lab-grown diamonds — ethically sourced, fully certified, and typically offered at better value than comparable mined stones.",
    },
    {
      id: "sizing",
      question: "How do I find my ring size?",
      answer:
        "Use our sizing guide on the product page, or visit a local jeweler for a professional measurement. We recommend sizing your dominant hand's ring finger.",
    },
    {
      id: "payment",
      question: "Which payment methods do you accept?",
      answer:
        "We accept major credit and debit cards via Stripe, as well as PayPal where available. All transactions are secured with industry-standard encryption.",
    },
  ],
  zh: [
    {
      id: "shipping",
      question: "发货需要多久？",
      answer:
        "美国订单通常在制作完成后 3–5 个工作日内发出；国际订单时效因目的地而异，结算页会显示预计送达时间。",
    },
    {
      id: "returns",
      question: "退换货政策是什么？",
      answer:
        "未佩戴且保持原状的商品可在签收后 30 天内申请退货。定制或刻字商品可能有特殊条款，下单前欢迎先联系我们确认。",
    },
    {
      id: "lab-grown",
      question: "你们的钻石是培育钻石吗？",
      answer:
        "是的。BoldRadiant 专注实验室培育钻石，来源可追溯、附带证书，相较同级别天然钻石通常更具性价比。",
    },
    {
      id: "sizing",
      question: "如何确定戒指尺码？",
      answer:
        "可参考商品页的尺码指南，或到当地珠宝店实测。建议测量惯用手对应的无名指围度。",
    },
    {
      id: "payment",
      question: "支持哪些支付方式？",
      answer:
        "支持 Stripe 信用卡/借记卡，部分地区还支持 PayPal。所有支付均通过行业标准加密保护。",
    },
  ],
  ja: [
    {
      id: "shipping",
      question: "配送にはどのくらいかかりますか？",
      answer:
        "米国内の注文は通常、製作完了後 3〜5 営業日以内に発送されます。海外配送の所要日数は配送先により異なり、目安はチェックアウト時にご確認いただけます。",
    },
    {
      id: "returns",
      question: "返品ポリシーを教えてください。",
      answer:
        "未使用で元の状態の商品は、お届けから 30 日以内に返品いただけます。カスタム品や刻印入りの商品は条件が異なる場合がありますので、ご不明な点はご注文前にお問い合わせください。",
    },
    {
      id: "lab-grown",
      question: "ダイヤモンドはラボグロウンですか？",
      answer:
        "はい。BoldRadiant はラボグロウンダイヤモンドを専門としています。倫理的に調達され、証明書付きで、同等の天然石よりもお求めやすい価格で提供しています。",
    },
    {
      id: "sizing",
      question: "指輪のサイズはどうやって調べますか？",
      answer:
        "商品ページのサイズガイドをご利用いただくか、お近くの宝飾店で計測してください。利き手の薬指を測ることをおすすめします。",
    },
    {
      id: "payment",
      question: "どのお支払い方法が利用できますか？",
      answer:
        "Stripe を通じて主要なクレジットカード・デビットカードをご利用いただけるほか、一部地域では PayPal もご利用いただけます。すべての取引は業界標準の暗号化で保護されています。",
    },
  ],
};

export function getFaqLocale(locale) {
  const code = String(locale || "en").toLowerCase();
  if (code.startsWith("zh")) return "zh";
  if (code.startsWith("ja")) return "ja";
  return "en";
}

export function getFaqItems(locale) {
  return FAQ_ITEMS[getFaqLocale(locale)] || FAQ_ITEMS.en;
}
