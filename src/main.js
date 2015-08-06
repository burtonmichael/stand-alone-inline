require(['moment', 'pikaday', 'template'], function(moment, Pikaday, template) {

    var app = window.rcApp || {};

    app.extend = function(defaults, options) {
        var extended = {};
        var prop;
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };

    app.validateNumber = function(event) {
        var keypressed = event || window.event;
        var key = keypressed.keyCode || keypressed.which;
        key = String.fromCharCode(key);
        var regex = /[0-9]/;
        if (!regex.test(key)) {
            keypressed.returnValue = false;
            if (keypressed.preventDefault) keypressed.preventDefault();
        }
    };

    app.validateForm = function() {
    	var errors = [];
    	if (!parseInt(app.form.location.value)) {
    		errors.push(app.messages.errorLocation + ' ' + app.messages.errorManditory);
    	} else {
            if (!parseInt(app.form.dropLocation.value)) {
                errors.push(app.messages.errorDropLocation + ' ' + app.messages.errorManditory);
            }
        }

        var pickupDateTime = app.pickupDate.getMoment().hour(app.form.puHour.value).minute(app.form.puMinute.value);

        var dropoffDateTime = app.dropoffDate.getMoment().hour(app.form.doHour.value).minute(app.form.doMinute.value);

        if (dropoffDateTime.diff(pickupDateTime, 'minutes') < 60) {
            errors.push(app.messages.errorDateLength);
        }

        var age = parseInt(app.form.driversAge.value);

        if (!age) {
            errors.push(app.messages.errorDriversAge + ' ' + app.messages.errorManditory);
        } else {
        	app.form.driversAge.value = age;
        }

        if (errors.length !== 0) {
	        if (event.preventDefault){
	            event.preventDefault();
	        } else {
	            event.returnValue = false;
	        }
            var body = document.getElementById('rc-modal-body');

            while (body.firstChild) {
                body.removeChild(body.firstChild);
            }

            for (var i = 0; i < errors.length; i++) {
                var error = document.createElement("span");
                error.innerHTML = errors[i];
                body.appendChild(error);
            }

            app.showModal();
        }
    };

    app.getJSON = function(url, params, callback) {

        if (params) {
            var queryStr = '?';
            for (var prop in params) {
                queryStr += prop + '=' + decodeURIComponent(params[prop]) + '&';
            }
            url += queryStr;
        }

        var xhr = new XMLHttpRequest();

        if ("withCredentials" in xhr) {
            xhr.open('GET', url, true);
        } else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
            xhr.open('GET', url);
        } else {
            xhr = null;
        }

        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status < 400) {
                    var data = JSON.parse(this.responseText);
                    callback(data);
                } else {
                    console.log('getJSON error');
                }
            }
        };

        xhr.send();
        xhr = null;
    };

    app.getLocations = function(callback) {
        app.getJSON('http://www.rentalcars.com/InPathAjaxAction.do', app.search, function(data) {
            app[callback](data);
        });
    };

    app.localeChanged = function(event) {
        var locale = event.name;

        var callback;

        switch (locale) {
            case 'country':
            case 'dropCountry':
                app.clear(locale);
                callback = locale + 'Changed';
                app.search.country = event.options[event.selectedIndex].value;
                delete app.search.city;
                break;
            case 'city':
            case 'dropCity':
                app.clear(locale);
                callback = locale + 'Changed';
                app.search.city = event.options[event.selectedIndex].value;
                break;
            case 'location':
                app.clear('location');
                callback = 'locationChanged';
                break;
        }

        if (callback) app.getLocations(callback);
    };

    app.clear = function(locale) {
        switch (locale) {
            case 'country':
                app.clearField(app.form.city);
                /* falls through */
            case 'city':
                app.clearField(app.form.location);
                /* falls through */
            case 'location':
                app.clearField(app.form.dropCountry);
                /* falls through */
            case 'dropCountry':
                app.clearField(app.form.dropCity);
                /* falls through */
            case 'dropCity':
                app.clearField(app.form.dropLocation);
                /* falls through */
            default:
                break;
        }
    };

    app.clearField = function(elem) {
        elem.disabled = true;
        elem.options.length = 0;

        var opt = document.createElement('option');
        opt.innerHTML = app.messages.emptySelect;
        opt.value = 0;
        opt.disabled = true;
        elem.appendChild(opt);
    };

    app.countryChanged = function(data) {
        app.fillSelect(app.form.city, data.cityList);
        if (data.cityList.length === 1) {
            app.form.city.selectedIndex = 1;
            app.search.city = data.cityList[0].id;
            app.getLocations('cityChanged');
        }
    };

    app.cityChanged = function(data) {
        app.fillSelect(app.form.location, data.locationList);
        if (data.locationList.length === 1) {
            app.form.location.selectedIndex = 1;
            app.search.location = data.locationList[0].id;
            app.locationChanged();
        }
    };

    app.locationChanged = function() {
        app.form.dropCountry.innerHTML = app.form.country.innerHTML;
        app.form.dropCountry.selectedIndex = app.form.country.selectedIndex;

        app.form.dropCity.innerHTML = app.form.city.innerHTML;
        app.form.dropCity.selectedIndex = app.form.city.selectedIndex;

        app.form.dropLocation.innerHTML = app.form.location.innerHTML;
        app.form.dropLocation.selectedIndex = app.form.location.selectedIndex;

        app.form.dropCountry.disabled = false;
        app.form.dropCity.disabled = false;
        app.form.dropLocation.disabled = false;

        app.form.locationName.value = app.form.location.options[app.form.location.selectedIndex].innerHTML;
        app.form.dropLocationName.value = app.form.dropLocation.options[app.form.dropLocation.selectedIndex].innerHTML;
    };

    app.dropCountryChanged = function(data) {
        app.fillSelect(app.form.dropCity, data.cityList);
        if (data.cityList.length === 1) {
            app.form.dropCity.selectedIndex = 1;
            app.search.city = data.cityList[0].id;
            app.getLocations('cityChanged');
        }
    };

    app.dropCityChanged = function(data) {
        app.fillSelect(app.form.dropLocation, data.locationList);
        if (data.locationList.length === 1) {
            app.form.dropLocation.selectedIndex = 1;
            app.search.dropLocation = data.locationList[0].id;
            app.dropLocationChanged();
        }
    };

    app.dropLocationChanged = function() {
        app.form.dropLocationName.value = app.form.dropLocationName.options[app.form.dropLocationName.selectedIndex].innerHTML;
    };

    app.fillSelect = function(elem, array) {
        var fragment = document.createDocumentFragment();

        for (var i = 0; i < array.length; i++) {
            var opt = document.createElement('option');
            opt.innerHTML = array[i].name;
            opt.value = array[i].id;
            fragment.appendChild(opt);
        }

        elem.appendChild(fragment);
        elem.disabled = false;
    };

    app.returnChanged = function(elem) {
        if (elem.checked) {
            app.removeClass(document.getElementById('rc-dropoff'), 'is-visible');
        } else {
            app.addClass(document.getElementById('rc-dropoff'), 'is-visible');
        }
    };

    app.setHiddenDateFields = function(date, fieldset) {
        app.form[fieldset + 'Day'].value = date.date();
        app.form[fieldset + 'Month'].value = date.month() + 1;
        app.form[fieldset + 'Year'].value = date.year();
    };

    app.hasClass = function(elem, className) {
        if (elem.classList) {
            elem.classList.contains(className);
        } else {
            new RegExp('(^| )' + className + '( |$)', 'gi').test(elem.className);
        }
    };

    app.addClass = function(elem, className) {
        if (elem.classList) {
            elem.classList.add(className);
        } else {
            elem.className += ' ' + className;
        }
    };

    app.removeClass = function(elem, className) {
        if (elem.classList) {
            elem.classList.remove(className);
        } else {
            elem.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    };

    app.cssLoader = function(url) {
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = url + '.css';

        document.head.appendChild(css);
    };

    app.showModal = function() {
        app.removeClass(document.getElementById("rc-modal-overlay"), "rc-modal-overlay--hidden");
    };

    app.dismissModal = function() {
        app.addClass(document.getElementById("rc-modal-overlay"), "rc-modal-overlay--hidden");
    };

    rcApp.init = function(data) {

        app.messages = data;

        var container = document.getElementById(app.options.containerId);

        if (container) {
            container.innerHTML = template(data);
        } else {
            var scriptElem = document.getElementById("rcAppScript");
            var containerElem = document.createElement("div");
            containerElem.innerHTML = template(data);
            scriptElem.parentNode.insertBefore(containerElem, scriptElem.nextSibling);
        }

        if (app.options.preflang === "ar" || app.options.preflang === "he") {
            app.isRTL = true;
            app.addClass(document.getElementById('rc-app'), "rc-app--is-rtl");
        }

        app.form = document.rcAppForm;
        if (app.options.affiliateCode) app.form.affiliateCode.value = app.options.affiliateCode;
        if (app.options.preflang) app.form.preflang.value = app.options.preflang;
        if (app.options.prefcurrency) app.form.prefcurrency.value = app.options.prefcurrency;
        if (app.options.adcamp) app.form.adcamp.value = app.options.adcamp;
        if (app.options.adplat) app.form.adplat.value = app.options.adplat;
        if (app.options.enabler) app.form.enabler.value = app.options.enabler;
        if (app.options.cor) app.form.cor.value = app.options.cor;

        if (app.options.affUrl) app.form.action = 'http://' + app.options.affUrl + '/LoadingSearchResults.do';

        moment.defineLocale("app", data.moment);
        moment.locale("app");

        var i18n = {
            previousMonth: data.previousMonth,
            nextMonth: data.nextMonth,
            months: data.moment.months,
            monthsShort: data.moment.monthsShort,
            weekdays: data.moment.weekdays,
            weekdaysShort: data.moment.weekdaysShort
        };

        var startDate = moment();
        startDate.add(3, 'days');

        var endDate = moment();
        endDate.add(6, 'days');

        app.setHiddenDateFields(startDate, 'pu');
        app.setHiddenDateFields(endDate, 'do');

        app.pickupDate = new Pikaday({
            defaultDate: startDate.toDate(),
            minDate: new Date(),
            setDefaultDate: true,
            field: document.getElementById('rc-datepicker--pickup'),
            format: app.options.calendarFormat,
            i18n: i18n,
            isRTL: app.isRTL,
            numberOfMonths: app.options.calendarMonths || null,
            theme: 'rc-app rc-app-reset',
            onSelect: function(date) {
                var dateMoment = this.getMoment();
                app.dropoffDate.setMinDate(date);
                if (dateMoment > app.dropoffDate.getMoment()) {
                    app.dropoffDate.setMoment(dateMoment);
                    app.setHiddenDateFields(dateMoment, 'do');
                }
                app.setHiddenDateFields(dateMoment, 'pu');
            }
        });

        app.dropoffDate = new Pikaday({
            defaultDate: endDate.toDate(),
            minDate: startDate.toDate(),
            setDefaultDate: true,
            field: document.getElementById('rc-datepicker--dropoff'),
            format: app.options.calendarFormat,
            i18n: i18n,
            isRTL: app.isRTL,
            numberOfMonths: app.options.calendarMonths || null,
            theme: 'rc-app rc-app-reset',
            onSelect: function(date) {
                app.setHiddenDateFields(this.getMoment(), 'do');
            }
        });

        var rcScript = document.getElementById('rcAppData');
        rcScript.parentNode.removeChild(rcScript);
    };

    var defaults = {
        preflang: 'en',
        containerId: 'app',
        calendarFormat: 'L',
        calendarMonths: null
    };

    app.options = app.extend(defaults, app.options);

    app.search = {
        affiliateCode: app.options.affiliateCode,
        preflang: app.options.preflang
    };

    app.baseUrl = "http://www.rentalcars.com/partners/integrations/stand-alone-inline";

    switch (typeof app.options.css) {
        case "undefined":
            app.cssLoader(app.baseUrl + '/css/base');
            break;
        case "string":
            var sheetStr = app.options.css;
            if (sheetStr.indexOf("root~") === 0) {
                sheetStr = sheetStr.replace(/root~/, app.baseUrl);
            }
            app.cssLoader(sheet);
            break;
        case "object":
            for (var i = 0, n = app.options.css.length; i < n; i++) {
                var sheetArr = app.options.css[i];
                if (sheetArr.indexOf("root~") === 0) {
                    sheetArr = sheetArr.replace(/root~/, app.baseUrl);
                }
                app.cssLoader(sheetArr);
            }
            break;
        case "boolean":
            break;
    }

    var script = document.createElement('script');
    script.setAttribute('id', 'rcAppData');
    script.type = 'text/javascript';
    script.src = 'http://www.rentalcars.com/partners/integrations/stand-alone-inline/data/' + app.options.preflang + '.js';
    document.body.appendChild(script);
});
