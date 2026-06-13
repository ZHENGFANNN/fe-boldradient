import Api from "@/request";

export function getChatConfig() {
  return Api.get("/chat/config");
}

export function getChatFaq(locale) {
  return Api.get("/chat/faq", { params: { locale } });
}

export function createChatSession(body) {
  return Api.post("/chat/session", body);
}

export function getChatMessages(params) {
  return Api.get("/chat/messages", { params });
}

export function sendChatMessage(body) {
  return Api.post("/chat/message", body);
}

// 上传图片/文件到 OSS，返回 { url, name, type, size }；浏览器对 FormData 自动设置 multipart
export function uploadChatFile(file) {
  const form = new FormData();
  form.append("file", file);
  return Api.post("/chat/upload", form);
}

export function sendOfflineMessage(body) {
  return Api.post("/chat/offline-message", body);
}

export function refreshWsToken(body) {
  return Api.post("/chat/ws-token", body);
}

// 切片3 满意度评价：提交评分（rating 1~5，feedback 可选）
export function evaluateChat(body) {
  return Api.post("/chat/evaluate", body);
}

// 切片3 满意度评价：查询会话是否已评价，返回 { code, data: { rated, rating, feedback } }
export function getChatEvaluation(params) {
  return Api.get("/chat/evaluation", { params });
}
