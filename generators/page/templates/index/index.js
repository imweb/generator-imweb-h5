/**
 * <%= pageName + '.js' %>
 * @author <%= author %>
 * @date   <%= date %>
 * 
 */

<%= useES ? 'const' : 'var' %> T = require('modules/tools.ext');

function bindEvents() {
    if (this.hasBindEvents) {
        return;
    }

    this.hasBindEvents = true;
}
<%= `${!isPage && doCGIPreload? '\nfunction initData(data) {\n}\n' : ''}` %>
function init(opts) {

    bindEvents.call(this);
}

module.exports = {
    init: init<%= `${!isPage && doCGIPreload? ',\n\tinitData: initData' : ''}` %>
};