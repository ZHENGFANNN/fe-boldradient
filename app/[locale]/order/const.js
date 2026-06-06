export const domesticPay = function ({ CONFIG, LANG }) {
  return [
    // {
    //   title: LANG["store.order.pay_info.wechat"],
    //   key: "wechat",
    //   imgList: [`${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-wechat.png`],
    //   description: "",
    // },
    // {
    //   title: LANG["store.order.pay_info.zhifubao"],
    //   key: "zhifubao",
    //   imgList: [`${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-zhifubao.png`],
    //   description: "",
    // },
    // {
    //   title: LANG["store.order.pay_info.transfer"],
    //   key: "bank",
    //   description: LANG["store.order.pay_info.transfer_detail"]
    //     .split("${1}")
    //     .join(CONFIG["company.basic.company_name"]),
    //   imgList: [`${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-transfer.png`],
    // },
    {
      title: LANG["common.pay.pay_info.pay_list.paypal"],
      description: LANG["common.pay.pay_info.pay_list.paypal_detail"],
      key: "payPal",
      imgList: [`${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-paypal.png`],
    },
  ];
};

export const foreignPay = function ({ CONFIG, LANG }) {
  return [
    // {
    //   title: LANG["store.order.pay_info.credit_card"],
    //   key: "creditCard",
    //   imgList: [
    //     `${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-visa.png`,
    //     `${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-master.png`,
    //     `${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-maestro.png`,
    //     `${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-american-express.png`,
    //     `${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-diners-clubs.png`,
    //     `${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-discover.png`,
    //     `${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-jcb.png`,
    //     `${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-unionpay.png`,
    //   ],
    // },
    // {
    //   title: LANG['store.order.pay_info.pay_after_arrival'],
    //   description: LANG['store.order.pay_info.pay_after_arrival_desc'],
    //   key: 'cod',
    //   // imgList: [`${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-paypal.png`],
    // },
    {
      title: LANG["common.pay.pay_info.pay_list.paypal"],
      description: LANG["common.pay.pay_info.pay_list.paypal_detail"],
      key: "payPal",
      imgList: [`${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-paypal.png`],
    },
    // {
    //   title: LANG['store.order.pay_info.transfer'],
    //   description: LANG['store.order.pay_info.transfer_detail'].split('${1}').join(CONFIG['company.basic.company_name']),
    //   key: 'bank',
    //   imgList: [`${process.env.NEXT_PUBLIC_FILE}/common/image/icon/pay-transfer.png`],
    // },
  ];
};
