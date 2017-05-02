require.loadUrl(['common', 'page', './<%= pageName %>'], function(T, page, opts) {
    window.bindCatchFunctionWithZepto();
    page.init(opts);
    require.async(['modules/common.async', 'modules/page/page.async', './<%= pageName %>.async'], function() {});
});