
var _ = require('lib/underscore')._;

exports.createRootWindow = function(controller, db, options) {
  var result = Ti.UI.createWindow({
    title: L('RootWindow.title'),
    backgroundColor: 'white',
  });
  _.extend(result, options);

  var tableView = Ti.UI.createTableView({
    
  });
  result.addEventListener('delete', function(e) {
    var doc = e.rowData.doc;
    if (doc) {
      db.remove(doc._id, doc._rev, function(resp, status) {
        if (status !== 200) {
          alert('Error deleting book: '+JSON.stringify(resp));
        }
      });
    }
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
    load_book_list(db, tableView);
  });
    
  return result;
};

function load_book_list(db, table) {
  db.view('books/by_author', { include_docs: true }, function(data, status) {
    var sections = [];
    if (status === 200) {
      var section;
      for (i in data.rows) {
        var author = data.rows[i].key;
        var book = data.rows[i].doc;
        
        if (!section || section.headerTitle !== author) {
          section && sections.push(section);
          section = Ti.UI.createTableViewSection({
            headerTitle: author
          });
        }
        
        var row = Ti.UI.createTableViewRow({
          title: book.title,
          hasChild: true,
          book: book,
        });
        row.addEventListener('click', (function(b) {
          return function(e) {
            alert(JSON.stringify(b));
          }
        })(book));
        section.add(row);
      }
    }
    table.setData(sections);
  });
};


