import { writeFile } from "node:fs/promises";

const target = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = target.find((item) => item.type === "page" && item.url.includes(":5173/"));
if (!page) throw new Error("Vite page target not found");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 0;
const pending = new Map();
let mockAdminApi = false;
async function fulfillApi(requestId, url) {
  const payload = url.includes("/api/admin/me")
    ? { admin: { id: "theme-audit", name: "Theme Audit", email: "audit@example.test" } }
    : {};
  await cdp("Fetch.fulfillRequest", {
    requestId,
    responseCode: 200,
    responseHeaders: [{ name: "Content-Type", value: "application/json" }],
    body: Buffer.from(JSON.stringify(payload)).toString("base64"),
  });
}
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (mockAdminApi && data.method === "Fetch.requestPaused") {
    void fulfillApi(data.params.requestId, data.params.request.url).catch((error) => {
      console.log("API_MOCK_ERROR", JSON.stringify(error));
    });
  }
  if (data.id && pending.has(data.id)) {
    pending.get(data.id)(data);
    pending.delete(data.id);
  }
});
function cdp(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, (message) => message.error ? reject(message.error) : resolve(message.result));
  });
}
async function evaluate(expression) {
  const result = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result?.value;
}
async function screenshot(name) {
  const result = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`C:/Users/Hcheum/Desktop/fakhara/${name}`, Buffer.from(result.data, "base64"));
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForHeader() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await evaluate("Boolean(document.querySelector('.theme-toggle'))")) return;
    await wait(500);
  }
}
async function waitForTheme(theme) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await evaluate(`document.documentElement.dataset.theme === '${theme}'`)) return;
    await wait(250);
  }
  throw new Error(`Theme did not become ${theme}`);
}

await cdp("Page.enable");
await cdp("Runtime.enable");
await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
await cdp("Page.navigate", { url: "http://127.0.0.1:5173/" });
await waitForHeader();
await evaluate("localStorage.setItem('fakhara-theme','light'); location.reload()");
await waitForHeader();
await waitForTheme("light");
await wait(1500);
const initial = await evaluate(`(() => {
  const box = (selector) => { const e=document.querySelector(selector); if(!e) return null; const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return {x:r.x,y:r.y,width:r.width,height:r.height,display:s.display,visibility:s.visibility,color:s.color,background:s.backgroundColor}; };
  return {title:document.title, theme:document.documentElement.dataset.theme, header:box('.site-header'), language:box('.language-select'), toggle:box('.theme-toggle'), wishlist:box('.wishlist-link'), cart:box('.cart-link'), intro:box('.intro'), app:box('.app'), bodyBackground:getComputedStyle(document.body).backgroundColor};
})()`);
console.log("LIGHT", JSON.stringify(initial));
await evaluate("document.querySelector('.intro')?.remove()");
await screenshot(".tmp-theme-desktop-light.png");

await evaluate(`document.querySelector('.theme-toggle')?.click()`);
await waitForTheme("night");
const night = await evaluate(`(() => ({theme:document.documentElement.dataset.theme, stored:localStorage.getItem('fakhara-theme'), icon:document.querySelector('.theme-toggle')?.getAttribute('aria-label'), pageBackground:getComputedStyle(document.querySelector('.app')).backgroundColor, text:getComputedStyle(document.querySelector('.app')).color, cardBackground:getComputedStyle(document.querySelector('.home-section') || document.body).backgroundColor}))()`);
console.log("NIGHT", JSON.stringify(night));
await evaluate("document.querySelector('.intro')?.remove()");
await screenshot(".tmp-theme-desktop-night.png");

await cdp("Page.reload", { ignoreCache: true });
await waitForHeader();
await waitForTheme("night");
const restored = await evaluate(`({theme:document.documentElement.dataset.theme, stored:localStorage.getItem('fakhara-theme')})`);
console.log("RESTORE", JSON.stringify(restored));

await cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await wait(500);
await evaluate("document.querySelector('.intro')?.remove()");
const mobile = await evaluate(`(() => {
  const box = (selector) => { const e=document.querySelector(selector); if(!e) return null; const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,display:s.display,visibility:s.visibility}; };
  return {viewport:innerWidth, theme:document.documentElement.dataset.theme, language:box('.language-select'), toggle:box('.theme-toggle'), wishlist:box('.wishlist-link'), cart:box('.cart-link'), headerActions:box('.header-actions')};
})()`);
console.log("MOBILE", JSON.stringify(mobile));
await screenshot(".tmp-theme-mobile-night.png");

await cdp("Emulation.setDeviceMetricsOverride", { width: 320, height: 740, deviceScaleFactor: 1, mobile: true });
const narrowMobile = await evaluate(`(() => { const selectors=['.language-select','.theme-toggle','.wishlist-link','.cart-link','.header-actions']; return {viewport:innerWidth, boxes:selectors.map(s=>{const e=document.querySelector(s);const r=e?.getBoundingClientRect();return {selector:s,visible:!!e&&getComputedStyle(e).display!=='none'&&r.width>0,right:r?.right}})} })()`);
console.log("MOBILE_320", JSON.stringify(narrowMobile));

mockAdminApi = true;
await cdp("Fetch.enable", { patterns: [{ urlPattern: "*://*/api/*", requestStage: "Request" }] });
await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
await cdp("Page.navigate", { url: "http://127.0.0.1:5173/admin" });
await wait(5000);
const adminView = await evaluate(`(() => { const selectors=['.admin-page','.admin-sidebar','.admin-section','.admin-table','.admin-form']; return {path:location.pathname,theme:document.documentElement.dataset.theme,title:document.querySelector('h1')?.innerText,sections:selectors.map(s=>{const e=document.querySelector(s);if(!e)return {selector:s,found:false};const c=getComputedStyle(e);return {selector:s,found:true,color:c.color,background:c.backgroundColor}}),bodyText:document.body.innerText.slice(0,500)} })()`);
console.log("ADMIN", JSON.stringify(adminView));
await evaluate("document.querySelector('.intro')?.remove()");
await screenshot(".tmp-theme-admin-night.png");
await cdp("Fetch.disable");
socket.close();
