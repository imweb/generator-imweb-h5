var fsAccess = require('fs-access');
var path = require('path');
var which = require('which');
var spawn = require('child_process').spawn;

// Return location of chrome.exe file for a given Chrome directory (available: "Chrome", "Chrome SxS").
function getChromeExe(chromeDirName) {
    // Only run these checks on win32
    if (process.platform !== 'win32') {
        return null;
    }
    var windowsChromeDirectory, i, prefix;
    var suffix = '\\Google\\' + chromeDirName + '\\Application\\chrome.exe';
    var prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']];

    for (i = 0; i < prefixes.length; i++) {
        prefix = prefixes[i];
        try {
            windowsChromeDirectory = path.join(prefix, suffix);
            fsAccess.sync(windowsChromeDirectory);
            return windowsChromeDirectory;
        } catch (e) {}
    }

    return windowsChromeDirectory;
}

// function isJSFlags(flag) {
//     return flag.indexOf('--js-flags=') === 0;
// }

// function sanitizeJSFlags(flag) {
//     var test = /--js-flags=(['"])/.exec(flag);
//     if (!test) {
//         return flag;
//     }
//     var escapeChar = test[1];
//     var endExp = new RegExp(escapeChar + '$');
//     var startExp = new RegExp('--js-flags=' + escapeChar);
//     return flag.replace(startExp, '--js-flags=').replace(endExp, '');
// }

// var ChromeBrowser = function(baseBrowserDecorator, args) {
//     baseBrowserDecorator(this);

//     var flags = args.flags || [];
//     // var userDataDir = args.chromeDataDir || this._tempDir;

//     this._getOptions = function(url) {
//         // Chrome CLI options
//         // http://peter.sh/experiments/chromium-command-line-switches/
//         flags.forEach(function(flag, i) {
//             if (isJSFlags(flag)) {
//                 flags[i] = sanitizeJSFlags(flag);
//             }
//         });

//         return [
//             // '--user-data-dir=' + userDataDir,
//             '--no-default-browser-check',
//             '--no-first-run',
//             '--disable-default-apps',
//             '--disable-popup-blocking',
//             '--disable-translate',
//             '--disable-background-timer-throttling',
//             // on macOS, disable-background-timer-throttling is not enough
//             // and we need disable-renderer-backgrounding too
//             // see https://github.com/karma-runner/karma-chrome-launcher/issues/123
//             '--disable-renderer-backgrounding',
//             '--disable-device-discovery-notifications'
//         ].concat(flags, [url]);
//     };
// };

// ChromeBrowser.prototype = {
//     name: 'Chrome',
//     DEFAULT_CMD: {
//         // linux: getBin(['google-chrome', 'google-chrome-stable']),
//         // darwin: getChromeDarwin('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
//         win32: getChromeExe('Chrome')
//     },
//     ENV_CMD: 'CHROME_BIN'
// };

// console.log('>>>>', getChromeExe('Chrome'));
// var spawn = require('child_process').spawn;
// var chrome = spawn(getChromeExe('Chrome'), [
//     '--disable-extensions-file-access-check',
//     'http://wang.oa.com/h5/?f1=21878&f2=1&pn=%E6%B5%8B%E8%AF%951#/rum/speed'
// ]);

// chrome.stdout.on('data', function(data) {
//     console.log('标准输出：\n' + data);
// });

// chrome.stderr.on('data', function(data) {
//     console.log('标准错误输出：\n' + data);
// });

// chrome.on('exit', function(code, signal) {
//     console.log('子进程已退出，代码：' + code);
// });

var chromeCMD_win32 = getChromeExe('Chrome');

module.exports = {
    chrome: function(url) {
        var chrome = spawn(getChromeExe('Chrome'), [
            url
        ]);

        // chrome.stdout.on('data', function(data) {
        //     console.log('chrome 标准输出：\n' + data);
        // });

        chrome.stderr.on('data', function(data) {
            console.log('\nchrome 标准错误输出：\n' + data + '\n');
        });

        // chrome.on('exit', function(code, signal) {
        //     console.log('chrome 子进程已退出，代码：' + code);
        // });
    }
};
