let Iurl = ""; //Iframes URL
var path = [];
var coll = document.getElementsByClassName("collapsible");
var frame = document.getElementsByClassName("iframe");
//var loadtable = document.getElementById("loadtable");

function LoadFromBox() {
  if (Iurl != "") path.unshift(Iurl);
  let url = document.getElementById("inputbox").value;
  load(url);
  addhistory(url);
}

function load(url) {
  getsiteDATA(url).then((html) => {
    //document.getElementById("iframe").srcdoc = getexternal(html);
    document.getElementById("iframe").srcdoc = getexternal(html);
  });
}

async function getData(url) {
  try {
    return fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
  } catch (_) {
    console.log(url);
  }
}

async function getsiteDATA(url) {
  const response = await getData(url).then((response) => {
    Iurl = decodeURIComponent(response.url.slice(35));
    if (response.ok) return response.json();
  });
  return response.contents;
}

async function getBlob(url) {
  const response = await getData(url)
    .then((response) => response.blob()).then((Blob) => {
      const ObjectURL = URL.createObjectURL(Blob);
      return ObjectURL;
    });
  return response;
}

function getexternal(html) {
  let domain = new URL(Iurl);
  var parser = new DOMParser();
  var doc = parser.parseFromString(html, "text/html");
  const attributelookup = (x) => (x=="A"||x=="AREA" ||x=="BASE" ||x=="LINK" ? "href" : "src");
  elementdict = ["a", "area", "base", "link", "audio", "embed", "iframe", "img", "input", "script", "source", "track", "video"];
  elements = [];
  //get a list of all elements with a tag in tags and filter our non href and src tags
  for (var i = 0; i < elementdict.length; i++)
    elements.push.apply(elements, doc.getElementsByTagName(elementdict[i]));
  elements = elements.filter((element) => element.hasAttribute("href") || element.hasAttribute("src"))
  for (var j = 0; j < elements.length; j++) {
    var attribute = attributelookup(elements[j].tagName)
    var attributevalue = elements[j].getAttribute(attribute);

    //the worst code ever written, i dont know why this works but it does
    try {
      new URL(attributevalue);
    } catch (_) {
      attributevalue = new URL(attributevalue, domain);
    }
    if ((attribute = "src")) {
      getBlob(attributevalue).then((ObjectURL) => {
        console.log(ObjectURL)
        attributevalue = ObjectURL;
      });
    }
    if ((attribute = "href")) {
      try {
        new URL(attributevalue)
      } catch (_) {
        alert(); break;
      }

    }    
    elements[j].setAttribute(attribute,attributevalue);
  }
  html = doc.documentElement.innerHTML;
  return html;
}



//window.parent.postMessage('message', '*');
window.addEventListener("message", function (e) {
  try {
    var url = JSON.parse(e.data).message;
  } catch (_) {
    console.log(e.data)
  }
  try {
    new URL(url);
  } catch (_) {
    return;
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

