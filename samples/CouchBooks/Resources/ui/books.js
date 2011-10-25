
var _ = require('lib/underscore')._;

exports.createRootWindow = function(controller, db, options) {
  var result = Ti.UI.createWindow({
    title: L('RootWindow.title'),
    backgroundColor: 'white',
  });
  _.extend(result, options);

  var tableView = Ti.UI.createTableView({
    
  });
  result.add(tableView);

  var editButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.EDIT,
  });
  editButton.addEventListener('click', function(e) {
    tableView.editing = true;
    result.leftNavButton = doneButton;
  });
  
  var doneButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.DONE,
  });
  doneButton.addEventListener('click', function(e) {
    tableView.editing = false;
    result.leftNavButton = editButton;
  });
  
  result.leftNavButton = editButton;
  
  var addButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.ADD,
  });
  addButton.addEventListener('click', function(e) {
    
  });
  result.rightNavButton = addButton;

  result.addEventListener('open', function(e) {
    load_books(db, tableView);
  });
    
  return result;
};

function load_books(db, table) {
  db.view('books/by_author', { include_docs: true }, function(data, status) {
    var sections = [];
    if (status === 200) {
      var section;
      for (i in data.rows) {
        var key = data.rows[i].key;
        var doc = data.rows[i].doc;
        
        if (!section || section.headerTitle !== key) {
          section && sections.push(section);
          section = Ti.UI.createTableViewSection({
            headerTitle: key
          });
        }
        
        var row = Ti.UI.createTableViewRow({
          title: doc.title,
          hasChild: true,
        });
        row.addEventListener('click', (function(d) {
          return function(e) {
            alert(JSON.stringify(d));
          }
        })(doc));
        section.add(row);
      }
    }
    table.setData(sections);
  });
};
