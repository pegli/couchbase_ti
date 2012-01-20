// This is a test harness for your module
// You should do something interesting in this harness 
// to test out the module and to provide instructions 
// to users on how to use it by example.

// open a single window
var window = Ti.UI.createWindow({
        backgroundColor:'white'
});
var label = Ti.UI.createLabel({
  text: "loading..."
});
window.add(label);
window.open();

// register for the server start event BEFORE loading the module!

var serverUrl;
var couchbase_ti = require('com.obscure.CouchbaseTi');
couchbase_ti.addEventListener("com.obscure.couchbase_ti.server_started", function(e) {
Ti.API.info(e);
  serverUrl = e.serverUrl;
  label.text = serverUrl || 'no url?';
});
couchbase_ti.startCouchbase();
