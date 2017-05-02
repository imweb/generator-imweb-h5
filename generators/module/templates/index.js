var selector = require('./selector');
<% if (isSimple) { %>var tpl = require('./<%= moduleName %>.tpl');<% } %>

var conf = {
  name: '<%= moduleName %>',
  box: '.<%= moduleName %>',
  dataSeletor: selector,
  <% if (isSimple) { %>tpl: tpl,<% } %>
};

module.exports = conf;