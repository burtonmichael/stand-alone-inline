define(['handlebars.runtime'], function(Handlebars){
    Handlebars.registerHelper('Hours', function() {
        var ret = [];

        for (var i = 0; i < 24; i++) {
            var hour = (i < 10) ? '0' + (i + '') : (i + ''),
                option = '<option ';
            if (hour == '10') option += 'selected ';
            option += 'value="' + i +'">'
            option += hour
            option += '</option>';
            ret.push(option)
        }

        return ret.join('');
    });

    Handlebars.registerHelper('Minutes', function() {
        var ret = [];

        for (var j = 0; j < 4; j++) {
            var minute = (j === 0) ? '00' : (j * 15 + ''),
                value = j * 15,
                option = '<option ';
            if (minute == '30') option += 'selected ';
            option += 'value="' + value +'">'
            option += minute
            option += '</option>';
            ret.push(option)
        }

        return ret.join('');
    });
})