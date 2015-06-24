/*!

 handlebars v3.0.3

Copyright (C) 2011-2014 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/

define("handlebars/utils",["exports"],function(e){function i(e){return t[e]}function s(e){for(var t=1;t<arguments.length;t++)for(var n in arguments[t])Object.prototype.hasOwnProperty.call(arguments[t],n)&&(e[n]=arguments[t][n]);return e}function f(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return-1}function l(e){if(typeof e!="string"){if(e&&e.toHTML)return e.toHTML();if(e==null)return"";if(!e)return e+"";e=""+e}return r.test(e)?e.replace(n,i):e}function c(e){return!e&&e!==0?!0:a(e)&&e.length===0?!0:!1}function h(e,t){return e.path=t,e}function p(e,t){return(e?e+".":"")+t}e.__esModule=!0,e.extend=s,e.indexOf=f,e.escapeExpression=l,e.isEmpty=c,e.blockParams=h,e.appendContextPath=p;var t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},n=/[&<>"'`]/g,r=/[&<>"'`]/,o=Object.prototype.toString;e.toString=o;var u=function(t){return typeof t=="function"};u(/x/)&&(e.isFunction=u=function(e){return typeof e=="function"&&o.call(e)==="[object Function]"});var u;e.isFunction=u;var a=Array.isArray||function(e){return e&&typeof e=="object"?o.call(e)==="[object Array]":!1};e.isArray=a}),define("handlebars/exception",["exports","module"],function(e,t){function r(e,t){var i=t&&t.loc,s=undefined,o=undefined;i&&(s=i.start.line,o=i.start.column,e+=" - "+s+":"+o);var u=Error.prototype.constructor.call(this,e);for(var a=0;a<n.length;a++)this[n[a]]=u[n[a]];Error.captureStackTrace&&Error.captureStackTrace(this,r),i&&(this.lineNumber=s,this.column=o)}var n=["description","fileName","lineNumber","message","name","number","stack"];r.prototype=new Error,t.exports=r}),define("handlebars/base",["exports","./utils","./exception"],function(e,t,n){function h(e,t){this.helpers=e||{},this.partials=t||{},p(this)}function p(e){e.registerHelper("helperMissing",function(){if(arguments.length===1)return undefined;throw new i('Missing helper: "'+arguments[arguments.length-1].name+'"')}),e.registerHelper("blockHelperMissing",function(n,r){var i=r.inverse,s=r.fn;if(n===!0)return s(this);if(n===!1||n==null)return i(this);if(a(n))return n.length>0?(r.ids&&(r.ids=[r.name]),e.helpers.each(n,r)):i(this);if(r.data&&r.ids){var o=m(r.data);o.contextPath=t.appendContextPath(r.data.contextPath,r.name),r={data:o}}return s(n,r)}),e.registerHelper("each",function(e,n){function h(n,i,s){l&&(l.key=n,l.index=i,l.first=i===0,l.last=!!s,c&&(l.contextPath=c+n)),u+=r(e[n],{data:l,blockParams:t.blockParams([e[n],n],[c+n,null])})}if(!n)throw new i("Must pass iterator to #each");var r=n.fn,s=n.inverse,o=0,u="",l=undefined,c=undefined;n.data&&n.ids&&(c=t.appendContextPath(n.data.contextPath,n.ids[0])+"."),f(e)&&(e=e.call(this)),n.data&&(l=m(n.data));if(e&&typeof e=="object")if(a(e))for(var p=e.length;o<p;o++)h(o,o,o===e.length-1);else{var d=undefined;for(var v in e)e.hasOwnProperty(v)&&(d&&h(d,o-1),d=v,o++);d&&h(d,o-1,!0)}return o===0&&(u=s(this)),u}),e.registerHelper("if",function(e,n){return f(e)&&(e=e.call(this)),!n.hash.includeZero&&!e||t.isEmpty(e)?n.inverse(this):n.fn(this)}),e.registerHelper("unless",function(t,n){return e.helpers["if"].call(this,t,{fn:n.inverse,inverse:n.fn,hash:n.hash})}),e.registerHelper("with",function(e,n){f(e)&&(e=e.call(this));var r=n.fn;if(!t.isEmpty(e)){if(n.data&&n.ids){var i=m(n.data);i.contextPath=t.appendContextPath(n.data.contextPath,n.ids[0]),n={data:i}}return r(e,n)}return n.inverse(this)}),e.registerHelper("log",function(t,n){var r=n.data&&n.data.level!=null?parseInt(n.data.level,10):1;e.log(r,t)}),e.registerHelper("lookup",function(e,t){return e&&e[t]})}function m(e){var n=t.extend({},e);return n._parent=e,n}var r=function(e){return e&&e.__esModule?e["default"]:e};e.__esModule=!0,e.HandlebarsEnvironment=h,e.createFrame=m;var i=r(n),s="3.0.1";e.VERSION=s;var o=6;e.COMPILER_REVISION=o;var u={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:"== 1.x.x",5:"== 2.0.0-alpha.x",6:">= 2.0.0-beta.1"};e.REVISION_CHANGES=u;var a=t.isArray,f=t.isFunction,l=t.toString,c="[object Object]";h.prototype={constructor:h,logger:d,log:v,registerHelper:function(n,r){if(l.call(n)===c){if(r)throw new i("Arg not supported with multiple helpers");t.extend(this.helpers,n)}else this.helpers[n]=r},unregisterHelper:function(t){delete this.helpers[t]},registerPartial:function(n,r){if(l.call(n)===c)t.extend(this.partials,n);else{if(typeof r=="undefined")throw new i("Attempting to register a partial as undefined");this.partials[n]=r}},unregisterPartial:function(t){delete this.partials[t]}};var d={methodMap:{0:"debug",1:"info",2:"warn",3:"error"},DEBUG:0,INFO:1,WARN:2,ERROR:3,level:1,log:function(t,n){if(typeof console!="undefined"&&d.level<=t){var r=d.methodMap[t];(console[r]||console.log).call(console,n)}}};e.logger=d;var v=d.log;e.log=v}),define("handlebars/safe-string",["exports","module"],function(e,t){function n(e){this.string=e}n.prototype.toString=n.prototype.toHTML=function(){return""+this.string},t.exports=n}),define("handlebars/runtime",["exports","./utils","./exception","./base"],function(e,t,n,r){function o(e){var t=e&&e[0]||1,n=r.COMPILER_REVISION;if(t!==n){if(t<n){var i=r.REVISION_CHANGES[n],o=r.REVISION_CHANGES[t];throw new s("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+i+") or downgrade your runtime to an older version ("+o+").")}throw new s("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+e[1]+").")}}function u(e,n){function r(r,i,o){o.hash&&(i=t.extend({},i,o.hash)),r=n.VM.resolvePartial.call(this,r,i,o);var u=n.VM.invokePartial.call(this,r,i,o);u==null&&n.compile&&(o.partials[o.name]=n.compile(r,e.compilerOptions,n),u=o.partials[o.name](i,o));if(u!=null){if(o.indent){var a=u.split("\n");for(var f=0,l=a.length;f<l;f++){if(!a[f]&&f+1===l)break;a[f]=o.indent+a[f]}u=a.join("\n")}return u}throw new s("The partial "+o.name+" could not be compiled when running in runtime-only mode")}function o(t){var n=arguments[1]===undefined?{}:arguments[1],r=n.data;o._setup(n),!n.partial&&e.useData&&(r=h(t,r));var s=undefined,u=e.useBlockParams?[]:undefined;return e.useDepths&&(s=n.depths?[t].concat(n.depths):[t]),e.main.call(i,t,i.helpers,i.partials,r,u,s)}if(!n)throw new s("No environment passed to template");if(!e||!e.main)throw new s("Unknown template object: "+typeof e);n.VM.checkRevision(e.compiler);var i={strict:function(t,n){if(n in t)return t[n];throw new s('"'+n+'" not defined in '+t)},lookup:function(t,n){var r=t.length;for(var i=0;i<r;i++)if(t[i]&&t[i][n]!=null)return t[i][n]},lambda:function(t,n){return typeof t=="function"?t.call(n):t},escapeExpression:t.escapeExpression,invokePartial:r,fn:function(n){return e[n]},programs:[],program:function(t,n,r,i,s){var o=this.programs[t],u=this.fn(t);return n||s||i||r?o=a(this,t,u,n,r,i,s):o||(o=this.programs[t]=a(this,t,u)),o},data:function(t,n){while(t&&n--)t=t._parent;return t},merge:function(n,r){var i=n||r;return n&&r&&n!==r&&(i=t.extend({},r,n)),i},noop:n.VM.noop,compilerInfo:e.compiler};return o.isTop=!0,o._setup=function(t){t.partial?(i.helpers=t.helpers,i.partials=t.partials):(i.helpers=i.merge(t.helpers,n.helpers),e.usePartial&&(i.partials=i.merge(t.partials,n.partials)))},o._child=function(t,n,r,o){if(e.useBlockParams&&!r)throw new s("must pass block params");if(e.useDepths&&!o)throw new s("must pass parent depths");return a(i,t,e[t],n,0,r,o)},o}function a(e,t,n,r,i,s,o){function u(t){var i=arguments[1]===undefined?{}:arguments[1];return n.call(e,t,e.helpers,e.partials,i.data||r,s&&[i.blockParams].concat(s),o&&[t].concat(o))}return u.program=t,u.depth=o?o.length:0,u.blockParams=i||0,u}function f(e,t,n){return e?!e.call&&!n.name&&(n.name=e,e=n.partials[e]):e=n.partials[n.name],e}function l(e,t,n){n.partial=!0;if(e===undefined)throw new s("The partial "+n.name+" could not be found");if(e instanceof Function)return e(t,n)}function c(){return""}function h(e,t){if(!t||!("root"in t))t=t?r.createFrame(t):{},t.root=e;return t}var i=function(e){return e&&e.__esModule?e["default"]:e};e.__esModule=!0,e.checkRevision=o,e.template=u,e.wrapProgram=a,e.resolvePartial=f,e.invokePartial=l,e.noop=c;var s=i(n)}),define("handlebars/no-conflict",["exports","module"],function(e,t){t.exports=function(e){var t=typeof global!="undefined"?global:window,n=t.Handlebars;e.noConflict=function(){t.Handlebars===e&&(t.Handlebars=n)}}}),define("handlebars.runtime",["exports","module","./handlebars/base","./handlebars/safe-string","./handlebars/exception","./handlebars/utils","./handlebars/runtime","./handlebars/no-conflict"],function(e,t,n,r,i,s,o,u){function h(){var e=new n.HandlebarsEnvironment;return s.extend(e,n),e.SafeString=f,e.Exception=l,e.Utils=s,e.escapeExpression=s.escapeExpression,e.VM=o,e.template=function(t){return o.template(t,e)},e}var a=function(e){return e&&e.__esModule?e["default"]:e},f=a(r),l=a(i),c=a(u),p=h();p.create=h,c(p),p["default"]=p,t.exports=p});