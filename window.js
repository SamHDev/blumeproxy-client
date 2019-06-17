var tcpServer = chrome.sockets.tcpServer;
var tcpSocket = chrome.sockets.tcp;

var resolveUrl = "http://2acaf647-20ee-409e-8648-4c673e262517.tk/servers.json"
var fallbackSocket = "http://2acaf647-20ee-409e-8648-4c673e262517.tk/handle/fallback"

var domain = "661c15d9-e245-4679-a234-a5961fbd2f47.tk"
var domains = {
  "Server 1":"2acaf647-20ee-409e-8648-4c673e262517.tk",
  "Server 2":"661c15d9-e245-4679-a234-a5961fbd2f47.tk",
  "Server 3":"8ed7e1b3-5f42-4470-af92-7431e5a90c61.tk",
  "BK SERVER":"samhdev.com/bp
}


function updateDomains(){
document.getElementById("domains").innerHTML = ""
for (dk in domains) {
  dv = domains[dk];
  document.getElementById("domains").innerHTML = document.getElementById("domains").innerHTML + "<option value='"+dv+"'>"+dk+"</option>";
}
chrome.storage.local.get(['server_name'], function(result) {
  domain = result.server_name
  document.getElementById("domains").value = result.server_name
        if (document.getElementById("domains").value == ""){
      document.getElementById("start_btn").disabled = true;
    }
});
}



try {
  killme()
  $.get("c7b4d3b0-8fab-4008-b9c5-0fd1ccb46b9c.tk/domains.json",{"nc":Date.now()},function(data){console.log(data);domains=data;updateDomains();document.getElementById("domains").onchange()})
  
} catch(e) {
  console.log("FAILED TO RESOLVE DOMAINS")
  updateDomains()
  //document.getElementById("domains").onchange()
}

document.getElementById("domains").onchange = function(){
      if (document.getElementById("domains").value == ""){
      document.getElementById("start_btn").disabled = true;
    } else {
      document.getElementById("start_btn").disabled = false;
    }
  domain = document.getElementById("domains").value
  chrome.storage.local.set({server_name: document.getElementById("domains").value}, function() {

          console.log('Value is set to ');
        });
}


var reqCount = 0;
var sendCount = 0;

//var status = document.getElementById("stats");
document.getElementById("stats").innerHTML = "Loading"
var running = false;
document.getElementById("start_btn").onclick=function(){startProxy()};
document.getElementById("stop_btn").onclick=function(){stopProxy()};
document.getElementById("web_btn").onclick=function(){window.open("http://"+domain+"/");}
document.getElementById("imger").ondblclick=function(){window.open("https://blume.dev");};




var host_interface;
var host_port = 8631
var serverSocketId;


var websocket = null;
var sessions_ses = {}
var sessions_id = {}

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}


tcpServer.create({}, function(socketInfo) {serverSocketId = socketInfo.socketId;});

chrome.system.network.getNetworkInterfaces(function(ifs) {
  if (ifs.length == 0) {
    document.getElementById("stats").innerHTML = "Failed to Resove Interfaces"
  } else {
    
    host_interface = ifs[0].address;
    console.log(host_interface)
  }
});


var encodeData = function(string) {
    var buffer = new ArrayBuffer(string.length);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < string.length; i++) {
      view[i] = string.charCodeAt(i);
    }
    return view;
  };

  var decodeData = function(buffer) {
    var str = '';
    var uArrayVal = new Uint8Array(buffer);
    for (var s = 0; s < uArrayVal.length; s++) {
      str += String.fromCharCode(uArrayVal[s]);
    }
    return str;
  };



function onAccept(data){
  tcpSocket.setPaused(data.clientSocketId, false);
  if (data.socketId != serverSocketId) {
      return;
  }
  //console.log("New Socket Connection")
  reqCount = reqCount +1
  document.getElementById("stats").innerHTML = "Running: ("+reqCount.toString()+","+sendCount.toString()+")"
  
  ses = create_UUID()
  websocket.send(JSON.stringify({"type":"open","data":"","session":ses}))
  sessions_ses[data.clientSocketId.toString()] = ses
  sessions_id[ses] = data.clientSocketId

}
function onReceive(data){
  sendCount=sendCount +1;
  document.getElementById("stats").innerHTML = "Running: ("+reqCount.toString()+","+sendCount.toString()+")"
  //console.log(data)
  //console.log("NEW DATA: "+decodeData(data.data))
  //console.log(data.socketId+"|"+sessions_ses[data.socketId.toString()])
  sends = JSON.stringify({"session":sessions_ses[data.socketId],"type":"request","data":btoa(decodeData(data.data))})
  //console.log(">> "+sends)
  websocket.send(sends)
  
}
function onClose(data) {
  console.log("CLOSED CLIENT SOCKET")
}

function startProxy() {
  console.log("STARTING")
  document.getElementById("imger").style.boxShadow = "0 0 10px 4px #0f0";
  document.getElementById("domains").disabled = true;

  document.getElementById("start_btn").disabled = true;
  reqCount = 0
  document.getElementById("stats").innerHTML = "Starting"
  var config = {
        mode: "fixed_servers",
        rules: {
          proxyForHttp: {
            scheme: "socks5",
            host: host_interface,
            port: host_port
          },
          proxyForHttps: {
            scheme: "socks5",
            host: host_interface,
            port: host_port
          },
          bypassList: ["*.google.com",domain,"*.codeanywhere.com","*.revise.zone"]
        }
      };
      chrome.proxy.settings.set(
          {value: config, scope: 'regular'},
          function() {console.log("PROXY SET")});
  tcpServer.listen(serverSocketId, host_interface, host_port, 50, function(result) {
        console.log("LISTENING:", result);

        tcpServer.onAccept.addListener(onAccept);
        tcpSocket.onReceive.addListener(onReceive);
        tcpSocket.onReceiveError.addListener(onClose)
        
        websocket = new WebSocket("ws://"+domain+"/handle");
        websocket.onopen = function (evt) {console.log("OPENED Connection");running = true;document.getElementById("stats").innerHTML = "Running: (0,0)";notStart();document.getElementById("stop_btn").disabled = false;document.getElementById("imger").style.boxShadow = "0 0 10px 4px #fff";}
        websocket.onclose = function (evt) {console.log("CLOSED Connection");stopProxy()}
        websocket.onmessage = function (evt) {//console.log("MSG"+evt.data)
          data = JSON.parse(evt.data)
          console.log(data)
          if (data.type=="reply") {
              reqCount = reqCount +1
              document.getElementById("stats").innerHTML = "Running: ("+reqCount.toString()+","+sendCount.toString()+")"
            chrome.sockets.tcp.send(sessions_id[data["session"]],encodeData(atob(data.data)),function(datas){console.log("SENT")})
          }
          
        }
        websocket.onerror = function(event) {
          console.error("WebSocket error observed:", event);
            chrome.notifications.clear("proxy_msg")
          chrome.notifications.create("proxy_error_"+create_UUID(), {
            "type":"basic",
            "title":"Blume Proxy Error",
            "message":"Failed to Connect to Tunnel",
            "contextMessage":"Try Switching Tunnel Server",
            "iconUrl":"icon.png",
            "eventTime":Date.now()
          }, function(){
            chrome.proxy.settings.clear({scope:'regular'}, function(){console.log("PROXY NOT SET")});
            chrome.runtime.reload()
          });
        };
      });
}
function stopProxy(){
  document.getElementById("imger").style.boxShadow = "0 0 10px 4px #f00";
  document.getElementById("stop_btn").disabled = true;
  console.log("CLOSING")
  if (running == true){
    document.getElementById("stats").innerHTML = "Stopping"
    running = false
    websocket.close()
    tcpServer.close(serverSocketId, function() {
        if (chrome.runtime.lastError) {
          console.warn("chrome.sockets.tcpServer.close:", chrome.runtime.lastError);
        }
        chrome.proxy.settings.clear({scope:'regular'}, function(){console.log("PROXY NOT SET");document.getElementById("stats").innerHTML = "Idle";chrome.notifications.clear("proxy_msg");chrome.runtime.reload();document.getElementById("start_btn").disabled = false;document.getElementById("imger").style.boxShadow = "";document.getElementById("domains").disabled = false;})
      
      });
      
  }
}
document.getElementById("stats").innerHTML = "Idle"

function notStart(){
  chrome.notifications.clear("proxy_msg")
  chrome.notifications.create("proxy_msg", {
    "type":"basic",
    "title":"Blume Proxy",
    "message":"Encyrpting & Unblocking Traffic",
    "iconUrl":"icon.png",
    "eventTime":Date.now(),
    "buttons":[
      {"title":"Stop Proxy"}
      ]
  }, function(){
    
  });
  
}

chrome.notifications.onButtonClicked.addListener(function(notid,btnid){
  if (notid == "proxy_msg") {
    if (btnid == 0) {
      stopProxy()
    }
  }
  })
chrome.notifications.onClosed.addListener(function(notid,byuser){
  if (notid == "proxy_msg") {
    if (running == true) {
      notStart()
    }
    
  }
})

chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
  if (command == "cmd_start_proxy"){document.getElementById("start_btn").onclick()}
  if (command == "cmd_stop_proxy"){document.getElementById("stop_btn").onclick()}
});
      

chrome.proxy.settings.clear({scope:'regular'}, function(){})
document.getElementById("start_btn").disabled = false;
document.getElementById("stop_btn").disabled = true;
document.getElementById("imger").style.boxShadow = "";
document.getElementById("domains").disabled = false;

if (document.getElementById("domains").value == ""){
  document.getElementById("start_btn").disabled = true;
}