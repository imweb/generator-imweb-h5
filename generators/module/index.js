'use strict';

const fs = require('fs');
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
                const dir = path.join(this.distPageResourcePath, v);

                v = v.trim();

                if (!validator.pageName(v)) {
                    return `pageName [${v}] is invalid, the test [/^[0-9a-z][0-9a-zA-Z]*$/] failed`;
                }

                if (!validator.fileExist(`${v}.html`, this.distHtmlPath) ||
                    !validator.fileExist(v, this.distPageResourcePath)) {
                    return `page [${v}] is not existed`;
                }

                if (!validator.fileExist(`data.page.js`, dir) &&
                    !validator.fileExist(`data.page.es6.js`, dir)) {
                    return `page [${v}] does not use page framework`;
                }

                return true;
            },
            filter: (v) => {
                this.distMainPageResourcePath = path.join(this.distPageResourcePath, v);
                this.distPageModuleResourcePath = path.join(this.distMainPageResourcePath, 'modules');
                this.indexJSFilePath = path.join(this.distMainPageResourcePath, `${v}.js`);
                this.indexESFilePath = path.join(this.distMainPageResourcePath, `${v}.es6.js`);
                this.indexHtmlFilePath = path.join(this.distHtmlPath, `${v}.html`);

                return v;
            }
        }, {
            type: 'input',
            name: 'moduleName',
            message: 'Input the name of the module:',
            validate: (v) => {
                v = v.trim();

                if (!validator.pageName(v)) {
                    return `module name [${v}] is invalid, the test [/^[0-9a-z][0-9a-zA-Z]*$/] failed`;
                }

                if (validator.fileExist('modules', this.distMainPageResourcePath) &&
                    validator.fileExist(v, this.distPageModuleResourcePath)) {
                    return `module [${v}] is already existed`;
                }

                return true;
            }
        }, {
            type: 'confirm',
            name: 'isSimple',
            message: 'use default mode?',
            default: true
        }, {
            type: 'confirm',
            name: 'useES',
            message: 'use ES6?',
            default: true
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
            props.moduleName = props.moduleName.trim();
            props.date = moment().format('YYYY-MM-DD');
            if (!props.author) {
                props.author = this.userName;
            }

            this.props = props;
        });
    }

    writing() {
        // 创建 modules 目录
        if (!validator.fileExist('modules', this.distMainPageResourcePath)) {
            fs.mkdirSync(this.distPageModuleResourcePath);
        }

        // 创建 moduleName 目录
        fs.mkdirSync(path.join(this.distPageModuleResourcePath, this.props.moduleName));

        // src/pages/[pageName]/modules/[moduleName]/[moduleName].js
        this.fs.copyTpl(
            this.templatePath('index.js'),
            this.destinationPath(`src/pages/${this.props.pageName}/modules/${this.props.moduleName}/${this.props.moduleName}.${ this.props.useES ? 'es6.js' : 'js' }`),
            this.props
        );

        // src/pages/[pageName]/modules/[moduleName]/selector.js
        this.fs.copy(
            this.templatePath('selector.js'),
            this.destinationPath(`src/pages/${this.props.pageName}/modules/${this.props.moduleName}/selector.${ this.props.useES ? 'es6.js' : 'js' }`)
        );

        // src/pages/[pageName]/modules/[moduleName]/[moduleName].scss
        this.fs.copy(
            this.templatePath('index.scss'),
            this.destinationPath(`src/pages/${this.props.pageName}/modules/${this.props.moduleName}/${this.props.moduleName}.scss`)
        );

        if (this.props.isSimple) {
            // src/pages/[pageName]/modules/[moduleName]/[moduleName].tpl
            this.fs.copy(
                this.templatePath('index.tpl'),
                this.destinationPath(`src/pages/${this.props.pageName}/modules/${this.props.moduleName}/${this.props.moduleName}.tpl`)
            );
        }

        // add module to src/[pageName].html
        let htmlFileCnt = fs.readFileSync(this.indexHtmlFilePath, 'utf-8');
        let writeHtml;
        htmlFileCnt = htmlFileCnt.replace(/<!-- sections -->/, (str) => {
            writeHtml = true;
            return `<section class="${this.props.moduleName}"></section>\n\t\t<!-- sections -->`;
        });
        writeHtml && fs.writeFileSync(this.indexHtmlFilePath, htmlFileCnt, 'utf-8');

        // add module to src/pages/[pageName]/[pageName].(js|es)
        let jsFileCnt;
        let writeFilePath;
        try {
            jsFileCnt = fs.readFileSync(this.indexJSFilePath, 'utf-8');
            writeFilePath = this.indexJSFilePath;
        } catch (e) {
            jsFileCnt = fs.readFileSync(this.indexESFilePath, 'utf-8');
            writeFilePath = this.indexESFilePath;
        }

        let writeJs;
        jsFileCnt = jsFileCnt.replace(/\/\* modules \*\//, (str) => {
            writeJs = true;
            return `${this.props.moduleName}Opt,\n\t\t/* modules */`;
        });
        if (writeJs) {
            jsFileCnt = `${ this.props.useES ? 'const' : 'var' } ${this.props.moduleName}Opt = require('./modules/${this.props.moduleName}/${this.props.moduleName}');\n${jsFileCnt}`;
            fs.writeFileSync(writeFilePath, jsFileCnt, 'utf-8');
        }
    }

    end() {
        this.log(`create module ${chalk.green(this.props.moduleName)} success!`);
    }
};
