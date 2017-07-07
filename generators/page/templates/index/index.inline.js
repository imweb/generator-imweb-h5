window.onload = function() {
    require.loadUrl(['zepto','common', './<%= pageName %>'], function($, T, Main) {
        Main.init();
        require.async(['modules/common.async', './<%= pageName %>.async'], function() {
        });
    });
};
