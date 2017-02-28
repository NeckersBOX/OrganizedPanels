/*
 * Author: Davide Francesco Merico
 */

/* When the document is fully loaded, It will go to watch options change events */
document.addEventListener ('DOMContentLoaded', () => {
  const themeElem = document.getElementsByClassName ('select-theme')[0];

  chrome.storage.sync.get ("theme", values => {
    if ( typeof values.theme === 'undefined' )
      return false;

    /* Restore saved theme */
    document.getElementById ('theme-stylesheet').setAttribute ('href', 'css/' + values.theme + '.css')

    /* Change select option */
    themeElem.value = values.theme;
  });

  let events = watchDOM ();

  document.addEventListener ('change', () => {
    unWatchDOM (events);
    events = watchDOM ();
  }, false);
}, false);

const watchDOM = () => {
  const removeDOM = document.getElementsByClassName ('remove-panel');
  const themeDOM = document.getElementsByClassName ('select-theme')[0];
  const restoreDOM = document.getElementsByClassName ('restore-panel');
  let events = [];

  /* Watch Theme */
  events.push ({
    type: 'change',
    target: themeDOM,
    listener: themeDOM.addEventListener ('change', changeTheme, false)
  });

  /* Watch Panels Remove */
  for ( let j = 0; j < removeDOM.length; ++j )
    events.push ({
      type: 'click',
      target: removeDOM[j],
      listener: removeDOM[j].addEventListener ('click', removePanel, false)
    });

  /* Watch Panels Restore */
  for ( let j = 0; j < restoreDOM.length; ++j )
    events.push ({
      type: 'click',
      target: restoreDOM[j],
      listener: restoreDOM[j].addEventListener ('click', restorePanel, false)
    });

  reloadMasonry ();

  return events;
};

const unWatchDOM = events => events.forEach (event => event.target.removeEventListener (event.type, event.listener));

/* Replace the css stylesheet with the theme choosen corrisponding file */
const changeTheme = event => {
  document.getElementById ('theme-stylesheet').setAttribute ('href', 'css/' + event.target.value + '.css');
  chrome.storage.sync.set ({ theme: event.target.value });
};

/* Update the view reloading Masonry */
const reloadMasonry = () => {
  const msnry =new Masonry (document.getElementById ('container'), {
    itemSelector: '.panel',
    fitWidth: true,
    gutter: 16
  });
};

/* Remove the panel clicked and save its id inside the "removed" array */
const removePanel = event => chrome.storage.sync.get ("removed", values => {
  let removed = [];

  if ( typeof values.removed !== 'undefined' )
    removed = JSON.parse (values.removed);

  removed.push (event.target.getAttribute ('data-ref'));

  chrome.storage.sync.set ({ removed: JSON.stringify (removed) });
  location.reload ();
});

/* Restore the panel clicked and remove its id from the "removed" array */
const restorePanel = event => chrome.storage.sync.get ("removed", values => {
  let removed = [];

  if ( typeof values.removed !== 'undefined' )
    removed = JSON.parse (values.removed);

  let indexPanel = removed.indexOf (event.target.getAttribute ('data-ref'));

  if ( indexPanel != -1 )
    removed.splice (indexPanel, 1);

  chrome.storage.sync.set ({ removed: JSON.stringify (removed) });
  location.reload ();
});
