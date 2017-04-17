/*
* Copyright (c) Teodorescu Claudiu-Ștefan: https://github.com/claudiut/jquery-klaus-datetime-picker
*/

(function($) {
  
  $.fn.usabilityDatetimePicker = function() {
    
    var render = function(inputElem, momentObj, silent) {
      var inputElem = $(inputElem);
      
      var dpOptions = getDPOptions(inputElem)
      
      var standardLocale = moment.locale();
      // use moment with locale and at the end of render, put the standard locale back
      if(dpOptions.locale) {
        moment.locale(dpOptions.locale);
        momentObj.locale(dpOptions.locale);
      }

      // day names html
      var dayNamesCellsHtml = getRangeArray(0, 6).map(function(v) {
        return "<td>" + moment().day(v).format('dd') + "</td>";
      }).join("")

      // day numbers html
      var dayOfMonth = 0;
      var firstDayOfMonthName = momentObj.clone().startOf('month').format('dddd');
      var lastDayOfMonth = parseInt(momentObj.clone().endOf('month').format('D'));
      
      var daysCellsHtml = '';
      getRangeArray(0, 5).forEach(function(weekNo) {
        // skip empty week (if the case)
        if(weekNo + 1 > monthNumberOfWeeks(momentObj.month()))
          return;
        
        daysCellsHtml += "<tr class='usability-dp-days'>" + getRangeArray(0, 6).map(function(dayNo) {
          // if we already started increasing the day of month OR this is the cell for the first day of month, increase to the next day
          var dayName = moment().day(dayNo).format('dddd')
          if(dayOfMonth && dayOfMonth <= lastDayOfMonth || weekNo == 0 && dayName == firstDayOfMonthName)
            dayOfMonth++
          
          // don't display numbers greater than the last day of month number
          if(dayOfMonth > lastDayOfMonth)
            dayOfMonth = 0
          
          return "<td data-date='" + (dayOfMonth ? dayOfMonth : '') + "' class='" + (dayOfMonth ? 'day-cell' : 'last-row-empty-cell') + " " + (dayOfMonth == momentObj.date() ? "current-day" : "") + "'>" + (dayOfMonth ? dayOfMonth : '') + "</td>";
        }).join("") + "</tr>";
        
      });
      
      // month selector
      var monthsSelectHtml = "<select class='usability-dp-months'>" + getRangeArray(0, 11).map(function(monthNo) {
        return "<option value='" + monthNo + "' " + (monthNo == momentObj.month() ? "selected='selected'" : "") + ">" + moment().month(monthNo).format("MMMM") + "</option>"
      }).join("") + "</select>";
      
      // year selector
      var yearsSelectHtml = "<select class='usability-dp-years'>" + getRangeArray(1920, moment().year() + 20).map(function(year) {
        return "<option value='" + year + "' " + (year == momentObj.year() ? "selected='selected'" : "") + ">" + year + "</option>"
      }).join("") + "</select>";

      // time selector
      var hoursHtml = "<select class='usability-dp-hours'>" + getRangeArray(0, 23).map(function(hour) {
        return "<option value='" + hour + "' " + (hour == momentObj.hour() ? "selected='selected'" : "") + ">" + moment().hour(hour).format("HH") + "</option>";
      }).join("") + "</select>"
      
      var minutesHtml = "<select class='usability-dp-minutes'>" + getRangeArray(0, 59).map(function(minute) {
        return "<option value='" + minute + "' " + (minute == momentObj.minute() ? "selected='selected'" : "") + ">" + moment().minute(minute).format("mm") + "</option>";
      }).join("") + "</select>"
      
      var secondsHtml = "<select class='usability-dp-seconds'>" + getRangeArray(0, 59).map(function(second) {
        return "<option value='" + second + "' " + (second == momentObj.second() ? "selected='selected'" : "") + ">" + moment().second(second).format("ss") + "</option>";
      }).join("") + "</select>"
console.log(dpOptions);

      var timeArr = [
        hoursHtml,
        minutesHtml,
        dpOptions.selectTimeSeconds === true ? secondsHtml : ""
      ].filter(function(s){return s})

      // datepicker html
      var html = "<table class='usability-dp-table " + (dpOptions.inline ? '' : 'floating-dp') + "' border='1'>" +
        (
          dpOptions.selectOnlyTime
          ?
          ""
          :
          (
            "<tr class='usability-dp-header'>\
              <td colspan='7'>\
                <a href='' class='usability-dp-prev-month'>&lt;</a> " +
                monthsSelectHtml + " " + yearsSelectHtml +
                " <a href='' class='usability-dp-next-month'>&gt;</a></td>\
            </tr>"
            +
            "<tr class='usability-dp-day-names'>" + dayNamesCellsHtml + "</tr>"
            +
            daysCellsHtml
          )
        )
        +
        "<tr class='usability-dp-time'><td colspan='7'>" + timeArr.join(" : ") + "</td></tr>\
      </table>";

      inputElem.parent().find(".usability-dp-table").remove();
      inputElem.parent().append(html);
      setDPEvents(inputElem, momentObj);
      
      if(!silent)
        inputElem.val(momentObj.format(dpOptions.format))
      
      if(dpOptions.locale) {
        moment.locale(standardLocale)
        momentObj.locale(standardLocale)
      }
      
    }
    
    // datepicker events
    var setDPEvents = function(inputElem, momentObj) {
      var dp = inputElem.parent().find(".usability-dp-table")

      // prev month
      dp.find(".usability-dp-prev-month")
      .off(".usabilityDatetimePicker")
      .on("click.usabilityDatetimePicker", function(e) {
        e.preventDefault();
        render(inputElem, momentObj.month(momentObj.month() - 1));
      });
      
      // next month
      dp.find(".usability-dp-next-month")
      .off(".usabilityDatetimePicker")
      .on("click.usabilityDatetimePicker", function(e) {
        e.preventDefault();
        render(inputElem, momentObj.month(momentObj.month() + 1));
      });
      
      // select month
      dp.find(".usability-dp-months")
      .off(".usabilityDatetimePicker")
      .on("change.usabilityDatetimePicker", function(e) {
        e.preventDefault();
        render(inputElem, momentObj.month(this.value));
      });
      
      // select year
      dp.find(".usability-dp-years")
      .off(".usabilityDatetimePicker")
      .on("change.usabilityDatetimePicker", function(e) {
        e.preventDefault();
        render(inputElem, momentObj.year(this.value));
      });
      
      // select hour
      dp.find(".usability-dp-hours")
      .off(".usabilityDatetimePicker")
      .on("change.usabilityDatetimePicker", function(e) {
        e.preventDefault();
        render(inputElem, momentObj.hour(this.value));
      });
      
      // select minute
      dp.find(".usability-dp-minutes")
      .off(".usabilityDatetimePicker")
      .on("change.usabilityDatetimePicker", function(e) {
        e.preventDefault();
        render(inputElem, momentObj.minute(this.value));
      });
      
      // select second
      dp.find(".usability-dp-seconds")
      .off(".usabilityDatetimePicker")
      .on("change.usabilityDatetimePicker", function(e) {
        e.preventDefault();
        render(inputElem, momentObj.second(this.value));
      });
      
      // day click event
      dp.find(".usability-dp-days td")
      .off(".usabilityDatetimePicker")
      .on("click.usabilityDatetimePicker", function(e) {
        e.preventDefault();
        // a valid date/day value expected here is always a number greater than 0
        if(date = $(this).data('date'))
          render(inputElem, momentObj.date(date));
      });
    }
    
    // helper methods
    var getRangeArray = function(min, max) {
      arr = [];
      for(var i = min; i <= max; i++) { arr.push(i); }
      
      return arr;
    }
    
    var getDPOptions = function(inputElem) {
      var defaultOpts = {
        format: 'D MMMM YYYY HH:mm'
      }
      var opts = {};
      
      var data = inputElem.data();
      
      for(k in data)
        opts[k.slice(0).slice("usabilityDatetimePicker".length).lowercaseFirstLetter()] = data[k];
    
      return $.extend(defaultOpts, opts);
    }
    
    var monthNumberOfWeeks = function(monthIndex) {
      var mDaysNo = parseInt(moment().month(monthIndex).endOf('month').format('D'))
      var firstWeekEmptyDays = parseInt(moment().month(monthIndex).startOf('month').format('d'))
      return Math.ceil((firstWeekEmptyDays + mDaysNo) / 7)
    }
    
    $(document).off("click.usabilityDatetimePicker").on("click.usabilityDatetimePicker", function(e) {
      if(!$(e.target).hasClass("usability-datetime-picker") && !$(e.target).closest(".usability-dp-table")[0]) {
        $(".usability-dp-table").each(function() {
          if(!$(this).parent().find(".usability-datetime-picker").data("usabilityDatetimePickerInline"))
            $(this).remove()
        })
      }
    });
    
    return this.each(function() {
      var inputElem = $(this);
      
      var options = getDPOptions(inputElem);
      
      // events
      inputElem
      .off(".usabilityDatetimePicker")
      .on("focus.usabilityDatetimePicker keypress.usabilityDatetimePicker keyup.usabilityDatetimePicker", function() {
        var m = inputElem.val() ? moment(inputElem.val(), options.format) : moment();
        render(this, m, true);
      })
      
      if(options.inline)
        inputElem.trigger("keypress.usabilityDatetimePicker");
      
    })
  }
  
})(jQuery)

jQuery(document).ready(function() {
  jQuery(".usability-datetime-picker").usabilityDatetimePicker();
})

// http://stackoverflow.com/a/1026087
String.prototype.lowercaseFirstLetter = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
}