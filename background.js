browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    init(tabId);
});

function init(tabId) {

    var title = browser.i18n.getMessage("extensionTitle");

    browser.pageAction.setIcon({
        tabId: tabId,
        path: "icons/icon.png"
    });

    browser.pageAction.setTitle({
        tabId: tabId,
        title: title
    });
    
    browser.pageAction.setPopup({
        tabId: tabId,
        popup: "popup-img/index.html"
    });

    browser.pageAction.show(tabId);

}