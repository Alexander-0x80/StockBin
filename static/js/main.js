var stocks_api_url = 'https://api.iextrading.com/1.0';
var batch_url = stocks_api_url + '/stock/market/batch';

function $(_) { return document.querySelector(_); }
function $all(_) { return [].slice.call(document.querySelectorAll(_)); }

var $http = {
    get: function (endpoint, success, failure) {
        var request = new XMLHttpRequest();
        request.open('GET', endpoint, true);
        request.onload = success.bind(null, request);
        request.onerror = (failure)
            ? failure.bind(null, request)
            : function (request) {
                // Just fucking ignore it™
            };

        request.send();
        return request;
    },
    post: function (endpoint, data, success, failure) {
        var request = new XMLHttpRequest();
        request.open("POST", endpoint, true);
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        request.onload = success.bind(null, request);
        request.onerror = (failure) 
            ? failure.bind(null, request)
            : function (request) {
                // Do what we always do
            };

        request.send(JSON.stringify(data));
        return request;
    },
};

var $fmt = {
    quote: function (value) {
        return value.toLocaleString('en', {
            'minimumFractionDigits': 2,
            'style': 'currency',
            'currency': 'USD'
        });
    },

    dec: function (value) {
        return value.toLocaleString('en');
    },

    mcap: function (c) {
        var value, suffix;
        if (c >= 1e12) {
          value = c / 1e12;
          suffix = 'T';
        } else if (c >= 1e9) {
          value = c / 1e9;
          suffix = 'B';
        } else {
          value = c / 1e6;
          suffix = 'M';
        }

        return '$' + value.toFixed(value < 10 ? 1 : 0) + suffix;
    },

    percent: function(value) {
        return '(' + (value * 100).toFixed(1) + '%)';
    }
};