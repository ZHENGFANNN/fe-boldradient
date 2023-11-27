export default {
  // 进入帐单页
  enterOrderForm: function ({ currency, value, contents }) {
    window.fbq('track', '进入账单表单', { currency, value, contents })
  },
}
