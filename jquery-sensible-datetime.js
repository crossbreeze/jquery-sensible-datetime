/*
 * sensible-datetime: a jQuery plugin, version: 0.0.1
 * Last modified: 09/26/2011
 *
 * Sensible DateTime is a jQuery plugin that makes it easy to format ISO datetime into something sensible as you see fit.
 *
 * https://crossbreeze.github.com/jquery-sensible-datetime
 * 
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2011, Jaewoong Kim (jwoongkim@gmail.com)
 */
(function($) {
  
  $.fn.sensible= function(options) {
    if (options) {
      $.extend(settings , options);
    }
      
    var self = this;
    self.each(refresh);
    setInterval(function() {
      self.each(refresh);
    }, settings.refreshRate);
    
    return self;
  };
  
  var settings = {
    shortDayNames: [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ],
    longDayNames: [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    shortMonthNames: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    longMonthNames: [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ],
    refreshRate: 60000,
    pastMask: '%mmmm %d, %yyyy at %h:%MM%tt',
    futureMask: '%mmmm %d, %yyyy at %h:%MM%tt',
    masks: [
      {
        // within a minute
        distance: 60,
        mask: 'less than a minute ago'
      },
      {
        // within 2 minutes
        distance: 120,
        mask: 'about a minute ago'
      },
      {
        // within 1 hour
        distance: 3600,
        mask: '%xm minutes ago'
      },
      {
        // within 2 hours
        distance: 7200,
        mask: 'about an hour ago'
      },
      {
        // within 24 hours
        distance: 86400,
        mask: '%xh hours ago'
      },
      {
        // within 48 hours
        distance: 172800,
        mask: 'Yesterday at %h:%MM%tt'
      },
      {
        // within this year
        distance: 31556926,
        mask: '%mmmm %d at %h:%MM%tt'
      }
    ]
  };
  
  // private functions
  function refresh() {
    var datetime = prepareData(this);
    
    if (datetime) {
      $(this).text(datetimeInWords(datetime));
      return this;
    }
  }
  
  function prepareData(element) {
    element = $(element);
    if (!element.data('datetime')) {
      element.data('datetime', datetime(element));
      var text = $.trim(element.text());
      if (text.length > 0) {
        element.attr('title', text);
      }
    }
    
    return element.data('datetime');
  }
  
  function datetime(elem) {
    var isTime = $(elem).get(0).tagName.toLowerCase() === 'time';
    var iso8601 = isTime ? $(elem).attr('datetime') : $(elem).attr('title');
    return parse(iso8601);
  }
  
  function parse(iso8601) {
    var s = $.trim(iso8601);
    s = s.replace(/\.\d\d\d+/,'');
    s = s.replace(/-/,'/').replace(/-/,'/');
    s = s.replace(/T/,' ').replace(/Z/,' UTC');
    s = s.replace(/([\+\-]\d\d)\:?(\d\d)/,' $1$2');
    
    var datetime = new Date(s);
    return isNaN(datetime) ? null : datetime;
  }
  
  function datetimeInWords(datetime) {
    var distanceSeconds = (new Date().getTime() - datetime.getTime()) / 1000;
    
    if (distanceSeconds < 0) {
      return stringFromMask(datetime, settings.futureMask);
    }
    
    for (var i = 0, length = settings.masks.length; i < length; ++i) {
      if (distanceSeconds < settings.masks[i].distance) {
        return stringFromMask(datetime, settings.masks[i].mask);
      }
    }
    
    return stringFromMask(datetime, settings.pastMask);
  }
  
  function stringFromMask(datetime, mask) {
    var re = /\%(d{1,4}|m{1,4}|yy(?:yy)?|[HhMsTt]{1,2}|x[smhdy]|[S])/g;
    var distanceSeconds = (new Date().getTime() - datetime.getTime()) / 1000;
    var distanceMinutes = distanceSeconds / 60;
    var distanceHours = distanceMinutes / 60;
    var distanceDays = distanceHours / 24;
    var distanceYears = distanceDays / 365;
    
    return mask.replace(re, function(match) {
      switch (match.substr(1, match.length)) {
        case 'd':
        return datetime.getDate();
        case 'dd':
        return pad(datetime.getDate());
        case 'ddd':
        return settings.shortDayNames[datetime.getDay()];
        case 'dddd':
        return settings.longDayNames[datetime.getDay()];
        case 'm':
        return datetime.getMonth() + 1;
        case 'mm':
        return pad(datetime.getMonth() + 1);
        case 'mmm':
        return settings.shortMonthNames[datetime.getMonth()];
        case 'mmmm':
        return settings.longMonthNames[datetime.getMonth()];
        case 'yy':
        return String(datetime.getFullYear()).slice(2);
        case 'yyyy':
        return datetime.getFullYear();
        case 'h':
        return datetime.getHours() % 12 || 12;
        case 'hh':
        return pad(datetime.getHours() % 12 || 12);
        case 'H':
        return datetime.getHours();
        case 'HH':
        return pad(datetime.getHours());
        case 'M':
        return datetime.getMinutes();
        case 'MM':
        return pad(datetime.getMinutes());
        case 's':
        return datetime.getSeconds();
        case 'ss':
        return pad(datetime.getSeconds());
        case 't':
        return datetime.getHours() < 12 ? 'a' : 'p';
        case 'tt':
        return datetime.getHours() < 12 ? 'am' : 'pm';
        case 'T':
        return datetime.getHours() < 12 ? 'A' : 'P';
        case 'TT':
        return datetime.getHours() < 12 ? 'AM' : 'PM';
        case 'S':
        return ['th', 'st', 'nd', 'rd'][datetime.getDate() % 10 > 3 ? 0 : (datetime.getDate() % 100 - datetime.getDate() % 10 != 10) * datetime.getDate() % 10];
        case 'xs':
        return Math.round(distanceSeconds);
        case 'xm':
        return Math.round(distanceMinutes);
        case 'xh':
        return Math.round(distanceHours);
        case 'xd':
        return Math.floor(distanceDays);
        case 'xy':
        return Math.floor(distanceYears);
        default:
        return match;
      }
    });
  }
  
  function pad(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) {
      val = '0' + val;
    }
    return val;
  }
  
  // fix for IE6
  document.createElement('abbr');
  document.createElement('time');

})(jQuery);
