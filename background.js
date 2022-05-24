browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    init(tabId);
});

function init(tabId) {

    browser.pageAction.setPopup({
        tabId: tabId,
        popup: "popup-img/index.html"
    });

    browser.pageAction.show(tabId);

}