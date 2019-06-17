chrome.app.runtime.onLaunched.addListener(function(intentData) {
  chrome.app.window.create('window.html', {
  	id: "mainwin",
    innerBounds: {
      width: 400,
      height: 200,
      minWidth: 400,
      minHeight: 200,
      maxWidth: 400,
      maxHeight: 200
    },
    resizable:false,
    frame:{
      color:"#444"
    }
  });
});