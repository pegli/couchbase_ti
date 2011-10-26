
var _ = require('lib/underscore')._;

var dateFormatter = function(v) {
  var d;
  if (_.isArray(v)) {
    d = new Date(0);
    d.setFullYear(v.shift() || 0);
    d.setMonth((v.shift() || 1) - 1);
    d.setDate(v.shift() || 1);
  }
  else if (_.isDate(v)) {
    d = v;
  }
  else if (_.isNumber(v)) {
    d = new Date(v * 1000);
  }
  return d ? String.formatDate(d, 'medium') : v;
}

exports.createRootWindow = function(controller, db, options) {
  var result = Ti.UI.createWindow({
    title: L('RootWindow.title'),
    backgroundColor: 'white',
  });
  _.extend(result, options);

  var tableView = Ti.UI.createTableView({
    
  });
  result.addEventListener('click', function(e) {
    var book = e.rowData.book;
    controller.open(exports.createDetailWindow(controller, db, book));
  });
  result.addEventListener('delete', function(e) {
    var book = e.rowData.book;
    if (book) {
      db.remove(book._id, book._rev, function(resp, status) {
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
        
        section.add(Ti.UI.createTableViewRow({
          id: 'BookListRow',
          title: book.title,
          hasChild: true,
          book: book,
        }));
      }
    }
    table.setData(sections);
  });
};

exports.createDetailWindow = function(controller, db, book) {
  var result = Ti.UI.createWindow({
    title: L('DetailWindow.title'),
    backgroundColor: 'white',
  });
  

  var rows = [];
  rows.push(createDetailRow(L('DetailRow.title'), book, 'title'));
  rows.push(createDetailRow(L('DetailRow.author'), book, 'author'));
  rows.push(createDetailRow(L('DetailRow.copyright'), book, 'copyright', dateFormatter));
  
  var tableView = Ti.UI.createTableView({
    data: rows,
    style: Ti.UI.iPhone.TableViewStyle.GROUPED,
  });
  result.add(tableView);


  var editButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.EDIT,
  });
  editButton.addEventListener('click', function(e) {
    for (var i in rows) {
      rows[i].hasChild = true;
      rows[i].touchEnabled = true;
    }
    result.rightNavButton = doneButton;
  });
  
  var doneButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.DONE,
  });
  doneButton.addEventListener('click', function(e) {
    for (var i in rows) {
      rows[i].hasChild = false;
      rows[i].touchEnabled = false;
    }
    result.rightNavButton = editButton;
  });
  
  result.rightNavButton = editButton;

  return result;
};


function createDetailRow(label, model, key, formatter) {
  var result = Ti.UI.createTableViewRow({
    touchEnabled: false,
    key: key,
    formatter: (formatter || function(v) { return v; }),
  });
  
  result.add(Ti.UI.createLabel({
    top: 4,
    bottom: 4,
    left: 4,
    width: 80,
    color: '#6070A0',
    font: { fontSize: 12 },
    text: label,
    textAlign: 'right',
  }));

  var valueLabel = Ti.UI.createLabel({
    top: 4,
    left: 90, 
    bottom: 4,
    width: 190,
    color: 'black',
    font: { fontSize: 14, fontWeight: 'bold' },
  });
  result.add(valueLabel);
  
  result._set_value = function(value) {
    // this.value = value;
    valueLabel.text = this.formatter(value);
  };
  
  result._set_value(model[key]);

  return result;
};
