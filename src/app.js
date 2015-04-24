/**
 * Welcome to Pebble.js!
 *
 * Display Real-Time Stats from EdgeCast/VMDS CDN
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Settings = require('settings');

var options = Settings.option();

var debug = true;
var debuglog = function (message) {
  if (debug) {
    console.log(message);
  }
};

/* Setting TOK auth */
Settings.config(
  { url: 'http://wpc.10209.labcdn.com/0010209/pebble/index.html?'+encodeURIComponent(JSON.stringify(options)) },
  function(e) {
    debuglog('open: ' + JSON.stringify(e.options));
  },
  function(e) {
    // AutoSave by default nothing to do ;)
    debuglog('closed: ' + JSON.stringify(e.options));
    options = Settings.option();
  }
);

/* Convert number of bytes into human readable format */
var bytesToSize = function (bytes) {
    var sizes = ['b/s', 'Kb/s', 'Mb/s', 'Gb/s', 'Tb/s'];
    if (bytes === 0) { return '0 b/s'; }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[[i]];
};

/* Error Window */
var MessageWindow = function (message) {
  var wind = new UI.Window();

  var messagetext = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    font: 'gothic-14-bold',
    text: 'Error:\n\n'+message,
    color: 'white',
    textAlign: 'center'
  });
  // Add Text to windows
  wind.add(messagetext);
  wind.show();
};

/* About Window */
var AboutWindow = function () {
  var wind = new UI.Window();

  var abouttext = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    font: 'gothic-14-bold',
    text: 'About\n\nDeveloped By:\nFrancois Lacroix\n\nContact:\nflacroix@egdecast.com\n\nVerison:0.1\n2015',
    color: 'white',
    textAlign: 'center'
  });
  // Add Text to windows
  wind.add(abouttext);
  wind.show();
};

/* Tacometer Window */
var TacometerWindow = function (curr_bandwith, third_bandwidth, quarter_bandwidth, max_bandwith) {
  // Create the window 144, 168
  var wind = new UI.Window();

  // Create the tacometer
  var tacometer_img = new UI.Image({
    position: new Vector2(0, 0),
    size: new Vector2(144, 144),
    backgroundColor: 'clear',
    image: "images/tacometer.png"
  });
  wind.add(tacometer_img);

  // Create a center Circle
  var circle = new UI.Circle({
    position: new Vector2(72, 90),
    radius: 45,
    backgroundColor: 'white'
  });
  // Add Circle to Window
  wind.add(circle);

  // Create Text min speed 0b/s
  var text_min_graph = new UI.Text({
    position: new Vector2(0, 125),
    size: new Vector2(32, 14),
    font: 'gothic-14-bold',
    text: '0b/s',
    color: 'white',
    textAlign: 'center'
  });
  // Add Text to windows
  wind.add(text_min_graph);

  // Create Text third bandwidth
  var text_third_graph = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(50, 14),
    font: 'gothic-14-bold',
    text: third_bandwidth,
    color: 'white',
    textAlign: 'left'
  });
  // Add Text to windows
  wind.add(text_third_graph);

  // Create Text quarter bandwidth 
  var text_quarter_graph = new UI.Text({
    position: new Vector2(95, 0),
    size: new Vector2(50, 14),
    font: 'gothic-14-bold',
    text: quarter_bandwidth,
    color: 'white',
    textAlign: 'right'
  });
  // Add Text to windows
  wind.add(text_quarter_graph);

  // Create Text max speed xxY/s
  var text_max_graph = new UI.Text({
    position: new Vector2(95, 125),
    size: new Vector2(50, 14),
    font: 'gothic-14-bold',
    text: max_bandwith,
    color: 'white',
    textAlign: 'right'
  });
  // Add Text to windows
  wind.add(text_max_graph);

  // Create Text over the Circle, eg: the current speed
  var textbandwidth = new UI.Text({
    position: new Vector2(0, 64),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: curr_bandwith.replace(' ','\n'),
    color: 'black',
    backgroundColor: 'clear',
    textAlign: 'center'
  });
  // Add Text to Window
  wind.add(textbandwidth);

  // Display the window
  wind.show();
};

/* Get Current Bandwidth */
var Bandwidth = function (PlatformId, PlatformName) {

  // Show splash screen while waiting for data
  var WaitWindow = new UI.Window();

  // Text element to inform user
  var waittext = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text:'Downloading live data for '+PlatformName+'...',
    font:'GOTHIC_28_BOLD',
    color:'black',
    textOverflow:'wrap',
    textAlign:'center',
    backgroundColor:'white'
  });

  // Add to splashWindow and show
  WaitWindow.add(waittext);
  WaitWindow.show();

  // Default host unless transact platform is active
  var host = 'api.edgecast.com';
  if (options.transact && options.transact == "on") {
    host = 'api.transactcdn.com';
  }

  debuglog("Host:["+host+"] AN:["+options.account+"] PlatformId:["+PlatformId+"] TOK:["+options.token+"]");
  ajax(
    {
      url: 'https://'+host+'/v2/realtimestats/customers/'+options.account+'/media/'+PlatformId+'/bandwidth',
      type: 'json',
      cache: 'false',
      headers: {'content-type': 'application/json', 'Authorization': 'TOK:'+options.token}
    },
    function(data, status, request) {
      //console.log('Bandwidth JSON: ' + data.Result);
      var bandwidth = bytesToSize(data.Result);
      //console.log('Bandwidth Human: ' + bandwidth);
      var thirdbandwidth = bytesToSize(data.Result * 0.5);
      //console.log('Third bandwidth Human: ' + thirdbandwidth);
      var quarterbandwidth = bytesToSize(data.Result * 1.5);
      //console.log('Quarter Bandwidth Human: ' + quarterbandwidth);
      var maxbandwidth = bytesToSize(data.Result * 3);
      //console.log('Max Bandwidth Human: ' + maxbandwidth);
      
      TacometerWindow(bandwidth, thirdbandwidth, quarterbandwidth, maxbandwidth);
      WaitWindow.hide();
    },
    function(error, status, request) {
      debuglog('The ajax request failed: ' + JSON.stringify(error));
      MessageWindow(JSON.stringify(error));
      WaitWindow.hide();
    }
  );
};

/* Create SubMenu stats choice */
var SubMenu = function (PlatformId, PlatformName) {
  /* Sub menu */
  var submenu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Bandwidth',
        icon: 'images/menu_realtime_stats.png'
      }, {
        title: 'Status Codes',
        icon: 'images/menu_cache_status.png'
      }, {
        title: 'Cache Statuses',
        icon: 'images/menu_status_codes.png'
      }]
    }]
  });
  submenu.on('select', function(e) {
    debuglog('SubMenu: Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    debuglog('SubMenu: The item is titled "' + e.item.title + '"');

    if (e.itemIndex === 0) { // Bandwidth
      Bandwidth(PlatformId, PlatformName);
    }
    else if (e.itemIndex === 1) { // Status Codes
      Bandwidth(PlatformId, PlatformName);
    }
    else if (e.itemIndex === 2) { // Cache Statuses
      Bandwidth(PlatformId, PlatformName);
    }
  });
  submenu.show();
};

/* Create Main menu Platform choice */
var menu = new UI.Menu({
  sections: [{
    items: [{
      title: 'HTTP Large',
      subtitle: 'HTTP Large Object'
      //subtitle: options.token
    }, {
      title: 'HTTP Small',
      subtitle: 'HTTP Small Object'
    }, {
      title: 'ADN',
      subtitle: 'App Delivery Network',
    }, {
      title: 'FMS',
      subtitle: 'Flash Media Streaming'
    }, {
      title: 'Storage',
      subtitle: 'Storage'
    }, {
      title: 'About',
      subtitle: 'Francois L.'
    }]
  }]
});
menu.on('select', function(e) {
  debuglog('MainMenu: Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
  debuglog('MainMenu: The item is titled "' + e.item.title + '"');

  // Fetch config settings
  options = Settings.option();

  if (e.itemIndex === 0) { // Large
    SubMenu(3, e.item.title);
  }
  else if (e.itemIndex === 1) { // Small
    Bandwidth(8, e.item.title);
  }
  else if (e.itemIndex === 2) { // ADN
    Bandwidth(14, e.item.title);
  }
  else if (e.itemIndex === 3) { // FMS
    Bandwidth(2, e.item.title);
  }
  else if (e.itemIndex === 4) { // Storage TODO
    Bandwidth(2, e.item.title);
  }
  else if (e.itemIndex === 5) { // About
    AboutWindow();
  }

});

menu.show();
