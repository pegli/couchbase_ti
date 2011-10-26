
var _ = require('lib/underscore')._;

function array_to_date(a) {
  var d = new Date(0);
  d.setFullYear(a.shift() || 0);
  d.setMonth((a.shift() || 1) - 1);
  d.setDate(a.shift() || 1);
  return d;
};

function date_to_array(d) {
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}

var dateFormatter = function(v) {
  var d;
  if (_.isArray(v)) {
    d = array_to_date(v);
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
  rows.push(createDetailRow(db, L('DetailRow.title'), book, 'title'));
  rows.push(createDetailRow(db, L('DetailRow.author'), book, 'author'));
  rows.push(createDetailRow(db, L('DetailRow.copyright'), book, 'copyright', dateFormatter));
  
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


function createDetailRow(db, label, book, key, formatter) {
  var result = Ti.UI.createTableViewRow({
    touchEnabled: false,
    _value: book[key],
  });
  
  formatter = (formatter || function(v) { return v; }),

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
    text: formatter(book[key]),
  });
  result.add(valueLabel);
  
  result.label = function() {
    return label;
  }
  
  result.current_value = function() {
    if (arguments.length === 0) {
      return this._value
    }
    else {
      var newvalue = arguments[0];
      var dataToMerge = {};
      dataToMerge[key] = newvalue;
      db.merge(book._id, dataToMerge, function(resp, status) {
        if (status === 201) {
          this._value = newvalue;
          valueLabel.text = formatter(newvalue);
        }
        else {
          alert('Error updating book '+label+': '+JSON.stringify(resp));
        }
      });
    }
  };
  
  result.addEventListener('click', function(e) {
    // not sure why we are receiving events if touchEnabled == false...
    if (result.touchEnabled) {
      var editor = exports.createEditorWindow(result);
      editor.open({
        modal: true,
        style: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
        presentation: Ti.UI.iPhone.MODAL_PRESENTATION_PAGESHEET,
      });
    }
  });
  
  return result;
};


exports.createEditorWindow = function(tableRow) {
  var result = Ti.UI.createWindow({
    title: tableRow.label(),
    backgroundColor: 'stripped',
  });
  
  var current = tableRow.current_value();
  var savefn;
  
  if (_.isArray(current)) {
    var pickerVal = array_to_date(current);

    var picker = Ti.UI.createPicker({
      top: 12,
      type: Titanium.UI.PICKER_TYPE_DATE,
      value: pickerVal,
    });
    
    /*
     * picker.value doesn't seem to work, so listen for changes
     */
    picker.addEventListener('change', function(e) {
      pickerVal = e.value;
    });
    result.add(picker);
    
    savefn = function(e) {
      tableRow.current_value(date_to_array(pickerVal));
      result.close();
    }
  }
  else {
    var textField = Ti.UI.createTextField({
      top: 12,
      left: 10,
      right: 10,
      height: 35,
      font: { fontSize: 14 },
      borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
      value: tableRow.current_value(),
    });
    result.add(textField);
    
    savefn = function(e) {
      tableRow.current_value(textField.value);
      result.close();
    }
  }
  

  var cancelButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.CANCEL,
  });
  cancelButton.addEventListener('click', function(e) {
    result.close();
  });
  result.leftNavButton = cancelButton;
  
  var saveButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.SAVE,
  });
  saveButton.addEventListener('click', savefn);
  result.rightNavButton = saveButton;
  
  
  result.addEventListener('open', function(e) {
    textField && textField.focus();
  });
  
  return result;
};
