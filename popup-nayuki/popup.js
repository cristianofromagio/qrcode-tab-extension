/**
 * refs:
 *  - https://dinbror.dk/blog/how-to-download-an-inline-svg-as-jpg-or-png/
 *  - https://stackoverflow.com/a/28692538
 *  - https://stackoverflow.com/a/28226736
 *
 */

const IMAGE_START_SIZE = 20;
const BASE_FONT_SIZE = 16;

function getCurrentTab() {
  return new Promise((resolve, reject) => {
    browser.tabs.query({
      active: true,
      lastFocusedWindow: true
    })
    .then((tabs) => resolve(tabs[0]))
    .catch((err) => reject('Failed to get currrent tab'));
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

function updateSvgElementDimensions(newSize) {
  const svgEl = document.querySelector('#qrcode-svg');
  const sizeInPx = (newSize * BASE_FONT_SIZE);
  svgEl.setAttribute("width", sizeInPx + "px");
  svgEl.setAttribute("height", sizeInPx + "px");
  svgEl.style.width = newSize + "rem";
  svgEl.style.height = newSize + "rem";
  svgEl.dataset.size = newSize;
  document.querySelector('#image-dimensions').innerHTML = `(${sizeInPx}x${sizeInPx})`;
}

function setSvgDefaultDimensions() {
  updateSvgElementDimensions(IMAGE_START_SIZE);
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

function copyStylesInline(destinationNode, sourceNode) {
  let containerElements = ["svg", "g"];
  for (let cd = 0; cd < destinationNode.children.length; cd++) {
    let child = destinationNode.children[cd];
    if (containerElements.indexOf(child.tagName) != -1) {
      copyStylesInline(child, sourceNode.children[cd]);
      continue;
    }
    let style;
    try {
      style = sourceNode.children[cd].currentStyle || window.getComputedStyle(sourceNode.children[cd]);
    } catch(err) {
      console.log('err getComputedStyle');
    }

    if (style == "undefined" || style == null) continue;
    for (let st = 0; st < style.length; st++) {
      child.style.setProperty(style[st], style.getPropertyValue(style[st]));
    }
  }
}

function triggerDownload(imgURI, fileName) {
  const evt = new MouseEvent("click", {
    view: window,
    bubbles: false,
    cancelable: true
  });
  let a = document.createElement("a");
  a.setAttribute("download", fileName);
  a.setAttribute("href", imgURI);
  a.setAttribute("target", '_parent');
  (document.body || document.documentElement).append(a);
  a.dispatchEvent(evt);
  a.remove();
  setTimeout(() => { window.close() }, 200);
}

function downloadSvg(svg, fileName) {
  let copy = svg.cloneNode(true);
  copyStylesInline(copy, svg);
  let canvas = document.createElement("canvas");
  // const bbox = svg.getBBox(); // this returns viewbox, and our viewbox is 37px
  const bbox = svg.getBoundingClientRect();
  canvas.width = bbox.width;
  canvas.height = bbox.height;
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, bbox.width, bbox.height);
  const data = (new XMLSerializer()).serializeToString(copy);
  let DOMURL = window.URL || window.webkitURL || window;
  let img = new Image();
  const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  const url = DOMURL.createObjectURL(svgBlob);

  img.onload = (ev) => {
    ctx.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(url);
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
      let blob = canvas.msToBlob();
      navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
      let imgURI = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      triggerDownload(imgURI, fileName);
    }
    // document.removeChild(canvas);
    canvas.remove();
  };
  img.src = url;
}

window.addEventListener('DOMContentLoaded', () => {

  setSvgDefaultDimensions();
  resolveI18nPlaceholders();

  const svgEl = document.getElementById("qrcode-svg");
  svgEl.addEventListener('click', (e) => {
    const newSize = parseInt(svgEl.dataset.size, 10) * 1.25;
    updateSvgElementDimensions(newSize);
  });

  getCurrentTab().then((tab) => {
    const text = tab.url;
    const segs = qrcodegen.QrSegment.makeSegments(text);
    const ecl = qrcodegen.QrCode.Ecc.MEDIUM;
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
    updateSvgElementDimensions(IMAGE_START_SIZE);
  });

  document.getElementById('download-image').addEventListener('click', () => {
    const svgEl = document.querySelector('#qrcode-svg');
    downloadSvg(svgEl, 'qrcode.png');
  });

});
