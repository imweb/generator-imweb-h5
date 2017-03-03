var _userAgent = navigator.userAgent.toLowerCase() || '';

function qqVersion() {
    var _match = _userAgent.match(/qq\/(\d+\.\d+(\.\d+)?)/i);
    return _match && _match[1] || 0;
}

function isWeiXin() {
    return _userAgent.indexOf('micromessenger') !== -1 || getCookie('uid_type') == 2;
}

function getAuthKey() {
    var a2 = getCookie('uid_a2');
    var skey = getCookie('p_skey') || getCookie('skey');

    return isWeiXin() ? (a2 || skey) : skey;
}

function encryptSkey(str) {
    var hash = 5381;

    if (!str) {
        return '';
    }

    for (var i = 0, len = str.length; i < len; ++i) {
        hash += (hash << 5) + str.charAt(i).charCodeAt();
    }

    return hash & 0x7fffffff;
}

function getBkn() {
    return encryptSkey(getAuthKey());
}

window.getUin = function() {
    var uin = (getCookie('p_uin') || getCookie('uin')).replace(/[^\d]/g, '');
    var a2 = getCookie('uid_a2');
    return isWeiXin() ? (a2 ? '' : uin) : uin;
};

window.onload = function() {
    var _ua = navigator.userAgent;
    var isIOS = (/iPhone|iPod/i).test(_ua);
    var isIOSQQ = isIOS && (/qq\/(\d+\.\d+)/i).test(_ua);

    Async.parallel([function(done) {
        require.loadUrl(['common', './<%= pageName %>'], function(T, Main) {
            window.bindCatchFunctionWithZepto();
            Main.init();
            done(Main || {});
        });
    }, function(done) {
        var _url;

        if (WIN_NAME.get(window.DYNAMIC_KEY) == 1) {
            _url = '//ke.qq.com/cgi-bin/<%= preloadCGI %>?is_ios_h5=' + (isIOSQQ ? 1 : 0) + '&bkn=' + getBkn();
        } else {
            _url = '//ke.qq.com/cgi-bin/<%= preloadCGI %>?is_ios=' + (isIOS ? 1 : 0) + '&bkn=' + getBkn();
        }
        if (isIOSQQ) {
            _url += '&is_ios_qq=1';
        }

        require.getData(_url, function(data) {
            done(data || {});
        }, function() {
            done({
                retcode: -1
            });
        }, {
            reportPath: '/cgi-bin/<%= preloadCGI %>'
        });
    }], function(Main, data) {
        Main.initData(data);
        require.async(['modules/common.async', './<%= pageName %>.async'], function() {});
    });
};
