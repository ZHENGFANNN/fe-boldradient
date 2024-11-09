import api from "../../request";

const request = {
  loginOut: () => {
    return api.get(`/user/loginOut`);
  },
  contactForm: (data) => {
    return api.post(`/user/contactForm`, data);
  },
};

export default request;
