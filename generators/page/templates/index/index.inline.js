window.onload = function() {
    require.loadUrl(['common', './<%= pageName %>'], function(T, Main) {
        Main.init();
        require.async(['modules/common.async', './<%= pageName %>.async'], function() {
        });
    });
};
