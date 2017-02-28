/*
 * Author: Davide Francesco Merico
 */

/* When the document is fully loaded add Bookmaks, History and Closed Tabs Panels */
document.addEventListener ('DOMContentLoaded', () => {
  chrome.bookmarks.getTree (showBookmark);

  chrome.history.search ({
    text: '',
    maxResults: 10
  }, showHistory);

  chrome.sessions.getRecentlyClosed ({
    maxResults: 10
  }, showClosedTabs);
}, false);

/* Add the panel in the 'container' div, working a bit directly with the DOM.
 * This function replace the dependency from jquery's append () function too.
 * ( Note: if you replace this function with a simple $('#container').append ()
 *   when the extension load the "closed tabs" chrome will print an error because
 *   of this: https://developer.chrome.com/extensions/contentSecurityPolicy#relaxing-inline-script )
 */
const addPanel = (type, title, links) => {
  const panelDOM = document.createElement ('div');
  panelDOM.className = 'panel ' + type;

  if ( type === 'bookmark' ) {
    const removePanelDOM = document.createElement ('span');

    removePanelDOM.innerText = 'x';
    panelDOM.appendChild (removePanelDOM);
  }

  const panelTitleDOM = document.createElement ('h1');
  panelTitleDOM.innerText = title;

  const panelListDOM = document.createElement ('ul');
  links.forEach (link => {
    let listDOM = document.createElement ('li');
    let linkDOM = document.createElement ('a');
    let iconDOM = document.createElement ('img');
    let spanDOM = document.createElement ('span');

    linkDOM.setAttribute ('href', link.url);

    iconDOM.setAttribute ('src', 'chrome://favicon/' + link.url);
    linkDOM.appendChild (iconDOM);

    spanDOM.innerText = link.title;
    linkDOM.appendChild (spanDOM);

    listDOM.appendChild (linkDOM);
    panelListDOM.appendChild (listDOM);
  });

  panelDOM.appendChild (panelTitleDOM);
  panelDOM.appendChild (panelListDOM);
  document.getElementById ('container').appendChild (panelDOM);

  /* masonry reload */
  const msnry = new Masonry (document.getElementById ('container'), {
    itemSelector: '.panel',
    fitWidth: true,
    gutter: 16
  });
};

/* Serialize the bookmarks tree supplied by chrome.bookmarks.getTree ()
 * Each folder, and sub-folder, is pushed out from its context\node with
 * only name and children links.
 */
const serializeBookmarks = bookmarkTreeNode => {
  let serialized = [];

  for ( node in bookmarkTreeNode ) {
    if ( 'children' in bookmarkTreeNode[node] ) {
      serialized.push ({
        name: bookmarkTreeNode[node].title,
        links: bookmarkTreeNode[node].children.filter (child => !child.hasOwnProperty ('children') && child.title.length)
      });

      serialized = serialized.concat (serializeBookmarks (bookmarkTreeNode[node].children));
    }
  }

  return serialized.filter (node => node.links.length);
};

/* Add the bookmark panel */
const showBookmark = bookmarkTreeNode => serializeBookmarks (bookmarkTreeNode).forEach (bookmark =>
  addPanel ('bookmark', bookmark.name, bookmark.links.map (link => ({ url: link.url, title: link.title })))
);

/* Add the history panel */
const showHistory = historyItems =>
  addPanel ('history', 'Browser History', historyItems.map (link => ({
    url: link.url,
    title: (link.hasOwnProperty ('title') && link.title.length) ? link.title : link.url
  })));

/* Add the closed tabs panel */
const showClosedTabs = closedTabs =>
  addPanel ('closed-tabs', 'Closed Tabs', closedTabs.filter (closedTab =>
    closedTab.hasOwnProperty ('tab') && closedTab.tab.hasOwnProperty ('url')).slice (10).map (closedTab => ({
    url: closedTab.tab.url,
    title: (closedTab.tab.hasOwnProperty ('title') && closedTab.tab.title.length) ? closedTab.tab.title : closedTab.tab.url
  })));
