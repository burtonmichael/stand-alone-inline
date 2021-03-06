require(['handlebars.runtime', 'moment', 'pikaday', 'template'], function(Handlebars, moment, Pikaday, template) {
    var app = window.rcApp || {};

    app.nextElement = function(elem) {
        if (elem.nextElementSibling) return elem.nextElementSibling;

        do {
            elem = elem.nextSibling;
        } while (elem && elem.nodeType !== 1);

        return elem;
    };

    app.setFocus = function(elem) {
        app.addClass(elem.parentNode, 'rc-form-control--has-focus');
    };

    app.unsetFocus = function(elem) {
        app.removeClass(elem.parentNode, 'rc-form-control--has-focus');
    };

    app.setDisabled = function(elem) {
        elem.disabled = true;
        app.addClass(elem.parentNode, 'rc-form-control--is-disabled');
    };

    app.unsetDisabled = function(elem) {
        elem.disabled = false;
        app.removeClass(elem.parentNode, 'rc-form-control--is-disabled');
    };

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
        function returnFalse() {
            if (event.preventDefault){
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            return false;
        }

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
            return returnFalse();
        }

        if (window.location.protocol === 'https:') {
            app.secureSubmission();
            return returnFalse();
        }
    };

    app.secureSubmission = function() {
        var field,
            fields = [],
            form = app.form;

        if (typeof form == 'object' && form.nodeName == "FORM") {
            var len = form.elements.length;
            for (i=0; i<len; i++) {
                field = form.elements[i];
                if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
                    if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
                        fields[fields.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value);
                    }
                }
            }
        }

        window.open('http://' + (app.options.affUrl || 'www.rentalcars.com') + '/LoadingSearchResults.do?' + fields.join('&').replace(/%20/g, '+'));
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
        xhr.open('GET', url, true);

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
        app.getJSON(app.baseUrl + '/InPathAjaxAction.do', app.search, function(data) {
            app[callback](data);
        });
    };

    app.localeChanged = function(elem) {
        var locale = elem.name;

        app.nextElement(elem).innerHTML = elem.options[elem.selectedIndex].innerHTML;

        var callback;

        switch (locale) {
            case 'country':
            case 'dropCountry':
                app.clear(locale);
                callback = locale + 'Changed';
                app.search.country = elem.options[elem.selectedIndex].value;
                delete app.search.city;
                break;
            case 'city':
            case 'dropCity':
                app.clear(locale);
                callback = locale + 'Changed';
                app.search.city = elem.options[elem.selectedIndex].value;
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
        if (elem.options.length > 0) {
            app.setDisabled(elem);
            var emptyVal = elem.options[0].innerHTML;

            elem.options.length = 0;

            var opt = document.createElement('option');
            opt.innerHTML = emptyVal;
            opt.value = 0;
            opt.disabled = true;
            elem.appendChild(opt);

            app.nextElement(elem).innerHTML = emptyVal;
        }
    };

    app.timeChanged = function(elem) {
        app.nextElement(elem).innerHTML = elem.options[elem.selectedIndex].innerHTML;
    };

    app.countryChanged = function(data) {
        app.fillSelect(app.form.city, data.cityList);
        if (data.cityList.length === 1) {
            app.form.city.selectedIndex = 1;
            app.search.city = data.cityList[0].id;
            app.nextElement(app.form.city).innerHTML = data.cityList[0].name;

            app.getLocations('cityChanged');
        }
    };

    app.cityChanged = function(data) {
        app.fillSelect(app.form.location, data.locationList);
        if (data.locationList.length === 1) {
            app.form.location.selectedIndex = 1;
            app.search.location = data.locationList[0].id;
            app.nextElement(app.form.location).innerHTML = data.locationList[0].name;

            app.locationChanged();
        }
    };

    app.copySelect = function(source, dest) {
        dest.innerHTML = source.innerHTML;
        dest.selectedIndex = source.selectedIndex;
        app.unsetDisabled(dest);

        app.nextElement(dest).innerHTML = app.nextElement(source).innerHTML;
    };

    app.locationChanged = function() {
        var form = app.form;

        app.copySelect(form.country, form.dropCountry);
        app.copySelect(form.city, form.dropCity);
        app.copySelect(form.location, form.dropLocation);

        form.locationName.value = form.location.options[form.location.selectedIndex].innerHTML;
        form.dropLocationName.value = form.dropLocation.options[form.dropLocation.selectedIndex].innerHTML;
    };

    app.dropCountryChanged = function(data) {
        app.fillSelect(app.form.dropCity, data.cityList);
        if (data.cityList.length === 1) {
            app.form.dropCity.selectedIndex = 1;
            app.search.city = data.cityList[0].id;
            app.getLocations('cityChanged');

            app.nextElement(app.form.dropCity).innerHTML = data.cityList[0].name;
        }
    };

    app.dropCityChanged = function(data) {
        app.fillSelect(app.form.dropLocation, data.locationList);
        if (data.locationList.length === 1) {
            app.form.dropLocation.selectedIndex = 1;
            app.search.dropLocation = data.locationList[0].id;

            app.nextElement(app.form.dropLocation).innerHTML = data.locationList[0].name;

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
        app.unsetDisabled(elem);
    };

    app.returnChanged = function(elem) {
        if (elem.checked) {
            app.removeClass(document.getElementById('rc-locations-wrap'), 'rc-locations-wrap--has-return');
        } else {
            app.addClass(document.getElementById('rc-locations-wrap'), 'rc-locations-wrap--has-return');
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

    app.clickThrough = function(elem) {
        var nextElem = app.nextElement(elem);
        if (nextElem.attributes.readonly) {
            nextElem.click();
        } else {
            nextElem.focus();
        }
    };

    app.getScript = function(url, id) {
        var script = document.createElement('script');
        script.setAttribute('id', id);
        script.type = 'text/javascript';
        script.src = url + '.js';
        document.body.appendChild(script);
    };

    app.setupDate = function() {
        moment.defineLocale("rcApp", app.messages.moment);
        moment.locale("rcApp");

        var i18n = {
            previousMonth: app.messages.previousMonth,
            nextMonth: app.messages.nextMonth,
            months: app.messages.moment.months,
            monthsShort: app.messages.moment.monthsShort,
            weekdays: app.messages.moment.weekdays,
            weekdaysShort: app.messages.moment.weekdaysShort
        };

        var startDate = moment().startOf('day');
        startDate.add(3, 'days');

        var endDate = moment().startOf('day');
        endDate.add(6, 'days');

        app.setHiddenDateFields(startDate, 'pu');
        app.setHiddenDateFields(endDate, 'do');

        app.pickupDate = new Pikaday({
            defaultDate: startDate.toDate(),
            startRange: startDate.toDate(),
            endRange: endDate.toDate(),
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
                this.setStartRange(date);
                app.dropoffDate.setStartRange(date);
                app.dropoffDate.setMinDate(date);
                if (dateMoment > app.dropoffDate.getMoment()) {
                    this.setEndRange(date);
                    app.dropoffDate.setMoment(dateMoment);
                    app.setHiddenDateFields(dateMoment, 'do');
                }
                app.setHiddenDateFields(dateMoment, 'pu');
            }
        });

        app.dropoffDate = new Pikaday({
            defaultDate: endDate.toDate(),
            startRange: startDate.toDate(),
            endRange: endDate.toDate(),
            minDate: startDate.toDate(),
            setDefaultDate: true,
            field: document.getElementById('rc-datepicker--dropoff'),
            format: app.options.calendarFormat,
            i18n: i18n,
            isRTL: app.isRTL,
            numberOfMonths: app.options.calendarMonths || null,
            theme: 'rc-app rc-app-reset',
            onSelect: function(date) {
                app.pickupDate.setEndRange(date);
                this.setEndRange(date);
                app.setHiddenDateFields(this.getMoment(), 'do');
            }
        });
    };

    app.setupForm = function() {
        app.form = document.rcAppForm;
        app.form.action = app.options.affUrl ? 'http://' + app.options.affUrl + '/LoadingSearchResults.do' : 'http://www.rentalcars.com/LoadingSearchResults.do';

        if (app.options.affiliateCode) app.form.affiliateCode.value = app.options.affiliateCode;
        if (app.options.preflang) app.form.preflang.value = app.options.preflang;
        if (app.options.prefcurrency) app.form.prefcurrency.value = app.options.prefcurrency;
        if (app.options.adcamp) app.form.adcamp.value = app.options.adcamp;
        if (app.options.adplat) app.form.adplat.value = app.options.adplat;
        if (app.options.enabler) app.form.enabler.value = app.options.enabler;
        if (app.options.cor) app.form.cor.value = app.options.cor;
    };

    app.setupTemplate = function(template, custom) {
        var container = document.getElementById(app.options.containerId);
        var rcAppScript = document.getElementById("rcAppScript");
        var rcAppDataScript = document.getElementById('rcAppData');

        if (custom) {
            template = Handlebars.template(template);
            var rcAppTemplateScript = document.getElementById('rcAppTemplate');
            rcAppTemplateScript.parentNode.removeChild(rcAppTemplateScript);
        }

        if (container) {
            container.innerHTML = template(app.messages);
        } else {
            var containerElem = document.createElement("div");
            containerElem.innerHTML = template(app.messages);
            rcAppScript.parentNode.insertBefore(containerElem, rcAppScript.nextSibling);
        }

        if (app.options.preflang === "ar" || app.options.preflang === "he") {
            app.isRTL = true;
            app.addClass(document.getElementById('rc-app'), "rc-app--is-rtl");
        }

        app.setupForm();
        app.setupDate();

        if (app.options.script) {
            var rcAppAddScript;
            switch (typeof app.options.script) {
                case "string":
                    app.getScript(app.resourceUrl + app.options.script, 'rcAppAddScript');
                    rcAppAddScript = document.getElementById('rcAppAddScript');
                    rcAppAddScript.parentNode.removeChild(rcAppAddScript);
                    break;
                case "object":
                    for (var i = 0, n = app.options.script.length; i < n; i++) {
                        app.getScript(app.resourceUrl + app.options.script[i], 'rcAppAddScript-' + i);
                        rcAppAddScript = document.getElementById('rcAppAddScript-' + i);
                        rcAppAddScript.parentNode.removeChild(rcAppAddScript);
                    }
                    break;
            }
        }

        rcAppScript.parentNode.removeChild(rcAppScript);
        rcAppDataScript.parentNode.removeChild(rcAppDataScript);
    };

    app.getOptionsFromScript = function() {
        var scriptSrc = document.getElementById("rcAppScript").attributes.src.value;

        if (scriptSrc.indexOf('?') >= 0) {
            var scriptQuery = scriptSrc.substr(scriptSrc.indexOf('?') + 1).split('&');

            if (scriptQuery === "") return {};

            var obj = {};
            for (var i = 0; i < scriptQuery.length; ++i)
            {
                var parameter = scriptQuery[i].split('=', 2);
                if (parameter.length == 1)
                    obj[parameter[0]] = "";
                else
                    obj[parameter[0]] = decodeURIComponent(parameter[1]);
            }
            console.log(obj);
            return obj;
        } else {
            console.log("rentalcars.com | No paramaters found for application to initiate.");
        }
    };

    app.init = function(data) {
        app.messages = app.messages ? app.extend(data, app.messages) : data;

        if (app.options.template) {
            app.getScript(app.resourceUrl + 'templates/' + app.options.template, 'rcAppTemplate');
        } else {
            app.setupTemplate(template);
        }
    };

    var defaults = {
        preflang: 'en',
        containerId: 'app',
        calendarFormat: 'L',
        calendarMonths: null
    };

    if (!app.options) {
        app.options = app.extend(defaults, app.getOptionsFromScript());
    } else {
        app.options = app.extend(defaults, app.options);
    }

    if (app.options.affUrl) {
        app.baseUrl = 'http://' + app.options.affUrl;
    } else {
        app.baseUrl = 'https://secure.rentalcars.com';
    }

    app.search = {
        affiliateCode: app.options.affiliateCode,
        preflang: app.options.preflang
    };

    app.resourceUrl = app.baseUrl + "/partners/integrations/stand-alone-inline/";

    switch (typeof app.options.css) {
        case "undefined":
            app.cssLoader(app.resourceUrl + 'css/base');
            break;
        case "string":
            app.cssLoader(app.resourceUrl + app.options.css);
            break;
        case "object":
            for (var i = 0, n = app.options.css.length; i < n; i++) {
                app.cssLoader(app.resourceUrl + app.options.css[i]);
            }
            break;
        case "boolean":
            break;
    }

    app.getScript(app.resourceUrl + 'data/' + app.options.preflang, 'rcAppData');
});
