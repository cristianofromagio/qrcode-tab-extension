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

function resolveI18nPlaceholders() {
  let allTextNodes = document.createTreeWalker(document.getElementById('messages'), NodeFilter.SHOW_TEXT);
  let tmpText, tmpNode, newText;

  // iterate through all text nodes
  while (allTextNodes.nextNode()) {
    tmpNode = allTextNodes.currentNode;
    tmpText = tmpNode.nodeValue;
    newText = tmpText.replace(/__MSG_(\w+)__/g, (match, str) => (str) ? browser.i18n.getMessage(str) : '');

    if (newText) {
      tmpNode.nodeValue = newText;
    }
  }
}

// Returns a string of SVG code for an image depicting the given QR Code, with the given number
// of border modules. The string always uses Unix newlines (\n), regardless of the platform.
function toSvgString(qrGen, border, lightColor, darkColor) {
  if (border < 0)
    throw new RangeError("Border must be non-negative");
  let parts = [];
  for (let y = 0; y < qrGen.size; y++) {
    for (let x = 0; x < qrGen.size; x++) {
      if (qrGen.getModule(x, y))
        parts.push(`M${x + border},${y + border}h1v1h-1z`);
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${qrGen.size + border * 2} ${qrGen.size + border * 2}" stroke="none">
    <rect width="100%" height="100%" fill="${lightColor}"/>
    <path d="${parts.join(" ")}" fill="${darkColor}"/>
    </svg>
  `;
}

window.addEventListener('DOMContentLoaded', () => {

  resolveI18nPlaceholders();

  const svgEl = document.getElementById("qrcode-svg");
  svgEl.addEventListener('click', (e) => {
    const newSize = parseInt(svgEl.dataset.size, 10) * 1.25;
    svgEl.style.width = newSize + "em";
    svgEl.style.height = newSize + "em";
    svgEl.dataset.size = newSize;
  });

  getCurrentTab().then((tab) => {
		const text = tab.url;
		const segs = qrcodegen.QrSegment.makeSegments(text);
    const ecl = qrcodegen.QrCode.Ecc.LOW;
		const minVer = parseInt(1, 10);
		const maxVer = parseInt(40, 10);
		const mask = parseInt(-1, 10);
		const boostEcc = true;
		const tabUrlQR = qrcodegen.QrCode.encodeSegments(segs, ecl, minVer, maxVer, mask, boostEcc);

    const border = parseInt(0, 10);
		const lightColor = "#FFFFFF";
		const darkColor = "#000000";
    const code = toSvgString(tabUrlQR, border, lightColor, darkColor);

    const viewBox = (/ viewBox="([^"]*)"/.exec(code))[1];
    const pathD = (/ d="([^"]*)"/.exec(code))[1];
    svgEl.setAttribute("viewBox", viewBox);
    svgEl.querySelector("path").setAttribute("d", pathD);
    svgEl.querySelector("rect").setAttribute("fill", lightColor);
    svgEl.querySelector("path").setAttribute("fill", darkColor);
  });

  document.getElementById('reset-zoom').addEventListener('click', () => {
    svgEl.style.width = '23em';
    svgEl.style.height = '23em';
    svgEl.dataset.size = 23
  });

});
