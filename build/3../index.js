webpackJsonp([3],{

/***/ 104:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;
	var sourceMap = obj.sourceMap;

	if (media) {
		styleElement.setAttribute("media", media);
	}

	if (sourceMap) {
		// https://developer.chrome.com/devtools/docs/javascript-debugging
		// this makes source maps inside style tags work properly in Chrome
		css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */';
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}


/***/ }),

/***/ 22:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(287)

/* script */
__vue_exports__ = __webpack_require__(293)

/* template */
var __vue_template__ = __webpack_require__(295)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/login.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-8e5f6ac0", __vue_options__)
  } else {
    hotAPI.reload("data-v-8e5f6ac0", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] login.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 23:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(296)

/* script */
__vue_exports__ = __webpack_require__(298)

/* template */
var __vue_template__ = __webpack_require__(299)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/main.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-740e0ed2", __vue_options__)
  } else {
    hotAPI.reload("data-v-740e0ed2", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] main.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 24:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(300)

/* script */
__vue_exports__ = __webpack_require__(302)

/* template */
var __vue_template__ = __webpack_require__(303)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/home.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5793faf8", __vue_options__)
  } else {
    hotAPI.reload("data-v-5793faf8", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] home.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 25:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(304)

/* script */
__vue_exports__ = __webpack_require__(306)

/* template */
var __vue_template__ = __webpack_require__(307)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/sales/sales.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-45e9b640", __vue_options__)
  } else {
    hotAPI.reload("data-v-45e9b640", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] sales.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 26:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(308)

/* script */
__vue_exports__ = __webpack_require__(310)

/* template */
var __vue_template__ = __webpack_require__(311)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/sales/salesDrugs.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-2b1ffb23"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2b1ffb23", __vue_options__)
  } else {
    hotAPI.reload("data-v-2b1ffb23", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] salesDrugs.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 27:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(312)

/* script */
__vue_exports__ = __webpack_require__(314)

/* template */
var __vue_template__ = __webpack_require__(315)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/allot/allot.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-b4568598", __vue_options__)
  } else {
    hotAPI.reload("data-v-b4568598", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] allot.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 28:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(316)

/* script */
__vue_exports__ = __webpack_require__(318)

/* template */
var __vue_template__ = __webpack_require__(319)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/allot/allotDrugs.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-38f1a6a2"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-38f1a6a2", __vue_options__)
  } else {
    hotAPI.reload("data-v-38f1a6a2", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] allotDrugs.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 287:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(288);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-8e5f6ac0!../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./login.vue", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-8e5f6ac0!../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./login.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 288:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.mask{\n  position:absolute;\n  width: 100%;\n  height: 100%;\n  top:0;\n  bottom:0;\n  left:0;\n  right:0;\n  background-color:rgba(0,0,0,0.7);\n  z-index: 10;\n}\n.mask .el-progress__text{\n  color: #ffffff;\n}\n.mask > .download_title{\n  position: absolute;\n  height: 40px;\n  width: 100%;\n  top: 50%;\n  margin-top: -140px;\n  /* margin-top: -200px; */\n  font-size: 18px;\n  text-align:center;\n  color: #ffffff;\n}\n.mask > .el-progress{\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  margin-top: -84px;\n  margin-left: -64px;\n}\n.code{\n  position: relative;\n}\n.code .img_div{\n  position: absolute;\n  overflow: hidden;\n  right: 0px;\n  top: 0px;\n  height: 40px;\n  cursor: pointer;\n}\n.code .el-input{\n  width:180px;\n}\n.group input{\n  background: url(" + __webpack_require__(289) + ") 8px center no-repeat;\n  background-size: 20px 20px;\n  text-indent: 20px;\n}\n.code input{\n  background: url(" + __webpack_require__(290) + ") 8px center no-repeat;\n  background-size: 20px 20px;\n  text-indent: 20px;\n  width:180px;\n}\n.password > input{\n  background: url(" + __webpack_require__(291) + ") 8px center no-repeat;\n  background-size: 20px 20px;\n  text-indent: 20px;\n}\n.username > input{\n  background: url(" + __webpack_require__(292) + ") 8px center no-repeat;\n  background-size: 20px 20px;\n  text-indent: 20px;\n}\n.login_operation_title{\n  height: 40px;\n  line-height: 40px;\n  font-size: 18px;\n  text-align: center;\n  background-color: #409EFF;\n  border-top-left-radius: 4px;\n  border-top-right-radius: 4px;\n  color: #fff;\n}\n.login_operation{\n  background: #fff;\n  height: 390px;\n  border-radius: 4px;\n}\n.login_div{\n  width: 360px;\n  height: 390px;\n  position: absolute;\n  left:50%;\n  top: 50%;\n  margin-left: -180px;\n  margin-top:-210px;\n}\n.login_title{\n  padding-bottom:20px;\n  font-size: 22px;\n  text-align: center;\n  color: #fff;\n}\n.login{\n  background-size: cover;\n  background-repeat: no-repeat;\n  background-position: center center;\n  background-attachment:fixed;\n}\n", ""]);

// exports


/***/ }),

/***/ 289:
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAKT0lEQVR4Xu1afZAcRRV/b3ZzsJtoEiqKCoETg0oREgxaKB8qFgmFSBCRiAIiwapggdG72+meTUQHEW+6Z+9ShKJICgnRSkSDWKKgWEQxCVQsoRQCAiUfBvmWEHNi9g5v6We9syc13N3uzOztwVWS989Wbb/ufu83rz/e7zXCPi64j/sP+wHYHwH7OAL7l8A+HgATYxMkIuzp6ZlnjGkHgHcS0UEA8IrjOC85jvPXrq6uv43Xh3pLl0AQBMc4jlMCgE8DwIx6ThLRHwHgB4VCYd3SpUtfayUYbwkAvu8fWCwWrwAACQC5tA4R0bOIeGV7e/tNixYtej1tv0Z6LQWgp6fn/bVabQ4AHIqI+alTp16zZMmSwbgBQRAcjYi3IuIHov+J6AVEvAcA/kxEzyDiy0R0MAC0I+LpAPCx+BhEdI8xZmG5XP7XWEEYMwC+77cVi8UlAPAVAJg3zNBzpJQ/j/4LgmCR4zg/AoAD7H+7iKhTSnlTI0e6u7uPyOVyAgC+GkUMET1ljJlfLpefGgsIYwIgDMOziehaADhkFCNeNMYc73neP7hNKXUUIv4l5vymSZMmfbGjo+OFtA50d3fPchxnAyJ+iPsQ0XZjzLyxRELTAARB0Ok4Tk8sjP8LAOuJaE0+n3+sVCrtiNp83y8WCoUHEXGWNXxlf39/h+/7Jq3zsbE44m4AgC/b/7a2t7ef3Oye0BQASqmLEHFtzPjV+Xz+qs7OzudGc0hrfTUALLNtG13XXYCIlNX5SH/16tWTdu3atRkRP2oB/YaUcmUz42UGoFKpHGeM2QoAkzgKjTFLPM/jLzKqBEFwmOM4fI7zut9hjJnleV5fM8bG+/T29h4yODj4FCK2EdGrxpjDm1kKmQFQSt2HiB+2xrhCiEojZ+Jfn4gWJ214WYBRSq1AxG+OJQoyARCG4VlE9Atr5K+EEAuTDNZaPwQAs4moTwgxfSyhP3wurfW7AOB5AEAiuktKuSDJnuHtmQBQSt2CiJ///wZMR0spH200oVLqPYgY7QvrhBAXZjUwSV8ptQkRPw4Ar1Wr1YN8368m9Ym3pwZgw4YNue3bt78KAAUi+pOU8vikicIwPJW/DOsh4qWu665O6pO1XSl1BSJ+l/sZY+Z4nscRl1pSA1CpVD5ojBn64kTULaWMdvW6kw07Lc4UQtye2rKUilrrxQBwo1U/XQhxZ8quQ2qpAQjD8JNEdHeWr6m15kQntH1OcF2XT4+WilJqISLeZue40HXddVkmSA2A1vocAPiZHfw8IcRPkyZSSl2KiNfb8PyM53l3JPXJ2q6UuhgR14x7BGitOWWNHLhcCHFdkrH2qjyUCxDR16SUq5L6ZG3XWn8LAK6yIB/red6DWcZIHQFBEMx1HOcBO/i1QoilSRPxZaVWqz1r9W4VQvAJ0lLRWvMmeyoAvD558uRpl1122X+yTJAaAN/3nWKxyEcM3+ieFEIM3euTRCn1CCIeBQD91Wp1RtZjqtH4vb29hVqtxidTjoh+J6VkIDJJagB4VKXUbYgYXX5OEkLcmzSbUqqMiN+3emUhRJDUJ2271ppTZGXDv8vzvN60fSO9TACEYXgmEf3Sdv61EOKMpAkrlcoMYwynxHx/6Gtra2vv6OjYldQvqd1esp6w476pucC9iHiCNTAxF2A9rTXnC122T8uzQQBIZcdooGaKAOvMkQDAO20hTTbIfcIwnGyM2YaIR1gjrqlWq51N8gH5YrHIDNIFPBYR3d/f33+i7/vMR2SWzABYEOK3L/6rIR9gQZhtjOEcfrq1chMRXSCljE6JROPDMHwvEd0CAMdZ5RcdxzkmTr4kDjJMoSkA7IZ4OSIyCTE0BhHVLLF5FxFx/r9dSnl/fL4wDOcYYzYi4jtsnwG+KOXz+Z56ZArr8QlUKBR4Pt5AOfJ4vudzudz8Uqn0SFan4/pNA2Aj4RNEdDsiThl1fSGe4rruH+JtlUrlcGMM5wSzo/+JyCDiZgD4bZwVRsTDieg4m+1xsSSSbYODgwuWL1/+0lic575NAcCUVF9f3/lEtDzi+eoYMmoCxExyoVBYhYgXZ3GAiF5BxKur1ep1za754fNlBkApxTzcGnu52TMehyQAMOu7g3l9RHxiePq7cuXKAwYGBj7LFDoRMS/opASAw3wVEa2VUvLFp2WSGgC7DpmC+nps3VcRcR0i3rx79+7N9XZ1rv1VKpXzjTEaEd89zHoudXHp60kAeJaZFkQ0RLQTETnEHxdCRFfwljkeDZQKABvyvPueZTuyneva2tpkEq9vcwjO16OdmzcwXvN3GGOuHxgYuNv3/YGWe5ZywEQAfN/nc5ezwIhv2wkAC9Ncg5lDNMb8BBEPjO36N3A9oVQqPZ3SxnFVawgAR2MYhpz3n2ut4DA9TQjBvw0lDMPvEJEfU9qYy+UWd3V1PZPUt9l2XqZTpkyZmQXchgBorbsBwLMGPec4zrFpLh1Kqe8h4nL71Tk9XdpKOrweQEqpOxGRI1Uk0fWJe4DlAB+2qWYtl8udUCqV7kv6OnHmiIj4NFgwnptY3B6l1L8R8W18T+KoFULcmmRv3QjQWnO5+kT7FUtSyj11wHqDhmF4PBFtspzBbiL6SBJ1nmRglvY4BUdEVWPM3HK5zBljXRkVAK31yQDANzOWv1er1VlJiYstk3PEcLLEJbMzPM/7TRYHWqGrlFqLiBfZD/dof3//vEanTD0A1gPAl3gQY8wXPM/bkGSc1vpKAPi21QuEEOWkPuPRbgunv0fEk+z4WgjBL1FGlREABEEwFRH5NpfnpEZKueclR71BtNZHEhFTX3kAeLq9vf19zZarWwFKGIb80OpxAHg7c4WO48yplzSNACBe/yOiUErJtFND0VpzdZhfb/Al52wpZVQ/TOo6bu1aaz69+BRjm9ZLKYf4g+EyAgClFF9XXVZExPmu625sZGVvb+9BtVqN8wAmS7cKISK2aNycSzOwfYjFG+AhfPMEgJlSSrbzDTIaAFt4/RDRQKFQmJb0LC1OeqYBLI3xrdLRWnNUDr1dICJPSjlEoMZlBABaayYwZwLAY0IIprMbilLqAUScCwA7Xded0cryd9LcSe28nzmOwy/J2M9tQgi2MzECdiNikeuAUspPNZpkxYoV0wYHB4eeqhHRjVLKoX1gIolSamv0lAYRD3Zd9591I8Ce5dFLzB8LIc5v5IxS6nP85s8CcK6UMqodThgM4qUzABhR03zDErDVH37QwC8vLhFCREXHUR2K0925XO6w8Ux0mkU0CIKTHMfZYj/SlVLKeII2khLr6emZaYw5NE0pWyl1MyKex68zhBBDKe9EE8skDz2mHO04TOQDEpYA37hO4euyECLi/CcUBpbMiWoGI6pZYwXgYUQ8mogeklLyG+EJKUoppte4HrFFCMHvifbIWAHg/Ps0rhdKKSO6bMKBEJXQ+YWblPLslgHQ3d09PZfLXVKr1X64bNmylyec59agyE7HcdYOJ3TGFAET1eEsdu0HIAtae6Pu/gjYG79qFp/2R0AWtPZG3f8BgT+jfRIuiO8AAAAASUVORK5CYII="

/***/ }),

/***/ 29:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(320)

/* script */
__vue_exports__ = __webpack_require__(322)

/* template */
var __vue_template__ = __webpack_require__(323)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/allocation/allocation.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-21074fa6", __vue_options__)
  } else {
    hotAPI.reload("data-v-21074fa6", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] allocation.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 290:
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAGd0lEQVR4Xu1bS1bcOBTVMyVPO1lByAo6WUFgBcAKAisIDLAOI4oRx6oBsILACgIr6GIFXVlBwwoapoCtPreOXMdWSZb8qSKpRpOcUNbn3ffR0/sQW/I4Ozt79/Ly8i3P810iWtfbT5RS50KIqyUfh9EyNxyNRht5nn8vEW5uP2GM7SVJgn+XMpYGwGg0OlZKDUOoIqLh4eHhSci3Xb9ZOABSyk+Mse+MMfxbGUqpn0T0wBj7YiFkKdKwMAAKXVdK7TPG3pUJVEo9MsZ2hRDX+DtAUkpdEtGfFiAusyw7OTo6uuvKbdv83gHQHP8GAh0HvuWcbx8cHIDzlZGm6ZCIjh3zFgJELwCA209PT1tEBG7PiToI0lwfCiHO6zgJQwlpYIx9cAGhlBrHcXxjA7GplLQG4PT0dD2KIujuNhFteza+ZYzth1p3DSjA3CeiP2rWxvU5jqJoPBgMbtsAEgQAiF1bW/tAROAO7m5w2cppQ9eviOg8lHCTUA3EORF9DeGsUgp2YhJF0RQYzvlPHyhOANI0xabg7oZpxDyHuYdTE8fxpW/zEKLwjZY22IcgIIx1x0qpi8LgmnvOAQDUn5+ffzDGQHjouGeMwaJftuV2yEZaInCugjEuO2FbDmfb8wKQpumPAJ3GOkshug4YrZpQS4DyyXGNzpZQSh2YRrgiAfoK+9vYFIRCp+CYTIjobpFcDpEE3y2S53lhoyApZSP6kCTJ+/L8CgBpmsLqnpU+uOGc7/aly12JazpfS8jYuFI/lxloAlBxRIho8/DwEAv8tkNKCb8Djlkx8NiCnzEd/wcA4JHiLTIdSqkTIcTsUbbyAGjP8q83AN4k4E0F3mzAShlB7bR9ybLspi5YspJGUEqJe72IKyCwsunyTlcOACkl7nQz2jROkmTT5q2tFAAO4qfRJiFEJe5YgLEyALiItxm2siSsBAAe4q+EEK4ALPutAdDBGbixrvDbRZIkiB06x1IAwLNzMBh8zfP8rq/8XgDxlVedCwELAJWgSOfHkGWDayHETpf3c1/E4wzm+cwnfmcApJSIF5ipLWv8LQSUPol/TQCwd2MQ6vKIGrwgsS8DLaWsxAN6l4A0TRF3QxTZNoJB0MTD4M3d57jnEZ5vE4s00229AwCqfTk9Wzja4BKsfO/EYw8zJMY5f1+OcXa2AQUhaZoiu+tKXDhFd1GcL85VtlE2j9EEoCLOZvzMZ8SagqAtNNSnV7E3pEuV/n+bJEkl4VMBQIeR/6mb0BcIpnEqr6sLJ3bb6LxFtcp5jjnHaS41lqbpQymZMJdI8AGg9Q5psi3Ht0V6ahapNYmP43ijj1yEmedQSu2YOUIbABVdtk3ygaBzeGNfqspcB5zvi3gbI0wDiG9sAJh2oPax4QKjKQh9E68dqn+L82F9IcTcm8KaHjfUgNmQ80kBfm8AgrNsJmQf2zemjXEZdBcAphpUsilNDuUDQSnVSsJ8Z5BSwq+YWfwsyz7aYodWACy3wQPn/GNbw6QLHJBZrpS7LIp48/wu8bfagBrHxvv2ruOKdnhwOxRFDZ3Wq9vL4o84HTFniYxFCrBnJbXsE0Pb79r5wfW6kHJYC/ed8cJaCdDXiJlaniRJ8rkN4cuaY3Lf583WVolpA3Zn6O7CRLcrSJbgzGMcx+t1tstbJmd77v6qhRNSSri9s7veVhNkguwFwOHa1mZjunKyzXzLk/w+SZKiH8G5ZBAA2quC0SqXpU0455ttr8Y2RLrmmKI/NW6B5T1BAGgpQEU3/PvyXf7qIDjiCcF2KhgADUIlvqY58mog2AKoTd8UjQD4lUBwEP+IGsEmvQWNAXD4B/jzJMuynSabt7UDrtB5qN6X920FABZwhL8WfjvUhM4bh8y9nqCPQ5bK0mIKegMufPOb/q59EkSSzBhiK+I7A1BjE/DTOMuyvT5UQnukx7ojxcStNfG9AFBzReInqMSwizSgbwFNF7bGqyiKtruW8ra2ASYb9CsMNbhzLXC6kwP9QsGdobphA7XLc95cX1Hj3iSgDEZdlkgDcU1EV7bn8Gg02srzfIOI4G9YS14YYxec82FfHmhvElAGoU4aDMkpKtFBbG0PErgeRdF+V5E3JXchABSbaKsN/W3S2mKeEQ0bsCOzEvemt0fd9wsFoNhYR2jRWudKltjOeIP+QVezU18gLAWA4rA6ODpteEL7nZE4QW/htC2Hc37dl477gPoPRVa6ff30grgAAAAASUVORK5CYII="

/***/ }),

/***/ 291:
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEKUlEQVR4Xu1bXVLbMBDWGswr9ASlJ2g5AeEEpDeAE0AeIg9PhSfGykPCCcgNgBM0nKDlBIUTNH0N2NvZjExFJkQrW4K4sWeYYbAkdr/9tNL+GMSKP7Di+osGgIYBb4hAr9fbz/O8BQBfEHEbALbp3yPiPQDcI+LPKIpG3W735q3ECr4F+v3+1tPT0xEiHgshtpiKjQFgsL6+ftHpdMbMOaWGBQWg1+u18jy/LCytrf0HAEZkbVNizQpix2bxd2JGFEWH3W53VEo7xqRgACilDoQQl4YMt4g4SJLkepFcaZq2AYDYsmuMO5RSDhn6OA8JAoBSaiCEOCosHkVR29WKmj3XBiMupJQEjNfHOwCm5RHxLs/z9snJyX0ZqZVS5CyHAPBZz/fOBK8AkMBCiB9a2Ic4jr9UdWLkRB8fH8lffNTr7kgpX/iPMuAWc3wD8F0I0UJEcnQtX4JqJoz0dhhJKfeqKP3C+fpaiPYsIhIAdK6fJUly6mttWidN01MA+Ea/A8Ceq095TRZvDFBKkXffF0J4of6swLQVJpMJXZjomLyRUrZ9AOwTANQCBfHWtLZ5ukgpvcjuZRGT/kIIr07KtLL5f3xtAy8AmPvTl2Veo7dSaso0X36mAcCHIzEYcCulbPlYcwEDKC7YXVYGNAA0DGi2QOMD/n8neH5+vr22tlZEZ+SwKflBPxSleY/ZZ04EyjVQ1EkJkuckSZZlD2XCbqd7gL6JUUAS1MoVjlGKGM9cAiU2AHNSXBXkDD6VnThhAWAmOijWF0IMdPo6WLLSBSKdPiNWHhcptCzLPnG2BBeAItQluYIFOy5Kzxs7k5FihcxcAIKHulWVL+a7hsxWALTH/6UjsK+2tLYvRcquo9PqVzQ/juMPtpykFYAQMXhZ5TjzXOVtALCh6oqobb3Q713lbRhgs4grorb1zPf62NqM4/jO5qy467rK+y4M0J6aCqdFuXyMiIc+TpilB0Afq1Q+m+0VGGdZtsO5vS1iw9IDYGaQZxXxkeerNQBCiMpFlaUHYFFUiYidJEko3i/9LD0ApJlSapraNrWkXoIkSSjRUempBQDz/ICP/U/INQAYZXpO/fC97gHPtf6C7yvFgFccITuNVet7AAmv+35+m4pwYneOd6yFDyBF9HWYUulU6h76uAbXxglyLFl2TG0YUFZB27wGgDocgzYrVnnfMKBhwL+GTS83QR28FIURL5eVKhS3zU3TlMpjfRrH6VizXoU1ANTtTeXwyvG6TYGq79M0vQIA6iJ9kFJOP8lZ9LAAmInelrk2SN8oTPMJ3NiCBcCclnXq4S/1DYDNImXfIyJZvcgnsPuVWQDobTD78UJZWYPOo8QKABxwW/XZABRBzGQymbbDGF9xBFWIuzgpTi0zGxsbQ5cagxMAXGHqNK4BoE7WCiHryjPgL3M+j24SyQhuAAAAAElFTkSuQmCC"

/***/ }),

/***/ 292:
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAF30lEQVR4Xu1bTVYjNxCusunehpxg4ASBEwROMOQEgRMMLCw9VsOseJIXwAlCThDPCQIniOcEAydIsoVxK6/6SX6K3O1Wq9R2eC/aeOGWWvWp6lP9NcKGh9b6AAB+RMTd8NXGmIfFYvF8eXn5tKlt4SZeNJ1O31dVdYqIRwCwInjDHuYERlVVd0ODMSgASqmfAeAKEfcYQN8vFotPQwExCADX19d74/H4FwCgE/fHZwCYIeLTZDJ58P+4ubnZ/fbt24Ex5sQYc4SIPwRzz4UQdwwgG6dmB2A6nR4ZY35zqm6M+RsAbsuyvL24uPgrVgDLFbfEF26OMWZWluVZn3W63pcVAK31KQDQydfDGPNrWZbnnA1bQO8B4J1ddl4UxTFnTR+UbADYE/vDW/xMCEEbZw8yj9fX15mnDdlAyAKAtXkS3jH8oRBizpY8WEApdY+IRKw07oUQZ9x3ZAFAa/27R3jZTr5JOKXU3BEkIh6HZNoXEDYAvt2TzUspiQcGG9YcSLveGWOeyrI85PABGwCl1Fe654nty7Lc42wmFrUA9AspJd0WSYMFQLCRT1LKq6RdJEzSWpO7XGuBlHI/YYl6ChcAYub3tJAQgrVWXwEC8H+SUtJeeg/WprXWxr7xsxDipPfbGRMsF/xpl7gTQpynLJcMgFLqBBHJ46MxKPO3Caa1dho4F0IcbhoACnI+2pcOcu93CaSUWu6hKIrvUwiYowFLp2TT9u+A8Xkg1SdIBkBrTdFcHahsCwAbJ5ATBv8DkOgVJmuA75dvSwN8It64BvgEtFgs9ofK2Kwjwm2T4PIaTEW/i+W7/ndaSG64lDIm17iyZLIJ2BD4K9cR6RKyQwPqOAQAkh2xZABoYy405frjKSAECZhkR4wLwDki3nCuoRThLfhLP4TDQSwAyB9/eXl5QsTvAOBBCHGcKlCfeb75cXMQLABo01prisU/bDIm8DNQnNOvNbcP8k3PBlpAae/jIfKB7t3+1QcAyVGgW48NgLVHPzLMlrENAfcdH2PMFykl1RlZIwsAFgQ/OswOgg18iHB36d6nOmMOTcsGQMjMAJDNHJRSN4hYJzxyCp+FAxrU1M/d09/JxU1SeQAg4eviam7hBwHA3gynxphbez06jAiY2WQyoQJp67BXHOUZKb2+tHGy+aqqTnLHHFlNwJeKBBmNRlQJDqu89FhdGUbE+reqql1EJGHJn/8Xsbni6lAZ58EAcGBorSlx2TtQSa0q970SBgHA1vo/2K6Q2OaIZwB4os6Q0Wj0wC15xQKRFQAnuDGGGDs8dRJwRoHTaDSqC6c7OzvzlERmrHAxz2UDYDqdfgwFJ+KyHSGzHHd2jEB9n2EDYFmb6gM+eT0i4tWm1Liv0P7zLAC01hQEUT3QqfubEdyBkAyA1ppaYepSuGXsK06VNvUUSQNpbqp/kARAIPwXRDzdho3b+iCl5UgDk7JCvQHwhQeAx6IoTrbF5EEoTpp4K6W86KNNvQDwkx/cTEyfTa57lnKD5Dt4bnevHEE0AEELXHIWNpfgods9Ho/JrXatdNHmEAWAzcBSDY5s7bkoioNtqX0bgIEmRIfisQD4XWBbKYXHaE7QsxDVM9AJQJCGYjUkxQjBfcZrmiBS7NxvDACu+vIshIgNbLhyJM8Pk7RFUeyvM9e1ACilloWP1Hs2WRLGxICw1xJiFwDu9B+FEGHrO2OLw091bXQAsJYLWgHwuy/e0uk7aGPL960AODLhlJ6HP+f2NwTls1YybAQgVw/eNgGgd3s3Qqvj1ghAcJ/+Z+/9LoB9Em9r42kDwOX238TV1wZEYAaN7bRtALgO8MHb37tOkfu/dxs0BkkrAAStL9FBBXejQ833utkar8MVAHz759behxKqz7pdnWRNACyrvNvq/+sjYNezQSyzwgMrAHhXx5vz/prACBy6FR5oAoC+/qIsy5snQAeI913DyqE2mUB9BRpjkr/C6FLLTf/vfV7TbQI2nDxK/QRl08LFvM/2Gew1pe3/AQgxXG7Lbb4PAAAAAElFTkSuQmCC"

/***/ }),

/***/ 293:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _package = __webpack_require__(294);

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  data: function data() {
    return {
      session: null,
      datetime: "",
      tips: "new",
      downloadPercent: 0,
      login: {
        username: "",
        password: "",
        machineCode: "",
        code: "",
        version: _package2.default.version,
        remember: true,
        groupCode: ""
      },
      ipcRenderer: "",
      rules: {
        groupCode: [{ required: true, message: '请输入组编码', trigger: 'blur' }],
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      },
      bg: "img/login.png",
      height: ""
    };
  },
  activated: function activated() {
    var _this = this;

    this.getCookies("login_message");
    this.refreshCode();
    this.login.code = "";
    this.datetime = new Date().getTime();
    this.height = $(window).height();
    var that = this;
    $(window).resize(function () {
      that.height = $(window).height();
    });

    this.ipcRenderer = window.require('electron').ipcRenderer;
    this.ipcRenderer.send("checkForUpdate");
    this.ipcRenderer.on("message", function (event, text) {
      _this.tips = text;
    });
    this.ipcRenderer.on("downloadProgress", function (event, progressObj) {
      _this.downloadPercent = progressObj.percent || 0;
      _this.downloadPercent = Math.round(_this.downloadPercent);
    });
    this.ipcRenderer.on("isUpdateNow", function () {
      that.ipcRenderer.send("isUpdateNow");
    });
  },
  deactivated: function deactivated() {
    //组件销毁前移除所有事件监听channel
    this.ipcRenderer.removeAll(["message", "downloadProgress", "isUpdateNow"]);
  },
  mounted: function mounted() {
    this.session = window.require('electron').remote.session;
  },

  methods: {
    setCookie: function setCookie(name, value) {
      var Days = 60;
      var exp = new Date();
      var date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60;
      var cookie = {
        url: this.$bus.data.host,
        name: name,
        value: value,
        expirationDate: date
      };
      this.session.defaultSession.cookies.set(cookie, function (error) {
        if (error) console.error(error);
      });
    },
    clearCookies: function clearCookies() {
      this.session.defaultSession.clearStorageData({
        origin: this.$bus.data.host,
        storages: ['cookies']
      }, function (error) {
        if (error) console.error(error);
      });
    },
    getCookies: function getCookies() {
      var _self = this;
      this.session.defaultSession.cookies.get({ url: this.$bus.data.host }, function (error, cookies) {
        if (cookies.length > 0) {
          for (var i = 0; i < cookies.length; i++) {
            if (cookies[i].name == "login_message") {
              var temp = JSON.parse(cookies[i].value);
              _self.login.username = temp.username;
              _self.login.password = temp.password;
              _self.login.remember = temp.remember;
              _self.login.groupCode = temp.groupCode;
              break;
            }
          }
        }
      });
    },
    refreshCode: function refreshCode() {
      this.datetime = new Date().getTime();
    },
    submitForm: function submitForm(formName) {
      var _this2 = this;

      this.$refs[formName].validate(function (valid) {
        if (valid) {
          var _self = _this2;
          $.ajax({
            type: "post",
            url: _self.$bus.data.host + "/iae/login/login",
            data: _self.login,
            success: function success(res) {
              if (res.code == "100001") {
                //验证码错识
                _self.refreshCode();
                _self.$message.error("验证码错误");
              } else if (res.code == "100000") {
                _self.refreshCode();
                _self.$message.error("用户名或密码错误");
              } else if (res.code == "100002") {
                _self.refreshCode();
                var temp = res.message.startTime.substring(0, 10) + " - " + res.message.endTime.substring(0, 10);
                _self.$message.warning("使用期限为：" + temp + "。请续费。");
              } else if (res.code == "100003") {
                _self.refreshCode();
                _self.$message.error("该电脑没有授权登陆");
              } else if (res.code == "000000") {
                sessionStorage["user"] = JSON.stringify(res.message[0]);
                _self.$router.push("/main");
                if (!_self.login.remember) {
                  _self.login.password = "";
                }
                _self.setCookie("login_message", JSON.stringify(_self.login), 1000 * 60 * 60);
              }
            }
          });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }
  }
}; //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 294:
/***/ (function(module, exports) {

module.exports = {"name":"IAE","version":"1.12.1","description":"iae","main":"main.js","scripts":{"build":"node start-electron.js","start":"electron --inspect=5858 .","asar":"asar pack . dist/app.asar","dist-win":"electron-builder --win --x64","dist-win-32":"electron-builder --win --ia32","rb":"cd node_modules/electron-prebuilt && node install.js","r2b":"./node_modules/.bin/electron-rebuild -w sqlite3 -p","rebuild-sqlite3-win64":"cd node_modules/sqlite3 && npm install nan --save && node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-win32-x64 && node-gyp rebuild --target=1.8.2 --arch=x64 --target_platform=win32 --dist-url=https://atom.io/download/electron/ --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-win32-x64","rebuild-sqlite3-darwin":"cd node_modules/sqlite3 && npm install nan --save && node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-darwin-x64 && node-gyp rebuild --target=1.8.4 --arch=x64 --target_platform=darwin --dist-url=https://atom.io/download//atom-shell --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-darwin-x64","rebuild-sqlite3-win32":"cd node_modules/sqlite3 && npm install nan --save && node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-win32-ia32 && node-gyp rebuild --target=1.8.2 --arch=ia32 --target_platform=win32 --dist-url=https://atom.io/download/electron/ --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.8-win32-ia32","packager":"electron-packager . 'IAE' --platform=darwin --arch=x64 --icon=favicon.icns --out=./dist --asar --app-version=0.0.2 --ignore='(dist|.gitignore|README.md|webpack.config.js|iae.db)'","packageWin32":"electron-packager . IAE --platform=win32 --arch=ia32 --icon=favicon.ico --out=./dist --asar --app-version=0.0.1","packageWin64":"electron-packager . IAE --platform=win32 --arch=x64 --icon=favicon.ico --out=./dist --asar --app-version=0.0.1"},"repository":"https://github.com/alvyang/iae.git","keywords":["Electron","quick","start","tutorial","demo"],"build":{"appId":"com.lvyang","copyright":"iae","productName":"IAE","files":["build/**/*","img/*","package.json","main.js","index.html","favicon.ico"],"publish":[{"provider":"generic","url":"http://139.129.238.114/download/"}],"win":{"icon":"favicon.ico","target":["nsis","zip"]},"nsis":{"oneClick":false,"perMachine":true,"allowElevation":true,"allowToChangeInstallationDirectory":true,"createDesktopShortcut":true,"runAfterFinish":true,"artifactName":"${productName}-setup-${version}.${ext}"}},"author":"GitHub","license":"CC0-1.0","devDependencies":{"asar":"^0.14.3","babel-core":"^6.18.2","babel-loader":"^6.2.7","babel-plugin-component":"^1.1.0","babel-plugin-transform-runtime":"^6.15.0","babel-preset-es2015":"^6.18.0","babel-preset-stage-2":"^6.18.0","babel-runtime":"^6.18.0","child_process":"^1.0.2","css-loader":"^0.25.0","echarts":"^4.0.4","electron":"^1.8.7","electron-builder":"^20.28.4","electron-prebuilt":"^1.4.13","electron-rebuild":"^1.8.2","excel-export":"^0.5.1","exports-loader":"^0.6.3","expose-loader":"^0.7.1","express-session":"^1.15.0","file-loader":"^0.9.0","fs":"0.0.1-security","getmac":"^1.4.0","imports-loader":"^0.6.5","jquery":"^3.3.1","json-loader":"^0.5.7","node-pinyin":"^0.2.3","node-sass":"^4.8.3","node-uuid":"^1.4.8","node-webkit":"0.0.0","os":"^0.1.1","sqlite":"^2.9.1","sqlite3":"^3.1.13","style-loader":"^0.13.1","swiper":"^3.4.2","url-loader":"^0.5.9","vue":"^2.5.17","vue-html-loader":"^1.2.4","vue-loader":"^9.9.5","vue-resource":"^1.2.1","vue-router":"^2.3.0","vue-template-compiler":"^2.5.17","vuex":"^2.2.1","webpack":"^3.11.0","webpack-dev-server":"^1.16.2","xlsx":"^0.12.5"},"dependencies":{"buffer-from":"^1.1.1","builder-util-runtime":"^4.4.1","electron-updater":"^3.1.2"}}

/***/ }),

/***/ 295:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "login",
    style: ({
      'background-image': 'url(' + _vm.bg + ')',
      'height': _vm.height + 'px'
    })
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.tips != 'new'),
      expression: "tips != 'new'"
    }],
    staticClass: "mask"
  }, [_c('el-progress', {
    attrs: {
      "type": "circle",
      "percentage": _vm.downloadPercent
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "download_title"
  }, [_vm._v(_vm._s(_vm.tips))])], 1), _vm._v(" "), _c('div', {
    staticClass: "login_div"
  }, [_c('div', {
    staticClass: "login_title"
  }, [_vm._v("欢迎使用药品进销存管理软件")]), _vm._v(" "), _c('div', {
    staticClass: "login_operation"
  }, [_c('div', {
    staticClass: "login_operation_title"
  }, [_vm._v("登   陆")]), _vm._v(" "), _c('div', {
    staticStyle: {
      "padding-left": "20px",
      "padding-right": "20px",
      "margin-top": "16px"
    }
  }, [_c('el-form', {
    ref: "login",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.login,
      "status-icon": "",
      "rules": _vm.rules,
      "label-width": "0px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "prop": "groupCode"
    }
  }, [_c('el-input', {
    staticClass: "group",
    staticStyle: {
      "width": "320px"
    },
    attrs: {
      "type": "text",
      "placeholder": "请输入组编码"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.submitForm('login')
      }
    },
    model: {
      value: (_vm.login.groupCode),
      callback: function($$v) {
        _vm.$set(_vm.login, "groupCode", $$v)
      },
      expression: "login.groupCode"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "prop": "username"
    }
  }, [_c('el-input', {
    staticClass: "username",
    staticStyle: {
      "width": "320px"
    },
    attrs: {
      "type": "text",
      "placeholder": "请输入用户名"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.submitForm('login')
      }
    },
    model: {
      value: (_vm.login.username),
      callback: function($$v) {
        _vm.$set(_vm.login, "username", $$v)
      },
      expression: "login.username"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "prop": "password"
    }
  }, [_c('el-input', {
    staticClass: "password",
    staticStyle: {
      "width": "320px"
    },
    attrs: {
      "type": "password",
      "placeholder": "请输入密码"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.submitForm('login')
      }
    },
    model: {
      value: (_vm.login.password),
      callback: function($$v) {
        _vm.$set(_vm.login, "password", $$v)
      },
      expression: "login.password"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    staticClass: "code",
    attrs: {
      "prop": "code"
    }
  }, [_c('el-input', {
    attrs: {
      "type": "text",
      "maxlength": 4,
      "placeholder": "请输入验证码"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.submitForm('login')
      }
    },
    model: {
      value: (_vm.login.code),
      callback: function($$v) {
        _vm.$set(_vm.login, "code", $$v)
      },
      expression: "login.code"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "img_div",
    attrs: {
      "title": "点击刷新"
    },
    on: {
      "click": _vm.refreshCode
    }
  }, [_c('img', {
    staticStyle: {
      "height": "40px"
    },
    attrs: {
      "src": _vm.$bus.data.host + '/iae/login/captcha?v=' + _vm.datetime
    }
  })])], 1)], 1), _vm._v(" "), _c('div', {
    staticStyle: {
      "margin-bottom": "5px"
    }
  }, [_c('el-checkbox', {
    model: {
      value: (_vm.login.remember),
      callback: function($$v) {
        _vm.$set(_vm.login, "remember", $$v)
      },
      expression: "login.remember"
    }
  }, [_vm._v("记住密码")])], 1), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "type": "primary"
    },
    on: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.submitForm('login')
      },
      "click": function($event) {
        _vm.submitForm('login')
      }
    }
  }, [_vm._v("登   陆")])], 1)])])])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-8e5f6ac0", module.exports)
  }
}

/***/ }),

/***/ 296:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(297);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-740e0ed2!../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./main.vue", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-740e0ed2!../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./main.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 297:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.time{\n\t\tdisplay: inline-block;\n    position: absolute;\n    right: 0px;\n    width: 200px;\n\t\ttext-align: right;\n    top: -9px;\n\t\tright:4px;\n    font-size: 9px;\n}\n.el-table--mini td{\n\t\tpadding: 4px 0 !important;\n}\n.el-table__body .el-button--mini{\n\t\tpadding: 4px 10px;\n}\n.login_out{\n\t\tposition: fixed;\n\t\tfloat: right;\n\t\ttop:0px;\n\t\tright: 0px;\n\t\tline-height: 61px;\n\t\tpadding-right: 20px;\n\t\tcolor: #fff;\n\t\ttext-decoration: none;\n\t\tcursor: pointer;\n}\n.login_out .el-dropdown{\n\t\tcolor: #fff;\n\t\theight: 40px;\n}\n.main_top{\n\t\tposition: fixed;\n\t\twidth: 100%;\n\t\theight: 60px;\n\t\tz-index: 10;\n}\n.view{\n\t\tbackground-color: #f4f4f4;\n}\n.main_content{\n\t\tpadding: 10px;\n\t\tbox-sizing: border-box;\n}\n\t/* .el-dialog__header{\n\t\tmargin-bottom: 20px;\n\t} */\n.main_content .el-date-editor--daterange{\n\t\twidth: 210px !important;\n}\n.main_content .el-date-editor--daterange > input{\n\t\twidth: 37% !important;\n}\n.main_content .el-date-editor .el-range__close-icon{\n\t\twidth: 13px !important;\n}\n.main_content .el-range-editor.el-input__inner{\n\t\tpadding: 3px 5px !important;\n}\n.el-table .cell{\n\t\twhite-space: nowrap;\n}\n.allot_policy{\n    background-color: #fff;\n    border-bottom: 1px solid #ebeef5;\n    height: 30px;\n    line-height: 30px;\n    padding:10px 10px;\n    font-size: 14px;\n    color:#606266;\n}\n.el-dialog__body{\n\t\tpadding-top: 0 !important;\n\t\tpadding-bottom: 0 !important;\n}\n.main_content .import_record .el-dialog__body{\n\t\tpadding-bottom:30px !important;\n}\n.el-collapse-item__content > div{\n\t\tdisplay: inline-block;\n\t\twidth: 30%;\n}\n.el-collapse-item__content > div > span{\n\t\tdisplay: inline-block;\n\t\twidth: 56px;\n\t\ttext-align: right;\n\t\tpadding-right: 10px;\n}\n.sum_money{\n\t\tbackground-color: #fff;\n\t\tborder-bottom: 1px solid #ebeef5;\n\t\theight: 30px;\n\t\tline-height: 30px;\n\t\tpadding-left: 10px;\n\t\tfont-size: 14px;\n\t\tcolor:#606266;\n}\n.sum_money a{\n\t\tcolor: #f24040;\n}\n", ""]);

// exports


/***/ }),

/***/ 298:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
	value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
	data: function data() {
		return {
			activeIndex2: "/main/sales",
			routerFlag: true,
			username: "",
			startTime: "",
			endTime: "",
			height: 0,
			authList: []
		};
	},
	activated: function activated() {
		this.activeIndex2 = "/main/sales";
		this.getAuthorityList();
		var temp = JSON.parse(sessionStorage["user"]);
		this.startTime = new Date(temp.start_time).format("yyyy-MM-dd");
		this.endTime = new Date(temp.end_time).format("yyyy-MM-dd");
		this.username = temp.realname;
	},
	mounted: function mounted() {
		this.height = $(window).height() - 60;
		var that = this;
		$(window).resize(function () {
			that.height = $(window).height() - 60;
		});
	},

	methods: {
		handleSelect: function handleSelect(key, keyPath) {
			this.activeIndex2 = key;
		},
		getAuthorityList: function getAuthorityList() {
			var _self = this;
			var user = JSON.parse(sessionStorage["user"]);
			var authCode = user.authority_code;
			this.jquery('/iae/authority/getAuthoritysList', {
				authority_code: authCode
			}, function (res) {
				_self.authList = res.message[0].children;
			});
		},
		handleCommand: function handleCommand(command) {
			if (command == "login_out") {
				this.$router.push({ path: "/login" });
			} else if (command == "modify_password") {
				this.$router.push({ path: "/main/password" });
			}
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 299:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('div', {
    staticClass: "main_top"
  }, [_c('el-menu', {
    staticClass: "el-menu-demo",
    attrs: {
      "default-active": _vm.activeIndex2,
      "mode": "horizontal",
      "router": _vm.routerFlag,
      "background-color": "#545c64",
      "text-color": "#fff",
      "active-text-color": "#ffd04b"
    },
    on: {
      "select": _vm.handleSelect
    }
  }, [_vm._l((_vm.authList), function(a) {
    return [(a.children.length == 0 || a.authority_type == '2') ? _c('el-menu-item', {
      attrs: {
        "index": a.authority_path
      }
    }, [_vm._v(_vm._s(a.authority_name))]) : _c('el-submenu', {
      attrs: {
        "index": a.authority_id + ''
      }
    }, [_c('template', {
      slot: "title"
    }, [_vm._v(_vm._s(a.authority_name))]), _vm._v(" "), _vm._l((a.children), function(sa) {
      return _c('el-menu-item', {
        attrs: {
          "index": sa.authority_path
        }
      }, [_vm._v(_vm._s(sa.authority_name))])
    })], 2)]
  })], 2), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.username),
      expression: "username"
    }],
    staticClass: "login_out"
  }, [_c('el-dropdown', {
    on: {
      "command": _vm.handleCommand
    }
  }, [_c('span', {
    staticClass: "el-dropdown-link"
  }, [_c('a', {
    staticStyle: {
      "position": "relative"
    }
  }, [_c('div', {
    staticStyle: {
      "text-align": "right",
      "display": "inline-block"
    }
  }, [_vm._v("\n\t\t\t\t\t\t\t" + _vm._s(_vm.username) + "\n\t\t\t\t\t\t")]), _vm._v(" "), _c('div', {
    staticClass: "time"
  }, [_vm._v("\n\t\t\t\t\t\t\t有效日期：" + _vm._s(_vm.startTime) + " 到 " + _vm._s(_vm.endTime) + "\n\t\t\t\t\t\t")])]), _vm._v(" "), _c('i', {
    staticClass: "el-icon-arrow-down el-icon--right"
  })]), _vm._v(" "), _c('el-dropdown-menu', {
    attrs: {
      "slot": "dropdown"
    },
    slot: "dropdown"
  }, [_c('el-dropdown-item', {
    attrs: {
      "command": "login_out"
    }
  }, [_vm._v("退出登陆")]), _vm._v(" "), _c('el-dropdown-item', {
    attrs: {
      "command": "modify_password"
    }
  }, [_vm._v("修改密码")])], 1)], 1)], 1)], 1), _vm._v(" "), _c('div', {
    staticStyle: {
      "height": "60px"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "main_content",
    style: ({
      height: _vm.height + 'px'
    })
  }, [_c('keep-alive', {
    attrs: {
      "exclude": "drugs_edit"
    }
  }, [_c('router-view', {
    staticClass: "view"
  })], 1)], 1)])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-740e0ed2", module.exports)
  }
}

/***/ }),

/***/ 300:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(301);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-5793faf8!../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./home.vue", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-5793faf8!../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./home.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 301:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.echarts_div{\n\tfont-size: 0px;\n\tbox-sizing: border-box;\n\tpadding: 0px 10px 50px 10px;\n}\n.echarts_div > div{\n\tdisplay: inline-block;\n\twidth: 50%;\n\theight: 350px;\n\tmargin-bottom:10px;\n\tbackground:#fff;\n\tpadding-top: 10px;\n}\n.advertisement{\n\tposition: fixed;\n\tbottom: 0px;\n\twidth: 100%;\n\theight: 60px;\n}\n", ""]);

// exports


/***/ }),

/***/ 302:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
//
//
//
//
//
//

exports.default = {
	data: function data() {
		return {};
	},
	mounted: function mounted() {},

	methods: {}
};

/***/ }),

/***/ 303:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_vm._v("\n\t首页\n\n")])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-5793faf8", module.exports)
  }
}

/***/ }),

/***/ 304:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(305);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-45e9b640!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./sales.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-45e9b640!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./sales.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 305:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.el-collapse-item__content > div{\n\tdisplay: inline-block;\n\twidth: 30%;\n}\n.el-collapse-item__content > div > span{\n\tdisplay: inline-block;\n\twidth: 56px;\n\ttext-align: right;\n\tpadding-right: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 306:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
	data: function data() {
		var _this = this;

		var validateNum = function validateNum(rule, value, callback) {
			var regu = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/;
			if (value === '') {
				callback(new Error('请输入计划数量'));
			} else if (!regu.test(value)) {
				callback(new Error('请输入整数'));
			} else {
				_this.sale.sale_money = _this.sale.sale_money ? _this.sale.sale_money : _this.mul(_this.sale.sale_num, _this.sale.sale_price, 2);
				if (!_this.isEmpty(_this.sale.cost_univalent)) {
					_this.sale.gross_profit = _this.sale.gross_profit ? _this.sale.gross_profit : _this.mul(_this.sale.sale_num, _this.sub(_this.sale.sale_price, _this.sale.cost_univalent), 2);
				}
				if (!_this.isEmpty(_this.sale.accounting_cost)) {
					_this.sale.real_gross_profit = _this.sale.real_gross_profit ? _this.sale.real_gross_profit : _this.mul(_this.sale.sale_num, _this.sub(_this.sale.sale_price, _this.sale.accounting_cost), 2);
				}
				callback();
			}
		};
		var validateMoney = function validateMoney(rule, value, callback) {
			var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
			if (value && !reg.test(value)) {
				callback(new Error('请再输入正确的' + rule.labelname));
			} else {
				_this.sale.sale_money = _this.sale.sale_money ? _this.sale.sale_money : _this.mul(_this.sale.sale_num, _this.sale.sale_price, 2);
				if (!_this.isEmpty(value)) {
					if (!_this.isEmpty(_this.sale.cost_univalent)) {
						_this.sale.gross_profit = _this.sale.gross_profit ? _this.sale.gross_profit : _this.mul(_this.sale.sale_num, _this.sub(_this.sale.sale_price, _this.sale.cost_univalent), 2);
					}
					if (!_this.isEmpty(_this.sale.accounting_cost)) {
						_this.sale.real_gross_profit = _this.sale.real_gross_profit ? _this.sale.real_gross_profit : _this.mul(_this.sale.sale_num, _this.sub(_this.sale.sale_price, _this.sale.accounting_cost), 2);
					}
				}
				callback();
			}
		};
		var nowDate = new Date();
		var beforeDate = new Date();
		beforeDate.setFullYear(nowDate.getFullYear() - 1);
		return {
			pickerOptions2: {
				shortcuts: [{
					text: '本月',
					onClick: function onClick(picker) {
						var end = new Date();
						var start = new Date(end.getFullYear() + "-" + (end.getMonth() + 1) + "-01");
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: nowDate.getFullYear() + '年',
					onClick: function onClick(picker) {
						var end = new Date();
						var start = new Date(end.getFullYear() + "-01" + "-01");
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: beforeDate.getFullYear() + '年',
					onClick: function onClick(picker) {
						var start = new Date(beforeDate.getFullYear() + "-01" + "-01");
						var end = new Date(beforeDate.getFullYear() + "-12" + "-31");
						picker.$emit('pick', [start, end]);
					}
				}]
			},
			sales: [],
			tags: [], //标签
			contacts: [],
			business: [],
			pageNum: 20,
			currentPage: 1,
			count: 0,
			hospitals: [],
			money: 0, //销售总额
			realGrossProfit: 0,
			grossProfit: 0,
			params: { //查询参数
				product_makesmakers: "",
				productCommonName: "",
				salesTime: [],
				hospitalsId: "",
				productType: "",
				sale_type: "",
				business: "",
				contactId: "",
				product_code: "",
				tag: "",
				rate_gap: 0,
				rate_formula: "<=",
				tag_type: [],
				batch_number: ""
			},
			sale: {}, //修改的销售信息
			saleRule: {
				sale_price: [{ validator: validateMoney, labelname: "销售单价", trigger: 'blur' }],
				accounting_cost: [{ validator: validateMoney, labelname: "核算成本价", trigger: 'blur' }],
				cost_univalent: [{ validator: validateMoney, labelname: "成本单价", trigger: 'blur' }],
				sale_num: [{ validator: validateNum, trigger: 'blur' }],
				bill_date: [{ required: true, message: '请选择销售时间', trigger: 'blur,change' }],
				hospital_id: [{ required: true, message: '请选择销售机构', trigger: 'blur,change' }]
			},
			dialogFormVisible: false,
			dialogFormVisibleImport: false,
			loading: false,
			authCode: "",
			importSalesUrl: "",
			loadingImport: false,
			uploadButtom: "导入销售记录",
			errorMessage: "",
			tableHeight: 0
		};
	},
	updated: function updated() {
		this.tableHeight = $(window).height() - 200 - $(".search").height();
		var that = this;
		$(window).resize(function () {
			that.tableHeight = $(window).height() - 200 - $(".search").height();
		});
	},
	activated: function activated() {

		this.getSalesList();
		this.getHospitals();
		this.getContacts();
		this.getProductBusiness();
		this.getTags();
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted: function mounted() {
		this.importDrugsUrl = this.$bus.data.host + "/iae/sales/importSales";
	},

	methods: {
		hospitalChange: function hospitalChange(val) {
			var _self = this;
			_self.sale.hospital_policy_return_money = "";
			this.jquery("/iae/hospitalpolicyrecorddrugs/getHospitalPolicyById", {
				hospitalId: val,
				drugId: _self.sale.product_id
			}, function (res) {
				//查询商业
				_self.sale.sale_price = res.message ? res.message.hospital_policy_price : _self.sale.sale_price;
				_self.sale.product_return_money = res.message ? res.message.hospital_policy_return_money : "";
				if (!_self.isEmpty(_self.sale.sale_price) && !_self.isEmpty(_self.sale.sale_num)) {
					_self.sale.sale_money = _self.mul(_self.sale.sale_price, _self.sale.sale_num, 2);
				}
			});
		},
		downloadTemplate: function downloadTemplate() {
			window.location.href = this.$bus.data.host + "/download/template_sales.xlsx";
		},
		importShow: function importShow() {
			this.dialogFormVisibleImport = true;
			this.errorMessage = "";
			if (this.$refs.upload) {
				this.$refs.upload.clearFiles();
			}
		},
		beforeUpload: function beforeUpload(file) {
			this.errorMessage = "";
			this.uploadButtom = "上传成功，正在导入...";
			this.loadingImport = true;
		},
		importDrugsSuccess: function importDrugsSuccess(response, file, fileList) {
			this.uploadButtom = "导入销售记录";
			this.loadingImport = false;
			var downloadErrorMessage = "<a style='color:red;' href='" + this.$bus.data.host + "/iae/sales/downloadErrorSales'>下载错误数据</a>";
			this.errorMessage = response.message + downloadErrorMessage;
		},
		getTags: function getTags() {
			var _self = this;
			this.jquery("/iae/tag/getAllTags", null, function (res) {
				//查询商业
				_self.tags = res.message.tagAll;
			});
		},
		getContacts: function getContacts() {
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['高打品种', '佣金品种'] }, function (res) {
				_self.contacts = res.message;
			});
		},
		getProductBusiness: function getProductBusiness() {
			var _self = this;
			this.jquery("/iae/business/getAllBusiness", null, function (res) {
				//查询商业
				_self.business = res.message;
			});
		},
		exportExcel: function exportExcel() {
			// this.params.tag = this.params.tag_type[1];
			var url = this.$bus.data.host + "/iae/sales/exportSales";
			this.download(url, this.params);
		},
		formatterType: function formatterType(row, column, cellValue) {
			return cellValue == '1' ? "销售出库" : cellValue == '2' ? "销售退回" : "销售退补价";
		},
		formatterOtherMoney: function formatterOtherMoney(row, column, cellValue) {
			if (row.product_type != '其它') {
				return cellValue;
			} else {
				return "-";
			}
		},
		formatterDate: function formatterDate(row, column, cellValue) {
			if (cellValue && typeof cellValue == "string") {
				var temp = cellValue.substring(0, 10);
				var d = new Date(temp);
				d.setDate(d.getDate() + 1);
				return d.format("yyyy-MM-dd");
			} else if (cellValue && (typeof cellValue === 'undefined' ? 'undefined' : _typeof(cellValue)) == "object") {
				return new Date(cellValue).format("yyyy-MM-dd");
			} else {
				return "";
			}
		},
		formatterRealProfitRate: function formatterRealProfitRate(row, column, cellValue) {
			if (!this.isEmpty(row.real_gross_profit) && !this.isEmpty(row.sale_money) && row.real_gross_profit > 0 && row.sale_money > 0) {
				return this.mul(this.div(row.real_gross_profit, row.sale_money, 4), 100) + "%";
			} else {
				return "";
			}
		},
		editRow: function editRow(scope) {
			//编辑药品信息
			this.dialogFormVisible = true;
			var temp = JSON.stringify(scope.row);
			this.sale = JSON.parse(temp);
			this.sale.front_sale = temp;
			this.sale.sale_return_price = this.sale.sale_return_price ? this.sale.sale_return_price : this.sale.sale_policy_money;
			this.sale.sale_contact_id = this.sale.sale_contact_id ? this.sale.sale_contact_id : this.sale.sale_policy_contact_id;
			// this.sale.sale_return_money = this.mul(this.sale.sale_return_price,scope.row.sale_num,2);
			this.sale.sale_num_temp = this.sale.sale_num;
		},
		deleteRow: function deleteRow(scope) {
			var _this2 = this;

			//删除
			this.$confirm('是否删除?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(function () {
				_this2.deleteItem(scope);
			}).catch(function () {});
		},
		deleteItem: function deleteItem(scope) {
			var _self = this;
			this.jquery('/iae/sales/deleteSales', {
				sale_id: scope.row.sale_id,
				delete_flag: "",
				product_type: scope.row.product_type,
				stock: scope.row.stock,
				product_id: scope.row.product_id,
				sale_num: scope.row.sale_num,
				sales_purchase_id: scope.row.sales_purchase_id
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getSalesList();
				_self.dialogFormVisible = false;
			});
		},

		//跳转到编辑页面
		add: function add() {
			sessionStorage["hospitals"] = JSON.stringify(this.hospitals);
			sessionStorage["business"] = JSON.stringify(this.business);
			this.$router.push("/main/salesdrugs");
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getSalesList();
		},
		getHospitals: function getHospitals() {
			var _self = this;
			this.jquery('/iae/hospitals/getAllHospitals', { hospital_type: '销售单位' }, function (res) {
				_self.hospitals = res.message;
			});
		},
		getSalesList: function getSalesList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 20;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.params.tag = this.params.tag_type[1];
			this.jquery('/iae/sales/getSales', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.money = (res.message.saleMoney + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				_self.realGrossProfit = (res.message.realGrossProfit + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				_self.grossProfit = (res.message.grossProfit + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				_self.sales = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		editSales: function editSales(formName) {
			var _this3 = this;

			var _self = this;
			this.sale.gross_profit = 0;
			this.sale.real_gross_profit = 0;
			if (!this.isEmpty(this.sale.cost_univalent)) {
				this.sale.gross_profit = this.mul(this.sale.sale_num, this.sub(this.sale.sale_price, this.sale.cost_univalent), 2);
			}
			if (!this.isEmpty(this.sale.accounting_cost)) {
				this.sale.real_gross_profit = this.mul(this.sale.sale_num, this.sub(this.sale.sale_price, this.sale.accounting_cost), 2);
			}
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this3.loading = true;
					_self.jquery('/iae/sales/editSales', _self.sale, function (res) {
						_self.dialogFormVisible = false;
						_self.loading = false;
						_self.$message({ showClose: true, message: '修改成功', type: 'success' });
						_self.getSalesList();
					});
				} else {
					return false;
				}
			});
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getSalesList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getSalesList();
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 307:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "sale_list",
    staticStyle: {
      "box-sizing": "border-box",
      "padding": "0px 10px"
    }
  }, [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("销售管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("销售管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "销售日期",
      "prop": "salesTime"
    }
  }, [_c('el-date-picker', {
    attrs: {
      "type": "daterange",
      "size": "mini",
      "align": "right",
      "unlink-panels": "",
      "range-separator": "至",
      "start-placeholder": "开始日期",
      "end-placeholder": "结束日期",
      "picker-options": _vm.pickerOptions2
    },
    model: {
      value: (_vm.params.salesTime),
      callback: function($$v) {
        _vm.$set(_vm.params, "salesTime", $$v)
      },
      expression: "params.salesTime"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品名称",
      "prop": "productCommonName"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品名称/助记码"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.productCommonName),
      callback: function($$v) {
        _vm.$set(_vm.params, "productCommonName", $$v)
      },
      expression: "params.productCommonName"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品编号",
      "prop": "product_code"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品编号"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.product_code),
      callback: function($$v) {
        _vm.$set(_vm.params, "product_code", $$v)
      },
      expression: "params.product_code"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "生产厂家",
      "prop": "product_makesmakers"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "生产厂家"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.product_makesmakers),
      callback: function($$v) {
        _vm.$set(_vm.params, "product_makesmakers", $$v)
      },
      expression: "params.product_makesmakers"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "　联系人",
      "prop": "contactId"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "filterable": "",
      "size": "mini",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.contactId),
      callback: function($$v) {
        _vm.$set(_vm.params, "contactId", $$v)
      },
      expression: "params.contactId"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.contacts), function(item) {
    return _c('el-option', {
      key: item.contacts_id,
      attrs: {
        "label": item.contacts_name,
        "value": item.contacts_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "品种类型",
      "prop": "productType"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "multiple": "",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.productType),
      callback: function($$v) {
        _vm.$set(_vm.params, "productType", $$v)
      },
      expression: "params.productType"
    }
  }, [_c('el-option', {
    key: "佣金",
    attrs: {
      "label": "佣金",
      "value": "佣金"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "高打",
    attrs: {
      "label": "高打",
      "value": "高打"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "其它",
    attrs: {
      "label": "其它",
      "value": "其它"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销往单位",
      "prop": "hospitalsId"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "filterable": "",
      "size": "mini",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.hospitalsId),
      callback: function($$v) {
        _vm.$set(_vm.params, "hospitalsId", $$v)
      },
      expression: "params.hospitalsId"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.hospitals), function(item) {
    return _c('el-option', {
      key: item.hospital_id,
      attrs: {
        "label": item.hospital_name,
        "value": item.hospital_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "　　商业",
      "prop": "business"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择商业"
    },
    model: {
      value: (_vm.params.business),
      callback: function($$v) {
        _vm.$set(_vm.params, "business", $$v)
      },
      expression: "params.business"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.business), function(item) {
    return _c('el-option', {
      key: item.business_id,
      attrs: {
        "label": item.business_name,
        "value": item.business_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销售类型",
      "prop": "sale_type"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.sale_type),
      callback: function($$v) {
        _vm.$set(_vm.params, "sale_type", $$v)
      },
      expression: "params.sale_type"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _c('el-option', {
    key: "1",
    attrs: {
      "label": "销售出库",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "销售退回",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "销售退补价",
      "value": "3"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "　　标签",
      "prop": "tag_type"
    }
  }, [_c('el-cascader', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "搜索标签",
      "options": _vm.tags,
      "filterable": ""
    },
    model: {
      value: (_vm.params.tag_type),
      callback: function($$v) {
        _vm.$set(_vm.params, "tag_type", $$v)
      },
      expression: "params.tag_type"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "　　批号",
      "prop": "batch_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "批号"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.batch_number),
      callback: function($$v) {
        _vm.$set(_vm.params, "batch_number", $$v)
      },
      expression: "params.batch_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "真实毛利率",
      "prop": "rate_gap"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "85px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.rate_formula),
      callback: function($$v) {
        _vm.$set(_vm.params, "rate_formula", $$v)
      },
      expression: "params.rate_formula"
    }
  }, [_c('el-option', {
    key: "<",
    attrs: {
      "label": "<",
      "value": "<"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "<=",
    attrs: {
      "label": "≤",
      "value": "<="
    }
  }), _vm._v(" "), _c('el-option', {
    key: ">",
    attrs: {
      "label": ">",
      "value": ">"
    }
  }), _vm._v(" "), _c('el-option', {
    key: ">=",
    attrs: {
      "label": "≥",
      "value": ">="
    }
  })], 1), _vm._v(" "), _c('el-input-number', {
    staticStyle: {
      "width": "106px"
    },
    attrs: {
      "precision": 0,
      "step": 1,
      "max": 100
    },
    model: {
      value: (_vm.params.rate_gap),
      callback: function($$v) {
        _vm.$set(_vm.params, "rate_gap", $$v)
      },
      expression: "params.rate_gap"
    }
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',51,') > -1),
      expression: "authCode.indexOf(',51,') > -1"
    }],
    staticStyle: {
      "margin-left": "14px"
    },
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.reSearch(false)
      }
    }
  }, [_vm._v("查询")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',51,') > -1),
      expression: "authCode.indexOf(',51,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.reSearch(true)
      }
    }
  }, [_vm._v("重置")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',48,') > -1),
      expression: "authCode.indexOf(',48,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.add
    }
  }, [_vm._v("新增")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',52,') > -1),
      expression: "authCode.indexOf(',52,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.exportExcel
    }
  }, [_vm._v("导出")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',102,') > -1),
      expression: "authCode.indexOf(',102,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.importShow
    }
  }, [_vm._v("导入")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',102,') > -1),
      expression: "authCode.indexOf(',102,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.downloadTemplate
    }
  }, [_vm._v("导入模板下载")])], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "sum_money"
  }, [_vm._v("销售总额："), _c('a', [_vm._v(_vm._s(_vm.money))]), _vm._v(" 元；真实毛利："), _c('a', [_vm._v(_vm._s(_vm.realGrossProfit))]), _vm._v(" 元；毛利："), _c('a', [_vm._v(_vm._s(_vm.grossProfit))]), _vm._v(" 元")]), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.sales,
      "size": "mini",
      "height": _vm.tableHeight,
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "fixed": "left",
      "prop": "bill_date",
      "label": "日期",
      "width": "80",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hospital_name",
      "label": "销往单位",
      "width": "140"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hospital_area",
      "label": "单位区域",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_code",
      "label": "产品编码",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_common_name",
      "label": "产品名称",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_specifications",
      "label": "产品规格",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_makesmakers",
      "label": "生产厂家",
      "width": "150"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_packing",
      "label": "包装",
      "width": "50"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_unit",
      "label": "单位",
      "width": "50"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "buyer",
      "label": "采购",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "sale_type",
      "label": "销售类型",
      "width": "60",
      "formatter": _vm.formatterType
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "联系人",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_type",
      "label": "品种类型",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "sale_price",
      "label": "中标价",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "sale_num",
      "label": "销售数量",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "batch_number",
      "label": "批号",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "sale_money",
      "label": "销售金额",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "sale_other_money",
      "label": "补点/费用票",
      "width": "70",
      "formatter": _vm.formatterOtherMoney
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "real_gross_profit",
      "label": "真实毛利",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "label": "真实毛利率",
      "width": "80",
      "formatter": _vm.formatterRealProfitRate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "accounting_cost",
      "label": "核算成本",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "gross_profit",
      "label": "毛利",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "cost_univalent",
      "label": "成本单价"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "right",
      "label": "操作",
      "width": "100"
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(scope) {
        return [_c('el-button', {
          directives: [{
            name: "dbClick",
            rawName: "v-dbClick"
          }, {
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',50,') > -1),
            expression: "authCode.indexOf(',50,') > -1"
          }],
          attrs: {
            "icon": "el-icon-delete",
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.deleteRow(scope)
            }
          }
        }), _vm._v(" "), _c('el-button', {
          directives: [{
            name: "dbClick",
            rawName: "v-dbClick"
          }, {
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',49,') > -1),
            expression: "authCode.indexOf(',49,') > -1"
          }],
          attrs: {
            "icon": "el-icon-edit-outline",
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.editRow(scope)
            }
          }
        })]
      }
    }])
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "page_div"
  }, [_c('el-pagination', {
    attrs: {
      "background": "",
      "current-page": _vm.currentPage,
      "page-sizes": [10, 20, 50, 100],
      "page-size": _vm.pageNum,
      "layout": "total, sizes, prev, pager, next",
      "total": _vm.count
    },
    on: {
      "size-change": _vm.handleSizeChange,
      "current-change": _vm.handleCurrentChange
    }
  })], 1), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "修改销售记录",
      "width": "700px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-collapse', {
    model: {
      value: (_vm.activeNames),
      callback: function($$v) {
        _vm.activeNames = $$v
      },
      expression: "activeNames"
    }
  }, [_c('el-collapse-item', {
    attrs: {
      "title": '药品信息（药品名：' + _vm.sale.product_common_name + '）',
      "name": "1"
    }
  }, [_c('div', [_c('span', [_vm._v("产品编号:")]), _vm._v(_vm._s(_vm.sale.product_code))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("产品规格:")]), _vm._v(_vm._s(_vm.sale.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.sale.sale_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("包装:")]), _vm._v(_vm._s(_vm.sale.product_packing))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("单位:")]), _vm._v(_vm._s(_vm.sale.product_unit))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.sale.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "sale",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.sale,
      "status-icon": "",
      "rules": _vm.saleRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('div', [_c('el-form-item', {
    attrs: {
      "label": "销售类型",
      "prop": "sale_type"
    }
  }, [_c('el-radio', {
    attrs: {
      "label": "1"
    },
    model: {
      value: (_vm.sale.sale_type),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_type", $$v)
      },
      expression: "sale.sale_type"
    }
  }, [_vm._v("销售出库")]), _vm._v(" "), _c('el-radio', {
    attrs: {
      "label": "2"
    },
    model: {
      value: (_vm.sale.sale_type),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_type", $$v)
      },
      expression: "sale.sale_type"
    }
  }, [_vm._v("销售退回")]), _vm._v(" "), _c('el-radio', {
    attrs: {
      "label": "3"
    },
    model: {
      value: (_vm.sale.sale_type),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_type", $$v)
      },
      expression: "sale.sale_type"
    }
  }, [_vm._v("销售退补价")])], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销售日期",
      "prop": "bill_date"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择销售时间"
    },
    model: {
      value: (_vm.sale.bill_date),
      callback: function($$v) {
        _vm.$set(_vm.sale, "bill_date", $$v)
      },
      expression: "sale.bill_date"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销往单位",
      "prop": "hospital_id"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "filterable": "",
      "placeholder": "请选择销售机构"
    },
    on: {
      "change": _vm.hospitalChange
    },
    model: {
      value: (_vm.sale.hospital_id),
      callback: function($$v) {
        _vm.$set(_vm.sale, "hospital_id", $$v)
      },
      expression: "sale.hospital_id"
    }
  }, _vm._l((_vm.hospitals), function(item) {
    return _c('el-option', {
      key: item.hospital_id,
      attrs: {
        "label": item.hospital_name,
        "value": item.hospital_id
      }
    })
  }))], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销售单价",
      "prop": "sale_price",
      "maxlength": 10,
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "请输入销售单价"
    },
    model: {
      value: (_vm.sale.sale_price),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_price", $$v)
      },
      expression: "sale.sale_price"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "计划数量",
      "prop": "sale_num",
      "maxlength": 10,
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "请输入计划数量"
    },
    model: {
      value: (_vm.sale.sale_num),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_num", $$v)
      },
      expression: "sale.sale_num"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "购入金额",
      "prop": "sale_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    model: {
      value: (_vm.sale.sale_money),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_money", $$v)
      },
      expression: "sale.sale_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.sale.product_type == '佣金'),
      expression: "sale.product_type == '佣金'"
    }],
    attrs: {
      "label": "费用票",
      "prop": "sale_other_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "补点/费用票"
    },
    model: {
      value: (_vm.sale.sale_other_money),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_other_money", $$v)
      },
      expression: "sale.sale_other_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "核算成本价",
      "prop": "accounting_cost",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "请输入核算成本价"
    },
    model: {
      value: (_vm.sale.accounting_cost),
      callback: function($$v) {
        _vm.$set(_vm.sale, "accounting_cost", $$v)
      },
      expression: "sale.accounting_cost"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "真实毛利",
      "prop": "real_gross_profit"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    model: {
      value: (_vm.sale.real_gross_profit),
      callback: function($$v) {
        _vm.$set(_vm.sale, "real_gross_profit", $$v)
      },
      expression: "sale.real_gross_profit"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "成本单价",
      "prop": "cost_univalent",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "请输入成本单价"
    },
    model: {
      value: (_vm.sale.cost_univalent),
      callback: function($$v) {
        _vm.$set(_vm.sale, "cost_univalent", $$v)
      },
      expression: "sale.cost_univalent"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "毛利",
      "prop": "gross_profit"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    model: {
      value: (_vm.sale.gross_profit),
      callback: function($$v) {
        _vm.$set(_vm.sale, "gross_profit", $$v)
      },
      expression: "sale.gross_profit"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.sale.product_type != '高打'),
      expression: "sale.product_type != '高打' "
    }],
    attrs: {
      "label": "批号",
      "prop": "batch_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "auto-complete": "off",
      "placeholder": "请输入批号"
    },
    model: {
      value: (_vm.sale.batch_number),
      callback: function($$v) {
        _vm.$set(_vm.sale, "batch_number", $$v)
      },
      expression: "sale.batch_number"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "dialog-footer",
    attrs: {
      "slot": "footer"
    },
    slot: "footer"
  }, [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.dialogFormVisible = false
      }
    }
  }, [_vm._v("取 消")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "size": "small",
      "loading": _vm.loading
    },
    on: {
      "click": function($event) {
        _vm.editSales('sale')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1), _vm._v(" "), _c('el-dialog', {
    staticClass: "import_record",
    attrs: {
      "title": "导入销售记录",
      "width": "600px",
      "visible": _vm.dialogFormVisibleImport
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisibleImport = $event
      }
    }
  }, [_c('el-upload', {
    ref: "upload",
    staticClass: "upload-demo",
    attrs: {
      "action": _vm.importDrugsUrl,
      "before-upload": _vm.beforeUpload,
      "on-success": _vm.importDrugsSuccess,
      "file-list": _vm.fileList
    }
  }, [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "size": "small",
      "type": "primary",
      "loading": _vm.loadingImport
    }
  }, [_vm._v(_vm._s(_vm.uploadButtom))]), _vm._v(" "), _c('div', {
    staticClass: "el-upload__tip",
    staticStyle: {
      "display": "inline-block"
    },
    attrs: {
      "slot": "tip"
    },
    slot: "tip"
  }, [_vm._v("　只能上传xls/xlsx文件")])], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.errorMessage),
      expression: "errorMessage"
    }],
    staticStyle: {
      "margin-top": "15px"
    },
    domProps: {
      "innerHTML": _vm._s(_vm.errorMessage)
    }
  })], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-45e9b640", module.exports)
  }
}

/***/ }),

/***/ 308:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(309);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-2b1ffb23&scoped=true!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./salesDrugs.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-2b1ffb23&scoped=true!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./salesDrugs.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 309:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.el-table .cell[data-v-2b1ffb23]{\n\twhite-space: nowrap;\n}\n.el-collapse-item__content > div[data-v-2b1ffb23]{\n\tdisplay: inline-block;\n\twidth: 30%;\n}\n.el-collapse-item__content > div > span[data-v-2b1ffb23]{\n\tdisplay: inline-block;\n\twidth: 56px;\n\ttext-align: right;\n\tpadding-right: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 310:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
	value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
	data: function data() {
		var _this = this;

		var validateNum = function validateNum(rule, value, callback) {
			var regu = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/;
			if (value === '') {
				callback(new Error('请输入计划数量'));
			} else if (!regu.test(value)) {
				callback(new Error('请输入整数'));
			} else {
				_this.sale.sale_money = _this.sale.sale_money ? _this.sale.sale_money : _this.mul(_this.sale.sale_num, _this.sale.sale_price, 2);
				callback();
			}
		};
		var validateMoney = function validateMoney(rule, value, callback) {
			var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
			if (value && !reg.test(value)) {
				callback(new Error('请再输入正确的' + rule.labelname));
			} else {
				_this.sale.sale_money = _this.sale.sale_money ? _this.sale.sale_money : _this.mul(_this.sale.sale_num, _this.sale.sale_price, 2);
				callback();
			}
		};
		var validateBatchNumber = function validateBatchNumber(rule, value, callback) {
			var regu = /^\+?[1-9][0-9]*$/;
			if (!value && _this.drug.product_type == '高打') {
				callback(new Error('请选择批号'));
			} else {
				callback();
			}
		};
		return {
			drugs: [],
			contacts: [],
			pageNum: 20,
			currentPage: 1,
			count: 0,
			authCode: "",
			dialogFormVisible: false,
			loading: false,
			params: {
				productCommonName: "",
				contactId: "",
				product_type: "",
				product_medical_type: "",
				product_code: "",
				business: "",
				product_distribution_flag: "0",
				sale_other_money: ""
			},
			sale: {
				product_code: "",
				sale_money: "",
				sale_price: "",
				sale_num: "",
				gross_profit: "",
				real_gross_profit: "",
				accounting_cost: "",
				cost_univalent: "",
				group_id: "",
				bill_date: new Date(),
				hospital_id: "",
				sale_type: "1",
				sale_return_flag: "",
				batch_number: ""
			},
			drug: {}, //选择的药品信息
			hospitals: [],
			business: [],
			saleRule: {
				batch_number: [{ validator: validateBatchNumber, trigger: 'blur' }],
				sale_price: [{ validator: validateMoney, labelname: '销售单价', trigger: 'blur' }],
				sale_num: [{ validator: validateNum, trigger: 'blur' }],
				bill_date: [{ required: true, message: '请选择销售时间', trigger: 'change' }],
				hospital_id: [{ required: true, message: '请选择销售机构', trigger: 'change' }]
			},
			batchStockList: [], //库存列表
			tableHeight: 0
		};
	},
	updated: function updated() {
		this.tableHeight = $(window).height() - 170 - $(".search").height();
		var that = this;
		$(window).resize(function () {
			that.tableHeight = $(window).height() - 170 - $(".search").height();
		});
	},
	activated: function activated() {
		this.getDrugsList();
		this.getContacts();
		this.hospitals = JSON.parse(sessionStorage["hospitals"]);
		this.business = JSON.parse(sessionStorage["business"]);
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted: function mounted() {},

	methods: {
		hospitalChange: function hospitalChange(val) {
			var _self = this;
			_self.sale.hospital_policy_return_money = "";
			this.jquery("/iae/hospitalpolicyrecorddrugs/getHospitalPolicyById", {
				hospitalId: val,
				drugId: _self.drug.product_id
			}, function (res) {
				//查询商业
				_self.sale.sale_price = res.message && res.message.hospital_policy_price ? res.message.hospital_policy_price : _self.sale.sale_price;
				_self.sale.product_return_money = res.message && res.message.hospital_policy_return_money ? res.message.hospital_policy_return_money : "";
				if (!_self.isEmpty(_self.sale.sale_price) && !_self.isEmpty(_self.sale.sale_num)) {
					_self.sale.sale_money = _self.mul(_self.sale.sale_price, _self.sale.sale_num, 2);
				}
			});
			this.jquery('/iae/sales/selesPolicy', { product_id: this.drug.product_id, hospital_id: this.sale.hospital_id }, function (res) {
				if (res.message.length > 0) {
					_self.sale.sale_policy_formula = res.message[0].sale_policy_formula ? res.message[0].sale_policy_formula : "";
					_self.sale.sale_policy_percent = res.message[0].sale_policy_percent ? res.message[0].sale_policy_percent : "";
					_self.sale.sale_return_price = res.message[0].sale_policy_money ? res.message[0].sale_policy_money : "";
					_self.sale.sale_contact_id = res.message[0].sale_policy_contact_id ? res.message[0].sale_policy_contact_id : "";
				} else {
					_self.sale.sale_return_price = "";
					_self.sale.sale_contact_id = "";
					_self.sale.sale_policy_formula = "";
					_self.sale.sale_policy_percent = "";
				}
			});
		},
		addSales: function addSales(formName) {
			var _this2 = this;

			if (!this.drug.product_code) {
				return;
			}
			this.sale.gross_profit = 0;
			this.sale.real_gross_profit = 0;
			if (!this.isEmpty(this.drug.product_mack_price)) {
				this.sale.gross_profit = this.mul(this.sale.sale_num, this.sub(this.sale.sale_price, this.drug.product_mack_price), 2);
			}
			if (!this.isEmpty(this.drug.accounting_cost)) {
				this.sale.real_gross_profit = this.mul(this.sale.sale_num, this.sub(this.sale.sale_price, this.drug.accounting_cost), 2);
			}
			this.sale.accounting_cost = this.drug.accounting_cost;
			this.sale.product_price = this.drug.product_price;
			this.sale.cost_univalent = this.drug.product_mack_price;
			this.sale.product_code = this.drug.product_code;
			this.sale.product_type = this.drug.product_type;
			this.sale.product_id = this.drug.product_id;
			this.sale.sale_return_flag = this.drug.product_return_statistics;
			this.sale.stock = this.drug.stock;
			this.sale.sale_tax_rate = this.drug.product_tax_rate;
			this.sale.product_return_money = this.sale.product_return_money ? this.sale.product_return_money : this.drug.product_return_money;
			this.sale.product_return_time_type = this.drug.product_return_time_type;
			this.sale.product_return_time_day = this.drug.product_return_time_day;
			this.sale.product_return_time_day_num = this.drug.product_return_time_day_num;
			if (this.drug.product_type == '高打') {
				for (var i = 0; i < this.batchStockList.length; i++) {
					var t = new Date(this.batchStockList[i].batch_stock_time).format("yyyy-MM-dd");
					if (this.sale.batch_number == this.batchStockList[i].batch_number + "(" + t + ")") {
						this.sale.sales_purchase_id = this.batchStockList[i].batch_stock_purchase_id;
						var temp = this.batchStockList[i].purchase_other_money;
						this.sale.sale_other_money = temp ? temp * this.sale.sale_num / this.batchStockList[i].purchase_number : 0;
						this.sale.realReturnMoney = this.batchStockList[i].refunds_real_money / this.batchStockList[i].purchase_number;
						break;
					}
				}
			}
			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this2.loading = true;
					_self.jquery('/iae/sales/saveSales', _self.sale, function (res) {
						_self.$confirm('新增成功', '提示', {
							confirmButtonText: '继续添加',
							cancelButtonText: '返回销售列表',
							type: 'success'
						}).then(function () {
							_self.$refs["sale"].resetFields();
							_self.dialogFormVisible = false;
							_self.loading = false;
						}).catch(function () {
							_self.$refs["sale"].resetFields();
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.$router.push({ path: '/main/sales' });
						});
					});
				} else {
					return false;
				}
			});
		},
		returnSale: function returnSale() {
			this.$router.push({ path: "/main/sales" });
		},
		selectRow: function selectRow(scope) {
			var temp = JSON.stringify(scope.row);
			this.drug = JSON.parse(temp);
			this.sale.sales_purchase_id = null;
			if (this.$refs["sale"]) {
				this.$refs["sale"].resetFields();
			}
			this.sale.sale_price = this.drug.product_price;
			//查询批次库存
			if (this.drug.product_type == '高打') {
				//如果是高打品种，则选择批次库存
				var _self = this;
				this.jquery('/iae/stock/getBatchStockByDrugId', { productId: this.drug.product_id }, function (res) {
					_self.batchStockList = res.message;
				});
			}
			this.dialogFormVisible = true;
		},
		formatNull: function formatNull(row, column, cellValue, index) {
			if (row.product_type == "其它") {
				return "-";
			} else {
				return cellValue;
			}
		},
		getContacts: function getContacts() {
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['高打品种', '佣金品种'] }, function (res) {
				_self.contacts = res.message;
			});
		},
		formatterPer: function formatterPer(row, column, cellValue) {
			var per = row.product_commission / row.product_price * 100;
			return per.toFixed(2) + "%";
		},
		deleteRow: function deleteRow(scope) {
			var _this3 = this;

			//删除
			this.$confirm('是否删除?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(function () {
				_this3.deleteItem(scope);
			}).catch(function () {});
		},
		deleteItem: function deleteItem(scope) {
			var _self = this;
			this.jquery('/iae/drugs/deleteDrugs', {
				product_id: scope.row.product_id
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getDrugsList();
				_self.dialogFormVisible = false;
			});
		},

		//搜索所有药品信息
		searchDrugsList: function searchDrugsList() {
			this.getDrugsList();
		},
		getDrugsList: function getDrugsList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 20;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/drugs/getDrugs', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.drugs = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getDrugsList();
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.params.limit = this.pageNum;
			this.getDrugsList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.params.start = (val - 1) * this.pageNum;
			this.params.limit = this.pageNum;
			this.getDrugsList();
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 311:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticStyle: {
      "box-sizing": "border-box",
      "padding": "0px 10px"
    }
  }, [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("销售管理")]), _vm._v(" "), _c('el-breadcrumb-item', {
    attrs: {
      "to": {
        path: '/main/sales'
      }
    }
  }, [_vm._v("销售管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("选择药品"), _c('a', {
    staticStyle: {
      "color": "#f24040"
    }
  }, [_vm._v("（请先选择销售药品）")])])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "产品名称",
      "prop": "productCommonName"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品名称"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.productCommonName),
      callback: function($$v) {
        _vm.$set(_vm.params, "productCommonName", $$v)
      },
      expression: "params.productCommonName"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品编号",
      "prop": "product_code"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品编号"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.product_code),
      callback: function($$v) {
        _vm.$set(_vm.params, "product_code", $$v)
      },
      expression: "params.product_code"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "　联系人",
      "prop": "contactId"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择联系人"
    },
    model: {
      value: (_vm.params.contactId),
      callback: function($$v) {
        _vm.$set(_vm.params, "contactId", $$v)
      },
      expression: "params.contactId"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.contacts), function(item) {
    return _c('el-option', {
      key: item.contacts_id,
      attrs: {
        "label": item.contacts_name,
        "value": item.contacts_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "商业",
      "prop": "business"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择商业"
    },
    model: {
      value: (_vm.params.business),
      callback: function($$v) {
        _vm.$set(_vm.params, "business", $$v)
      },
      expression: "params.business"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.business), function(item) {
    return _c('el-option', {
      key: item.business_id,
      attrs: {
        "label": item.business_name,
        "value": item.business_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "品种类型",
      "prop": "product_type"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "multiple": "",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.product_type),
      callback: function($$v) {
        _vm.$set(_vm.params, "product_type", $$v)
      },
      expression: "params.product_type"
    }
  }, [_c('el-option', {
    key: "佣金",
    attrs: {
      "label": "佣金",
      "value": "佣金"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "高打",
    attrs: {
      "label": "高打",
      "value": "高打"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "其它",
    attrs: {
      "label": "其它",
      "value": "其它"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "医保类型",
      "prop": "product_medical_type"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.product_medical_type),
      callback: function($$v) {
        _vm.$set(_vm.params, "product_medical_type", $$v)
      },
      expression: "params.product_medical_type"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _c('el-option', {
    key: "甲类",
    attrs: {
      "label": "甲类",
      "value": "甲类"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "乙类",
    attrs: {
      "label": "乙类",
      "value": "乙类"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "丙类",
    attrs: {
      "label": "丙类",
      "value": "丙类"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "省医保",
    attrs: {
      "label": "省医保",
      "value": "省医保"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "是否配送",
      "prop": "product_distribution_flag"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.product_distribution_flag),
      callback: function($$v) {
        _vm.$set(_vm.params, "product_distribution_flag", $$v)
      },
      expression: "params.product_distribution_flag"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _c('el-option', {
    key: "0",
    attrs: {
      "label": "配送",
      "value": "0"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "1",
    attrs: {
      "label": "不配送",
      "value": "1"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.searchDrugsList
    }
  }, [_vm._v("查询")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.reSearch
    }
  }, [_vm._v("重置")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.returnSale
    }
  }, [_vm._v("返回列表")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.drugs,
      "size": "mini",
      "height": _vm.tableHeight,
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "product_common_name",
      "label": "产品通用名",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_code",
      "label": "产品编号",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_makesmakers",
      "label": "生产厂家",
      "width": "150"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_specifications",
      "label": "产品规格",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_packing",
      "label": "包装",
      "width": "50"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_unit",
      "label": "单位",
      "width": "50"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "buyer",
      "label": "采购员",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_price",
      "label": "中标价",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_discount",
      "label": "扣率",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_mack_price",
      "label": "打款价",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_type",
      "label": "品种类型",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "联系人",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_medical_type",
      "label": "医保类型"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "right",
      "label": "操作",
      "width": "70"
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(scope) {
        return [_c('el-button', {
          directives: [{
            name: "dbClick",
            rawName: "v-dbClick"
          }],
          attrs: {
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.selectRow(scope)
            }
          }
        }, [_vm._v("选择")])]
      }
    }])
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "page_div"
  }, [_c('el-pagination', {
    attrs: {
      "background": "",
      "current-page": _vm.currentPage,
      "page-sizes": [10, 20, 50, 100],
      "page-size": _vm.pageNum,
      "layout": "total, sizes, prev, pager, next, jumper",
      "total": _vm.count
    },
    on: {
      "size-change": _vm.handleSizeChange,
      "current-change": _vm.handleCurrentChange
    }
  })], 1), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "新增销售记录",
      "width": "700px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-collapse', {
    model: {
      value: (_vm.activeNames),
      callback: function($$v) {
        _vm.activeNames = $$v
      },
      expression: "activeNames"
    }
  }, [_c('el-collapse-item', {
    attrs: {
      "title": '药品信息（药品名：' + _vm.drug.product_common_name + '）',
      "name": "1"
    }
  }, [_c('div', [_c('span', [_vm._v("产品编号:")]), _vm._v(_vm._s(_vm.drug.product_code))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("产品规格:")]), _vm._v(_vm._s(_vm.drug.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.drug.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("包装:")]), _vm._v(_vm._s(_vm.drug.product_packing))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("单位:")]), _vm._v(_vm._s(_vm.drug.product_unit))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.drug.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "sale",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.sale,
      "status-icon": "",
      "rules": _vm.saleRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('div', [_c('el-form-item', {
    attrs: {
      "label": "销售类型",
      "prop": "sale_type"
    }
  }, [_c('el-radio', {
    attrs: {
      "label": "1"
    },
    model: {
      value: (_vm.sale.sale_type),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_type", $$v)
      },
      expression: "sale.sale_type"
    }
  }, [_vm._v("销售出库")]), _vm._v(" "), _c('el-radio', {
    attrs: {
      "label": "2"
    },
    model: {
      value: (_vm.sale.sale_type),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_type", $$v)
      },
      expression: "sale.sale_type"
    }
  }, [_vm._v("销售退回")]), _vm._v(" "), _c('el-radio', {
    attrs: {
      "label": "3"
    },
    model: {
      value: (_vm.sale.sale_type),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_type", $$v)
      },
      expression: "sale.sale_type"
    }
  }, [_vm._v("销售退补价")])], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销售日期",
      "prop": "bill_date"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择销售时间"
    },
    model: {
      value: (_vm.sale.bill_date),
      callback: function($$v) {
        _vm.$set(_vm.sale, "bill_date", $$v)
      },
      expression: "sale.bill_date"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销往单位",
      "prop": "hospital_id"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "filterable": "",
      "placeholder": "请选择销售机构"
    },
    on: {
      "change": _vm.hospitalChange
    },
    model: {
      value: (_vm.sale.hospital_id),
      callback: function($$v) {
        _vm.$set(_vm.sale, "hospital_id", $$v)
      },
      expression: "sale.hospital_id"
    }
  }, _vm._l((_vm.hospitals), function(item) {
    return _c('el-option', {
      key: item.hospital_id,
      attrs: {
        "label": item.hospital_name,
        "value": item.hospital_id
      }
    })
  }))], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销售单价",
      "prop": "sale_price",
      "maxlength": 10,
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "请输入销售单价"
    },
    model: {
      value: (_vm.sale.sale_price),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_price", $$v)
      },
      expression: "sale.sale_price"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销售数量",
      "prop": "sale_num",
      "maxlength": 10,
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "请输入计划数量"
    },
    model: {
      value: (_vm.sale.sale_num),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_num", $$v)
      },
      expression: "sale.sale_num"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销售金额",
      "prop": "sale_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "auto-complete": "off"
    },
    model: {
      value: (_vm.sale.sale_money),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_money", $$v)
      },
      expression: "sale.sale_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.drug.product_type == '佣金'),
      expression: "drug.product_type == '佣金'"
    }],
    attrs: {
      "label": "费用票",
      "prop": "sale_other_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "补点/费用票"
    },
    model: {
      value: (_vm.sale.sale_other_money),
      callback: function($$v) {
        _vm.$set(_vm.sale, "sale_other_money", $$v)
      },
      expression: "sale.sale_other_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "批号",
      "prop": "batch_number"
    }
  }, [_c('el-select', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (this.drug.product_type == '高打'),
      expression: "this.drug.product_type == '高打'"
    }],
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "请选择",
      "filterable": ""
    },
    model: {
      value: (_vm.sale.batch_number),
      callback: function($$v) {
        _vm.$set(_vm.sale, "batch_number", $$v)
      },
      expression: "sale.batch_number"
    }
  }, _vm._l((_vm.batchStockList), function(item) {
    return (item.batch_stock_number > 0 || _vm.sale.sale_type == '2' || _vm.sale.sale_type == '3') ? _c('el-option', {
      key: item.batch_number + '(' + new Date(item.batch_stock_time).format('yyyy-MM-dd').substring(0, 10) + ')',
      attrs: {
        "label": item.batch_number + '(' + new Date(item.batch_stock_time).format('yyyy-MM-dd').substring(0, 10) + ')',
        "value": item.batch_number + '(' + new Date(item.batch_stock_time).format('yyyy-MM-dd').substring(0, 10) + ')'
      }
    }, [_c('span', {
      staticStyle: {
        "float": "left"
      }
    }, [_vm._v(_vm._s(item.batch_number + '(' + new Date(item.batch_stock_time).format('yyyy-MM-dd') + ')'))]), _vm._v(" "), _c('span', {
      staticStyle: {
        "float": "right",
        "color": "#8492a6",
        "font-size": "13px",
        "padding-left": "10px"
      }
    }, [_vm._v("库存：" + _vm._s(item.batch_stock_number))])]) : _vm._e()
  })), _vm._v(" "), _c('el-input', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (this.drug.product_type != '高打'),
      expression: "this.drug.product_type != '高打'"
    }],
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "auto-complete": "off",
      "placeholder": "请输入批号"
    },
    model: {
      value: (_vm.sale.batch_number),
      callback: function($$v) {
        _vm.$set(_vm.sale, "batch_number", $$v)
      },
      expression: "sale.batch_number"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (!_vm.drug.product_code),
      expression: "!drug.product_code"
    }],
    staticStyle: {
      "font-size": "12px",
      "color": "#f04040"
    }
  }, [_vm._v("温馨提示：该药品无产品编码，不可添加。请到药品管理中维护。")]), _vm._v(" "), _c('div', {
    staticClass: "dialog-footer",
    attrs: {
      "slot": "footer"
    },
    slot: "footer"
  }, [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.dialogFormVisible = false
      }
    }
  }, [_vm._v("取 消")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "loading": _vm.loading,
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.addSales('sale')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-2b1ffb23", module.exports)
  }
}

/***/ }),

/***/ 312:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(313);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-b4568598!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./allot.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-b4568598!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./allot.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 313:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.sum_money_allot > a{\n\tpadding-left: 20px;\n\tcolor: #606266;\n}\n.sum_money_allot > span{\n\tcolor:#606266;\n}\n.sum_money_allot .more_detail{\n\tposition: absolute;\n\tright: 10px;\n\theight: 30px;\n\tline-height: 30px;\n\tcolor: #409EFF;\n\ttext-decoration: none;\n}\n.sum_money_allot{\n\tposition: relative;\n\tbackground-color: #fff;\n\tborder-bottom: 1px solid #ebeef5;\n\theight: 30px;\n\tcolor:#f24040;\n\tline-height: 30px;\n\tfont-size: 14px;\n}\n", ""]);

// exports


/***/ }),

/***/ 314:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
	data: function data() {
		var _this = this;

		var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
		var validateNum = function validateNum(rule, value, callback) {
			var regu = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/;
			if (value === '') {
				callback(new Error('请输入调货数量'));
			} else if (!regu.test(value)) {
				callback(new Error('请输入正整数'));
			} else {
				_this.allot.allot_money = _this.allot.allot_money ? _this.allot.allot_money : _this.mul(_this.allot.allot_number, _this.allot.allot_price, 2);
				if (!_this.isEmpty(_this.allot.allot_return_price) && reg.test(_this.allot.allot_return_price)) {
					_this.allot.allot_return_money = _this.allot.allot_return_money ? _this.allot.allot_return_money : _this.mul(_this.allot.allot_return_price, _this.allot.allot_number, 2);
				}
				callback();
			}
		};
		var validateNull = function validateNull(rule, value, callback) {
			if (!_this.isEmpty(_this.allot.allot_return_fla) && _this.isEmpty(value)) {
				callback(new Error('请选择' + rule.labelname));
			} else {
				callback();
			}
		};
		var validateRealReturnMoney = function validateRealReturnMoney(rule, value, callback) {
			if (!_this.isEmpty(_this.allot.allot_return_flag) && _this.isEmpty(value)) {
				callback(new Error('请输入返款单价'));
			} else if (!_this.isEmpty(_this.allot.allot_return_flag) && !_this.isEmpty(value) && !reg.test(value)) {
				callback(new Error('请输入正确的返款单价'));
			} else {
				_this.allot.allot_return_money = _this.allot.allot_return_money ? _this.allot.allot_return_money : _this.mul(value, _this.allot.allot_number);
				callback();
			}
		};
		var validateAllotPrice = function validateAllotPrice(rule, value, callback) {
			if (_this.isEmpty(value)) {
				callback(new Error('请输入调货价'));
			} else if (!reg.test(value)) {
				callback(new Error('请输入正确的调货价'));
			} else {
				_this.allot.allot_money = _this.allot.allot_money ? _this.allot.allot_money : _this.mul(_this.allot.allot_number, value, 2);
				callback();
			}
		};
		var nowDate = new Date();
		var beforeDate = new Date();
		beforeDate.setFullYear(nowDate.getFullYear() - 1);
		return {
			pickerOptions2: {
				shortcuts: [{
					text: '本月',
					onClick: function onClick(picker) {
						var end = new Date();
						var start = new Date(end.getFullYear() + "-" + (end.getMonth() + 1) + "-01");
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: nowDate.getFullYear() + '年',
					onClick: function onClick(picker) {
						var end = new Date();
						var start = new Date(end.getFullYear() + "-01" + "-01");
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: beforeDate.getFullYear() + '年',
					onClick: function onClick(picker) {
						var start = new Date(beforeDate.getFullYear() + "-01" + "-01");
						var end = new Date(beforeDate.getFullYear() + "-12" + "-31");
						picker.$emit('pick', [start, end]);
					}
				}]
			},
			allots: [],
			allot: {},
			hospitals: [],
			business: [],
			loading: false,
			money: 0, //总额统计
			pageNum: 20,
			currentPage: 1,
			count: 0,
			dialogFormVisible: false,
			params: {
				product_makesmakers: "",
				productCommonName: "",
				allot_hospital: "",
				allot_time: [],
				product_code: "",
				allot_return_flag: "",
				business: "",
				contactId: "",
				batch_number: ""
			},
			allotRule: {
				allot_price: [{ validator: validateAllotPrice, trigger: 'blur' }],
				allot_account_id: [{ validator: validateNull, labelname: '返款账号', trigger: 'change' }],
				allot_return_time: [{ validator: validateNull, labelname: '返款时间', trigger: 'change' }],
				allot_number: [{ validator: validateNum, trigger: 'blur' }],
				allot_return_price: [{ validator: validateRealReturnMoney, trigger: 'blur' }],
				allot_time: [{ required: true, message: '请选择调货时间', trigger: 'blur,change' }],
				allot_hospital: [{ required: true, message: '请输入调货单位', trigger: 'blur,change' }]
			},
			authCode: "",
			importAllotsUrl: "",
			dialogFormVisibleImport: false,
			uploadButtom: "导入调货记录",
			errorMessage: "",
			tableHeight: 0
		};
	},
	updated: function updated() {
		this.tableHeight = $(window).height() - 200 - $(".search").height();
		var that = this;
		$(window).resize(function () {
			that.tableHeight = $(window).height() - 200 - $(".search").height();
		});
	},
	activated: function activated() {
		this.getAllotsList();
		this.getAllotHospitalList();
		this.getBankAccount();
		this.getProductBusiness();
		this.getContacts();
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted: function mounted() {
		this.importAllotsUrl = this.$bus.data.host + "/iae/allot/importAllots";
	},

	methods: {
		formatterType: function formatterType(row, column, cellValue) {
			return cellValue == '1' ? "调货出库" : "调货退回";
		},
		downloadTemplate: function downloadTemplate() {
			window.location.href = this.$bus.data.host + "/download/template_allots.xlsx";
		},
		importShow: function importShow() {
			this.dialogFormVisibleImport = true;
			this.errorMessage = "";
			if (this.$refs.upload) {
				this.$refs.upload.clearFiles();
			}
		},
		beforeUpload: function beforeUpload(file) {
			this.errorMessage = "";
			this.uploadButtom = "上传成功，正在导入...";
			this.loadingImport = true;
		},
		importAllotsSuccess: function importAllotsSuccess(response, file, fileList) {
			this.uploadButtom = "导入销售记录";
			this.loadingImport = false;
			var downloadErrorMessage = "<a style='color:red;' href='" + this.$bus.data.host + "/iae/allot/downloadErrorAllots'>下载错误数据</a>";
			this.errorMessage = response.message + downloadErrorMessage;
		},
		exportAllot: function exportAllot() {
			var url = this.$bus.data.host + "/iae/allot/exportAllot";
			this.download(url, this.params);
		},
		hospitalChange: function hospitalChange() {
			var _self = this;
			this.jquery('/iae/allot/getAllotPolicy', {
				drugId: this.allot.product_id,
				hospitalId: this.allot.allot_hospital
			}, function (res) {
				if (res.message.length > 0) {
					_self.allot.allot_policy_contact_id = res.message[0].allot_policy_contact_id;
					_self.allot.allot_return_price = res.message[0].allot_policy_money;
					_self.allot.allot_policy_remark = res.message[0].allot_policy_remark;
				} else {
					_self.allot.allot_policy_contact_id = "";
					_self.allot.allot_return_price = "";
					_self.allot.allot_policy_remark = "";
				}
			});
		},
		getContacts: function getContacts() {
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['调货'] }, function (res) {
				_self.contacts = res.message;
			});
		},
		getProductBusiness: function getProductBusiness() {
			var _self = this;
			this.jquery("/iae/business/getAllBusiness", null, function (res) {
				//查询商业
				_self.business = res.message;
				sessionStorage["productbusiness"] = JSON.stringify(_self.business);
			});
		},
		getBankAccount: function getBankAccount() {
			var _self = this;
			this.jquery("/iae/bankaccount/getAllAccounts", null, function (res) {
				//查询账号
				_self.accounts = res.message;
			});
		},
		getAllotHospitalList: function getAllotHospitalList() {
			var _self = this;
			this.jquery('/iae/hospitals/getAllHospitals', { hospital_type: '调货单位' }, function (res) {
				_self.hospitals = res.message;
			});
		},
		formatPercent: function formatPercent(row, column, cellValue, index) {
			if (cellValue) {
				return cellValue + " %";
			} else {
				return "-";
			}
		},
		editallots: function editallots(formName) {
			var _self = this;
			this.allot.account_detail = this.formatterDate(null, null, this.allot.allot_time) + this.allot.allot_hospital + "调货（" + this.allot.allot_number + "）" + this.allot.product_common_name + "返款";
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_self.loading = true;
					_self.jquery('/iae/allot/editAllot', _self.allot, function (res) {
						_self.dialogFormVisible = false;
						_self.loading = false;
						_self.$message({ showClose: true, message: '修改成功', type: 'success' });
						_self.getAllotsList();
					});
				} else {
					return false;
				}
			});
		},
		formatterDate: function formatterDate(row, column, cellValue) {
			if (cellValue && typeof cellValue == "string") {
				var temp = cellValue.substring(0, 10);
				var d = new Date(temp);
				d.setDate(d.getDate() + 1);
				return d.format("yyyy-MM-dd");
			} else if (cellValue && (typeof cellValue === 'undefined' ? 'undefined' : _typeof(cellValue)) == "object") {
				return new Date(cellValue).format("yyyy-MM-dd");
			} else {
				return "";
			}
		},
		editRow: function editRow(scope) {
			//编辑药品信息
			this.dialogFormVisible = true;
			var temp = JSON.stringify(scope.row);
			this.allot = JSON.parse(temp);
			this.allot.front_allot_message = temp;
			this.allot.allot_number_temp = this.allot.allot_number;
		},
		deleteRow: function deleteRow(scope) {
			var _this2 = this;

			//删除
			this.$confirm('是否删除?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(function () {
				_this2.deleteItem(scope);
			}).catch(function () {});
		},
		deleteItem: function deleteItem(scope) {
			var _self = this;
			this.jquery('/iae/allot/deleteAllot', {
				allot_id: scope.row.allot_id,
				stock: scope.row.stock,
				product_id: scope.row.product_id,
				allot_number: scope.row.allot_number,
				allot_purchase_id: scope.row.allot_purchase_id
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getAllotsList();
				_self.dialogFormVisible = false;
			});
		},

		//跳转到编辑页面
		add: function add() {
			sessionStorage["allotcontacts"] = JSON.stringify(this.contacts);
			sessionStorage["allot_hospital"] = JSON.stringify(this.hospitals);
			this.$router.push("/main/allotdrugs");
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getAllotsList();
		},
		getAllotsList: function getAllotsList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 20;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/allot/getAllot', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.allots = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
				_self.money = res.message.allotMoney.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			});
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getAllotsList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getAllotsList();
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 315:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "allot_list",
    staticStyle: {
      "box-sizing": "border-box",
      "padding": "0px 10px"
    }
  }, [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("销售管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("调货管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "调货时间",
      "prop": "allot_time"
    }
  }, [_c('el-date-picker', {
    attrs: {
      "type": "daterange",
      "size": "mini",
      "align": "right",
      "unlink-panels": "",
      "range-separator": "至",
      "start-placeholder": "开始日期",
      "end-placeholder": "结束日期",
      "picker-options": _vm.pickerOptions2
    },
    model: {
      value: (_vm.params.allot_time),
      callback: function($$v) {
        _vm.$set(_vm.params, "allot_time", $$v)
      },
      expression: "params.allot_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品名称",
      "prop": "productCommonName"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品名称/助记码"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.productCommonName),
      callback: function($$v) {
        _vm.$set(_vm.params, "productCommonName", $$v)
      },
      expression: "params.productCommonName"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品编号",
      "prop": "product_code"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品通用名"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.product_code),
      callback: function($$v) {
        _vm.$set(_vm.params, "product_code", $$v)
      },
      expression: "params.product_code"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "生产厂家",
      "prop": "product_makesmakers"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "生产厂家"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.product_makesmakers),
      callback: function($$v) {
        _vm.$set(_vm.params, "product_makesmakers", $$v)
      },
      expression: "params.product_makesmakers"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货单位",
      "prop": "allot_hospital"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择供货单位"
    },
    model: {
      value: (_vm.params.allot_hospital),
      callback: function($$v) {
        _vm.$set(_vm.params, "allot_hospital", $$v)
      },
      expression: "params.allot_hospital"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.hospitals), function(item) {
    return _c('el-option', {
      key: item.hospital_id,
      attrs: {
        "label": item.hospital_name,
        "value": item.hospital_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "　　商业",
      "prop": "business"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择商业"
    },
    model: {
      value: (_vm.params.business),
      callback: function($$v) {
        _vm.$set(_vm.params, "business", $$v)
      },
      expression: "params.business"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.business), function(item) {
    return _c('el-option', {
      key: item.business_id,
      attrs: {
        "label": item.business_name,
        "value": item.business_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货联系人",
      "prop": "contactId"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "196px"
    },
    attrs: {
      "filterable": "",
      "size": "mini",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.contactId),
      callback: function($$v) {
        _vm.$set(_vm.params, "contactId", $$v)
      },
      expression: "params.contactId"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.contacts), function(item) {
    return _c('el-option', {
      key: item.contacts_id,
      attrs: {
        "label": item.contacts_name,
        "value": item.contacts_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "　　批号",
      "prop": "batch_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "批号"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.batch_number),
      callback: function($$v) {
        _vm.$set(_vm.params, "batch_number", $$v)
      },
      expression: "params.batch_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',61,') > -1),
      expression: "authCode.indexOf(',61,') > -1"
    }],
    staticStyle: {
      "margin-left": "14px"
    },
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.reSearch(false)
      }
    }
  }, [_vm._v("查询")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',61,') > -1),
      expression: "authCode.indexOf(',61,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.reSearch(true)
      }
    }
  }, [_vm._v("重置")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',58,') > -1),
      expression: "authCode.indexOf(',58,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.add
    }
  }, [_vm._v("新增")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',129,') > -1),
      expression: "authCode.indexOf(',129,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.exportAllot
    }
  }, [_vm._v("导出")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',101,') > -1),
      expression: "authCode.indexOf(',101,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.importShow
    }
  }, [_vm._v("导入")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',101,') > -1),
      expression: "authCode.indexOf(',101,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.downloadTemplate
    }
  }, [_vm._v("导入模板下载")])], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "sum_money_allot"
  }, [_c('a', [_vm._v("调货总额：")]), _vm._v(_vm._s(_vm.money) + " "), _c('span', [_vm._v("元")])]), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.allots,
      "size": "mini",
      "height": _vm.tableHeight,
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "allot_time",
      "label": "调货时间",
      "width": "80",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hospital_name",
      "label": "调货单位",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hospital_area",
      "label": "单位区域",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_code",
      "label": "产品编码",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_common_name",
      "label": "产品通用名",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_specifications",
      "label": "产品规格",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_makesmakers",
      "label": "生产厂家",
      "width": "150"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_unit",
      "label": "单位",
      "width": "50"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allot_type",
      "label": "调货类型",
      "width": "80",
      "formatter": _vm.formatterType
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "调货联系人",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allot_number",
      "label": "数量",
      "width": "50"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allot_mack_price",
      "label": "打款价",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allot_price",
      "label": "中标价",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allot_money",
      "label": "金额"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "batch_number",
      "label": "批号"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "right",
      "label": "操作",
      "width": "100"
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(scope) {
        return [_c('el-button', {
          directives: [{
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',60,') > -1),
            expression: "authCode.indexOf(',60,') > -1"
          }, {
            name: "dbClick",
            rawName: "v-dbClick"
          }],
          attrs: {
            "icon": "el-icon-delete",
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.deleteRow(scope)
            }
          }
        }), _vm._v(" "), _c('el-button', {
          directives: [{
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',59,') > -1),
            expression: "authCode.indexOf(',59,') > -1"
          }, {
            name: "dbClick",
            rawName: "v-dbClick"
          }],
          attrs: {
            "icon": "el-icon-edit-outline",
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.editRow(scope)
            }
          }
        })]
      }
    }])
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "page_div"
  }, [_c('el-pagination', {
    attrs: {
      "background": "",
      "current-page": _vm.currentPage,
      "page-sizes": [10, 20, 50, 100],
      "page-size": _vm.pageNum,
      "layout": "total, sizes, prev, pager, next, jumper",
      "total": _vm.count
    },
    on: {
      "size-change": _vm.handleSizeChange,
      "current-change": _vm.handleCurrentChange
    }
  })], 1), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "修改调货记录",
      "width": "700px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-collapse', {
    model: {
      value: (_vm.activeNames),
      callback: function($$v) {
        _vm.activeNames = $$v
      },
      expression: "activeNames"
    }
  }, [_c('el-collapse-item', {
    attrs: {
      "title": '药品信息（药品名：' + _vm.allot.product_common_name + '）',
      "name": "2"
    }
  }, [_c('div', [_c('span', [_vm._v("产品编号:")]), _vm._v(_vm._s(_vm.allot.product_code))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("产品规格:")]), _vm._v(_vm._s(_vm.allot.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.allot.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("包装:")]), _vm._v(_vm._s(_vm.allot.product_packing))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("单位:")]), _vm._v(_vm._s(_vm.allot.product_unit))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("打款价:")]), _vm._v(_vm._s(_vm.allot.product_mack_price))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.allot.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "allot",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.allot,
      "status-icon": "",
      "rules": _vm.allotRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('div', [_c('el-form-item', {
    attrs: {
      "label": "调货类型",
      "prop": "sale_type"
    }
  }, [_c('el-radio', {
    attrs: {
      "label": "1"
    },
    model: {
      value: (_vm.allot.allot_type),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_type", $$v)
      },
      expression: "allot.allot_type"
    }
  }, [_vm._v("调货出库")]), _vm._v(" "), _c('el-radio', {
    attrs: {
      "label": "2"
    },
    model: {
      value: (_vm.allot.allot_type),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_type", $$v)
      },
      expression: "allot.allot_type"
    }
  }, [_vm._v("调货退回")])], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货时间",
      "prop": "allot_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择打款时间"
    },
    model: {
      value: (_vm.allot.allot_time),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_time", $$v)
      },
      expression: "allot.allot_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货单位",
      "prop": "allot_hospital"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "filterable": "",
      "placeholder": "请选择调货单位"
    },
    on: {
      "change": _vm.hospitalChange
    },
    model: {
      value: (_vm.allot.allot_hospital),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_hospital", $$v)
      },
      expression: "allot.allot_hospital"
    }
  }, _vm._l((_vm.hospitals), function(item) {
    return _c('el-option', {
      key: item.hospital_id,
      attrs: {
        "label": item.hospital_name,
        "value": item.hospital_id
      }
    })
  }))], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货价",
      "prop": "allot_price",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入调货价"
    },
    model: {
      value: (_vm.allot.allot_price),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_price", $$v)
      },
      expression: "allot.allot_price"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货数量",
      "prop": "allot_number",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入购入数量"
    },
    model: {
      value: (_vm.allot.allot_number),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_number", $$v)
      },
      expression: "allot.allot_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货金额",
      "prop": "allot_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    model: {
      value: (_vm.allot.allot_money),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_money", $$v)
      },
      expression: "allot.allot_money"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "dialog-footer",
    attrs: {
      "slot": "footer"
    },
    slot: "footer"
  }, [_c('el-button', {
    attrs: {
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.dialogFormVisible = false
      }
    }
  }, [_vm._v("取 消")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "loading": _vm.loading,
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.editallots('allot')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1), _vm._v(" "), _c('el-dialog', {
    staticClass: "import_record",
    attrs: {
      "title": "导入调货记录",
      "width": "600px",
      "visible": _vm.dialogFormVisibleImport
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisibleImport = $event
      }
    }
  }, [_c('el-upload', {
    ref: "upload",
    staticClass: "upload-demo",
    attrs: {
      "action": _vm.importAllotsUrl,
      "before-upload": _vm.beforeUpload,
      "on-success": _vm.importAllotsSuccess,
      "file-list": _vm.fileList
    }
  }, [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "size": "small",
      "type": "primary",
      "loading": _vm.loadingImport
    }
  }, [_vm._v(_vm._s(_vm.uploadButtom))]), _vm._v(" "), _c('div', {
    staticClass: "el-upload__tip",
    staticStyle: {
      "display": "inline-block"
    },
    attrs: {
      "slot": "tip"
    },
    slot: "tip"
  }, [_vm._v("　只能上传xls/xlsx文件")])], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.errorMessage),
      expression: "errorMessage"
    }],
    staticStyle: {
      "margin-top": "15px"
    },
    domProps: {
      "innerHTML": _vm._s(_vm.errorMessage)
    }
  })], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-b4568598", module.exports)
  }
}

/***/ }),

/***/ 316:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(317);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-38f1a6a2&scoped=true!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./allotDrugs.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-38f1a6a2&scoped=true!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./allotDrugs.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 317:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.el-table .cell[data-v-38f1a6a2]{\n\twhite-space: nowrap;\n}\n", ""]);

// exports


/***/ }),

/***/ 318:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
	data: function data() {
		var _this = this,
		    _allot;

		var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
		var validateNum = function validateNum(rule, value, callback) {
			var regu = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/;
			if (value === '') {
				callback(new Error('请输入调货数量'));
			} else if (!regu.test(value)) {
				callback(new Error('请输入整数'));
			} else {
				_this.allot.allot_money = _this.allot.allot_money ? _this.allot.allot_money : _this.mul(_this.allot.allot_number, _this.allot.allot_price, 2);
				callback();
			}
		};
		var validateNull = function validateNull(rule, value, callback) {
			if (!_this.isEmpty(_this.allot.allot_return_flag) && _this.isEmpty(value)) {
				callback(new Error('请选择' + rule.labelname));
			} else {
				callback();
			}
		};
		var validateRealReturnMoney = function validateRealReturnMoney(rule, value, callback) {
			if (!_this.isEmpty(_this.allot.allot_return_flag) && _this.isEmpty(value)) {
				callback(new Error('请输入返款单价'));
			} else if (!_this.isEmpty(_this.allot.allot_return_flag) && !_this.isEmpty(value) && !reg.test(value)) {
				callback(new Error('请输入正确的返款单价'));
			} else {
				_this.allot.allot_return_money = _this.allot.allot_return_money ? _this.allot.allot_return_money : _this.mul(_this.allot.allot_number, value, 2);
				callback();
			}
		};
		var validateAllotPrice = function validateAllotPrice(rule, value, callback) {
			if (_this.isEmpty(value)) {
				callback(new Error('请输入调货价'));
			} else if (!reg.test(value)) {
				callback(new Error('请输入正确的调货价'));
			} else {
				_this.allot.allot_money = _this.allot.allot_money ? _this.allot.allot_money : _this.mul(_this.allot.allot_number, value, 2);
				callback();
			}
		};
		var validateBatchNumber = function validateBatchNumber(rule, value, callback) {
			var regu = /^\+?[1-9][0-9]*$/;
			if (!value) {
				callback(new Error('请选择批号'));
			} else {
				callback();
			}
		};
		return {
			dialogFormVisible: false,
			loading: false,
			drugs: [],
			drug: {},
			hospitals: [],
			business: [],
			pageNum: 20,
			currentPage: 1,
			count: 0,
			params: {
				product_type: ['高打'],
				productCommonName: "",
				contactId: "",
				product_code: "",
				business: ""
			},
			remarks: [],
			contacts: [],
			accounts: [],
			allotContacts: [],
			allot: (_allot = {
				allot_time: new Date(),
				allot_number: "",
				allot_hospital: "",
				allot_mack_price: "",
				allot_price: "",
				allot_money: "",
				allot_return_money: "",
				allot_return_time: null, //返款时间
				allot_return_price: "", //返款单价
				allot_return_flag: "", //是否返款标识
				allot_drug_id: "",
				allot_policy_contact_id: "",
				allot_account_id: "" }, _defineProperty(_allot, 'allot_price', ""), _defineProperty(_allot, 'batch_number', ""), _defineProperty(_allot, 'allot_type', "1"), _allot),
			allotRule: {
				batch_number: [{ validator: validateBatchNumber, trigger: 'blur' }],
				allot_price: [{ validator: validateAllotPrice, trigger: 'blur' }],
				allot_return_price: [{ validator: validateRealReturnMoney, trigger: 'blur' }],
				allot_account_id: [{ validator: validateNull, labelname: '返款账号', trigger: 'change' }],
				allot_return_time: [{ validator: validateNull, labelname: '返款时间', trigger: 'change' }],
				allot_number: [{ validator: validateNum, trigger: 'blur' }],
				// allot_return_price:[{validator:validateRealReturnMoney,trigger: 'blur' }],
				allot_time: [{ required: true, message: '请选择调货时间', trigger: 'blur,change' }],
				allot_hospital: [{ required: true, message: '请输入调货单位', trigger: 'blur,change' }]
			},
			batchStockList: [],
			tableHeight: 0
		};
	},
	updated: function updated() {
		this.tableHeight = $(window).height() - 170 - $(".search").height();
		var that = this;
		$(window).resize(function () {
			that.tableHeight = $(window).height() - 170 - $(".search").height();
		});
	},
	activated: function activated() {
		this.getContacts();
		this.getDrugsList();
		// this.getBankAccount();
		this.hospitals = JSON.parse(sessionStorage["allot_hospital"]);
		this.business = JSON.parse(sessionStorage["productbusiness"]);
		this.allotContacts = JSON.parse(sessionStorage["allotcontacts"]);
	},
	mounted: function mounted() {},

	methods: {
		hospitalChange: function hospitalChange() {
			var _self = this;
			this.jquery('/iae/allot/getAllotPolicy', {
				drugId: this.drug.product_id,
				hospitalId: this.allot.allot_hospital
			}, function (res) {
				if (res.message.length > 0) {
					_self.allot.allot_policy_contact_id = res.message[0].allot_policy_contact_id ? res.message[0].allot_policy_contact_id : "";
					_self.allot.allot_return_price = res.message[0].allot_policy_money ? res.message[0].allot_policy_money : "";
					_self.allot.allot_policy_remark = res.message[0].allot_policy_remark ? res.message[0].allot_policy_remark : "";
					_self.allot.allot_policy_formula = res.message[0].allot_policy_formula ? res.message[0].allot_policy_formula : "";
					_self.allot.allot_policy_percent = res.message[0].allot_policy_percent ? res.message[0].allot_policy_percent : "";
				} else {
					_self.allot.allot_policy_contact_id = "";
					_self.allot.allot_return_price = "";
					_self.allot.allot_policy_remark = "";
					_self.allot.allot_policy_formula = "";
					_self.allot.allot_policy_percent = "";
				}
			});
		},
		getBankAccount: function getBankAccount() {
			var _self = this;
			this.jquery("/iae/bankaccount/getAllAccounts", null, function (res) {
				//查询账号
				_self.accounts = res.message;
			});
		},
		getContacts: function getContacts() {
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['高打品种'] }, function (res) {
				_self.contacts = res.message;
			});
		},
		handleSelect: function handleSelect(item) {
			this.allot.allot_hospital = item.allot_hospital;
		},
		querySearch: function querySearch(queryString, cb) {
			var hospitals = this.hospitals;
			var results = queryString ? hospitals.filter(this.createFilter(queryString)) : hospitals;
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		createFilter: function createFilter(queryString) {
			return function (hospitals) {
				if (hospitals.allot_hospital) {
					return hospitals.allot_hospital.toLowerCase().indexOf(queryString.toLowerCase()) > -1;
				} else {
					return;
				}
			};
		},

		//选择要进货的药品
		selectRow: function selectRow(scope) {
			var temp = JSON.stringify(scope.row);
			this.drug = JSON.parse(temp);
			if (this.$refs["allot"]) {
				this.$refs["allot"].resetFields();
			}
			this.dialogFormVisible = true;
			//查询批次库存
			if (this.drug.product_type == '高打') {
				//如果是高打品种，则选择批次库存
				var _self = this;
				this.jquery('/iae/stock/getBatchStockByDrugId', { productId: this.drug.product_id }, function (res) {
					_self.batchStockList = res.message;
				});
			}
			this.allot.allot_price = this.drug.product_price;
		},

		//搜索所有药品信息
		searchDrugsList: function searchDrugsList() {
			this.getDrugsList();
		},
		returnallot: function returnallot() {
			this.$router.push("/main/allot");
		},
		formatterDate: function formatterDate(row, column, cellValue) {
			if (cellValue && typeof cellValue == "string") {
				var temp = cellValue.substring(0, 10);
				var d = new Date(temp);
				d.setDate(d.getDate() + 1);
				return d.format("yyyy-MM-dd");
			} else if (cellValue && (typeof cellValue === 'undefined' ? 'undefined' : _typeof(cellValue)) == "object") {
				return new Date(cellValue).format("yyyy-MM-dd");
			} else {
				return "";
			}
		},
		addallots: function addallots(formName) {
			var _self = this;
			this.allot.allot_mack_price = this.drug.product_mack_price;
			this.allot.allot_drug_id = this.drug.product_id;
			this.allot.product_type = this.drug.product_type;
			this.allot.product_price = this.drug.product_price;
			this.allot.product_return_money = this.allot.product_return_money ? this.allot.product_return_money : this.drug.product_return_money;
			this.allot.stock = this.drug.stock;
			for (var i = 0; i < this.batchStockList.length; i++) {
				var t = new Date(this.batchStockList[i].batch_stock_time).format("yyyy-MM-dd");
				if (this.allot.batch_number == this.batchStockList[i].batch_number + "(" + t + ")") {
					this.allot.allot_purchase_id = this.batchStockList[i].batch_stock_purchase_id;
					var temp = this.batchStockList[i].purchase_other_money;
					this.allot.allot_other_money = temp ? temp * this.allot.allot_number / this.batchStockList[i].purchase_number : 0;
					this.allot.realReturnMoney = this.batchStockList[i].refunds_real_money / this.batchStockList[i].purchase_number;
					break;
				}
			}
			this.allot.account_detail = this.formatterDate(null, null, this.allot.allot_time) + this.allot.allot_hospital + "调货（" + this.allot.allot_number + "）" + this.drug.product_common_name + "返款";
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_self.loading = true;
					_self.jquery('/iae/allot/saveAllot', _self.allot, function (res) {
						_self.$confirm('新增成功', '提示', {
							confirmButtonText: '继续添加',
							cancelButtonText: '返回调货列表',
							type: 'success'
						}).then(function () {
							_self.$refs["allot"].resetFields();
							_self.dialogFormVisible = false;
							_self.loading = false;
						}).catch(function () {
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.$router.push({ path: '/main/allot' });
						});
					});
				} else {
					return false;
				}
			});
		},
		getDrugsList: function getDrugsList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 20;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/drugs/getDrugs', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.drugs = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		returnMoney: function returnMoney() {
			this.allot.allot_return_money = this.mul(this.allot.allot_return_price, this.allot.allot_number, 2);
		},
		reSearch: function reSearch() {
			this.$refs["params"].resetFields();
			this.getDrugsList();
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getDrugsList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getDrugsList();
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 319:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticStyle: {
      "box-sizing": "border-box",
      "padding": "0px 10px"
    }
  }, [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("销售管理")]), _vm._v(" "), _c('el-breadcrumb-item', {
    attrs: {
      "to": {
        path: '/main/allot'
      }
    }
  }, [_vm._v("调货管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("选择药品"), _c('a', {
    staticStyle: {
      "color": "#f24040"
    }
  }, [_vm._v("（请先选择销售药品）")])])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "产品名称",
      "prop": "productCommonName"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品名称"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        return _vm.searchDrugsList($event)
      }
    },
    model: {
      value: (_vm.params.productCommonName),
      callback: function($$v) {
        _vm.$set(_vm.params, "productCommonName", $$v)
      },
      expression: "params.productCommonName"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品编码",
      "prop": "product_code"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品编码"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        return _vm.searchDrugsList($event)
      }
    },
    model: {
      value: (_vm.params.product_code),
      callback: function($$v) {
        _vm.$set(_vm.params, "product_code", $$v)
      },
      expression: "params.product_code"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "联系人",
      "prop": "contactId"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.contactId),
      callback: function($$v) {
        _vm.$set(_vm.params, "contactId", $$v)
      },
      expression: "params.contactId"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.contacts), function(item) {
    return _c('el-option', {
      key: item.contacts_id,
      attrs: {
        "label": item.contacts_name,
        "value": item.contacts_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "　　商业",
      "prop": "business"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择商业"
    },
    model: {
      value: (_vm.params.business),
      callback: function($$v) {
        _vm.$set(_vm.params, "business", $$v)
      },
      expression: "params.business"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.business), function(item) {
    return _c('el-option', {
      key: item.business_id,
      attrs: {
        "label": item.business_name,
        "value": item.business_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.searchDrugsList
    }
  }, [_vm._v("查询")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.reSearch
    }
  }, [_vm._v("重置")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.returnallot
    }
  }, [_vm._v("返回列表")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.drugs,
      "size": "mini",
      "height": _vm.tableHeight,
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "product_common_name",
      "label": "产品名称",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_code",
      "label": "产品编号",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_specifications",
      "label": "产品规格",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_makesmakers",
      "label": "生产厂家",
      "width": "150"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_packing",
      "label": "包装",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_unit",
      "label": "单位",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_price",
      "label": "中标价",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_mack_price",
      "label": "打款价",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_discount",
      "label": "毛利率(百分比)",
      "formatter": _vm.formatPercent,
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "联系人"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "right",
      "label": "操作",
      "width": "70"
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(scope) {
        return [_c('el-button', {
          directives: [{
            name: "dbClick",
            rawName: "v-dbClick"
          }],
          attrs: {
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.selectRow(scope)
            }
          }
        }, [_vm._v("选择")])]
      }
    }])
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "page_div"
  }, [_c('el-pagination', {
    attrs: {
      "background": "",
      "current-page": _vm.currentPage,
      "page-sizes": [10, 20, 50, 100],
      "page-size": _vm.pageNum,
      "layout": "total, sizes, prev, pager, next, jumper",
      "total": _vm.count
    },
    on: {
      "size-change": _vm.handleSizeChange,
      "current-change": _vm.handleCurrentChange
    }
  })], 1), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "新增调货记录",
      "width": "700px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-collapse', {
    model: {
      value: (_vm.activeNames),
      callback: function($$v) {
        _vm.activeNames = $$v
      },
      expression: "activeNames"
    }
  }, [_c('el-collapse-item', {
    attrs: {
      "title": '药品信息（药品名：' + _vm.drug.product_common_name + '）',
      "name": "2"
    }
  }, [_c('div', [_c('span', [_vm._v("产品编号:")]), _vm._v(_vm._s(_vm.drug.product_code))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("产品规格:")]), _vm._v(_vm._s(_vm.drug.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.drug.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("包装:")]), _vm._v(_vm._s(_vm.drug.product_packing))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("单位:")]), _vm._v(_vm._s(_vm.drug.product_unit))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("打款价:")]), _vm._v(_vm._s(_vm.drug.product_mack_price))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.drug.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "allot",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.allot,
      "status-icon": "",
      "rules": _vm.allotRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('div', [_c('el-form-item', {
    attrs: {
      "label": "调货类型",
      "prop": "sale_type"
    }
  }, [_c('el-radio', {
    attrs: {
      "label": "1"
    },
    model: {
      value: (_vm.allot.allot_type),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_type", $$v)
      },
      expression: "allot.allot_type"
    }
  }, [_vm._v("调货出库")]), _vm._v(" "), _c('el-radio', {
    attrs: {
      "label": "2"
    },
    model: {
      value: (_vm.allot.allot_type),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_type", $$v)
      },
      expression: "allot.allot_type"
    }
  }, [_vm._v("调货退回")])], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货时间",
      "prop": "allot_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择打款时间"
    },
    model: {
      value: (_vm.allot.allot_time),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_time", $$v)
      },
      expression: "allot.allot_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货单位",
      "prop": "allot_hospital"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "filterable": "",
      "placeholder": "请选择供货单位"
    },
    on: {
      "change": _vm.hospitalChange
    },
    model: {
      value: (_vm.allot.allot_hospital),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_hospital", $$v)
      },
      expression: "allot.allot_hospital"
    }
  }, _vm._l((_vm.hospitals), function(item) {
    return _c('el-option', {
      key: item.hospital_id,
      attrs: {
        "label": item.hospital_name,
        "value": item.hospital_id
      }
    })
  }))], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货价",
      "prop": "allot_price",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入调货价"
    },
    model: {
      value: (_vm.allot.allot_price),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_price", $$v)
      },
      expression: "allot.allot_price"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货数量",
      "prop": "allot_number",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入购入数量"
    },
    model: {
      value: (_vm.allot.allot_number),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_number", $$v)
      },
      expression: "allot.allot_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货金额",
      "prop": "allot_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    model: {
      value: (_vm.allot.allot_money),
      callback: function($$v) {
        _vm.$set(_vm.allot, "allot_money", $$v)
      },
      expression: "allot.allot_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "批号",
      "prop": "batch_number",
      "required": true
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "filterable": "",
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.allot.batch_number),
      callback: function($$v) {
        _vm.$set(_vm.allot, "batch_number", $$v)
      },
      expression: "allot.batch_number"
    }
  }, _vm._l((_vm.batchStockList), function(item) {
    return (item.batch_stock_number > 0 || _vm.allot.allot_type == '2') ? _c('el-option', {
      key: item.batch_number + '(' + new Date(item.batch_stock_time).format('yyyy-MM-dd').substring(0, 10) + ')',
      attrs: {
        "label": item.batch_number + '(' + new Date(item.batch_stock_time).format('yyyy-MM-dd').substring(0, 10) + ')',
        "value": item.batch_number + '(' + new Date(item.batch_stock_time).format('yyyy-MM-dd').substring(0, 10) + ')'
      }
    }, [_c('span', {
      staticStyle: {
        "float": "left"
      }
    }, [_vm._v(_vm._s(item.batch_number + '(' + new Date(item.batch_stock_time).format('yyyy-MM-dd') + ')'))]), _vm._v(" "), _c('span', {
      staticStyle: {
        "float": "right",
        "color": "#8492a6",
        "font-size": "13px",
        "padding-left": "10px"
      }
    }, [_vm._v("库存：" + _vm._s(item.batch_stock_number))])]) : _vm._e()
  }))], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "dialog-footer",
    attrs: {
      "slot": "footer"
    },
    slot: "footer"
  }, [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.dialogFormVisible = false
      }
    }
  }, [_vm._v("取 消")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "loading": _vm.loading,
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.addallots('allot')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-38f1a6a2", module.exports)
  }
}

/***/ }),

/***/ 320:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(321);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-21074fa6!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./allocation.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-21074fa6!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./allocation.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 321:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.search .el-form-item__label{\n\t\tpadding-left: 0 !important;\n}\n.el-table tr.current-row > td{\n\t\t color: #f24040 !important;\n}\n.el-step__title{\n\t\tfont-size: 14px !important;\n\t\tline-height: 24px;\n}\n.el-step__description{\n\t\tfont-size: 12px !important;\n\t\tline-height: 24px;\n}\n.step_class{\n\t\twidth:760px;\n\t\tmargin-left: -10px;\n    padding: 10px;\n    background: #f4f4f4;\n\t\tmargin-top: 20px;\n}\n", ""]);

// exports


/***/ }),

/***/ 322:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
	data: function data() {
		var validateNum = function validateNum(rule, value, callback) {
			var regu = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/;
			if (value === '') {
				callback(new Error('请输入调拨数量'));
			} else if (!regu.test(value)) {
				callback(new Error('请输入整数'));
			} else {
				callback();
			}
		};
		var nowDate = new Date();
		var beforeDate = new Date();
		beforeDate.setFullYear(nowDate.getFullYear() - 1);
		return {
			pickerOptions2: {
				shortcuts: [{
					text: '本月',
					onClick: function onClick(picker) {
						var end = new Date();
						var start = new Date(end.getFullYear() + "-" + (end.getMonth() + 1) + "-01");
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: nowDate.getFullYear() + '年',
					onClick: function onClick(picker) {
						var end = new Date();
						var start = new Date(end.getFullYear() + "-01" + "-01");
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: beforeDate.getFullYear() + '年',
					onClick: function onClick(picker) {
						var start = new Date(beforeDate.getFullYear() + "-01" + "-01");
						var end = new Date(beforeDate.getFullYear() + "-12" + "-31");
						picker.$emit('pick', [start, end]);
					}
				}]
			},
			params: {
				allocation_time: [],
				businessFront: "",
				businessAfter: "",
				productCommonName: ""
			},
			paramsFront: {
				productCommonName: "",
				product_code: "",
				business: "",
				product_type: ['高打']
			},
			paramsAfter: {
				productCommonName: "",
				product_code: "",
				business: "",
				product_makesmakers: "",
				product_specifications: "",
				product_type: ['高打']
			},
			loading: false,
			pageNum: 20,
			currentPage: 1,
			count: 0,
			pageNumFront: 5,
			currentPageFront: 1,
			countFront: 0,
			pageNumAfter: 5,
			currentPageAfter: 1,
			countAfter: 0,
			dialogFormVisible: false,
			dialogFormVisibleEdit: false,
			authCode: "",
			allocation: [],
			active: 1,
			business: [],
			drugsFront: [],
			drugsAfter: [],
			currentRowFront: null,
			currentRowAfter: null,
			allocationData: {
				allocation_front_drug_id: "",
				allocation_front_business_id: "",
				allocation_front_product_code: "",
				allocation_front_business_name: "",
				allocation_after_drug_id: "",
				allocation_after_business_id: "",
				allocation_after_product_code: "",
				allocation_after_business_name: "",
				allocation_number: "",
				allocation_remark: "",
				allocation_time: nowDate,
				allocation_purchase_id: ""
			},
			editAllocationData: {},
			allocationDataRule: {
				allocation_time: [{ required: true, message: '请选择调拨时间', trigger: 'change' }],
				allocation_number: [{ validator: validateNum, trigger: 'blur' }]
			},
			dialogFormVisibleImport: false,
			errorMessage: "",
			importAllocationUrl: "",
			uploadButtom: "导入调拨记录"
		};
	},
	updated: function updated() {
		this.tableHeight = $(window).height() - 170 - $(".search").height();
		var that = this;
		$(window).resize(function () {
			that.tableHeight = $(window).height() - 170 - $(".search").height();
		});
	},
	activated: function activated() {
		this.getAllocationList();
		this.getProductBusiness();
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted: function mounted() {
		this.importAllocationUrl = this.$bus.data.host + "/iae/allocation/importAllocation";
	},

	methods: {
		importShow: function importShow() {
			this.dialogFormVisibleImport = true;
			this.errorMessage = "";
			if (this.$refs.upload) {
				this.$refs.upload.clearFiles();
			}
		},
		beforeUpload: function beforeUpload(file) {
			this.errorMessage = "";
			this.uploadButtom = "上传成功，正在导入...";
			this.loadingImport = true;
		},
		importAllotsSuccess: function importAllotsSuccess(response, file, fileList) {
			this.uploadButtom = "导入调拨记录";
			this.loadingImport = false;
			var downloadErrorMessage = "<a style='color:red;' href='" + this.$bus.data.host + "/iae/allocation/downloadErrorAllocation'>下载错误数据</a>";
			this.errorMessage = response.message + downloadErrorMessage;
		},
		downloadTemplate: function downloadTemplate() {
			window.location.href = this.$bus.data.host + "/download/template_allocation.xlsx";
		},
		exportAllocation: function exportAllocation() {
			var url = this.$bus.data.host + "/iae/allocation/exportAllocation";
			this.download(url, this.params);
		},
		editallots: function editallots(formName) {
			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_self.loading = true;
					_self.jquery('/iae/allocation/editAllocation', _self.editAllocationData, function (res) {
						_self.dialogFormVisibleEdit = false;
						_self.loading = false;
						_self.$message({ showClose: true, message: '修改成功', type: 'success' });
						_self.getAllocationList();
					});
				} else {
					return false;
				}
			});
		},
		editRow: function editRow(scope) {
			//编辑药品信息
			this.dialogFormVisibleEdit = true;
			var temp = JSON.stringify(scope.row);
			this.editAllocationData = JSON.parse(temp);
			this.editAllocationData.front_allocation_message = temp;
			this.editAllocationData.allocation_number_temp = this.editAllocationData.allocation_number;
		},
		deleteRow: function deleteRow(scope) {
			var _this = this;

			//删除
			this.$confirm('是否删除?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(function () {
				_this.deleteItem(scope);
			}).catch(function () {});
		},
		deleteItem: function deleteItem(scope) {
			var _self = this;
			this.jquery('/iae/allocation/deleteAllocation', {
				allocation_id: scope.row.allocation_id,
				allocation_number: -scope.row.allocation_number,
				allocation_front_drug_id: scope.row.allocation_front_drug_id,
				allocation_after_drug_id: scope.row.allocation_after_drug_id,
				allocation_purchase_id: scope.row.allocation_purchase_id
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getAllocationList();
				_self.dialogFormVisible = false;
			});
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getAllocationList();
		},
		getAllocationList: function getAllocationList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 20;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/allocation/getAllocationList', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.allocation = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		save: function save(formName) {
			var _this2 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_self.loading = true;
					_this2.jquery('/iae/allocation/saveAllocation', _self.allocationData, function (res) {
						_self.$message({ showClose: true, message: '新增成功', type: 'success' });
						_self.dialogFormVisible = false;
						_self.loading = false;
						_self.getAllocationList();
					});
				} else {
					return false;
				}
			});
		},
		previous: function previous() {
			if (this.active-- < 2) this.active = 1;
		},
		next: function next() {
			if (this.active == "1" && !this.currentRowFront) {
				this.$message({ message: '请先选择调拨前药品', type: 'warning' });
				return;
			} else if (this.active == "1") {
				this.allocationData.allocation_purchase_id = this.currentRowFront.batch_stock_purchase_id;
				this.allocationData.allocation_front_drug_id = this.currentRowFront.product_id;
				this.allocationData.allocation_front_business_id = this.currentRowFront.product_business;
				this.allocationData.allocation_front_product_code = this.currentRowFront.product_code;
				this.allocationData.allocation_front_business_name = this.currentRowFront.business_name;
				this.allocationData.allocation_batch_number = this.currentRowFront.batch_number;
				this.paramsAfter.productCommonName = this.currentRowFront.product_common_name;
				this.paramsAfter.product_makesmakers = this.currentRowFront.product_makesmakers;
				this.paramsAfter.product_specifications = this.currentRowFront.product_specifications;
				this.currentRowAfter = null;
				this.getDrugsAfterList();
			}
			if (this.active == "2" && !this.currentRowAfter) {
				this.$message({ message: '请先选择调拨后药品', type: 'warning' });
				return;
			} else if (this.active == "2" && this.currentRowFront.product_id == this.currentRowAfter.product_id) {
				this.$message({ message: '编码相同不可调货', type: 'warning' });
				return;
			} else if (this.active == "2") {
				this.allocationData.allocation_after_drug_id = this.currentRowAfter.product_id;
				this.allocationData.allocation_after_business_id = this.currentRowAfter.product_business;
				this.allocationData.allocation_after_product_code = this.currentRowAfter.product_code;
				this.allocationData.allocation_after_business_name = this.currentRowAfter.business_name;
				this.allocationData.allocation_remark = "";
				this.allocationData.allocation_time = new Date();
				this.allocationData.allocation_number = "";
			}
			if (this.active++ > 2) this.active = 2;
		},
		getDrugsAfterList: function getDrugsAfterList() {
			var _self = this;
			if (!_self.currentPageAfter) {
				_self.currentPageAfter = 1;
			}
			if (!_self.pageNumAfter) {
				_self.pageNumAfter = 10;
			}
			var page = {
				start: (_self.currentPageAfter - 1) * _self.pageNumAfter,
				limit: _self.pageNumAfter
			};
			this.jquery('/iae/drugs/getDrugs', {
				data: _self.paramsAfter,
				page: page
			}, function (res) {
				_self.drugsAfter = res.message.data;
				_self.pageNumAfter = parseInt(res.message.limit);
				_self.countAfter = res.message.totalCount;
			});
		},
		getDrugsFrontList: function getDrugsFrontList() {
			var _self = this;
			if (!_self.currentPageFront) {
				_self.currentPageFront = 1;
			}
			if (!_self.pageNumFront) {
				_self.pageNumFront = 10;
			}
			var page = {
				start: (_self.currentPageFront - 1) * _self.pageNumFront,
				limit: _self.pageNumFront
			};
			this.jquery('/iae/allocation/getAllocationDrugs', {
				data: _self.paramsFront,
				page: page
			}, function (res) {
				_self.drugsFront = res.message.data;
				_self.pageNumFront = parseInt(res.message.limit);
				_self.countFront = res.message.totalCount;
			});
		},
		getProductBusiness: function getProductBusiness() {
			var _self = this;
			this.jquery("/iae/business/getAllBusiness", null, function (res) {
				//查询商业
				_self.business = res.message;
			});
		},
		formatterDate: function formatterDate(row, column, cellValue) {
			if (cellValue && typeof cellValue == "string") {
				var temp = cellValue.substring(0, 10);
				var d = new Date(temp);
				d.setDate(d.getDate() + 1);
				return d.format("yyyy-MM-dd");
			} else if (cellValue && (typeof cellValue === 'undefined' ? 'undefined' : _typeof(cellValue)) == "object") {
				return new Date(cellValue).format("yyyy-MM-dd");
			} else {
				return "";
			}
		},
		add: function add() {
			this.active = 1;
			this.currentRowFront = null;
			this.currentRowAfter = null;
			this.getDrugsFrontList();
			this.dialogFormVisible = true;
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getAllocationList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getAllocationList();
		},
		handleSizeChangeFront: function handleSizeChangeFront(val) {
			this.pageNumFront = val;
			this.currentPageFront = 1;
			this.getDrugsFrontList();
		},
		handleCurrentChangeFront: function handleCurrentChangeFront(val) {
			this.currentPageFront = val;
			this.getDrugsFrontList();
		},
		handleSizeChangeAfter: function handleSizeChangeAfter(val) {
			this.pageNumAfter = val;
			this.currentPageAfter = 1;
			this.getDrugsAfterList();
		},
		handleCurrentChangeAfter: function handleCurrentChangeAfter(val) {
			this.currentPageAfter = val;
			this.getDrugsAfterList();
		},
		handleCurrentChangeRow: function handleCurrentChangeRow(val) {
			this.currentRowFront = val;
		},
		handleCurrentChangeAfterRow: function handleCurrentChangeAfterRow(val) {
			this.currentRowAfter = val;
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 323:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "allot_list",
    staticStyle: {
      "box-sizing": "border-box",
      "padding": "0px 10px"
    }
  }, [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("销售管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("商业调拨")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "调拨时间",
      "prop": "allocation_time"
    }
  }, [_c('el-date-picker', {
    attrs: {
      "type": "daterange",
      "size": "mini",
      "align": "right",
      "unlink-panels": "",
      "range-separator": "至",
      "start-placeholder": "开始日期",
      "end-placeholder": "结束日期",
      "picker-options": _vm.pickerOptions2
    },
    model: {
      value: (_vm.params.allocation_time),
      callback: function($$v) {
        _vm.$set(_vm.params, "allocation_time", $$v)
      },
      expression: "params.allocation_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品名称",
      "prop": "productCommonName"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品名称/助记码"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.productCommonName),
      callback: function($$v) {
        _vm.$set(_vm.params, "productCommonName", $$v)
      },
      expression: "params.productCommonName"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调拨前商业",
      "prop": "businessFront"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择调拨前商业"
    },
    model: {
      value: (_vm.params.businessFront),
      callback: function($$v) {
        _vm.$set(_vm.params, "businessFront", $$v)
      },
      expression: "params.businessFront"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.business), function(item) {
    return _c('el-option', {
      key: item.business_id,
      attrs: {
        "label": item.business_name,
        "value": item.business_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调拨后商业",
      "prop": "businessAfter"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择调拨后商业"
    },
    model: {
      value: (_vm.params.businessAfter),
      callback: function($$v) {
        _vm.$set(_vm.params, "businessAfter", $$v)
      },
      expression: "params.businessAfter"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.business), function(item) {
    return _c('el-option', {
      key: item.business_id,
      attrs: {
        "label": item.business_name,
        "value": item.business_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',175,') > -1),
      expression: "authCode.indexOf(',175,') > -1"
    }],
    staticStyle: {
      "margin-left": "14px"
    },
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.reSearch(false)
      }
    }
  }, [_vm._v("查询")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',175,') > -1),
      expression: "authCode.indexOf(',175,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.reSearch(true)
      }
    }
  }, [_vm._v("重置")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',172,') > -1),
      expression: "authCode.indexOf(',172,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.add
    }
  }, [_vm._v("新增")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',176,') > -1),
      expression: "authCode.indexOf(',176,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.exportAllocation
    }
  }, [_vm._v("导出")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',177,') > -1),
      expression: "authCode.indexOf(',177,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.importShow
    }
  }, [_vm._v("导入")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',177,') > -1),
      expression: "authCode.indexOf(',177,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.downloadTemplate
    }
  }, [_vm._v("导入模板下载")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.allocation,
      "size": "mini",
      "height": _vm.tableHeight,
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "allocation_time",
      "label": "调拨时间",
      "width": "80",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_common_name",
      "label": "产品通用名",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_specifications",
      "label": "产品规格",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_makesmakers",
      "label": "生产厂家",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allocation_front_business_name",
      "label": "调拨前商业名称"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allocation_front_product_code",
      "label": "调拨前产品编码"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allocation_after_business_name",
      "label": "调拨后商业名称"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allocation_after_product_code",
      "label": "调拨后产品编码"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allocation_batch_number",
      "label": "批号"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allocation_number",
      "label": "调拨数量"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allocation_remark",
      "label": "备注"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "right",
      "label": "操作",
      "width": "100"
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(scope) {
        return [_c('el-button', {
          directives: [{
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',174,') > -1),
            expression: "authCode.indexOf(',174,') > -1"
          }, {
            name: "dbClick",
            rawName: "v-dbClick"
          }],
          attrs: {
            "icon": "el-icon-delete",
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.deleteRow(scope)
            }
          }
        }), _vm._v(" "), _c('el-button', {
          directives: [{
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',173,') > -1),
            expression: "authCode.indexOf(',173,') > -1"
          }, {
            name: "dbClick",
            rawName: "v-dbClick"
          }],
          attrs: {
            "icon": "el-icon-edit-outline",
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.editRow(scope)
            }
          }
        })]
      }
    }])
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "page_div"
  }, [_c('el-pagination', {
    attrs: {
      "background": "",
      "current-page": _vm.currentPage,
      "page-sizes": [10, 20, 50, 100],
      "page-size": _vm.pageNum,
      "layout": "total, sizes, prev, pager, next, jumper",
      "total": _vm.count
    },
    on: {
      "size-change": _vm.handleSizeChange,
      "current-change": _vm.handleCurrentChange
    }
  })], 1), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "新增调拨记录",
      "width": "800px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('div', {
    staticStyle: {
      "width": "600px",
      "margin": "0 auto"
    }
  }, [_c('el-steps', {
    attrs: {
      "active": _vm.active,
      "align-center": true
    }
  }, [_c('el-step', {
    attrs: {
      "title": "步骤 1",
      "description": "选择调拨前药品"
    }
  }), _vm._v(" "), _c('el-step', {
    attrs: {
      "title": "步骤 2",
      "description": "选择调拨后药品"
    }
  }), _vm._v(" "), _c('el-step', {
    attrs: {
      "title": "步骤 3",
      "description": "填写调拨数量"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.active == 1),
      expression: "active == 1"
    }],
    staticClass: "step_class"
  }, [_c('el-form', {
    ref: "paramsFront",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.paramsFront,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "产品名称",
      "prop": "productCommonName"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "150px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品名称/助记码"
    },
    model: {
      value: (_vm.paramsFront.productCommonName),
      callback: function($$v) {
        _vm.$set(_vm.paramsFront, "productCommonName", $$v)
      },
      expression: "paramsFront.productCommonName"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品编号",
      "prop": "product_code"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "150px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品编号"
    },
    model: {
      value: (_vm.paramsFront.product_code),
      callback: function($$v) {
        _vm.$set(_vm.paramsFront, "product_code", $$v)
      },
      expression: "paramsFront.product_code"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "商业",
      "prop": "business"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "150px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择商业"
    },
    model: {
      value: (_vm.paramsFront.business),
      callback: function($$v) {
        _vm.$set(_vm.paramsFront, "business", $$v)
      },
      expression: "paramsFront.business"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.business), function(item) {
    return _c('el-option', {
      key: item.business_id,
      attrs: {
        "label": item.business_name,
        "value": item.business_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.getDrugsFrontList()
      }
    }
  }, [_vm._v("查询")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.drugsFront,
      "size": "mini",
      "stripe": true,
      "border": true,
      "highlight-current-row": ""
    },
    on: {
      "current-change": _vm.handleCurrentChangeRow
    }
  }, [_c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "product_common_name",
      "label": "产品通用名",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_code",
      "label": "产品编码",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_specifications",
      "label": "产品规格",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_makesmakers",
      "label": "生产厂家",
      "width": "150"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_packing",
      "label": "包装",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_unit",
      "label": "单位",
      "width": "50"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "batch_number",
      "label": "批号"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "batch_stock_number",
      "label": "库存"
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "page_div"
  }, [_c('el-pagination', {
    attrs: {
      "background": "",
      "current-page": _vm.currentPageFront,
      "page-sizes": [5, 10, 50, 100],
      "page-size": _vm.pageNumFront,
      "layout": "total, sizes, prev, pager, next, jumper",
      "total": _vm.countFront
    },
    on: {
      "size-change": _vm.handleSizeChangeFront,
      "current-change": _vm.handleCurrentChangeFront
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.active == 2),
      expression: "active == 2"
    }],
    staticClass: "step_class"
  }, [_c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "产品编号",
      "prop": "product_code"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "150px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "产品编号"
    },
    model: {
      value: (_vm.paramsAfter.product_code),
      callback: function($$v) {
        _vm.$set(_vm.paramsAfter, "product_code", $$v)
      },
      expression: "paramsAfter.product_code"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "商业",
      "prop": "business"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "150px"
    },
    attrs: {
      "size": "mini",
      "filterable": "",
      "placeholder": "请选择商业"
    },
    model: {
      value: (_vm.paramsAfter.business),
      callback: function($$v) {
        _vm.$set(_vm.paramsAfter, "business", $$v)
      },
      expression: "paramsAfter.business"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.business), function(item) {
    return _c('el-option', {
      key: item.business_id,
      attrs: {
        "label": item.business_name,
        "value": item.business_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.getDrugsAfterList()
      }
    }
  }, [_vm._v("查询")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.drugsAfter,
      "size": "mini",
      "stripe": true,
      "border": true,
      "highlight-current-row": ""
    },
    on: {
      "current-change": _vm.handleCurrentChangeAfterRow
    }
  }, [_c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "product_common_name",
      "label": "产品通用名",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_code",
      "label": "产品编码",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_specifications",
      "label": "产品规格",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_makesmakers",
      "label": "生产厂家",
      "width": "150"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_packing",
      "label": "包装",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_unit",
      "label": "单位",
      "width": "50"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业"
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "page_div"
  }, [_c('el-pagination', {
    attrs: {
      "background": "",
      "current-page": _vm.currentPageAfter,
      "page-sizes": [5, 10, 50, 100],
      "page-size": _vm.pageNumAfter,
      "layout": "total, sizes, prev, pager, next, jumper",
      "total": _vm.countAfter
    },
    on: {
      "size-change": _vm.handleSizeChangeAfter,
      "current-change": _vm.handleCurrentChangeAfter
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.active == 3),
      expression: "active == 3"
    }],
    staticClass: "step_class"
  }, [_c('el-form', {
    ref: "allocationData",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.allocationData,
      "status-icon": "",
      "rules": _vm.allocationDataRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "调拨时间",
      "prop": "allocation_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择调拨时间"
    },
    model: {
      value: (_vm.allocationData.allocation_time),
      callback: function($$v) {
        _vm.$set(_vm.allocationData, "allocation_time", $$v)
      },
      expression: "allocationData.allocation_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调拨数量",
      "prop": "allocation_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入调拨数量"
    },
    model: {
      value: (_vm.allocationData.allocation_number),
      callback: function($$v) {
        _vm.$set(_vm.allocationData, "allocation_number", $$v)
      },
      expression: "allocationData.allocation_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备注",
      "prop": "allocation_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "placeholder": "请输入备注"
    },
    model: {
      value: (_vm.allocationData.allocation_remark),
      callback: function($$v) {
        _vm.$set(_vm.allocationData, "allocation_remark", $$v)
      },
      expression: "allocationData.allocation_remark"
    }
  })], 1)], 1)], 1), _vm._v(" "), _c('div', {
    staticStyle: {
      "text-align": "right",
      "padding-bottom": "20px"
    }
  }, [_c('el-button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.active > 1),
      expression: "active > 1"
    }],
    staticStyle: {
      "margin-top": "12px"
    },
    on: {
      "click": _vm.previous
    }
  }, [_vm._v("上一步")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.active < 3),
      expression: "active < 3"
    }],
    staticStyle: {
      "margin-top": "12px"
    },
    on: {
      "click": _vm.next
    }
  }, [_vm._v("下一步")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.active == 3),
      expression: "active == 3"
    }],
    staticStyle: {
      "margin-top": "12px"
    },
    on: {
      "click": function($event) {
        _vm.save('allocationData')
      }
    }
  }, [_vm._v("保存")])], 1)]), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "修改调拨记录",
      "width": "700px",
      "visible": _vm.dialogFormVisibleEdit
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisibleEdit = $event
      }
    }
  }, [_c('el-form', {
    ref: "editAllocationData",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.editAllocationData,
      "status-icon": "",
      "rules": _vm.allocationDataRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "调拨时间",
      "prop": "allocation_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择调拨时间"
    },
    model: {
      value: (_vm.editAllocationData.allocation_time),
      callback: function($$v) {
        _vm.$set(_vm.editAllocationData, "allocation_time", $$v)
      },
      expression: "editAllocationData.allocation_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调拨数量",
      "prop": "allocation_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入调拨数量"
    },
    model: {
      value: (_vm.editAllocationData.allocation_number),
      callback: function($$v) {
        _vm.$set(_vm.editAllocationData, "allocation_number", $$v)
      },
      expression: "editAllocationData.allocation_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备注",
      "prop": "allocation_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "请输入备注"
    },
    model: {
      value: (_vm.editAllocationData.allocation_remark),
      callback: function($$v) {
        _vm.$set(_vm.editAllocationData, "allocation_remark", $$v)
      },
      expression: "editAllocationData.allocation_remark"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "dialog-footer",
    attrs: {
      "slot": "footer"
    },
    slot: "footer"
  }, [_c('el-button', {
    attrs: {
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.dialogFormVisibleEdit = false
      }
    }
  }, [_vm._v("取 消")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "loading": _vm.loading,
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.editallots('editAllocationData')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1), _vm._v(" "), _c('el-dialog', {
    staticClass: "import_record",
    attrs: {
      "title": "导入调拨记录",
      "width": "600px",
      "visible": _vm.dialogFormVisibleImport
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisibleImport = $event
      }
    }
  }, [_c('el-upload', {
    ref: "upload",
    staticClass: "upload-demo",
    attrs: {
      "action": _vm.importAllocationUrl,
      "before-upload": _vm.beforeUpload,
      "on-success": _vm.importAllotsSuccess,
      "file-list": _vm.fileList
    }
  }, [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "size": "small",
      "type": "primary",
      "loading": _vm.loadingImport
    }
  }, [_vm._v(_vm._s(_vm.uploadButtom))]), _vm._v(" "), _c('div', {
    staticClass: "el-upload__tip",
    staticStyle: {
      "display": "inline-block"
    },
    attrs: {
      "slot": "tip"
    },
    slot: "tip"
  }, [_vm._v("　只能上传xls/xlsx文件")])], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.errorMessage),
      expression: "errorMessage"
    }],
    staticStyle: {
      "margin-top": "15px"
    },
    domProps: {
      "innerHTML": _vm._s(_vm.errorMessage)
    }
  })], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-21074fa6", module.exports)
  }
}

/***/ })

});