'use strict';

const path = require('path');
const Generator = require('yeoman-generator');
const getName = require('imweb-git-user-name');
const moment = require('moment');
const chalk = require('chalk');

const validator = require('../../lib/validator');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.distHtmlPath = path.resolve(this.destinationPath('src'));
        this.distPageResourcePath = path.resolve(this.destinationPath('src/pages'));

        this.userName = getName() || getName(true);
    }

    prompting() {
        const prompts = [{
            type: 'input',
            name: 'pageName',
            message: 'Input the name of the page:',
            validate: (v) => {
                v = v.trim();

                if (!validator.pageName(v)) {
                    return `pageName [${v}] is invalid, the test [/^[0-9a-z][0-9a-zA-Z]*$/] failed`;
                }

                if (validator.fileExist(`${v}.html`, this.distHtmlPath) ||
                    validator.fileExist(v, this.distPageResourcePath)) {
                    return `page [${v}] is already existed`;
                }

                return true;
            }
        }, {
            type: 'input',
            name: 'pageTitle',
            message: 'Input the title of the page:',
        }, {
            type: 'confirm',
            name: 'useES',
            message: 'use ES6?',
            default: true
        }, {
            type: 'confirm',
            name: 'isPage',
            message: 'use page framework?',
            default: false
        }, {
            type: 'confirm',
            name: 'doCGIPreload',
            message: 'Want to use CGI preload?',
            default: false,
            when: function(answers) {
                return !answers.isPage;
            }
        }, {
            type: 'input',
            name: 'preloadCGI',
            message: 'Input the preload cgi (/cgi-bin/???):',
            when: function(answers) {
                return answers.doCGIPreload;
            }
        }, {
            type: 'input',
            name: 'author',
            message: 'Input the author of page:',
            validate: v => {
                if (!validator.notEmpty(v)) {
                    return 'Author can not be null';
                }

                return true;
            },
            when: () => {
                return !this.userName;
            }
        }];

        return this.prompt(prompts).then((props) => {
            props.pageName = props.pageName.trim();
            props.date = moment().format('YYYY-MM-DD');
            if (!props.author) {
                props.author = this.userName;
            }

            this.props = props;
        });
    }

    writing() {
        // src/[pageName].html
        this.fs.copyTpl(
            this.templatePath('index.html'),
            this.destinationPath(`src/${this.props.pageName}.html`),
            this.props
        );

        // src/pages/[pageName]/[pageName].inline.js
        this.fs.copyTpl(
            this.templatePath(this.props.isPage ? 'index/index.inline.page.js' : this.props.doCGIPreload ? 'index/index.inline.preload.js' : 'index/index.inline.js'),
            this.destinationPath(`src/pages/${this.props.pageName}/${this.props.pageName}.inline.js`),
            this.props
        );

        // src/pages/[pageName]/[pageName].js
        this.fs.copyTpl(
            this.templatePath(this.props.isPage ? 'index/index.page.js' : 'index/index.js'),
            this.destinationPath(`src/pages/${this.props.pageName}/${this.props.pageName}.${ this.props.useES ? 'es' : 'js' }`),
            this.props
        );

        // src/pages/[pageName]/[pageName].async.js
        this.fs.copy(
            this.templatePath('index/index.async.js'),
            this.destinationPath(`src/pages/${this.props.pageName}/${this.props.pageName}.async.${ this.props.useES ? 'es' : 'js' }`)
        );

        // src/pages/[pageName]/[pageName].scss
        this.fs.copy(
            this.templatePath('index/index.scss'),
            this.destinationPath(`src/pages/${this.props.pageName}/${this.props.pageName}.scss`)
        );

        if (this.props.isPage) {
            // src/pages/[pageName]/data.page.js
            this.fs.copyTpl(
                this.templatePath('index/data.page.js'),
                this.destinationPath(`src/pages/${this.props.pageName}/data.page.${ this.props.useES ? 'es' : 'js' }`),
                this.props
            );
        } else {
            // src/pages/[pageName]/db.[pageName].js
            this.fs.copyTpl(
                this.templatePath('index/db.index.js'),
                this.destinationPath(`src/pages/${this.props.pageName}/db.${this.props.pageName}.${ this.props.useES ? 'es' : 'js' }`),
                this.props
            );
        }
    }

    end() {
        this.log(`create page ${chalk.green(this.props.pageName)} success!`);
    }
};
