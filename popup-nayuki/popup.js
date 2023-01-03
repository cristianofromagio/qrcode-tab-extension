/**
 * refs:
 *  - https://dinbror.dk/blog/how-to-download-an-inline-svg-as-jpg-or-png/
 *  - https://stackoverflow.com/a/28692538
 *  - https://stackoverflow.com/a/28226736
 *  - https://erikmartinjordan.com/startswith-multiple-strings-javascript
 *  - https://groups.google.com/a/chromium.org/g/chromium-extensions/c/hEDShE5Dwe0
 *  - https://developer.chrome.com/docs/extensions/reference/tabs/
 *  - http://links2tabs.com/about/
 *  - https://pieroxy.net/blog/pages/lz-string/index.html
 */

const IMAGE_START_SIZE = 20;
const BASE_FONT_SIZE = 16;

function getCurrentTab() {
  return new Promise((resolve, reject) => {
    browser.tabs.query({
      active: true,
      currentWindow: true
    })
    .then((tabs) => resolve(tabs[0]))
    .catch((err) => reject('Failed to get currrent tab'));
  });
}

function getHighlightedTabs() {
  return new Promise((resolve, reject) => {
    browser.tabs.query({
      highlighted : true,
      currentWindow: true
    })
    .then((tabs) => resolve(tabs))
    .catch((err) => reject('Failed to get highlighted tabs'));
  });
}

function resolveI18nPlaceholders() {

  let fullLangCode = browser.i18n.getUILanguage();
  let langCode = fullLangCode.split(/[-_.]/g)[0]; // might return "es-ES", "zh_cn"
  document.body.classList.add(langCode);

  let allTextNodes = document.createTreeWalker($('body'), NodeFilter.SHOW_TEXT);

  function replaceMsg(node, prop) {

    if (prop.includes('.')) {
      let arr = prop.split('.');
      replaceMsg(node[arr.shift()], arr.join('.'));
      return;
    }

    let tmp, txt;
    tmp = node[prop];
    if (tmp.includes('__MSG_')) {
      txt = tmp.replace(/__MSG_(\w+)__/g, (match, str) => (str) ? browser.i18n.getMessage(str) : '');
      if (txt) {
        node[prop] = txt;
      }
    }
  }

  let tmpNode;

  // iterate through all text nodes
  while (allTextNodes.nextNode()) {
    tmpNode = allTextNodes.currentNode;

    replaceMsg(tmpNode, 'nodeValue');

    if (tmpNode.parentElement.title) {
      replaceMsg(tmpNode, 'parentElement.title');
    }

  }
}

function updateBoundedElementsDimensions(newSize) {
  const sizeInPx = (newSize * BASE_FONT_SIZE);

  [...$$('[data-id="qrcode-svg"]')].forEach((svgEl) => {
    // svgEl.setAttribute("width", sizeInPx + "px");
    // svgEl.setAttribute("height", sizeInPx + "px");
    // svgEl.style.width = newSize + "rem";
    // svgEl.style.height = newSize + "rem";
    // svgEl.dataset.size = newSize;

    $fill(
      svgEl,
      ['width', 'height', 'style.width', 'style.height', 'dataset.size'],
      [sizeInPx + "px", sizeInPx + "px", newSize + "rem", newSize + "rem", newSize]
    );
  });

  [...$$('[data-id="image-dimensions"]')].forEach((el) => {
    el.textContent = `(${sizeInPx}x${sizeInPx})`;
  });

  // to keep to popup the same size throughout tabs (active / highlighted)
  const instructions = $('#highlighted-tab-instructions');
  if (instructions) {
    // instructions.style.width = newSize + "rem";
    // instructions.style.height = newSize + "rem";
    $fill(instructions, ['style.width', 'style.height'], [newSize + "rem", newSize + "rem"])
  }

  // THIS IS DONE ONLY TO FIX A BUG WHERE THE TEXT OF THE ANCHOR INSIDE A LIST ITEM
  //  WOULD NOT WRAP/BREAK ON FIREFOX (IT WORKED AS EXPECTED ON CHROME)
  const list = $('#highlighted-tab-list');
  if (list) {
    // list.style.maxWidth = newSize + "rem";
    // list.style.maxHeight = newSize + "rem";
    $fill(list, ['style.maxWidth', 'style.maxHeight'], [newSize + "rem", newSize + "rem"]);

    // this one-liner will overwrite/replace whole style attribute string, use with caution
    // list.setAttribute('style', `max-width:${newSize}rem;max-height:${newSize}rem;`);
  }
}

function setSvgDefaultDimensions() {
  updateBoundedElementsDimensions(IMAGE_START_SIZE);
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
  let a = $create("a");
  a.setAttribute("download", fileName);
  a.setAttribute("href", imgURI);
  a.setAttribute("target", '_parent');
  (document.body || document.documentElement).append(a);
  a.dispatchEvent(evt);
  a.remove();
  setTimeout(() => { window.close() }, 500);
}

function downloadSvg(svg, fileName) {
  // let copy = svg.cloneNode(true); // this would only be required if svg is complex / styled with css classes
  // copyStylesInline(copy, svg); // this would only be required if svg is complex / styled with css classes
  let copy = svg;
  let canvas = document.createElement("canvas");
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

function getMultilinkUrlString(tabs, encoded = false) {
  // these are "http:", not "https:"
  //  - they use different query params than our own
  // const baseUrl = new URL("http://links2.me/links2tabs/");
  // const baseUrl = new URL("http://brief.ly/links2tabs/");
  // const baseUrl = new URL("http://many.at/links2tabs/");

  const baseUrl = new URL("https://cristianofromagio.github.io/qrcode-tab-extension/multi/");
  const baseParams = {
    toc: "ToC",
    title: "Multiple links",
    description: "References 1 - " + tabs.length,
    selected: 0
  };
  let linksParams = {};

  if (!encoded) {

    // for (let i = 0; i < tabs.length; i++) {
    //   const idx = i + 1;
    //   linksParams['url' + idx] = tabs[i].url;
    //   linksParams['caption' + idx] = tabs[i].title;
    // }

    tabs.forEach((tab, i) => {
      const idx = i + 1;
      linksParams['url' + idx] = tab.url;
      // 65 is the length of title preview on tab hover (chromium based)
      // (firefox seems to not have a title length limit on tab hover)
      linksParams['caption' + idx] = (tab.title.length > 65)
        ? tab.title.substring(0, 65).trim().concat('...')
        : tab.title;
    });

  } else {

    for (let i = 0; i < tabs.length; i++) {
      const idx = i + 1;
      linksParams['url' + idx] = LZString.compressToEncodedURIComponent(tabs[i].url);
      linksParams['caption' + idx] = LZString.compressToEncodedURIComponent(tabs[i].title);
    }

  }

  baseUrl.search = new URLSearchParams({
    ...baseParams,
    ...linksParams,
    encoded: (encoded) ? 1 : 0
  });

  return baseUrl.toString();
}

function generateSvgContent(svgEl, text) {
  const segs = qrcodegen.QrSegment.makeSegments(text);
  const ecl = qrcodegen.QrCode.Ecc.LOW;
  const minVer = parseInt(1, 10);
  const maxVer = parseInt(40, 10);
  const mask = parseInt(-1, 10);
  const boostEcc = false;
  const tabUrlQR = qrcodegen.QrCode.encodeSegments(segs, ecl, minVer, maxVer, mask, boostEcc);

  const border = parseInt(1, 10);
  const lightColor = "#FFFFFF";
  const darkColor = "#000000";
  const code = toSvgString(tabUrlQR, border, lightColor, darkColor);

  const viewBox = (/ viewBox="([^"]*)"/.exec(code))[1];
  const pathD = (/ d="([^"]*)"/.exec(code))[1];
  svgEl.setAttribute("viewBox", viewBox);
  svgEl.querySelector("path").setAttribute("d", pathD);
  svgEl.querySelector("rect").setAttribute("fill", lightColor);
  svgEl.querySelector("path").setAttribute("fill", darkColor);
}

function createQrCodeActiveTab() {
  const svgEl = $('#qrcode-svg-active');

  getCurrentTab().then((tab) => {
    currentActiveTab = tab;
    const text = tab.url;
    generateSvgContent(svgEl, text);
  });

}

function createQrCodeHighlightedTabs() {

  getHighlightedTabs().then((tabs) => {
    // ignores "chrome://" and "file://" protocols, etc
    const validTabs = tabs
      .filter((tab) => ['http://', 'https://'].some((scheme) => tab.url.startsWith(scheme)))
      .map((tab) => {
        return {
          url: tab.url,
          title: tab.title
        }
      });

    validHighlightedTabs = validTabs;

    if (validHighlightedTabs.length < 2) {
      return;
    }

    $('#highlighted-tab-insuficient').remove();
    $('#highlighted-tab-section').classList.remove('hide');

    [...$$('[data-id="highlighted-tab-length"]')].forEach((el) => {
      el.textContent = `(${validHighlightedTabs.length})`;
    });

    renderHighlightedTabsMultilink();

    $('#encodedUrl').addEventListener('change', () => {
      renderHighlightedTabsMultilink();
    });

    const highlightedTabList = $('#highlighted-tab-list');
    // highlightedTabList.querySelectorAll('*').forEach((n) => n.remove());
    [...validHighlightedTabs].forEach((tab) => {
      const item = $create('li');
      const link = $create('a');
      // $fill(link, [
      //   'href',
      //   'title',
      //   'target',
      //   'rel',
      //   'textContent',
      //   'className'
      // ],
      // [
      //   tab.url,
      //   tab.url,
      //   '_blank',
      //   'noopener',
      //   tab.title,
      //   'highlighted-tab-list-item'
      // ]);
      link.href = tab.url;
      link.title = tab.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = tab.title;
      item.className = "highlighted-tab-list-item";
      item.appendChild(link);
      highlightedTabList.appendChild(item);
    });

  });
}

function renderHighlightedTabsMultilink() {

  const isEncoded = $('#encodedUrl').checked;
  const uniLinkText = getMultilinkUrlString(validHighlightedTabs, isEncoded);

  const svgEl = $('#qrcode-svg-highlighted');
  generateSvgContent(svgEl, uniLinkText);

  const highlightedTabUniLink = $('#highlighted-tab-unified-link-copy');
  highlightedTabUniLink.href = uniLinkText;
  highlightedTabUniLink.title = uniLinkText;

}

let currentActiveTab = {};
let validHighlightedTabs = [];

window.addEventListener('DOMContentLoaded', () => {

  // shared default sizes
  setSvgDefaultDimensions();

  resolveI18nPlaceholders();

  let targetTabs = new Tabs({
    elem: "tabs",
    open: 0
  });

  // shared resizing
  [...$$('[data-id="qrcode-svg"]')].forEach((svgEl) => {
    svgEl.addEventListener('click', (e) => {
      const newSize = parseInt(svgEl.dataset.size, 10) * 1.25;
      updateBoundedElementsDimensions(newSize);
    });
  });

  // shared reset sizing
  [...$$('[data-id="reset-zoom"]')].forEach((el) => {
    el.addEventListener('click', () => {
      updateBoundedElementsDimensions(IMAGE_START_SIZE);
    });
  });

  [...$$('[data-id="download-image"]')].forEach((el) => {
    el.addEventListener('click', (ev) => {
      const downloadTrigger = ev.target.closest('[data-id="download-image"]');
      const { image: target } = downloadTrigger.dataset;
      const svgEl = $('#qrcode-svg-' + target);
      downloadSvg(svgEl, 'qrcode-' + target + '.png');
    });
  });

  createQrCodeActiveTab();
  createQrCodeHighlightedTabs();

});
