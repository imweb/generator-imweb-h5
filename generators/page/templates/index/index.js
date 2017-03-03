/**
 * <%= pageName + '.js' %>
 * @author <%= author %>
 * @date   <%= date %>
 * 
 */

var T = require('modules/tools.ext');

function bindEvents() {
    if (this.hasBindEvents) {
        return;
    }

    this.hasBindEvents = true;
}
<%= `${doCGIPreload? '\nfunction initData(data) {\n}\n' : ''}` %>
function init(opts) {

    bindEvents.call(this);
}

module.exports = {
    init: init<%= `${doCGIPreload? ',\n\tinitData: initData' : ''}` %>
};