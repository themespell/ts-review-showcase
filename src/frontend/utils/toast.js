export function toastNotification(type, message, description) {
  if (typeof document === 'undefined') {
    return;
  }

  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  const background = type === 'error' ? '#991b1b' : type === 'success' ? '#065f46' : '#111827';
  el.style.cssText = `position:fixed;top:16px;right:16px;z-index:100000;max-width:320px;padding:12px 14px;border-radius:10px;background:${background};color:#fff;font:14px/1.45 sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.2)`;
  el.textContent = description ? `${message}. ${description}` : message;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 4000);
}
