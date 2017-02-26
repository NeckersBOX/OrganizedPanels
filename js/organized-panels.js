$(() => {
  chrome.bookmarks.getTree (showBookmark);
});

const showBookmark = bookmarkTreeNode => serializeBookmarks (bookmarkTreeNode).forEach (bookmark =>
  $('#container').append (
    '<div class="panel bookmark">' +
    ' <h1>' + bookmark.name + '</h1>' +
    ' <ul>' + bookmark.links.reduce ((formattedHtml, link) =>
      formattedHtml +
      '<li>' +
      ' <a target="_blank" href="' + link.url + '">' + link.title + '</a>' +
      '</li>', ''
    ) +
    ' </ul>' +
    '</div>'
  )
);

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
