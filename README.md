<p align="center">
  <img src="./icons/icon-128.png" width="128" height="128"/>
</p>

# QR Code Tab

Browser extension that shows current tab url + all highlighted tabs as QR code images using pageAction (on Firefox) and browserAction (on Chromium-based).

- Get the add-on for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/qr-code-tab-url/), [Opera](https://addons.opera.com/en/extensions/details/qr-code-tab/) (other browsers, see `Local debugging` below).


## Local Development
- Run `nodemon --watch popup-nayuki -e html,css,js,json build.js` (make sure to have `nodemon` installed globally with `npm install --g nodemon`)
  + `nodemon --watch popup-nayuki -e html,css,js,json build.js --firefox`
  + `nodemon --watch popup-nayuki -e html,css,js,json build.js --chrome`


## Local debugging

### Firefox
Enter `about:debugging` in the address bar on Firefox 45+, click on `Load Temporary Add-on`, select and open the `manifest.json` on `dist/firefox`. After each code change, it needs to be reloaded on the `about:debugging` page using the `Reload` link underneath the respective `Temporary Extensions` entry. Local debugging add-ons last as long as the current browser session.

To test i18n, download and set language packs on `Options/Preferences -> General -> Language` (may need to [restart the browser and reset browser cache](https://support.mozilla.org/en-US/questions/1264272)), if it does not work, the `about:config` "forced" method with option `intl.locale.requested` might work ([see ref.](https://support.mozilla.org/mk/questions/1264276)).

### Chromium-based
Enter `chrome://extensions/` in the address bar on any Chromium-based browser, click on `Load unpacked`, select the `chrome` folder on `dist` and confirm. On all Chromium-based browsers (tested with Chromium, Brave and Edge), the change on extension files during development will automatically propagate (no need to reload the extension each change like in Firefox). Unpacked extensions will stay installed through browser sessions.

To test i18n, enter `chrome://settings/languages` in the address bar, in the section `Preferred languages` click on `Add languages` if they are not on the list. After finding the desired language, click on the three dots in front of it and check `Display __BROWSER__ in this language`. By default, the browser uses language preferences from the OS.


## Publishing new version

### Firefox
- Run `node build.js --firefox` to copy all files needed for the extension to a `dist/firefox` folder.
- Enter `dist/firefox` folder and add all files to a zip (do not zip `firefox` folder directly, the `manifest.json` file should be at the root when unzipped).
- Go to Mozilla Add-on Developer Hub extension configs to [Submit a New Version](https://addons.mozilla.org/en-US/developers/addon/qr-code-tab-url/versions/submit/) and follow the instructions on the page.

### Chromium-based
- Run `node build.js --chrome` to copy all files needed for the extension to a `dist/chrome` folder.
- Enter `dist/chrome` folder and add all files to a zip (do not zip `chrome` folder directly, the `manifest.json` file should be at the root when unzipped).
- NOTE: since [Chrome Web Store no longer accepts Manifest V2 extensions](https://developer.chrome.com/docs/extensions/mv2/hosting/), it will not be published on Chrome Web Store. It will stay on Manifest V2 for now and I have no intention to port it to Manifest V3 at the moment.
- TODO: publish steps for [Opera Add-on](https://addons.opera.com/en/extensions/details/qr-code-tab/).
- TODO: publish steps for Edge Add-on.


## References
- https://github.com/tsl143/tutorials
- https://www.youtube.com/watch?v=RBI-j8USuJs
- https://activate.mozilla.community/webextensions/
- https://github.com/mdn/webextensions-examples

### Relevant links
- Publish add-on (Firefox): http://trishulgoel.com/how-to-publish-addon-on-addons-mozilla-org-aka-amo/
- WebExtensions API pageAction: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/pageAction
- WebExtensions API tabs: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/onUpdated
