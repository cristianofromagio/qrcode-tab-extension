# qrcode-tab - [Get the add-on on Firefox 45+](https://addons.mozilla.org/en-US/firefox/addon/qr-code-tab-url/)
Firefox extension that show current tab url as QR code image using WebExtensions API pageAction

![Screenshot](https://raw.githubusercontent.com/cristianofromagio/qrcode-tab-firefox/master/screenshot-v1.2.gif)

## Local debugging
Enter `about:debugging` in the address bar on Firefox 45+, click on `Load Temporary Add-on`, select and open the `manifest.json`. After each code change, it needs to be reloaded on the `about:debugging` page using the `Reload` link underneath the respective `Temporary Extensions` entry. Local debugging add-ons last as long as the browser window is open.

To test i18n, download and set language packs on `Options/Preferences -> General -> Language` (may need to [restart the browser and reset browser cache](https://support.mozilla.org/en-US/questions/1264272)), if it does not work, the `about:config` "forced" method with option `intl.locale.requested` might work ([see ref.](https://support.mozilla.org/mk/questions/1264276)).

## Sources:

### Based on:
- https://github.com/tsl143/tutorials
- https://www.youtube.com/watch?v=RBI-j8USuJs
- https://activate.mozilla.community/webextensions/
- https://github.com/mdn/webextensions-examples

### Publish add-on:
- http://trishulgoel.com/how-to-publish-addon-on-addons-mozilla-org-aka-amo/

### WebExtensions API pageAction:
- https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/pageAction

### WebExtensions API tabs:
- https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/onUpdated

### Files:
- manifest.json
  + https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json
  + https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/permissions

- /popup-*/index.html
  + https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/getCurrent
  + https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/Tab

- /popup-*/popup.js
  + https://stackoverflow.com/questions/43695817/tabs-getcurrent-result-is-undefined
  + https://stackoverflow.com/questions/10413911/how-to-get-the-currently-opened-tabs-url-in-my-page-action-popup
  + https://stackoverflow.com/questions/7275650/javascript-replace-command-replace-page-text/7275856#7275856

- /popup-canvas/qrcode.min.js
  + https://github.com/davidshimjs/qrcodejs

- /popup-img/qrious.min.js
  + https://github.com/neocotic/qrious

- /popup-api/popup.js
  + http://goqr.me/api/doc/create-qr-code/

- /popup-nayuki/qrcodegen-*.js
  + https://www.nayuki.io/page/qr-code-generator-library
  + https://www.digitalocean.com/community/tools/minify
