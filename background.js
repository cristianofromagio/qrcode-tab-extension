browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    init(tabId);
});

function init(tabId) {

    browser.pageAction.setIcon({
        tabId: tabId,
        path: "icons/icon.png"
    });

    browser.pageAction.setTitle({
        tabId: tabId,
        title: "SHOW URL AS QR CODE"
    });
    
    browser.pageAction.setPopup({
        tabId: tabId,
        popup: "popup-img/index.html"
    });

    browser.pageAction.show(tabId);

}