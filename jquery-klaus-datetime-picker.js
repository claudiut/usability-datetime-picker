/*
* Copyright (c) Teodorescu Claudiu-Ștefan: https://github.com/claudiut/jquery-klaus-datetime-picker
*/

var klausDatetimePicker = function (options) {
  var self = this;
  
  this.init = function(options) {
    this.elem = jQuery(this);
    var now = new Date()

    this.opts = jQuery.extend(true,
      {
        dpOptions: {
          month: now.getMonth(),
          date: now.getDate(),
          year: now.getFullYear(),
          locale: "en",
          format: "DD/MM/YYYY",
          floating: true
        },
      },
      {dpOptions: this.getInlineHtmlData(this.elem)},
      options
    );
    
    // if the element is already filled with a valid date in it, parse that date string
    // Otherwise, set it to the current date
    if((elemMoment = moment(this.elem.val(), this.opts.dpOptions.format)).isValid())
      this.mKlausDatetimePicker = elemMoment;
    else
      this.mKlausDatetimePicker = moment({date: this.opts.dpOptions.date, month: this.opts.dpOptions.month, year: this.opts.dpOptions.year, hour: this.opts.dpOptions.hour, minute: this.opts.dpOptions.minute, seconds: this.opts.dpOptions.seconds});
  
    this.dpGeneralClass = "jquery-klaus-datetime-picker-instance"
    this.dpInstanceClass = "kdtp-" + Date.now();
    this.dpClass = this.dpGeneralClass + " " + this.dpInstanceClass
    
    this.inst = jQuery("\
      <div class='" + this.dpClass + " " + (this.opts.dpOptions.floating ? "floating" : "") + "'><div class='wrapper'> \
        <table class='date-header'> \
          <tr> \
            <td class='prev-month-cell'><a class='prev-month' href=''> &lt; </a></td> \
            <td class='months-cell'><select class='months'></select></td> \
            <td class='years-cell'><select class='years'></select></td> \
            <td class='next-month-cell'><a class='next-month' href=''> &gt; </a></td> \
          </tr> \
        </table> \
    \
        <div class='date-content'></div> \
      </div></div> \
    ");

    // events
    this.inst.find('.prev-month').click(function(e) {
      e.preventDefault()
      self.mKlausDatetimePicker.month(self.mKlausDatetimePicker.month() - 1)
      self.render();
    })
    this.inst.find('.next-month').click(function(e) {
      e.preventDefault()
      self.mKlausDatetimePicker.month(self.mKlausDatetimePicker.month() + 1)
      self.render();
    })
    this.inst.find('select.months').change(function() {
      self.mKlausDatetimePicker.month(this.value)
      self.render();
    })
    this.inst.find('select.years').change(function() {
      self.mKlausDatetimePicker.year(this.value)
      self.render();
    })
    this.elem.on("keyup change", function() {
      self.mKlausDatetimePicker = moment(this.value, self.opts.dpOptions.format)
      self.render(true)
    })
    
    this.elem.parent().append(this.inst);
        
    if(this.opts.dpOptions.floating) {
      // make sure clicking the calendar does not hide it
      self.inst.off("click.klausDatetimePicker").on("click.klausDatetimePicker", function(e) { e.stopPropagation(); })
      // hide the calendar if the user clicks outside it, except the triggering input
      jQuery(document).off("click." + this.dpInstanceClass).on("click." + this.dpInstanceClass, function(e) {
        if(!jQuery(e.target).is(self.elem))
          self.inst.hide();
      })
      // show the calendar when the input is clicked
      this.elem.off("click.klausDatetimePicker").on("click.klausDatetimePicker", function() { self.inst.show() })
    }
        
    // if the input element's value is empty, don't render the date in it on the first render
    this.render(!this.elem.val());
  }.bind(this)

  this.range = function(fromIndex, toIndex) {
    var arr = [];
    for(var i=fromIndex; i <= toIndex; i++)
      arr.push(i);
    return arr;
  }
  
  this.getInlineHtmlData = function(elem) {
    var dataPrefix = "klausDatetimePicker"
    var d = elem.data();
    var kdpOpts = {}
    Object.keys(d).forEach(function(k) {
      if(k.indexOf(dataPrefix) === 0) kdpOpts[k.replace(dataPrefix, "").toLowerCase()] = d[k];
    })
    return kdpOpts;
  }
  
  this.capitalize = function(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
  
  // renders almost everything - first update this.mKlausDatetimePicker, then call this.render() 
  this.render = function(preventElemUpdate) {
    moment.locale(this.opts.dpOptions.locale);
    
    var firstDayOfKDPMonth = this.mKlausDatetimePicker.clone().startOf('month')
    
    var monthsIndices = this.range(0,11);
    var monthsHtml = "";
    monthsIndices.forEach(function(i) {
      var selected = "";
      if(i == self.mKlausDatetimePicker.month()) selected="selected='selected'"
      monthsHtml += "<option value=" + i + " " + selected + ">" + self.capitalize(moment.months()[i]) + "</option>"
    })
    this.inst.find(".months").html(monthsHtml)
    
    var yearsIndices = this.range(1930,2030);
    var yearsHtml = "";
    yearsIndices.forEach(function(i) {
      var selected = "";
      if(i == self.mKlausDatetimePicker.year()) selected="selected='selected'"
      yearsHtml += "<option value=" + i + " " + selected + ">" + i + "</option>"
    })
    this.inst.find(".years").html(yearsHtml)
    
    var weekdaysHtml = "";
    this.range(1,7).map(function(dI) { weekdaysHtml += ("<td class='weekday-name'>" + self.getWeekdayName(dI, "dd") + "</td>"); })
    
    var daysHtml = "";
    for(var week = 1; week <= 6; week++) {
      var firstWeekDayIndex = week * 7 - 7
 
      daysHtml += "<tr class='weekdays-row'>"
      this.range(firstWeekDayIndex, firstWeekDayIndex + 6).forEach(function(dayIndex) {
        daysHtml += "<td class='day day-cell-" + dayIndex + "'></td>"
      })
      daysHtml += "</tr>"
    }
    
    var tableHtml = jQuery("\
      <table cellpadding='0' cellspacing='0'> \
        <tr class='weekday-names-row'>" + weekdaysHtml + "</tr> " + daysHtml + " \
      </table> \
    ");
    
    tableHtml.find('.day').removeClass("selected")
    // we have to first find out: the first day of the month, which day index of the week is? For example: day 1 can be Tuestday, which has the index 2
    var calendarDate = 0
    for(var i = firstDayOfKDPMonth.day(); i <= (this.mKlausDatetimePicker.daysInMonth() - 1) + firstDayOfKDPMonth.day(); i++) {
      calendarDate++
      tableHtml.find('.day-cell-' + i).html(calendarDate);
      if(calendarDate == this.mKlausDatetimePicker.date())
        tableHtml.find('.day-cell-' + i).addClass("selected")
    }
    
    this.inst.find(".date-content").html(tableHtml)
    
    // remove the last calendar row, if it's empty, by checking if the first day is empty
    if(!this.inst.find(".day-cell-35").text()) this.inst.find(".weekdays-row:last").remove()
    
    // update the element value unless we don't want that on this render
    if(!preventElemUpdate) {
      this.elem.val(this.mKlausDatetimePicker.format(this.opts.dpOptions.format))
      this.elem.change()
    }
    
    // fresh bindings for the day cells
    this.inst.find(".day").off().on("click mouseup", this.onDateCellClick)
  }.bind(this)
  
  this.getWeekdayName = function(index, format) {
    var mNow = moment();
    var sundayIndex = new Date().getDate() - mNow.isoWeekday()
    return moment({date: sundayIndex + index - 1}).format(format);
  }
  
  this.onDateCellClick = function() {
    if(!this.innerText) return;
    self.mKlausDatetimePicker.date(parseInt(this.innerText))
    self.render()
  }
  
  return this.init(options);
};

jQuery.fn.extend({
  klausDatetimePicker: klausDatetimePicker
});

// add the class "jquery-klaus-datetime-picker" on a input element
jQuery(document).ready(function() {
  if(jQuery(".jquery-klaus-datetime-picker")[0])
    jQuery(".jquery-klaus-datetime-picker").each(function() {
      jQuery(this).klausDatetimePicker()
    })
})