// ==UserScript==
// @id           101_Logtime
// @name         101_Logtime
// @namespace    http://tampermonkey.net/
// @version      1.10.1
// @description  Affiche votre logtime du mois courant et des 3 mois précédents, avant d'installer ce script il faut tout d'abord avoir l'extension tampermonkey ## LIEN TAMPERMONKEY : https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=fr
// @author       Grégoire Hazette
// @match        https://profile.intra.42.fr/
// @match        https://profile.intra.42.fr/users/*
// @downloadURL  https://openuserjs.org/install/ghazette/101_Logtime.user.js
// @updateURL  https://openuserjs.org/install/ghazette/101_Logtime.user.js
// @run-at       document-end
// @license MIT
// ==/UserScript==

var months = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December"
};

function getJSON(url) {
  var Httpreq = new XMLHttpRequest();
  Httpreq.open("GET", url, false);
  Httpreq.send(null);
  return JSON.parse(Httpreq.responseText);
}

function getLogin() {
  let login = document.getElementsByClassName("login")[0];
  return (login.getAttribute("data-login"));
}

function get_Logtime() {
  let date = new Date();
  let month = date.getMonth() + 1;
  if (month < 10)
    month = "0" + month;
  let year = date.getYear() + 1900;
  let regexp = new RegExp(year + "-" + month + "-[0-9]{2}");
  let parsed = getJSON("https://profile.intra.42.fr/users/" + getLogin() + "/locations_stats.json");
  let Logtime = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  for (let key in parsed) {
    if (key.match(regexp)) {
      let time = (parsed[key]).split(":");
      hours += Number(time[0]);
      minutes += Number(time[1]);
      seconds += Number(time[2]);
    }
  }
  while (seconds) {
    if (seconds < 60)
      break;
    seconds -= 60;
    minutes++;
  }
  while (minutes) {
    if (minutes < 60)
      break;
    minutes -= 60;
    hours++;
  }
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  return (hours + "H " + minutes + "M " + seconds + "S");
}

function get_logtime_prev() {
  let date = new Date();
  let i = 0;
  let month = date.getMonth(); /* month 0 to 11, this is why if 0 (january) we set it to 12 (december) */
  if (month === 0)
    month = 12;
  let parsed = getJSON("https://profile.intra.42.fr/users/" + getLogin() + "/locations_stats.json");
  var Logtime = [];
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  while (i < 3) {
    if (month === 0)
      month = 12;
    if (month < 10)
      month = "0" + month;
    let regexp = new RegExp(month + "-[0-9]{2}");
    let logtime = 0;
    for (let key in parsed) {
      if (key.match(regexp)) {
        let time = (parsed[key]).split(":");
        hours += Number(time[0]);
        minutes += Number(time[1]);
        seconds += Number(time[2]);
      }
    }
    while (seconds) {
      if (seconds < 60)
        break;
      seconds -= 60;
      minutes++;
    }
    while (minutes) {
      if (minutes < 60)
        break;
      minutes -= 60;
      hours++;
    }
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    Logtime[i] = hours + "H " + minutes + "M " + seconds + "S";
    month--;
    hours = 0;
    minutes = 0;
    seconds = 0;
    i++;
  }

  return Logtime;
}

function createEl(type, _class, id, css, html) {
  let elem = document.createElement(type);
  if (_class)
    elem.className = _class;
  if (id)
    elem.id = id;
  if (css)
    elem.style.cssText = css;
  if (html)
    elem.innerHTML = html;
  return elem;
}

function matching(obj) {
  obj = obj.join('|');
  if ((document.baseURI).match(obj))
    return 1;
  return 0;
}

function display() {
  let month = new Date().getMonth() + 1;
  var regexs = [
    "^https:\/\/profile\.intra\.42\.fr\/$",
    "^https:\/\/profile\.intra\.42\.fr\/#$"
  ];
  if (matching(regexs)) {
    let text = document.createTextNode(" for " + months[month] + " : " + get_Logtime());
    let login = document.getElementsByClassName("profile-title")[2];
    login.appendChild(text);
  }

  if ((document.baseURI).match(/^https:\/\/profile\.intra\.42\.fr\/users\/[a-z0-9-_]+$/i)) {
    let userinfo = document.getElementsByClassName("user-infos-sub")[0];
    let div = createEl("div", "user-eta user-inline-stat", null, null, null);
    let title = createEl("span", "user-eta user-inline-stat", null, "color: rgb(0, 186, 150);", months[new Date().getMonth() + 1] + " Logtime");
    let sub = createEl("span", "user-eta-value", null, null, get_Logtime());
    userinfo.appendChild(div);
    div.appendChild(title);
    div.appendChild(sub);
  }

  let Logtimeprev = get_logtime_prev();
  let svgLogtime = document.getElementById("user-locations");

  let i = [];
  i[0] = (month == 1) ? month = 12 : month -= 1;
  i[1] = (month == 1) ? month = 12 : month -= 1;
  i[2] = (month == 1) ? month = 12 : month -= 1;

  let prevMonths = "<span style=\"opacity:0.85;\">" + months[i[0]] + " : " + Logtimeprev[0] + "</span><br><span style=\"opacity:0.70;\">" +
    months[i[1]] + " : " + Logtimeprev[1] + "</span><br><span style=\"opacity:0.50;\">" +
    months[i[2]] + " : " + Logtimeprev[2] + "</span";

  let logtimediv = createEl("div", null, null, "color:#202026; font-family: Futura PT; font-size:0.85em; font-weight: bold; width:50%; position:absolute; bottom:20px;", prevMonths);
  svgLogtime.parentNode.appendChild(logtimediv);
}

(function () {
  'use strict';
  display();
})();
