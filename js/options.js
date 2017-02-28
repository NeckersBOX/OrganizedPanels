/*
 * Author: Davide Francesco Merico
 */

/* When the document is fully loaded, It will go to watch options change events */
document.addEventListener ('DOMContentLoaded', () => {
  const themeElem = document.getElementsByClassName ('select-theme')[0];

  themeElem.onchange = changeTheme;
});

/* Replace the css stylesheet with the theme choosen corrisponding file */
const changeTheme = event =>
  document.getElementById ('theme-stylesheet').setAttribute ('href', 'css/' + event.target.value + '.css');
