function initPageAction(tabId) {

  // not required if there is a default on manifest
  // for browser.pageAction to be accessible, "page_action" key must be present on manifest
  // browser.pageAction.setIcon({tabId: tabId, path: "icons/icon.svg"});
  // browser.pageAction.setTitle({tabId: tabId, title: "title"});
  // browser.pageAction.setPopup({
  //     tabId: tabId,
  //     popup: "popup-nayuki/index.html"
  // });

  browser.pageAction.show(tabId); // required to "enable" pageAction icon

}

/*
When first loaded, initialize the page action for all tabs.
*/
var gettingAllTabs = browser.tabs.query({});
gettingAllTabs.then((tabs) => {
  for (let tab of tabs) {
    initPageAction(tab.id);
  }
});

browser.tabs.onUpdated.removeListener(initPageAction);
browser.tabs.onUpdated.addListener(initPageAction);
