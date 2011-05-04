// This is a test harness for your module
// You should do something interesting in this harness 
// to test out the module and to provide instructions 
// to users on how to use it by example.


// open a single window
var window = Ti.UI.createWindow({
	backgroundColor:'white'
});
var label = Ti.UI.createLabel();
window.add(label);
window.open();

// TODO: write your module tests here
var couchbase_ti = require('com.obscure.couchbase_ti');
Ti.API.info("module is => " + couchbase_ti);

couchbase_ti.startCouchbase();