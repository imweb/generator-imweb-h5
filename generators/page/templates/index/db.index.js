<%= useES ? 'const' : 'var' %> DB = require('modules/db');

$.extend(DB, {
    // getIndex: DB.httpMethod({
    //     url: '/cgi-bin/h5/index_3',
    //     type: 'get'
    // })
});
module.exports = DB;
