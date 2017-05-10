<%= useES ? 'const' : 'var' %> selector = require('./selector');
<% if (isSimple) { %><%= useES ? 'const' : 'var' %> tpl = require('./<%= moduleName %>.tpl');<% } %>

<%= useES ? 'const' : 'var' %> conf = {
  name: '<%= moduleName %>',
  box: '.<%= moduleName %>',
  dataSeletor: selector,
  <% if (isSimple) { %>tpl: tpl,<% } %>
};

module.exports = conf;