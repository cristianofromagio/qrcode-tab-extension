/**
 * refs:
 *  - https://github.com/davidshimjs/qrcodejs
 */

getCurrentTab().then((tab) => {
  var config = {
    text: tab.url,
    width: 256,
    height: 256,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  };
  var qrcode = new QRCode(document.getElementById("qrcode"), config);
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
