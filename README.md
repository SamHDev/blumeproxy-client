# blumeproxy-client
A Custom Proxy Client-App for ChromeOS

This is a custom client-side adapter for SOCK5 Proxy and a Websocket Tunnel to a BlumeProxy Server.

This version has been modifed to allow for personal use.

Please use responsibly.

## Install
- Download
- Load Unpacked
- Reload
- Open

## How does it work
- We are able to change Proxy Settings from a chrome app or extension dispite network and device management. Using the chrome app, we can set the proxy settings to a local proxy server using the chrome.proxy API.
- Using the chrome.tcp.server we are able to host a TCP socket server on the local machine, to create a 'fake' proxy server.
- All the trafic HTTP and HTTPS is recived
- We proccess The data, and forward it to the server using a Websocket Connection.
- The server then decodes it, and pushes it to a real SOCK5 proxy server.
- This 'tunnels' the proxy connection, meaning network is 'unblocked'
