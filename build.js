const
  fs = require("fs"),
  path = require("path");

let manifest = require("./manifest.json");

const TARGET_BROWSER = {
  '--firefox': "firefox",
  '--chrome': "chrome",
  '--opera': "chrome",
  '--edge': "chrome"
};

const args = process.argv.slice(2);
const target = args[0] || "--firefox";

function isFirefox() {
  return TARGET_BROWSER[target] === "firefox";
}

function isChrome() {
  return TARGET_BROWSER[target] === "chrome";
}

const filesToCopy = [
  "_locales/en/messages.json",
  "_locales/es/messages.json",
  "_locales/pt/messages.json",
  "popup-nayuki/index.html",
  "popup-nayuki/popup.css",
  "popup-nayuki/popup.js",
  "popup-nayuki/assets/js/utils.js",
  "popup-nayuki/assets/js/qrcodegen-v1.8.0-es5.js",
  "popup-nayuki/assets/js/qrcodegen-v1.8.0-es5.min.js",
  "popup-nayuki/assets/js/lz-string-v1.4.4.js",
  "popup-nayuki/assets/js/lz-string-v1.4.4.min.js",
  "popup-nayuki/assets/js/vanilla-js-tabs.js",
  "popup-nayuki/assets/js/vanilla-js-tabs.min.js",
  "popup-nayuki/assets/css/vanilla-js-tabs.css",
  "icons/icon-16.png",
  "icons/icon-32.png",
  "icons/icon-48.png",
  "icons/icon-96.png",
  "icons/icon-128.png",
  "vendor/browser-polyfill.min.js", // required by popup

  // "manifest.json", // will be written from object
];

if (isFirefox()) {
  // required by pageAction
  filesToCopy.push(
    "icons/icon.svg",
    "background.js"
  );

  // remove 'browser_action' from manifest
  const { browser_action, ...filteredManifest } = manifest;
  manifest = filteredManifest;
}

if (isChrome()) {
  // remove 'page_action' and 'background' from manifest
  const { page_action, background, ...filteredManifest } = manifest;
  manifest = filteredManifest;
}

const DEST_FOLDER = "dist/" + TARGET_BROWSER[target];

try {

  const targetFolder = path.join(__dirname, DEST_FOLDER);

  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, {
      recursive: true
    });
  } else {
    fs.rmSync(targetFolder, {
      recursive: true,
      force: true
    });
  }

  filesToCopy.forEach((filePath) => {
    let filePathArr = filePath.split("/");

    const filename = filePathArr.pop();
    let originPath, destPath;

    if (filePathArr.length > 0) {

      // this path has folders
      let destFolder = path.join(__dirname, DEST_FOLDER, filePathArr.join("/"));
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, {
          recursive: true
        });
      }

      originPath = path.join(__dirname, filePathArr.join("/"), filename);
      destPath = path.join(__dirname, DEST_FOLDER, filePathArr.join("/"), filename);

    } else {
      originPath = path.join(__dirname, filename);
      destPath = path.join(__dirname, DEST_FOLDER, filename);
    }

    fs.copyFileSync(originPath, destPath);
    console.log("Copied: ", destPath);

  });

  // write (filtered or not) manifest.json
  const manifestPath = path.join(__dirname, DEST_FOLDER, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("Copied: ", manifestPath);

} catch (err) {
  console.log(err);
}
