/**
 * refs:
 *  - http://goqr.me/api/doc/create-qr-code/
 */

getCurrentTab().then((tab) => {
  document.getElementById('image').src = 'https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=' + tab.url;
});

function getCurrentTab() {
  return new Promise((resolve, reject) => {
    browser.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, (tabs) => {
      resolve(tabs[0]);
    });
  });
}
