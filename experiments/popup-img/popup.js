/**
 * refs:
 *  - https://github.com/neocotic/qrious
 */

getCurrentTab().then((tab) => {
  var config = {
    level: 'H',
    size: 250,
    value: tab.url
  };

  var qr = new QRious(config);
  var qrImage = qr.toDataURL('image/jpeg');
  document.getElementById('image').src = qrImage;
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
