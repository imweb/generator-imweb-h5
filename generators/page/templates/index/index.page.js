<%= useES ? 'const' : 'var' %> dataOpt = require('./data.page');
<%= useES ? 'const' : 'var' %> pageName = '<%= pageName %>';

module.exports = {
    pageName: pageName,
    datas: dataOpt,
    modules: [
        /* modules */
    ]
};
