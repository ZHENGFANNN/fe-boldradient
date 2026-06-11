let openHandler = null;

export function registerLiveChatOpen(handler) {
  openHandler = handler;
}

/** 打开自研在线客服浮窗（对齐 GlobalContext.showLiveChat） */
export default function openLiveChat(forceOpen = true) {
  openHandler?.(forceOpen);
}
