'use strict';

const fs = require('fs');
const path = require('path');
const Generator = require('yeoman-generator');
const getName = require('imweb-git-user-name');
const moment = require('moment');
const chalk = require('chalk');
const esprima = require('esprima');
const esquery = require('esquery');
const estraverse = require('estraverse');
const escodegen = require('escodegen');
const Syntax = estraverse.Syntax;

const validator = require('../../lib/validator');
const launcher = require('../../lib/launcher');

const FLAG1 = '21879';
const FLAG2 = '1';
const DSTR = encodeURIComponent(JSON.stringify(['离线包', '非离线包', '直出']));
const PSTR = encodeURIComponent(
    JSON.stringify([
        'pageStart',
        'domEnd',
        'cssEnd',
        'jsEnd',
        'firstScreen',
        'dataEnd',
        'allEnd',
        'openWebView',
        'loadHtml'
    ])
);

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.distHtmlPath = path.resolve(this.destinationPath('src'));
        this.distPageResourcePath = path.resolve(this.destinationPath('src/pages'));

        this.userName = getName() || getName(true);
    }

    prompting() {
        const prompts = [
            {
                type: 'input',
                name: 'pageDesc',
                message: 'Input the name of the page which display in wang system:'
            },
            {
                type: 'input',
                name: 'pageName',
                message: 'Input the name of the page for [m.ke.qq.com/${???}.html]:',
                validate: (v, ans) => {
                    const dir = path.join(this.distPageResourcePath, v);

                    v = v.trim();
                    if (!validator.pageName(v)) {
                        return `pageName [${v}] is invalid, the test [/^[0-9a-z][0-9a-zA-Z]*$/] failed`;
                    }

                    if (
                        !validator.fileExist(`${v}.html`, this.distHtmlPath) ||
                        !validator.fileExist(v, this.distPageResourcePath)
                    ) {
                        return `page [${v}] is not existed`;
                    }

                    if (!validator.fileExist(`data.page.js`, dir) && !validator.fileExist(`data.page.es6.js`, dir)) {
                        return `page [${v}] does not use page framework`;
                    }

                    this.isES6 = validator.fileExist(`data.page.es6.js`, dir);
                    // launch chrome to add Speed Page
                    const url = `http://wang.oa.com/h5/?f1=${FLAG1}&f2=${FLAG2}&pn=${encodeURIComponent(
                        ans.pageDesc
                    )}&pfn=${encodeURIComponent(v)}&d=${DSTR}&p=${PSTR}#/rum/speed`;
                    launcher.chrome(url);

                    return true;
                }
            },
            {
                type: 'input',
                name: 'flag3',
                message: 'Input the flag3 value[在页面提示的最后一行中可以找到]:',
                validate: v => {
                    if (!/\d+/.test(v)) {
                        return `flag3 [${v}] must be number!`;
                    }

                    return true;
                }
            }
        ];

        return this.prompt(prompts).then(props => {
            props.pageDesc = props.pageDesc.trim();
            props.pageName = props.pageName.trim();

            this.props = props;
        });
    }

    writing() {
        const filePath = path.join(
            this.distPageResourcePath,
            this.props.pageName,
            `${this.props.pageName}.${this.isES6 ? 'es6.' : ''}js`
        );
        const indexContent = fs.readFileSync(filePath, 'utf8');

        // console.log('>>>>> ');
        // console.log(indexContent);
        // console.log('>>>>> ');

        const ast = esprima.parse(indexContent);
        let find = false,
            findSpeedOpts = false;
        let objNode, initReportNode;
        const rightNode = {
            type: 'ObjectExpression',
            properties: [
                {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: 'cgiTotal'
                    },
                    computed: false,
                    value: {
                        type: 'Literal',
                        value: 1,
                        raw: '1'
                    },
                    kind: 'init',
                    method: false,
                    shorthand: false
                },
                {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: 'isdFlags'
                    },
                    computed: false,
                    value: {
                        type: 'BinaryExpression',
                        operator: '+',
                        left: {
                            type: 'Literal',
                            value: `${FLAG1}-1-`,
                            raw: `'${FLAG1}-1-'`
                        },
                        right: {
                            type: 'ConditionalExpression',
                            test: {
                                type: 'MemberExpression',
                                computed: false,
                                object: {
                                    type: 'Identifier',
                                    name: 'window'
                                },
                                property: {
                                    type: 'Identifier',
                                    name: 'isPack'
                                }
                            },
                            consequent: {
                                type: 'Literal',
                                value: `${this.props.flag3}`,
                                raw: `'${this.props.flag3}'`
                            },
                            alternate: {
                                type: 'ConditionalExpression',
                                test: {
                                    type: 'MemberExpression',
                                    computed: false,
                                    object: {
                                        type: 'Identifier',
                                        name: 'window'
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'isDirect'
                                    }
                                },
                                consequent: {
                                    type: 'Literal',
                                    value: `${parseInt(this.props.flag3) + 2}`,
                                    raw: `'${parseInt(this.props.flag3) + 2}'`
                                },
                                alternate: {
                                    type: 'Literal',
                                    value: `${parseInt(this.props.flag3) + 1}`,
                                    raw: `'${parseInt(this.props.flag3) + 1}'`
                                }
                            }
                        }
                    },
                    kind: 'init',
                    method: false,
                    shorthand: false
                }
            ]
        };

        estraverse.traverse(ast, {
            enter: function(node, parent) {
                let m;

                if (!objNode && Syntax.ObjectExpression === node.type) {
                    let hasData = false,
                        hasModules = false;
                    (node.properties || []).forEach(p => {
                        if ('datas' === p.key.name) {
                            hasData = true;
                        } else if ('modules' === p.key.name) {
                            hasModules = true;
                        }
                    });

                    if (hasData && hasModules) {
                        objNode = node;
                    }
                }

                if (Syntax.Property === node.type) {
                    m = esquery(node, 'Property[key.name="initReport"][value.type=/^(Arrow)?FunctionExpression$/]');
                    if (m.length) {
                        // console.log('>>>> find initReport');
                        find = true;
                        initReportNode = node;
                        this.skip();
                    }
                }
            }
        });

        if (!find) {
            // console.log('>>>> not find initReport');
            if (!objNode) {
                this.errFlag = 1;
                this.errMsg = `cannot recognize [${this.props.pageName}.${this.isES6 ? 'es6.' : ''}js] file!`;
                return;
            } else {
                objNode.properties.push({
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: 'initReport'
                    },
                    computed: false,
                    value: {
                        type: `${this.isES6 ? 'Arrow' : ''}FunctionExpression`,
                        id: null,
                        params: [],
                        body: {
                            type: 'BlockStatement',
                            body: [
                                {
                                    type: 'ExpressionStatement',
                                    expression: {
                                        type: 'AssignmentExpression',
                                        operator: '=',
                                        left: {
                                            type: 'MemberExpression',
                                            computed: false,
                                            object: {
                                                type: 'Identifier',
                                                name: 'window'
                                            },
                                            property: {
                                                type: 'Identifier',
                                                name: 'speedOpts'
                                            }
                                        },
                                        right: rightNode
                                    }
                                }
                            ]
                        },
                        generator: false,
                        expression: false,
                        async: false
                    },
                    kind: 'init',
                    method: false,
                    shorthand: false
                });
            }
        } else {
            estraverse.traverse(initReportNode, {
                enter: function(node, parent) {
                    if (
                        Syntax.ExpressionStatement === node.type &&
                        node.expression &&
                        Syntax.AssignmentExpression === node.expression.type &&
                        node.expression.left &&
                        Syntax.MemberExpression === node.expression.left.type &&
                        'window' === node.expression.left.object.name &&
                        'speedOpts' === node.expression.left.property.name
                    ) {
                        // 找到 window.speedOpts = ... 语句
                        // 直接替换 window.speedOpts 的值
                        node.expression.right = rightNode;
                        findSpeedOpts = true;
                        this.skip();
                    }
                }
            });

            if (!findSpeedOpts) {
                // 没有找到 window.speedOpts = ... 语句
                initReportNode.value.body.body.push({
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'AssignmentExpression',
                        operator: '=',
                        left: {
                            type: 'MemberExpression',
                            computed: false,
                            object: {
                                type: 'Identifier',
                                name: 'window'
                            },
                            property: {
                                type: 'Identifier',
                                name: 'speedOpts'
                            }
                        },
                        right: rightNode
                    }
                });
            }
        }

        const newContent = escodegen.generate(ast);
        fs.writeFileSync(filePath, newContent, 'utf8');
    }

    end() {
        if (this.errFlag) {
            this.log(`[Error] ${this.errMsg}`);
        } else {
            this.log(
                `add speed report config [${chalk.green(
                    FLAG1 + '-' + FLAG2 + '-' + this.props.flag3
                )}] to page ${chalk.green(this.props.pageDesc)}[${chalk.green(this.props.pageName)}] success!`
            );
        }
    }
};
