var IframeOverlord = function () {
  this.iframeNode = null;

  this.addListener();
  this.appendIframe();
};

/**
* Adds Chrome message listener.
*/
IframeOverlord.prototype.addListener = function () {
  var overlord = this;
  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if(request.to !== 'overlord') {
      // ignore requests not 'to' us
      return;
    }
    if(typeof overlord[request.method] !== 'function') {
      throw new Error ('request.method must be a method on overlord');
    }
    overlord[request.method](request.params);
  });
};

/**
* Appends secure iframe, and stores the node.
*/
IframeOverlord.prototype.appendIframe = function (params) {
  var src = chrome.extension.getURL('html/view.html');

  var id = (new Date()).getTime();
  $('body').prepend("<iframe id='" + id +
                    "' src='" + src +
                     "' class='reset' " +
                    " scrolling='no' frameborder='0'" +
                    "></iframe>");

  $('#' + id).offset({left: 42, top: 42});
  $('#' + id).css('z-index', 1000000);


  $('#' + id).load(function () {
    overlord.iframeNode = $('#' + id)[0];
  });
};

/**
* Adds event listeners to the window to detect mousemoves and moves the iframe
* corespondingly.
*/
IframeOverlord.prototype.startDrag = function(params) {
  var overlord = this;

  // location of click inside iframe
  var mousedown_event = {
    screenX: params.x,
    screenY: params.y
  };

  // initial location of mouseclick
  var left = $(this.iframeNode).offset().left;
  var top = $(this.iframeNode).offset().top;
  var scroll_x = window.scrollX;
  var scroll_y = window.scrollY;

  var handler = function (mousemove_event) {
    // calculate new iframe position
    var delta_x = (mousemove_event.screenX + window.scrollX) -
        (mousedown_event.screenX + scroll_x);
    var delta_y = (mousemove_event.screenY + window.scrollY) -
        (mousedown_event.screenY + scroll_y);
    $(overlord.iframeNode).offset({
      left: left + delta_x,
      top: top + delta_y
    });
  };
  overlord.addCaptureDiv();
  window.addEventListener('mousemove', handler, true);
  window.addEventListener('DOMMouseScroll', handler, true);
  window.addEventListener(
    'mouseup',
    function (mouseup_event) {
      overlord.removeCaptureDiv();
      window.removeEventListener('mousemove', handler, true);
      window.removeEventListener('DOMMouseScroll', handler, true);
      window.removeEventListener('mouseup', arguments.callee, true);
    },
    true
  );
};

/**
* Add capture div over all of visible page to make sure we get all mouse events.
*/
IframeOverlord.prototype.addCaptureDiv = function() {
  $('body').append("<div class='capture-div reset'></div>");
};

/**
* Remove capture div.
*/
IframeOverlord.prototype.removeCaptureDiv = function() {
  $('.capture-div').remove();
};

var overlord = new IframeOverlord();
