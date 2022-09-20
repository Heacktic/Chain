let Ihtml; //Iframes HTML
let Iurl = ""; //Iframes URL
var i;
var path = [];
var coll = document.getElementsByClassName("collapsible");
var frame = document.getElementsByClassName("iframe");
//var loadtable = document.getElementById("loadtable");

function LoadFromBox() {
  //load whatever is in the text box
  if (Iurl != "") {
    path.unshift(Iurl);
  }
  let url = document.getElementById("inputbox").value;
  load(url);
  addhistory(url);
}

function load(url) {
  getsiteDATA(url).then((html) => {
    html = getexternal(html);
    assignHTMLframe(html);
  });
}

async function getsiteDATA(url) {
  const response = await fetch(
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  ).then((response) => {
    Iurl = decodeURIComponent(response.url.slice(35));
    if (response.ok) return response.json();
  });
  return response.contents;
}

async function getDATA(url) {
  const response = await fetch(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  )
    .then((response) => response.blob())
    .then((Blob) => {
      const ObjectURL = URL.createObjectURL(Blob);
      return ObjectURL;
    });
  return response;
}

function assignHTMLframe(html) {
  document.getElementById("iframe").srcdoc = html;
  Ihtml = html;
}

function getexternal(html) {
  let domain = new URL(Iurl);
  var parser = new DOMParser();
  var doc = parser.parseFromString(html, "text/html");
  //change all URIs to URLS
  var ele = [
    "a",
    "area",
    "base",
    "link",
    "audio",
    "embed",
    "iframe",
    "img",
    "input",
    "script",
    "source",
    "track",
    "video"
  ];
  var atri = [
    "href",
    "href",
    "href",
    "href",
    "src",
    "src",
    "src",
    "src",
    "src",
    "src",
    "src",
    "src",
    "src"
  ];
  //turn all URIs into URLs
  for (var i = 0; i < ele.length; i++) {
    var links = [].slice.apply(doc.getElementsByTagName(ele[i]));
    for (var j = 0; j < links.length; j++) {
      if (links[j].hasAttribute(atri[i])) {
        var link = links[j].getAttribute(atri[i]);
        //turn uris into urls
        try {
          new URL(link);
        } catch (_) {
          link = new URL(link, domain);
        }
        //if arttribute is an SRC download content as blob
        if ((atri[i] = "src")) {
          getDATA(link).then((ObjectURL) => {
            link = ObjectURL;
          });
        }

        //if attribute is a url setup sending url to parent
        if ((atri[i] = "href")) {
          try {
            new URL(link)
          } catch (_){
            alert();break;
          }
          //this is a message send command wrapped in a data URI
          link =
            "javascript:window.parent.postMessage('" +
            JSON.stringify({ message: link }) +
            "','*');";
        }
        links[j].setAttribute(atri[i], link);
      }
    }
  }
  html = doc.documentElement.innerHTML;
  return html;
}

//window.parent.postMessage('message', '*');
window.addEventListener("message", function (e) {
  var url = JSON.parse(e.data).message;
  try {
    new URL(url);
  } catch (_) {
  return 0;
  }
  if (Iurl != "") {
    path.unshift(Iurl);
  }
  load(url);
  addhistory(url);
});

//debugging and history --------------------------------------------------

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

function previouspage() {
  load(path.shift());
}

function addhistory(url) {
  var history = document.getElementById("history");
  var row = history.insertRow(1);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);

  // Add some text to the new cells:
  cell1.innerHTML = url;
  cell2.innerHTML =
    "<button type='button' onclick='load(\"" + url + "\")'>⇒</button>";
  cell3.innerHTML =
    "<button type='button' onclick='this.parentElement.parentElement.remove()'>⏻</button>";
}
function ClearSearchHistory() {
  while (history.rows.length != 1) {
    history.deleteRow(-1);
    path = [];
  }
}