const
  fs = require("fs"),
  path = require("path");

const filesToCopy = [
  "_locales/en/messages.json",
  "_locales/es/messages.json",
  "_locales/pt/messages.json",
  "icons/icon-128.svg",
  "popup-nayuki/index.html",
  "popup-nayuki/popup.css",
  "popup-nayuki/popup.js",
  "popup-nayuki/qrcodegen-v1.8.0-es5.js",
  "popup-nayuki/qrcodegen-v1.8.0-es5.min.js",
  "background.js",
  "manifest.json",
];

const DEST_FOLDER = "dist";

try {

  const targetFolder = path.join(__dirname, DEST_FOLDER);

  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, {
      recursive: true
    });
  } else {
    fs.rmdirSync(targetFolder, {
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

} catch (err) {
  console.log(err);
}
