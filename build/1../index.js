webpackJsonp([1],{

/***/ 100:
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

/***/ 204:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(455)

/* script */
__vue_exports__ = __webpack_require__(457)

/* template */
var __vue_template__ = __webpack_require__(458)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/bank_account/returnmoneyList.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5d3fdf82", __vue_options__)
  } else {
    hotAPI.reload("data-v-5d3fdf82", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] returnmoneyList.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 417:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(418);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-3e73cb4a!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./hospital.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-3e73cb4a!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./hospital.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 418:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 419:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _address = __webpack_require__(420);

var _address2 = _interopRequireDefault(_address);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	data: function data() {
		var _this = this;

		var validateName = function validateName(rule, value, callback) {
			if (!value) {
				callback(new Error('请再输入单位名称'));
			} else {
				if (_this.title == 1) {
					_this.jquery("/iae/hospitals/exitsHospitlsName", { hospital: _this.hospital }, function (res) {
						if (res.message.length > 0) {
							callback(new Error('该单位名称已存在'));
						} else {
							callback();
						}
					});
				} else {
					callback();
				}
			}
		};
		return {
			dialogFormVisible: false,
			hospital: {
				hospital_name: "",
				hospital_address: "",
				hospital_level: "",
				hospital_area: [],
				hospital_type: ["销售单位"]
			},
			hospitalRule: {
				hospital_name: [{ validator: validateName, labelname: '单位名称', trigger: 'blur' }]
			},
			title: 1,
			authCode: "",
			loading: false,
			hospitals: [],
			pageNum: 10,
			currentPage: 1,
			count: 0,
			deleteId: null,
			params: {
				hospital_name: "",
				hospital_type: ""
			},
			options: [],
			props: {
				label: 'name',
				value: 'name',
				children: 'child_code'
			}
		};
	},
	activated: function activated() {
		this.getHospitalsList();
	},
	mounted: function mounted() {
		this.options = _address2.default;
		// var _self = this;
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
		// $.getJSON("../iae/data/address.json",function(data){
		// 	_self.options = data;
		// });
	},

	methods: {
		editRow: function editRow(scope) {
			//编辑药品信息
			this.dialogFormVisible = true;
			this.title = 2;
			var temp = JSON.stringify(scope.row);
			this.hospital = JSON.parse(temp);
			this.hospital.hospital_area = this.hospital.hospital_area.split("/");
			this.hospital.front_message = temp;
			this.hospital.hospital_type = this.hospital.hospital_type ? this.hospital.hospital_type.split(",") : [];
			var _self = this;
			setTimeout(function () {
				_self.$refs["hospital"].clearValidate();
			});
		},
		deleteRow: function deleteRow(scope) {
			var _this2 = this;

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
			this.jquery('/iae/hospitals/deleteHospitals', {
				hospital_id: scope.row.hospital_id
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getHospitalsList();
				_self.dialogFormVisible = false;
			});
		},
		addShow: function addShow() {
			this.hospital = {
				hospital_name: "",
				hospital_address: "",
				hospital_level: "",
				hospital_area: [],
				hospital_type: ["销售单位"]
			};
			this.title = 1;
			this.dialogFormVisible = true;
			var _self = this;
			setTimeout(function () {
				_self.$refs["hospital"].clearValidate();
			});
		},
		add: function add(formName) {
			var _this3 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this3.loading = true;
					if (_this3.title == 1) {
						_this3.jquery('/iae/hospitals/saveHospitals', _self.hospital, function (res) {
							_self.$message({ showClose: true, message: '新增成功', type: 'success' });
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getHospitalsList();
						});
					} else {
						_this3.jquery('/iae/hospitals/editHospitals', _self.hospital, function (res) {
							_self.$message({ showClose: true, message: '修改成功', type: 'success' });
							_self.loading = false;
							_self.dialogFormVisible = false;
							_self.getHospitalsList();
						});
					}
				} else {
					return false;
				}
			});
		},
		searchHospitalsList: function searchHospitalsList() {
			this.currentPage = 1;
			this.getHospitalsList();
		},
		getHospitalsList: function getHospitalsList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 10;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/hospitals/getHospitals', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.hospitals = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getHospitalsList();
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getHospitalsList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getHospitalsList();
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),

/***/ 420:
/***/ (function(module, exports) {

module.exports = [{"code":"110000","name":"北京市","parend_code":"0","child_code":[{"code":"110100","name":"市辖区","parend_code":"110000","child_code":[{"code":"110101","name":"东城区","parend_code":"110100"},{"code":"110102","name":"西城区","parend_code":"110100"},{"code":"110105","name":"朝阳区","parend_code":"110100"},{"code":"110106","name":"丰台区","parend_code":"110100"},{"code":"110107","name":"石景山区","parend_code":"110100"},{"code":"110108","name":"海淀区","parend_code":"110100"},{"code":"110109","name":"门头沟区","parend_code":"110100"},{"code":"110111","name":"房山区","parend_code":"110100"},{"code":"110112","name":"通州区","parend_code":"110100"},{"code":"110113","name":"顺义区","parend_code":"110100"},{"code":"110114","name":"昌平区","parend_code":"110100"},{"code":"110115","name":"大兴区","parend_code":"110100"},{"code":"110116","name":"怀柔区","parend_code":"110100"},{"code":"110117","name":"平谷区","parend_code":"110100"}]},{"code":"110200","name":"县","parend_code":"110000","child_code":[{"code":"110228","name":"密云县","parend_code":"110200"},{"code":"110229","name":"延庆县","parend_code":"110200"}]}]},{"code":"120000","name":"天津市","parend_code":"0","child_code":[{"code":"120100","name":"市辖区","parend_code":"120000","child_code":[{"code":"120101","name":"和平区","parend_code":"120100"},{"code":"120102","name":"河东区","parend_code":"120100"},{"code":"120103","name":"河西区","parend_code":"120100"},{"code":"120104","name":"南开区","parend_code":"120100"},{"code":"120105","name":"河北区","parend_code":"120100"},{"code":"120106","name":"红桥区","parend_code":"120100"},{"code":"120107","name":"塘沽区","parend_code":"120100"},{"code":"120108","name":"汉沽区","parend_code":"120100"},{"code":"120109","name":"大港区","parend_code":"120100"},{"code":"120110","name":"东丽区","parend_code":"120100"},{"code":"120111","name":"西青区","parend_code":"120100"},{"code":"120112","name":"津南区","parend_code":"120100"},{"code":"120113","name":"北辰区","parend_code":"120100"},{"code":"120114","name":"武清区","parend_code":"120100"},{"code":"120115","name":"宝坻区","parend_code":"120100"}]},{"code":"120200","name":"县","parend_code":"120000","child_code":[{"code":"120221","name":"宁河县","parend_code":"120200"},{"code":"120223","name":"静海县","parend_code":"120200"},{"code":"120225","name":"蓟　县","parend_code":"120200"}]}]},{"code":"130000","name":"河北省","parend_code":"0","child_code":[{"code":"130100","name":"石家庄市","parend_code":"130000","child_code":[{"code":"130101","name":"市辖区","parend_code":"130100"},{"code":"130102","name":"长安区","parend_code":"130100"},{"code":"130103","name":"桥东区","parend_code":"130100"},{"code":"130104","name":"桥西区","parend_code":"130100"},{"code":"130105","name":"新华区","parend_code":"130100"},{"code":"130107","name":"井陉矿区","parend_code":"130100"},{"code":"130108","name":"裕华区","parend_code":"130100"},{"code":"130121","name":"井陉县","parend_code":"130100"},{"code":"130123","name":"正定县","parend_code":"130100"},{"code":"130124","name":"栾城县","parend_code":"130100"},{"code":"130125","name":"行唐县","parend_code":"130100"},{"code":"130126","name":"灵寿县","parend_code":"130100"},{"code":"130127","name":"高邑县","parend_code":"130100"},{"code":"130128","name":"深泽县","parend_code":"130100"},{"code":"130129","name":"赞皇县","parend_code":"130100"},{"code":"130130","name":"无极县","parend_code":"130100"},{"code":"130131","name":"平山县","parend_code":"130100"},{"code":"130132","name":"元氏县","parend_code":"130100"},{"code":"130133","name":"赵　县","parend_code":"130100"},{"code":"130181","name":"辛集市","parend_code":"130100"},{"code":"130182","name":"藁城市","parend_code":"130100"},{"code":"130183","name":"晋州市","parend_code":"130100"},{"code":"130184","name":"新乐市","parend_code":"130100"},{"code":"130185","name":"鹿泉市","parend_code":"130100"}]},{"code":"130200","name":"唐山市","parend_code":"130000","child_code":[{"code":"130201","name":"市辖区","parend_code":"130200"},{"code":"130202","name":"路南区","parend_code":"130200"},{"code":"130203","name":"路北区","parend_code":"130200"},{"code":"130204","name":"古冶区","parend_code":"130200"},{"code":"130205","name":"开平区","parend_code":"130200"},{"code":"130207","name":"丰南区","parend_code":"130200"},{"code":"130208","name":"丰润区","parend_code":"130200"},{"code":"130223","name":"滦　县","parend_code":"130200"},{"code":"130224","name":"滦南县","parend_code":"130200"},{"code":"130225","name":"乐亭县","parend_code":"130200"},{"code":"130227","name":"迁西县","parend_code":"130200"},{"code":"130229","name":"玉田县","parend_code":"130200"},{"code":"130230","name":"唐海县","parend_code":"130200"},{"code":"130281","name":"遵化市","parend_code":"130200"},{"code":"130283","name":"迁安市","parend_code":"130200"}]},{"code":"130300","name":"秦皇岛市","parend_code":"130000","child_code":[{"code":"130301","name":"市辖区","parend_code":"130300"},{"code":"130302","name":"海港区","parend_code":"130300"},{"code":"130303","name":"山海关区","parend_code":"130300"},{"code":"130304","name":"北戴河区","parend_code":"130300"},{"code":"130321","name":"青龙满族自治县","parend_code":"130300"},{"code":"130322","name":"昌黎县","parend_code":"130300"},{"code":"130323","name":"抚宁县","parend_code":"130300"},{"code":"130324","name":"卢龙县","parend_code":"130300"}]},{"code":"130400","name":"邯郸市","parend_code":"130000","child_code":[{"code":"130401","name":"市辖区","parend_code":"130400"},{"code":"130402","name":"邯山区","parend_code":"130400"},{"code":"130403","name":"丛台区","parend_code":"130400"},{"code":"130404","name":"复兴区","parend_code":"130400"},{"code":"130406","name":"峰峰矿区","parend_code":"130400"},{"code":"130421","name":"邯郸县","parend_code":"130400"},{"code":"130423","name":"临漳县","parend_code":"130400"},{"code":"130424","name":"成安县","parend_code":"130400"},{"code":"130425","name":"大名县","parend_code":"130400"},{"code":"130426","name":"涉　县","parend_code":"130400"},{"code":"130427","name":"磁　县","parend_code":"130400"},{"code":"130428","name":"肥乡县","parend_code":"130400"},{"code":"130429","name":"永年县","parend_code":"130400"},{"code":"130430","name":"邱　县","parend_code":"130400"},{"code":"130431","name":"鸡泽县","parend_code":"130400"},{"code":"130432","name":"广平县","parend_code":"130400"},{"code":"130433","name":"馆陶县","parend_code":"130400"},{"code":"130434","name":"魏　县","parend_code":"130400"},{"code":"130435","name":"曲周县","parend_code":"130400"},{"code":"130481","name":"武安市","parend_code":"130400"}]},{"code":"130500","name":"邢台市","parend_code":"130000","child_code":[{"code":"130501","name":"市辖区","parend_code":"130500"},{"code":"130502","name":"桥东区","parend_code":"130500"},{"code":"130503","name":"桥西区","parend_code":"130500"},{"code":"130521","name":"邢台县","parend_code":"130500"},{"code":"130522","name":"临城县","parend_code":"130500"},{"code":"130523","name":"内丘县","parend_code":"130500"},{"code":"130524","name":"柏乡县","parend_code":"130500"},{"code":"130525","name":"隆尧县","parend_code":"130500"},{"code":"130526","name":"任　县","parend_code":"130500"},{"code":"130527","name":"南和县","parend_code":"130500"},{"code":"130528","name":"宁晋县","parend_code":"130500"},{"code":"130529","name":"巨鹿县","parend_code":"130500"},{"code":"130530","name":"新河县","parend_code":"130500"},{"code":"130531","name":"广宗县","parend_code":"130500"},{"code":"130532","name":"平乡县","parend_code":"130500"},{"code":"130533","name":"威　县","parend_code":"130500"},{"code":"130534","name":"清河县","parend_code":"130500"},{"code":"130535","name":"临西县","parend_code":"130500"},{"code":"130581","name":"南宫市","parend_code":"130500"},{"code":"130582","name":"沙河市","parend_code":"130500"}]},{"code":"130600","name":"保定市","parend_code":"130000","child_code":[{"code":"130601","name":"市辖区","parend_code":"130600"},{"code":"130602","name":"新市区","parend_code":"130600"},{"code":"130603","name":"北市区","parend_code":"130600"},{"code":"130604","name":"南市区","parend_code":"130600"},{"code":"130621","name":"满城县","parend_code":"130600"},{"code":"130622","name":"清苑县","parend_code":"130600"},{"code":"130623","name":"涞水县","parend_code":"130600"},{"code":"130624","name":"阜平县","parend_code":"130600"},{"code":"130625","name":"徐水县","parend_code":"130600"},{"code":"130626","name":"定兴县","parend_code":"130600"},{"code":"130627","name":"唐　县","parend_code":"130600"},{"code":"130628","name":"高阳县","parend_code":"130600"},{"code":"130629","name":"容城县","parend_code":"130600"},{"code":"130630","name":"涞源县","parend_code":"130600"},{"code":"130631","name":"望都县","parend_code":"130600"},{"code":"130632","name":"安新县","parend_code":"130600"},{"code":"130633","name":"易　县","parend_code":"130600"},{"code":"130634","name":"曲阳县","parend_code":"130600"},{"code":"130635","name":"蠡　县","parend_code":"130600"},{"code":"130636","name":"顺平县","parend_code":"130600"},{"code":"130637","name":"博野县","parend_code":"130600"},{"code":"130638","name":"雄　县","parend_code":"130600"},{"code":"130681","name":"涿州市","parend_code":"130600"},{"code":"130682","name":"定州市","parend_code":"130600"},{"code":"130683","name":"安国市","parend_code":"130600"},{"code":"130684","name":"高碑店市","parend_code":"130600"}]},{"code":"130700","name":"张家口市","parend_code":"130000","child_code":[{"code":"130701","name":"市辖区","parend_code":"130700"},{"code":"130702","name":"桥东区","parend_code":"130700"},{"code":"130703","name":"桥西区","parend_code":"130700"},{"code":"130705","name":"宣化区","parend_code":"130700"},{"code":"130706","name":"下花园区","parend_code":"130700"},{"code":"130721","name":"宣化县","parend_code":"130700"},{"code":"130722","name":"张北县","parend_code":"130700"},{"code":"130723","name":"康保县","parend_code":"130700"},{"code":"130724","name":"沽源县","parend_code":"130700"},{"code":"130725","name":"尚义县","parend_code":"130700"},{"code":"130726","name":"蔚　县","parend_code":"130700"},{"code":"130727","name":"阳原县","parend_code":"130700"},{"code":"130728","name":"怀安县","parend_code":"130700"},{"code":"130729","name":"万全县","parend_code":"130700"},{"code":"130730","name":"怀来县","parend_code":"130700"},{"code":"130731","name":"涿鹿县","parend_code":"130700"},{"code":"130732","name":"赤城县","parend_code":"130700"},{"code":"130733","name":"崇礼县","parend_code":"130700"}]},{"code":"130800","name":"承德市","parend_code":"130000","child_code":[{"code":"130801","name":"市辖区","parend_code":"130800"},{"code":"130802","name":"双桥区","parend_code":"130800"},{"code":"130803","name":"双滦区","parend_code":"130800"},{"code":"130804","name":"鹰手营子矿区","parend_code":"130800"},{"code":"130821","name":"承德县","parend_code":"130800"},{"code":"130822","name":"兴隆县","parend_code":"130800"},{"code":"130823","name":"平泉县","parend_code":"130800"},{"code":"130824","name":"滦平县","parend_code":"130800"},{"code":"130825","name":"隆化县","parend_code":"130800"},{"code":"130826","name":"丰宁满族自治县","parend_code":"130800"},{"code":"130827","name":"宽城满族自治县","parend_code":"130800"},{"code":"130828","name":"围场满族蒙古族自治县","parend_code":"130800"}]},{"code":"130900","name":"沧州市","parend_code":"130000","child_code":[{"code":"130901","name":"市辖区","parend_code":"130900"},{"code":"130902","name":"新华区","parend_code":"130900"},{"code":"130903","name":"运河区","parend_code":"130900"},{"code":"130921","name":"沧　县","parend_code":"130900"},{"code":"130922","name":"青　县","parend_code":"130900"},{"code":"130923","name":"东光县","parend_code":"130900"},{"code":"130924","name":"海兴县","parend_code":"130900"},{"code":"130925","name":"盐山县","parend_code":"130900"},{"code":"130926","name":"肃宁县","parend_code":"130900"},{"code":"130927","name":"南皮县","parend_code":"130900"},{"code":"130928","name":"吴桥县","parend_code":"130900"},{"code":"130929","name":"献　县","parend_code":"130900"},{"code":"130930","name":"孟村回族自治县","parend_code":"130900"},{"code":"130981","name":"泊头市","parend_code":"130900"},{"code":"130982","name":"任丘市","parend_code":"130900"},{"code":"130983","name":"黄骅市","parend_code":"130900"},{"code":"130984","name":"河间市","parend_code":"130900"}]},{"code":"131000","name":"廊坊市","parend_code":"130000","child_code":[{"code":"131001","name":"市辖区","parend_code":"131000"},{"code":"131002","name":"安次区","parend_code":"131000"},{"code":"131003","name":"广阳区","parend_code":"131000"},{"code":"131022","name":"固安县","parend_code":"131000"},{"code":"131023","name":"永清县","parend_code":"131000"},{"code":"131024","name":"香河县","parend_code":"131000"},{"code":"131025","name":"大城县","parend_code":"131000"},{"code":"131026","name":"文安县","parend_code":"131000"},{"code":"131028","name":"大厂回族自治县","parend_code":"131000"},{"code":"131081","name":"霸州市","parend_code":"131000"},{"code":"131082","name":"三河市","parend_code":"131000"}]},{"code":"131100","name":"衡水市","parend_code":"130000","child_code":[{"code":"131101","name":"市辖区","parend_code":"131100"},{"code":"131102","name":"桃城区","parend_code":"131100"},{"code":"131121","name":"枣强县","parend_code":"131100"},{"code":"131122","name":"武邑县","parend_code":"131100"},{"code":"131123","name":"武强县","parend_code":"131100"},{"code":"131124","name":"饶阳县","parend_code":"131100"},{"code":"131125","name":"安平县","parend_code":"131100"},{"code":"131126","name":"故城县","parend_code":"131100"},{"code":"131127","name":"景　县","parend_code":"131100"},{"code":"131128","name":"阜城县","parend_code":"131100"},{"code":"131181","name":"冀州市","parend_code":"131100"},{"code":"131182","name":"深州市","parend_code":"131100"}]}]},{"code":"140000","name":"山西省","parend_code":"0","child_code":[{"code":"140100","name":"太原市","parend_code":"140000","child_code":[{"code":"140101","name":"市辖区","parend_code":"140100"},{"code":"140105","name":"小店区","parend_code":"140100"},{"code":"140106","name":"迎泽区","parend_code":"140100"},{"code":"140107","name":"杏花岭区","parend_code":"140100"},{"code":"140108","name":"尖草坪区","parend_code":"140100"},{"code":"140109","name":"万柏林区","parend_code":"140100"},{"code":"140110","name":"晋源区","parend_code":"140100"},{"code":"140121","name":"清徐县","parend_code":"140100"},{"code":"140122","name":"阳曲县","parend_code":"140100"},{"code":"140123","name":"娄烦县","parend_code":"140100"},{"code":"140181","name":"古交市","parend_code":"140100"}]},{"code":"140200","name":"大同市","parend_code":"140000","child_code":[{"code":"140201","name":"市辖区","parend_code":"140200"},{"code":"140202","name":"城　区","parend_code":"140200"},{"code":"140203","name":"矿　区","parend_code":"140200"},{"code":"140211","name":"南郊区","parend_code":"140200"},{"code":"140212","name":"新荣区","parend_code":"140200"},{"code":"140221","name":"阳高县","parend_code":"140200"},{"code":"140222","name":"天镇县","parend_code":"140200"},{"code":"140223","name":"广灵县","parend_code":"140200"},{"code":"140224","name":"灵丘县","parend_code":"140200"},{"code":"140225","name":"浑源县","parend_code":"140200"},{"code":"140226","name":"左云县","parend_code":"140200"},{"code":"140227","name":"大同县","parend_code":"140200"}]},{"code":"140300","name":"阳泉市","parend_code":"140000","child_code":[{"code":"140301","name":"市辖区","parend_code":"140300"},{"code":"140302","name":"城　区","parend_code":"140300"},{"code":"140303","name":"矿　区","parend_code":"140300"},{"code":"140311","name":"郊　区","parend_code":"140300"},{"code":"140321","name":"平定县","parend_code":"140300"},{"code":"140322","name":"盂　县","parend_code":"140300"}]},{"code":"140400","name":"长治市","parend_code":"140000","child_code":[{"code":"140401","name":"市辖区","parend_code":"140400"},{"code":"140402","name":"城　区","parend_code":"140400"},{"code":"140411","name":"郊　区","parend_code":"140400"},{"code":"140421","name":"长治县","parend_code":"140400"},{"code":"140423","name":"襄垣县","parend_code":"140400"},{"code":"140424","name":"屯留县","parend_code":"140400"},{"code":"140425","name":"平顺县","parend_code":"140400"},{"code":"140426","name":"黎城县","parend_code":"140400"},{"code":"140427","name":"壶关县","parend_code":"140400"},{"code":"140428","name":"长子县","parend_code":"140400"},{"code":"140429","name":"武乡县","parend_code":"140400"},{"code":"140430","name":"沁　县","parend_code":"140400"},{"code":"140431","name":"沁源县","parend_code":"140400"},{"code":"140481","name":"潞城市","parend_code":"140400"}]},{"code":"140500","name":"晋城市","parend_code":"140000","child_code":[{"code":"140501","name":"市辖区","parend_code":"140500"},{"code":"140502","name":"城　区","parend_code":"140500"},{"code":"140521","name":"沁水县","parend_code":"140500"},{"code":"140522","name":"阳城县","parend_code":"140500"},{"code":"140524","name":"陵川县","parend_code":"140500"},{"code":"140525","name":"泽州县","parend_code":"140500"},{"code":"140581","name":"高平市","parend_code":"140500"}]},{"code":"140600","name":"朔州市","parend_code":"140000","child_code":[{"code":"140601","name":"市辖区","parend_code":"140600"},{"code":"140602","name":"朔城区","parend_code":"140600"},{"code":"140603","name":"平鲁区","parend_code":"140600"},{"code":"140621","name":"山阴县","parend_code":"140600"},{"code":"140622","name":"应　县","parend_code":"140600"},{"code":"140623","name":"右玉县","parend_code":"140600"},{"code":"140624","name":"怀仁县","parend_code":"140600"}]},{"code":"140700","name":"晋中市","parend_code":"140000","child_code":[{"code":"140701","name":"市辖区","parend_code":"140700"},{"code":"140702","name":"榆次区","parend_code":"140700"},{"code":"140721","name":"榆社县","parend_code":"140700"},{"code":"140722","name":"左权县","parend_code":"140700"},{"code":"140723","name":"和顺县","parend_code":"140700"},{"code":"140724","name":"昔阳县","parend_code":"140700"},{"code":"140725","name":"寿阳县","parend_code":"140700"},{"code":"140726","name":"太谷县","parend_code":"140700"},{"code":"140727","name":"祁　县","parend_code":"140700"},{"code":"140728","name":"平遥县","parend_code":"140700"},{"code":"140729","name":"灵石县","parend_code":"140700"},{"code":"140781","name":"介休市","parend_code":"140700"}]},{"code":"140800","name":"运城市","parend_code":"140000","child_code":[{"code":"140801","name":"市辖区","parend_code":"140800"},{"code":"140802","name":"盐湖区","parend_code":"140800"},{"code":"140821","name":"临猗县","parend_code":"140800"},{"code":"140822","name":"万荣县","parend_code":"140800"},{"code":"140823","name":"闻喜县","parend_code":"140800"},{"code":"140824","name":"稷山县","parend_code":"140800"},{"code":"140825","name":"新绛县","parend_code":"140800"},{"code":"140826","name":"绛　县","parend_code":"140800"},{"code":"140827","name":"垣曲县","parend_code":"140800"},{"code":"140828","name":"夏　县","parend_code":"140800"},{"code":"140829","name":"平陆县","parend_code":"140800"},{"code":"140830","name":"芮城县","parend_code":"140800"},{"code":"140881","name":"永济市","parend_code":"140800"},{"code":"140882","name":"河津市","parend_code":"140800"}]},{"code":"140900","name":"忻州市","parend_code":"140000","child_code":[{"code":"140901","name":"市辖区","parend_code":"140900"},{"code":"140902","name":"忻府区","parend_code":"140900"},{"code":"140921","name":"定襄县","parend_code":"140900"},{"code":"140922","name":"五台县","parend_code":"140900"},{"code":"140923","name":"代　县","parend_code":"140900"},{"code":"140924","name":"繁峙县","parend_code":"140900"},{"code":"140925","name":"宁武县","parend_code":"140900"},{"code":"140926","name":"静乐县","parend_code":"140900"},{"code":"140927","name":"神池县","parend_code":"140900"},{"code":"140928","name":"五寨县","parend_code":"140900"},{"code":"140929","name":"岢岚县","parend_code":"140900"},{"code":"140930","name":"河曲县","parend_code":"140900"},{"code":"140931","name":"保德县","parend_code":"140900"},{"code":"140932","name":"偏关县","parend_code":"140900"},{"code":"140981","name":"原平市","parend_code":"140900"}]},{"code":"141000","name":"临汾市","parend_code":"140000","child_code":[{"code":"141001","name":"市辖区","parend_code":"141000"},{"code":"141002","name":"尧都区","parend_code":"141000"},{"code":"141021","name":"曲沃县","parend_code":"141000"},{"code":"141022","name":"翼城县","parend_code":"141000"},{"code":"141023","name":"襄汾县","parend_code":"141000"},{"code":"141024","name":"洪洞县","parend_code":"141000"},{"code":"141025","name":"古　县","parend_code":"141000"},{"code":"141026","name":"安泽县","parend_code":"141000"},{"code":"141027","name":"浮山县","parend_code":"141000"},{"code":"141028","name":"吉　县","parend_code":"141000"},{"code":"141029","name":"乡宁县","parend_code":"141000"},{"code":"141030","name":"大宁县","parend_code":"141000"},{"code":"141031","name":"隰　县","parend_code":"141000"},{"code":"141032","name":"永和县","parend_code":"141000"},{"code":"141033","name":"蒲　县","parend_code":"141000"},{"code":"141034","name":"汾西县","parend_code":"141000"},{"code":"141081","name":"侯马市","parend_code":"141000"},{"code":"141082","name":"霍州市","parend_code":"141000"}]},{"code":"141100","name":"吕梁市","parend_code":"140000","child_code":[{"code":"141101","name":"市辖区","parend_code":"141100"},{"code":"141102","name":"离石区","parend_code":"141100"},{"code":"141121","name":"文水县","parend_code":"141100"},{"code":"141122","name":"交城县","parend_code":"141100"},{"code":"141123","name":"兴　县","parend_code":"141100"},{"code":"141124","name":"临　县","parend_code":"141100"},{"code":"141125","name":"柳林县","parend_code":"141100"},{"code":"141126","name":"石楼县","parend_code":"141100"},{"code":"141127","name":"岚　县","parend_code":"141100"},{"code":"141128","name":"方山县","parend_code":"141100"},{"code":"141129","name":"中阳县","parend_code":"141100"},{"code":"141130","name":"交口县","parend_code":"141100"},{"code":"141181","name":"孝义市","parend_code":"141100"},{"code":"141182","name":"汾阳市","parend_code":"141100"}]}]},{"code":"150000","name":"内蒙古自治区","parend_code":"0","child_code":[{"code":"150100","name":"呼和浩特市","parend_code":"150000","child_code":[{"code":"150101","name":"市辖区","parend_code":"150100"},{"code":"150102","name":"新城区","parend_code":"150100"},{"code":"150103","name":"回民区","parend_code":"150100"},{"code":"150104","name":"玉泉区","parend_code":"150100"},{"code":"150105","name":"赛罕区","parend_code":"150100"},{"code":"150121","name":"土默特左旗","parend_code":"150100"},{"code":"150122","name":"托克托县","parend_code":"150100"},{"code":"150123","name":"和林格尔县","parend_code":"150100"},{"code":"150124","name":"清水河县","parend_code":"150100"},{"code":"150125","name":"武川县","parend_code":"150100"}]},{"code":"150200","name":"包头市","parend_code":"150000","child_code":[{"code":"150201","name":"市辖区","parend_code":"150200"},{"code":"150202","name":"东河区","parend_code":"150200"},{"code":"150203","name":"昆都仑区","parend_code":"150200"},{"code":"150204","name":"青山区","parend_code":"150200"},{"code":"150205","name":"石拐区","parend_code":"150200"},{"code":"150206","name":"白云矿区","parend_code":"150200"},{"code":"150207","name":"九原区","parend_code":"150200"},{"code":"150221","name":"土默特右旗","parend_code":"150200"},{"code":"150222","name":"固阳县","parend_code":"150200"},{"code":"150223","name":"达尔罕茂明安联合旗","parend_code":"150200"}]},{"code":"150300","name":"乌海市","parend_code":"150000","child_code":[{"code":"150301","name":"市辖区","parend_code":"150300"},{"code":"150302","name":"海勃湾区","parend_code":"150300"},{"code":"150303","name":"海南区","parend_code":"150300"},{"code":"150304","name":"乌达区","parend_code":"150300"}]},{"code":"150400","name":"赤峰市","parend_code":"150000","child_code":[{"code":"150401","name":"市辖区","parend_code":"150400"},{"code":"150402","name":"红山区","parend_code":"150400"},{"code":"150403","name":"元宝山区","parend_code":"150400"},{"code":"150404","name":"松山区","parend_code":"150400"},{"code":"150421","name":"阿鲁科尔沁旗","parend_code":"150400"},{"code":"150422","name":"巴林左旗","parend_code":"150400"},{"code":"150423","name":"巴林右旗","parend_code":"150400"},{"code":"150424","name":"林西县","parend_code":"150400"},{"code":"150425","name":"克什克腾旗","parend_code":"150400"},{"code":"150426","name":"翁牛特旗","parend_code":"150400"},{"code":"150428","name":"喀喇沁旗","parend_code":"150400"},{"code":"150429","name":"宁城县","parend_code":"150400"},{"code":"150430","name":"敖汉旗","parend_code":"150400"}]},{"code":"150500","name":"通辽市","parend_code":"150000","child_code":[{"code":"150501","name":"市辖区","parend_code":"150500"},{"code":"150502","name":"科尔沁区","parend_code":"150500"},{"code":"150521","name":"科尔沁左翼中旗","parend_code":"150500"},{"code":"150522","name":"科尔沁左翼后旗","parend_code":"150500"},{"code":"150523","name":"开鲁县","parend_code":"150500"},{"code":"150524","name":"库伦旗","parend_code":"150500"},{"code":"150525","name":"奈曼旗","parend_code":"150500"},{"code":"150526","name":"扎鲁特旗","parend_code":"150500"},{"code":"150581","name":"霍林郭勒市","parend_code":"150500"}]},{"code":"150600","name":"鄂尔多斯市","parend_code":"150000","child_code":[{"code":"150602","name":"东胜区","parend_code":"150600"},{"code":"150621","name":"达拉特旗","parend_code":"150600"},{"code":"150622","name":"准格尔旗","parend_code":"150600"},{"code":"150623","name":"鄂托克前旗","parend_code":"150600"},{"code":"150624","name":"鄂托克旗","parend_code":"150600"},{"code":"150625","name":"杭锦旗","parend_code":"150600"},{"code":"150626","name":"乌审旗","parend_code":"150600"},{"code":"150627","name":"伊金霍洛旗","parend_code":"150600"}]},{"code":"150700","name":"呼伦贝尔市","parend_code":"150000","child_code":[{"code":"150701","name":"市辖区","parend_code":"150700"},{"code":"150702","name":"海拉尔区","parend_code":"150700"},{"code":"150721","name":"阿荣旗","parend_code":"150700"},{"code":"150722","name":"莫力达瓦达斡尔族自治旗","parend_code":"150700"},{"code":"150723","name":"鄂伦春自治旗","parend_code":"150700"},{"code":"150724","name":"鄂温克族自治旗","parend_code":"150700"},{"code":"150725","name":"陈巴尔虎旗","parend_code":"150700"},{"code":"150726","name":"新巴尔虎左旗","parend_code":"150700"},{"code":"150727","name":"新巴尔虎右旗","parend_code":"150700"},{"code":"150781","name":"满洲里市","parend_code":"150700"},{"code":"150782","name":"牙克石市","parend_code":"150700"},{"code":"150783","name":"扎兰屯市","parend_code":"150700"},{"code":"150784","name":"额尔古纳市","parend_code":"150700"},{"code":"150785","name":"根河市","parend_code":"150700"}]},{"code":"150800","name":"巴彦淖尔市","parend_code":"150000","child_code":[{"code":"150801","name":"市辖区","parend_code":"150800"},{"code":"150802","name":"临河区","parend_code":"150800"},{"code":"150821","name":"五原县","parend_code":"150800"},{"code":"150822","name":"磴口县","parend_code":"150800"},{"code":"150823","name":"乌拉特前旗","parend_code":"150800"},{"code":"150824","name":"乌拉特中旗","parend_code":"150800"},{"code":"150825","name":"乌拉特后旗","parend_code":"150800"},{"code":"150826","name":"杭锦后旗","parend_code":"150800"}]},{"code":"150900","name":"乌兰察布市","parend_code":"150000","child_code":[{"code":"150901","name":"市辖区","parend_code":"150900"},{"code":"150902","name":"集宁区","parend_code":"150900"},{"code":"150921","name":"卓资县","parend_code":"150900"},{"code":"150922","name":"化德县","parend_code":"150900"},{"code":"150923","name":"商都县","parend_code":"150900"},{"code":"150924","name":"兴和县","parend_code":"150900"},{"code":"150925","name":"凉城县","parend_code":"150900"},{"code":"150926","name":"察哈尔右翼前旗","parend_code":"150900"},{"code":"150927","name":"察哈尔右翼中旗","parend_code":"150900"},{"code":"150928","name":"察哈尔右翼后旗","parend_code":"150900"},{"code":"150929","name":"四子王旗","parend_code":"150900"},{"code":"150981","name":"丰镇市","parend_code":"150900"}]},{"code":"152200","name":"兴安盟","parend_code":"150000","child_code":[{"code":"152201","name":"乌兰浩特市","parend_code":"152200"},{"code":"152202","name":"阿尔山市","parend_code":"152200"},{"code":"152221","name":"科尔沁右翼前旗","parend_code":"152200"},{"code":"152222","name":"科尔沁右翼中旗","parend_code":"152200"},{"code":"152223","name":"扎赉特旗","parend_code":"152200"},{"code":"152224","name":"突泉县","parend_code":"152200"}]},{"code":"152500","name":"锡林郭勒盟","parend_code":"150000","child_code":[{"code":"152501","name":"二连浩特市","parend_code":"152500"},{"code":"152502","name":"锡林浩特市","parend_code":"152500"},{"code":"152522","name":"阿巴嘎旗","parend_code":"152500"},{"code":"152523","name":"苏尼特左旗","parend_code":"152500"},{"code":"152524","name":"苏尼特右旗","parend_code":"152500"},{"code":"152525","name":"东乌珠穆沁旗","parend_code":"152500"},{"code":"152526","name":"西乌珠穆沁旗","parend_code":"152500"},{"code":"152527","name":"太仆寺旗","parend_code":"152500"},{"code":"152528","name":"镶黄旗","parend_code":"152500"},{"code":"152529","name":"正镶白旗","parend_code":"152500"},{"code":"152530","name":"正蓝旗","parend_code":"152500"},{"code":"152531","name":"多伦县","parend_code":"152500"}]},{"code":"152900","name":"阿拉善盟","parend_code":"150000","child_code":[{"code":"152921","name":"阿拉善左旗","parend_code":"152900"},{"code":"152922","name":"阿拉善右旗","parend_code":"152900"},{"code":"152923","name":"额济纳旗","parend_code":"152900"}]}]},{"code":"210000","name":"辽宁省","parend_code":"0","child_code":[{"code":"210100","name":"沈阳市","parend_code":"210000","child_code":[{"code":"210101","name":"市辖区","parend_code":"210100"},{"code":"210102","name":"和平区","parend_code":"210100"},{"code":"210103","name":"沈河区","parend_code":"210100"},{"code":"210104","name":"大东区","parend_code":"210100"},{"code":"210105","name":"皇姑区","parend_code":"210100"},{"code":"210106","name":"铁西区","parend_code":"210100"},{"code":"210111","name":"苏家屯区","parend_code":"210100"},{"code":"210112","name":"东陵区","parend_code":"210100"},{"code":"210113","name":"新城子区","parend_code":"210100"},{"code":"210114","name":"于洪区","parend_code":"210100"},{"code":"210122","name":"辽中县","parend_code":"210100"},{"code":"210123","name":"康平县","parend_code":"210100"},{"code":"210124","name":"法库县","parend_code":"210100"},{"code":"210181","name":"新民市","parend_code":"210100"}]},{"code":"210200","name":"大连市","parend_code":"210000","child_code":[{"code":"210201","name":"市辖区","parend_code":"210200"},{"code":"210202","name":"中山区","parend_code":"210200"},{"code":"210203","name":"西岗区","parend_code":"210200"},{"code":"210204","name":"沙河口区","parend_code":"210200"},{"code":"210211","name":"甘井子区","parend_code":"210200"},{"code":"210212","name":"旅顺口区","parend_code":"210200"},{"code":"210213","name":"金州区","parend_code":"210200"},{"code":"210224","name":"长海县","parend_code":"210200"},{"code":"210281","name":"瓦房店市","parend_code":"210200"},{"code":"210282","name":"普兰店市","parend_code":"210200"},{"code":"210283","name":"庄河市","parend_code":"210200"}]},{"code":"210300","name":"鞍山市","parend_code":"210000","child_code":[{"code":"210301","name":"市辖区","parend_code":"210300"},{"code":"210302","name":"铁东区","parend_code":"210300"},{"code":"210303","name":"铁西区","parend_code":"210300"},{"code":"210304","name":"立山区","parend_code":"210300"},{"code":"210311","name":"千山区","parend_code":"210300"},{"code":"210321","name":"台安县","parend_code":"210300"},{"code":"210323","name":"岫岩满族自治县","parend_code":"210300"},{"code":"210381","name":"海城市","parend_code":"210300"}]},{"code":"210400","name":"抚顺市","parend_code":"210000","child_code":[{"code":"210401","name":"市辖区","parend_code":"210400"},{"code":"210402","name":"新抚区","parend_code":"210400"},{"code":"210403","name":"东洲区","parend_code":"210400"},{"code":"210404","name":"望花区","parend_code":"210400"},{"code":"210411","name":"顺城区","parend_code":"210400"},{"code":"210421","name":"抚顺县","parend_code":"210400"},{"code":"210422","name":"新宾满族自治县","parend_code":"210400"},{"code":"210423","name":"清原满族自治县","parend_code":"210400"}]},{"code":"210500","name":"本溪市","parend_code":"210000","child_code":[{"code":"210501","name":"市辖区","parend_code":"210500"},{"code":"210502","name":"平山区","parend_code":"210500"},{"code":"210503","name":"溪湖区","parend_code":"210500"},{"code":"210504","name":"明山区","parend_code":"210500"},{"code":"210505","name":"南芬区","parend_code":"210500"},{"code":"210521","name":"本溪满族自治县","parend_code":"210500"},{"code":"210522","name":"桓仁满族自治县","parend_code":"210500"}]},{"code":"210600","name":"丹东市","parend_code":"210000","child_code":[{"code":"210601","name":"市辖区","parend_code":"210600"},{"code":"210602","name":"元宝区","parend_code":"210600"},{"code":"210603","name":"振兴区","parend_code":"210600"},{"code":"210604","name":"振安区","parend_code":"210600"},{"code":"210624","name":"宽甸满族自治县","parend_code":"210600"},{"code":"210681","name":"东港市","parend_code":"210600"},{"code":"210682","name":"凤城市","parend_code":"210600"}]},{"code":"210700","name":"锦州市","parend_code":"210000","child_code":[{"code":"210701","name":"市辖区","parend_code":"210700"},{"code":"210702","name":"古塔区","parend_code":"210700"},{"code":"210703","name":"凌河区","parend_code":"210700"},{"code":"210711","name":"太和区","parend_code":"210700"},{"code":"210726","name":"黑山县","parend_code":"210700"},{"code":"210727","name":"义　县","parend_code":"210700"},{"code":"210781","name":"凌海市","parend_code":"210700"},{"code":"210782","name":"北宁市","parend_code":"210700"}]},{"code":"210800","name":"营口市","parend_code":"210000","child_code":[{"code":"210801","name":"市辖区","parend_code":"210800"},{"code":"210802","name":"站前区","parend_code":"210800"},{"code":"210803","name":"西市区","parend_code":"210800"},{"code":"210804","name":"鲅鱼圈区","parend_code":"210800"},{"code":"210811","name":"老边区","parend_code":"210800"},{"code":"210881","name":"盖州市","parend_code":"210800"},{"code":"210882","name":"大石桥市","parend_code":"210800"}]},{"code":"210900","name":"阜新市","parend_code":"210000","child_code":[{"code":"210901","name":"市辖区","parend_code":"210900"},{"code":"210902","name":"海州区","parend_code":"210900"},{"code":"210903","name":"新邱区","parend_code":"210900"},{"code":"210904","name":"太平区","parend_code":"210900"},{"code":"210905","name":"清河门区","parend_code":"210900"},{"code":"210911","name":"细河区","parend_code":"210900"},{"code":"210921","name":"阜新蒙古族自治县","parend_code":"210900"},{"code":"210922","name":"彰武县","parend_code":"210900"}]},{"code":"211000","name":"辽阳市","parend_code":"210000","child_code":[{"code":"211001","name":"市辖区","parend_code":"211000"},{"code":"211002","name":"白塔区","parend_code":"211000"},{"code":"211003","name":"文圣区","parend_code":"211000"},{"code":"211004","name":"宏伟区","parend_code":"211000"},{"code":"211005","name":"弓长岭区","parend_code":"211000"},{"code":"211011","name":"太子河区","parend_code":"211000"},{"code":"211021","name":"辽阳县","parend_code":"211000"},{"code":"211081","name":"灯塔市","parend_code":"211000"}]},{"code":"211100","name":"盘锦市","parend_code":"210000","child_code":[{"code":"211101","name":"市辖区","parend_code":"211100"},{"code":"211102","name":"双台子区","parend_code":"211100"},{"code":"211103","name":"兴隆台区","parend_code":"211100"},{"code":"211121","name":"大洼县","parend_code":"211100"},{"code":"211122","name":"盘山县","parend_code":"211100"}]},{"code":"211200","name":"铁岭市","parend_code":"210000","child_code":[{"code":"211201","name":"市辖区","parend_code":"211200"},{"code":"211202","name":"银州区","parend_code":"211200"},{"code":"211204","name":"清河区","parend_code":"211200"},{"code":"211221","name":"铁岭县","parend_code":"211200"},{"code":"211223","name":"西丰县","parend_code":"211200"},{"code":"211224","name":"昌图县","parend_code":"211200"},{"code":"211281","name":"调兵山市","parend_code":"211200"},{"code":"211282","name":"开原市","parend_code":"211200"}]},{"code":"211300","name":"朝阳市","parend_code":"210000","child_code":[{"code":"211301","name":"市辖区","parend_code":"211300"},{"code":"211302","name":"双塔区","parend_code":"211300"},{"code":"211303","name":"龙城区","parend_code":"211300"},{"code":"211321","name":"朝阳县","parend_code":"211300"},{"code":"211322","name":"建平县","parend_code":"211300"},{"code":"211324","name":"喀喇沁左翼蒙古族自治县","parend_code":"211300"},{"code":"211381","name":"北票市","parend_code":"211300"},{"code":"211382","name":"凌源市","parend_code":"211300"}]},{"code":"211400","name":"葫芦岛市","parend_code":"210000","child_code":[{"code":"211401","name":"市辖区","parend_code":"211400"},{"code":"211402","name":"连山区","parend_code":"211400"},{"code":"211403","name":"龙港区","parend_code":"211400"},{"code":"211404","name":"南票区","parend_code":"211400"},{"code":"211421","name":"绥中县","parend_code":"211400"},{"code":"211422","name":"建昌县","parend_code":"211400"},{"code":"211481","name":"兴城市","parend_code":"211400"}]}]},{"code":"220000","name":"吉林省","parend_code":"0","child_code":[{"code":"220100","name":"长春市","parend_code":"220000","child_code":[{"code":"220101","name":"市辖区","parend_code":"220100"},{"code":"220102","name":"南关区","parend_code":"220100"},{"code":"220103","name":"宽城区","parend_code":"220100"},{"code":"220104","name":"朝阳区","parend_code":"220100"},{"code":"220105","name":"二道区","parend_code":"220100"},{"code":"220106","name":"绿园区","parend_code":"220100"},{"code":"220112","name":"双阳区","parend_code":"220100"},{"code":"220122","name":"农安县","parend_code":"220100"},{"code":"220181","name":"九台市","parend_code":"220100"},{"code":"220182","name":"榆树市","parend_code":"220100"},{"code":"220183","name":"德惠市","parend_code":"220100"}]},{"code":"220200","name":"吉林市","parend_code":"220000","child_code":[{"code":"220201","name":"市辖区","parend_code":"220200"},{"code":"220202","name":"昌邑区","parend_code":"220200"},{"code":"220203","name":"龙潭区","parend_code":"220200"},{"code":"220204","name":"船营区","parend_code":"220200"},{"code":"220211","name":"丰满区","parend_code":"220200"},{"code":"220221","name":"永吉县","parend_code":"220200"},{"code":"220281","name":"蛟河市","parend_code":"220200"},{"code":"220282","name":"桦甸市","parend_code":"220200"},{"code":"220283","name":"舒兰市","parend_code":"220200"},{"code":"220284","name":"磐石市","parend_code":"220200"}]},{"code":"220300","name":"四平市","parend_code":"220000","child_code":[{"code":"220301","name":"市辖区","parend_code":"220300"},{"code":"220302","name":"铁西区","parend_code":"220300"},{"code":"220303","name":"铁东区","parend_code":"220300"},{"code":"220322","name":"梨树县","parend_code":"220300"},{"code":"220323","name":"伊通满族自治县","parend_code":"220300"},{"code":"220381","name":"公主岭市","parend_code":"220300"},{"code":"220382","name":"双辽市","parend_code":"220300"}]},{"code":"220400","name":"辽源市","parend_code":"220000","child_code":[{"code":"220401","name":"市辖区","parend_code":"220400"},{"code":"220402","name":"龙山区","parend_code":"220400"},{"code":"220403","name":"西安区","parend_code":"220400"},{"code":"220421","name":"东丰县","parend_code":"220400"},{"code":"220422","name":"东辽县","parend_code":"220400"}]},{"code":"220500","name":"通化市","parend_code":"220000","child_code":[{"code":"220501","name":"市辖区","parend_code":"220500"},{"code":"220502","name":"东昌区","parend_code":"220500"},{"code":"220503","name":"二道江区","parend_code":"220500"},{"code":"220521","name":"通化县","parend_code":"220500"},{"code":"220523","name":"辉南县","parend_code":"220500"},{"code":"220524","name":"柳河县","parend_code":"220500"},{"code":"220581","name":"梅河口市","parend_code":"220500"},{"code":"220582","name":"集安市","parend_code":"220500"}]},{"code":"220600","name":"白山市","parend_code":"220000","child_code":[{"code":"220601","name":"市辖区","parend_code":"220600"},{"code":"220602","name":"八道江区","parend_code":"220600"},{"code":"220621","name":"抚松县","parend_code":"220600"},{"code":"220622","name":"靖宇县","parend_code":"220600"},{"code":"220623","name":"长白朝鲜族自治县","parend_code":"220600"},{"code":"220625","name":"江源县","parend_code":"220600"},{"code":"220681","name":"临江市","parend_code":"220600"}]},{"code":"220700","name":"松原市","parend_code":"220000","child_code":[{"code":"220701","name":"市辖区","parend_code":"220700"},{"code":"220702","name":"宁江区","parend_code":"220700"},{"code":"220721","name":"前郭尔罗斯蒙古族自治县","parend_code":"220700"},{"code":"220722","name":"长岭县","parend_code":"220700"},{"code":"220723","name":"乾安县","parend_code":"220700"},{"code":"220724","name":"扶余县","parend_code":"220700"}]},{"code":"220800","name":"白城市","parend_code":"220000","child_code":[{"code":"220801","name":"市辖区","parend_code":"220800"},{"code":"220802","name":"洮北区","parend_code":"220800"},{"code":"220821","name":"镇赉县","parend_code":"220800"},{"code":"220822","name":"通榆县","parend_code":"220800"},{"code":"220881","name":"洮南市","parend_code":"220800"},{"code":"220882","name":"大安市","parend_code":"220800"}]},{"code":"222400","name":"延边朝鲜族自治州","parend_code":"220000","child_code":[{"code":"222401","name":"延吉市","parend_code":"222400"},{"code":"222402","name":"图们市","parend_code":"222400"},{"code":"222403","name":"敦化市","parend_code":"222400"},{"code":"222404","name":"珲春市","parend_code":"222400"},{"code":"222405","name":"龙井市","parend_code":"222400"},{"code":"222406","name":"和龙市","parend_code":"222400"},{"code":"222424","name":"汪清县","parend_code":"222400"},{"code":"222426","name":"安图县","parend_code":"222400"}]}]},{"code":"230000","name":"黑龙江省","parend_code":"0","child_code":[{"code":"230100","name":"哈尔滨市","parend_code":"230000","child_code":[{"code":"230101","name":"市辖区","parend_code":"230100"},{"code":"230102","name":"道里区","parend_code":"230100"},{"code":"230103","name":"南岗区","parend_code":"230100"},{"code":"230104","name":"道外区","parend_code":"230100"},{"code":"230106","name":"香坊区","parend_code":"230100"},{"code":"230107","name":"动力区","parend_code":"230100"},{"code":"230108","name":"平房区","parend_code":"230100"},{"code":"230109","name":"松北区","parend_code":"230100"},{"code":"230111","name":"呼兰区","parend_code":"230100"},{"code":"230123","name":"依兰县","parend_code":"230100"},{"code":"230124","name":"方正县","parend_code":"230100"},{"code":"230125","name":"宾　县","parend_code":"230100"},{"code":"230126","name":"巴彦县","parend_code":"230100"},{"code":"230127","name":"木兰县","parend_code":"230100"},{"code":"230128","name":"通河县","parend_code":"230100"},{"code":"230129","name":"延寿县","parend_code":"230100"},{"code":"230181","name":"阿城市","parend_code":"230100"},{"code":"230182","name":"双城市","parend_code":"230100"},{"code":"230183","name":"尚志市","parend_code":"230100"},{"code":"230184","name":"五常市","parend_code":"230100"}]},{"code":"230200","name":"齐齐哈尔市","parend_code":"230000","child_code":[{"code":"230201","name":"市辖区","parend_code":"230200"},{"code":"230202","name":"龙沙区","parend_code":"230200"},{"code":"230203","name":"建华区","parend_code":"230200"},{"code":"230204","name":"铁锋区","parend_code":"230200"},{"code":"230205","name":"昂昂溪区","parend_code":"230200"},{"code":"230206","name":"富拉尔基区","parend_code":"230200"},{"code":"230207","name":"碾子山区","parend_code":"230200"},{"code":"230208","name":"梅里斯达斡尔族区","parend_code":"230200"},{"code":"230221","name":"龙江县","parend_code":"230200"},{"code":"230223","name":"依安县","parend_code":"230200"},{"code":"230224","name":"泰来县","parend_code":"230200"},{"code":"230225","name":"甘南县","parend_code":"230200"},{"code":"230227","name":"富裕县","parend_code":"230200"},{"code":"230229","name":"克山县","parend_code":"230200"},{"code":"230230","name":"克东县","parend_code":"230200"},{"code":"230231","name":"拜泉县","parend_code":"230200"},{"code":"230281","name":"讷河市","parend_code":"230200"}]},{"code":"230300","name":"鸡西市","parend_code":"230000","child_code":[{"code":"230301","name":"市辖区","parend_code":"230300"},{"code":"230302","name":"鸡冠区","parend_code":"230300"},{"code":"230303","name":"恒山区","parend_code":"230300"},{"code":"230304","name":"滴道区","parend_code":"230300"},{"code":"230305","name":"梨树区","parend_code":"230300"},{"code":"230306","name":"城子河区","parend_code":"230300"},{"code":"230307","name":"麻山区","parend_code":"230300"},{"code":"230321","name":"鸡东县","parend_code":"230300"},{"code":"230381","name":"虎林市","parend_code":"230300"},{"code":"230382","name":"密山市","parend_code":"230300"}]},{"code":"230400","name":"鹤岗市","parend_code":"230000","child_code":[{"code":"230401","name":"市辖区","parend_code":"230400"},{"code":"230402","name":"向阳区","parend_code":"230400"},{"code":"230403","name":"工农区","parend_code":"230400"},{"code":"230404","name":"南山区","parend_code":"230400"},{"code":"230405","name":"兴安区","parend_code":"230400"},{"code":"230406","name":"东山区","parend_code":"230400"},{"code":"230407","name":"兴山区","parend_code":"230400"},{"code":"230421","name":"萝北县","parend_code":"230400"},{"code":"230422","name":"绥滨县","parend_code":"230400"}]},{"code":"230500","name":"双鸭山市","parend_code":"230000","child_code":[{"code":"230501","name":"市辖区","parend_code":"230500"},{"code":"230502","name":"尖山区","parend_code":"230500"},{"code":"230503","name":"岭东区","parend_code":"230500"},{"code":"230505","name":"四方台区","parend_code":"230500"},{"code":"230506","name":"宝山区","parend_code":"230500"},{"code":"230521","name":"集贤县","parend_code":"230500"},{"code":"230522","name":"友谊县","parend_code":"230500"},{"code":"230523","name":"宝清县","parend_code":"230500"},{"code":"230524","name":"饶河县","parend_code":"230500"}]},{"code":"230600","name":"大庆市","parend_code":"230000","child_code":[{"code":"230601","name":"市辖区","parend_code":"230600"},{"code":"230602","name":"萨尔图区","parend_code":"230600"},{"code":"230603","name":"龙凤区","parend_code":"230600"},{"code":"230604","name":"让胡路区","parend_code":"230600"},{"code":"230605","name":"红岗区","parend_code":"230600"},{"code":"230606","name":"大同区","parend_code":"230600"},{"code":"230621","name":"肇州县","parend_code":"230600"},{"code":"230622","name":"肇源县","parend_code":"230600"},{"code":"230623","name":"林甸县","parend_code":"230600"},{"code":"230624","name":"杜尔伯特蒙古族自治县","parend_code":"230600"}]},{"code":"230700","name":"伊春市","parend_code":"230000","child_code":[{"code":"230701","name":"市辖区","parend_code":"230700"},{"code":"230702","name":"伊春区","parend_code":"230700"},{"code":"230703","name":"南岔区","parend_code":"230700"},{"code":"230704","name":"友好区","parend_code":"230700"},{"code":"230705","name":"西林区","parend_code":"230700"},{"code":"230706","name":"翠峦区","parend_code":"230700"},{"code":"230707","name":"新青区","parend_code":"230700"},{"code":"230708","name":"美溪区","parend_code":"230700"},{"code":"230709","name":"金山屯区","parend_code":"230700"},{"code":"230710","name":"五营区","parend_code":"230700"},{"code":"230711","name":"乌马河区","parend_code":"230700"},{"code":"230712","name":"汤旺河区","parend_code":"230700"},{"code":"230713","name":"带岭区","parend_code":"230700"},{"code":"230714","name":"乌伊岭区","parend_code":"230700"},{"code":"230715","name":"红星区","parend_code":"230700"},{"code":"230716","name":"上甘岭区","parend_code":"230700"},{"code":"230722","name":"嘉荫县","parend_code":"230700"},{"code":"230781","name":"铁力市","parend_code":"230700"}]},{"code":"230800","name":"佳木斯市","parend_code":"230000","child_code":[{"code":"230801","name":"市辖区","parend_code":"230800"},{"code":"230802","name":"永红区","parend_code":"230800"},{"code":"230803","name":"向阳区","parend_code":"230800"},{"code":"230804","name":"前进区","parend_code":"230800"},{"code":"230805","name":"东风区","parend_code":"230800"},{"code":"230811","name":"郊　区","parend_code":"230800"},{"code":"230822","name":"桦南县","parend_code":"230800"},{"code":"230826","name":"桦川县","parend_code":"230800"},{"code":"230828","name":"汤原县","parend_code":"230800"},{"code":"230833","name":"抚远县","parend_code":"230800"},{"code":"230881","name":"同江市","parend_code":"230800"},{"code":"230882","name":"富锦市","parend_code":"230800"}]},{"code":"230900","name":"七台河市","parend_code":"230000","child_code":[{"code":"230901","name":"市辖区","parend_code":"230900"},{"code":"230902","name":"新兴区","parend_code":"230900"},{"code":"230903","name":"桃山区","parend_code":"230900"},{"code":"230904","name":"茄子河区","parend_code":"230900"},{"code":"230921","name":"勃利县","parend_code":"230900"}]},{"code":"231000","name":"牡丹江市","parend_code":"230000","child_code":[{"code":"231001","name":"市辖区","parend_code":"231000"},{"code":"231002","name":"东安区","parend_code":"231000"},{"code":"231003","name":"阳明区","parend_code":"231000"},{"code":"231004","name":"爱民区","parend_code":"231000"},{"code":"231005","name":"西安区","parend_code":"231000"},{"code":"231024","name":"东宁县","parend_code":"231000"},{"code":"231025","name":"林口县","parend_code":"231000"},{"code":"231081","name":"绥芬河市","parend_code":"231000"},{"code":"231083","name":"海林市","parend_code":"231000"},{"code":"231084","name":"宁安市","parend_code":"231000"},{"code":"231085","name":"穆棱市","parend_code":"231000"}]},{"code":"231100","name":"黑河市","parend_code":"230000","child_code":[{"code":"231101","name":"市辖区","parend_code":"231100"},{"code":"231102","name":"爱辉区","parend_code":"231100"},{"code":"231121","name":"嫩江县","parend_code":"231100"},{"code":"231123","name":"逊克县","parend_code":"231100"},{"code":"231124","name":"孙吴县","parend_code":"231100"},{"code":"231181","name":"北安市","parend_code":"231100"},{"code":"231182","name":"五大连池市","parend_code":"231100"}]},{"code":"231200","name":"绥化市","parend_code":"230000","child_code":[{"code":"231201","name":"市辖区","parend_code":"231200"},{"code":"231202","name":"北林区","parend_code":"231200"},{"code":"231221","name":"望奎县","parend_code":"231200"},{"code":"231222","name":"兰西县","parend_code":"231200"},{"code":"231223","name":"青冈县","parend_code":"231200"},{"code":"231224","name":"庆安县","parend_code":"231200"},{"code":"231225","name":"明水县","parend_code":"231200"},{"code":"231226","name":"绥棱县","parend_code":"231200"},{"code":"231281","name":"安达市","parend_code":"231200"},{"code":"231282","name":"肇东市","parend_code":"231200"},{"code":"231283","name":"海伦市","parend_code":"231200"}]},{"code":"232700","name":"大兴安岭地区","parend_code":"230000","child_code":[{"code":"232721","name":"呼玛县","parend_code":"232700"},{"code":"232722","name":"塔河县","parend_code":"232700"},{"code":"232723","name":"漠河县","parend_code":"232700"}]}]},{"code":"310000","name":"上海市","parend_code":"0","child_code":[{"code":"310100","name":"市辖区","parend_code":"310000","child_code":[{"code":"310101","name":"黄浦区","parend_code":"310100"},{"code":"310103","name":"卢湾区","parend_code":"310100"},{"code":"310104","name":"徐汇区","parend_code":"310100"},{"code":"310105","name":"长宁区","parend_code":"310100"},{"code":"310106","name":"静安区","parend_code":"310100"},{"code":"310107","name":"普陀区","parend_code":"310100"},{"code":"310108","name":"闸北区","parend_code":"310100"},{"code":"310109","name":"虹口区","parend_code":"310100"},{"code":"310110","name":"杨浦区","parend_code":"310100"},{"code":"310112","name":"闵行区","parend_code":"310100"},{"code":"310113","name":"宝山区","parend_code":"310100"},{"code":"310114","name":"嘉定区","parend_code":"310100"},{"code":"310115","name":"浦东新区","parend_code":"310100"},{"code":"310116","name":"金山区","parend_code":"310100"},{"code":"310117","name":"松江区","parend_code":"310100"},{"code":"310118","name":"青浦区","parend_code":"310100"},{"code":"310119","name":"南汇区","parend_code":"310100"},{"code":"310120","name":"奉贤区","parend_code":"310100"}]},{"code":"310200","name":"县","parend_code":"310000","child_code":[{"code":"310230","name":"崇明县","parend_code":"310200"}]}]},{"code":"320000","name":"江苏省","parend_code":"0","child_code":[{"code":"320100","name":"南京市","parend_code":"320000","child_code":[{"code":"320101","name":"市辖区","parend_code":"320100"},{"code":"320102","name":"玄武区","parend_code":"320100"},{"code":"320103","name":"白下区","parend_code":"320100"},{"code":"320104","name":"秦淮区","parend_code":"320100"},{"code":"320105","name":"建邺区","parend_code":"320100"},{"code":"320106","name":"鼓楼区","parend_code":"320100"},{"code":"320107","name":"下关区","parend_code":"320100"},{"code":"320111","name":"浦口区","parend_code":"320100"},{"code":"320113","name":"栖霞区","parend_code":"320100"},{"code":"320114","name":"雨花台区","parend_code":"320100"},{"code":"320115","name":"江宁区","parend_code":"320100"},{"code":"320116","name":"六合区","parend_code":"320100"},{"code":"320124","name":"溧水县","parend_code":"320100"},{"code":"320125","name":"高淳县","parend_code":"320100"}]},{"code":"320200","name":"无锡市","parend_code":"320000","child_code":[{"code":"320201","name":"市辖区","parend_code":"320200"},{"code":"320202","name":"崇安区","parend_code":"320200"},{"code":"320203","name":"南长区","parend_code":"320200"},{"code":"320204","name":"北塘区","parend_code":"320200"},{"code":"320205","name":"锡山区","parend_code":"320200"},{"code":"320206","name":"惠山区","parend_code":"320200"},{"code":"320211","name":"滨湖区","parend_code":"320200"},{"code":"320281","name":"江阴市","parend_code":"320200"},{"code":"320282","name":"宜兴市","parend_code":"320200"}]},{"code":"320300","name":"徐州市","parend_code":"320000","child_code":[{"code":"320301","name":"市辖区","parend_code":"320300"},{"code":"320302","name":"鼓楼区","parend_code":"320300"},{"code":"320303","name":"云龙区","parend_code":"320300"},{"code":"320304","name":"九里区","parend_code":"320300"},{"code":"320305","name":"贾汪区","parend_code":"320300"},{"code":"320311","name":"泉山区","parend_code":"320300"},{"code":"320321","name":"丰　县","parend_code":"320300"},{"code":"320322","name":"沛　县","parend_code":"320300"},{"code":"320323","name":"铜山县","parend_code":"320300"},{"code":"320324","name":"睢宁县","parend_code":"320300"},{"code":"320381","name":"新沂市","parend_code":"320300"},{"code":"320382","name":"邳州市","parend_code":"320300"}]},{"code":"320400","name":"常州市","parend_code":"320000","child_code":[{"code":"320401","name":"市辖区","parend_code":"320400"},{"code":"320402","name":"天宁区","parend_code":"320400"},{"code":"320404","name":"钟楼区","parend_code":"320400"},{"code":"320405","name":"戚墅堰区","parend_code":"320400"},{"code":"320411","name":"新北区","parend_code":"320400"},{"code":"320412","name":"武进区","parend_code":"320400"},{"code":"320481","name":"溧阳市","parend_code":"320400"},{"code":"320482","name":"金坛市","parend_code":"320400"}]},{"code":"320500","name":"苏州市","parend_code":"320000","child_code":[{"code":"320501","name":"市辖区","parend_code":"320500"},{"code":"320502","name":"沧浪区","parend_code":"320500"},{"code":"320503","name":"平江区","parend_code":"320500"},{"code":"320504","name":"金阊区","parend_code":"320500"},{"code":"320505","name":"虎丘区","parend_code":"320500"},{"code":"320506","name":"吴中区","parend_code":"320500"},{"code":"320507","name":"相城区","parend_code":"320500"},{"code":"320581","name":"常熟市","parend_code":"320500"},{"code":"320582","name":"张家港市","parend_code":"320500"},{"code":"320583","name":"昆山市","parend_code":"320500"},{"code":"320584","name":"吴江市","parend_code":"320500"},{"code":"320585","name":"太仓市","parend_code":"320500"}]},{"code":"320600","name":"南通市","parend_code":"320000","child_code":[{"code":"320601","name":"市辖区","parend_code":"320600"},{"code":"320602","name":"崇川区","parend_code":"320600"},{"code":"320611","name":"港闸区","parend_code":"320600"},{"code":"320621","name":"海安县","parend_code":"320600"},{"code":"320623","name":"如东县","parend_code":"320600"},{"code":"320681","name":"启东市","parend_code":"320600"},{"code":"320682","name":"如皋市","parend_code":"320600"},{"code":"320683","name":"通州市","parend_code":"320600"},{"code":"320684","name":"海门市","parend_code":"320600"}]},{"code":"320700","name":"连云港市","parend_code":"320000","child_code":[{"code":"320701","name":"市辖区","parend_code":"320700"},{"code":"320703","name":"连云区","parend_code":"320700"},{"code":"320705","name":"新浦区","parend_code":"320700"},{"code":"320706","name":"海州区","parend_code":"320700"},{"code":"320721","name":"赣榆县","parend_code":"320700"},{"code":"320722","name":"东海县","parend_code":"320700"},{"code":"320723","name":"灌云县","parend_code":"320700"},{"code":"320724","name":"灌南县","parend_code":"320700"}]},{"code":"320800","name":"淮安市","parend_code":"320000","child_code":[{"code":"320801","name":"市辖区","parend_code":"320800"},{"code":"320802","name":"清河区","parend_code":"320800"},{"code":"320803","name":"楚州区","parend_code":"320800"},{"code":"320804","name":"淮阴区","parend_code":"320800"},{"code":"320811","name":"清浦区","parend_code":"320800"},{"code":"320826","name":"涟水县","parend_code":"320800"},{"code":"320829","name":"洪泽县","parend_code":"320800"},{"code":"320830","name":"盱眙县","parend_code":"320800"},{"code":"320831","name":"金湖县","parend_code":"320800"}]},{"code":"320900","name":"盐城市","parend_code":"320000","child_code":[{"code":"320901","name":"市辖区","parend_code":"320900"},{"code":"320902","name":"亭湖区","parend_code":"320900"},{"code":"320903","name":"盐都区","parend_code":"320900"},{"code":"320921","name":"响水县","parend_code":"320900"},{"code":"320922","name":"滨海县","parend_code":"320900"},{"code":"320923","name":"阜宁县","parend_code":"320900"},{"code":"320924","name":"射阳县","parend_code":"320900"},{"code":"320925","name":"建湖县","parend_code":"320900"},{"code":"320981","name":"东台市","parend_code":"320900"},{"code":"320982","name":"大丰市","parend_code":"320900"}]},{"code":"321000","name":"扬州市","parend_code":"320000","child_code":[{"code":"321001","name":"市辖区","parend_code":"321000"},{"code":"321002","name":"广陵区","parend_code":"321000"},{"code":"321003","name":"邗江区","parend_code":"321000"},{"code":"321011","name":"郊　区","parend_code":"321000"},{"code":"321023","name":"宝应县","parend_code":"321000"},{"code":"321081","name":"仪征市","parend_code":"321000"},{"code":"321084","name":"高邮市","parend_code":"321000"},{"code":"321088","name":"江都市","parend_code":"321000"}]},{"code":"321100","name":"镇江市","parend_code":"320000","child_code":[{"code":"321101","name":"市辖区","parend_code":"321100"},{"code":"321102","name":"京口区","parend_code":"321100"},{"code":"321111","name":"润州区","parend_code":"321100"},{"code":"321112","name":"丹徒区","parend_code":"321100"},{"code":"321181","name":"丹阳市","parend_code":"321100"},{"code":"321182","name":"扬中市","parend_code":"321100"},{"code":"321183","name":"句容市","parend_code":"321100"}]},{"code":"321200","name":"泰州市","parend_code":"320000","child_code":[{"code":"321201","name":"市辖区","parend_code":"321200"},{"code":"321202","name":"海陵区","parend_code":"321200"},{"code":"321203","name":"高港区","parend_code":"321200"},{"code":"321281","name":"兴化市","parend_code":"321200"},{"code":"321282","name":"靖江市","parend_code":"321200"},{"code":"321283","name":"泰兴市","parend_code":"321200"},{"code":"321284","name":"姜堰市","parend_code":"321200"}]},{"code":"321300","name":"宿迁市","parend_code":"320000","child_code":[{"code":"321301","name":"市辖区","parend_code":"321300"},{"code":"321302","name":"宿城区","parend_code":"321300"},{"code":"321311","name":"宿豫区","parend_code":"321300"},{"code":"321322","name":"沭阳县","parend_code":"321300"},{"code":"321323","name":"泗阳县","parend_code":"321300"},{"code":"321324","name":"泗洪县","parend_code":"321300"}]}]},{"code":"330000","name":"浙江省","parend_code":"0","child_code":[{"code":"330100","name":"杭州市","parend_code":"330000","child_code":[{"code":"330101","name":"市辖区","parend_code":"330100"},{"code":"330102","name":"上城区","parend_code":"330100"},{"code":"330103","name":"下城区","parend_code":"330100"},{"code":"330104","name":"江干区","parend_code":"330100"},{"code":"330105","name":"拱墅区","parend_code":"330100"},{"code":"330106","name":"西湖区","parend_code":"330100"},{"code":"330108","name":"滨江区","parend_code":"330100"},{"code":"330109","name":"萧山区","parend_code":"330100"},{"code":"330110","name":"余杭区","parend_code":"330100"},{"code":"330122","name":"桐庐县","parend_code":"330100"},{"code":"330127","name":"淳安县","parend_code":"330100"},{"code":"330182","name":"建德市","parend_code":"330100"},{"code":"330183","name":"富阳市","parend_code":"330100"},{"code":"330185","name":"临安市","parend_code":"330100"}]},{"code":"330200","name":"宁波市","parend_code":"330000","child_code":[{"code":"330201","name":"市辖区","parend_code":"330200"},{"code":"330203","name":"海曙区","parend_code":"330200"},{"code":"330204","name":"江东区","parend_code":"330200"},{"code":"330205","name":"江北区","parend_code":"330200"},{"code":"330206","name":"北仑区","parend_code":"330200"},{"code":"330211","name":"镇海区","parend_code":"330200"},{"code":"330212","name":"鄞州区","parend_code":"330200"},{"code":"330225","name":"象山县","parend_code":"330200"},{"code":"330226","name":"宁海县","parend_code":"330200"},{"code":"330281","name":"余姚市","parend_code":"330200"},{"code":"330282","name":"慈溪市","parend_code":"330200"},{"code":"330283","name":"奉化市","parend_code":"330200"}]},{"code":"330300","name":"温州市","parend_code":"330000","child_code":[{"code":"330301","name":"市辖区","parend_code":"330300"},{"code":"330302","name":"鹿城区","parend_code":"330300"},{"code":"330303","name":"龙湾区","parend_code":"330300"},{"code":"330304","name":"瓯海区","parend_code":"330300"},{"code":"330322","name":"洞头县","parend_code":"330300"},{"code":"330324","name":"永嘉县","parend_code":"330300"},{"code":"330326","name":"平阳县","parend_code":"330300"},{"code":"330327","name":"苍南县","parend_code":"330300"},{"code":"330328","name":"文成县","parend_code":"330300"},{"code":"330329","name":"泰顺县","parend_code":"330300"},{"code":"330381","name":"瑞安市","parend_code":"330300"},{"code":"330382","name":"乐清市","parend_code":"330300"}]},{"code":"330400","name":"嘉兴市","parend_code":"330000","child_code":[{"code":"330401","name":"市辖区","parend_code":"330400"},{"code":"330402","name":"秀城区","parend_code":"330400"},{"code":"330411","name":"秀洲区","parend_code":"330400"},{"code":"330421","name":"嘉善县","parend_code":"330400"},{"code":"330424","name":"海盐县","parend_code":"330400"},{"code":"330481","name":"海宁市","parend_code":"330400"},{"code":"330482","name":"平湖市","parend_code":"330400"},{"code":"330483","name":"桐乡市","parend_code":"330400"}]},{"code":"330500","name":"湖州市","parend_code":"330000","child_code":[{"code":"330501","name":"市辖区","parend_code":"330500"},{"code":"330502","name":"吴兴区","parend_code":"330500"},{"code":"330503","name":"南浔区","parend_code":"330500"},{"code":"330521","name":"德清县","parend_code":"330500"},{"code":"330522","name":"长兴县","parend_code":"330500"},{"code":"330523","name":"安吉县","parend_code":"330500"}]},{"code":"330600","name":"绍兴市","parend_code":"330000","child_code":[{"code":"330601","name":"市辖区","parend_code":"330600"},{"code":"330602","name":"越城区","parend_code":"330600"},{"code":"330621","name":"绍兴县","parend_code":"330600"},{"code":"330624","name":"新昌县","parend_code":"330600"},{"code":"330681","name":"诸暨市","parend_code":"330600"},{"code":"330682","name":"上虞市","parend_code":"330600"},{"code":"330683","name":"嵊州市","parend_code":"330600"}]},{"code":"330700","name":"金华市","parend_code":"330000","child_code":[{"code":"330701","name":"市辖区","parend_code":"330700"},{"code":"330702","name":"婺城区","parend_code":"330700"},{"code":"330703","name":"金东区","parend_code":"330700"},{"code":"330723","name":"武义县","parend_code":"330700"},{"code":"330726","name":"浦江县","parend_code":"330700"},{"code":"330727","name":"磐安县","parend_code":"330700"},{"code":"330781","name":"兰溪市","parend_code":"330700"},{"code":"330782","name":"义乌市","parend_code":"330700"},{"code":"330783","name":"东阳市","parend_code":"330700"},{"code":"330784","name":"永康市","parend_code":"330700"}]},{"code":"330800","name":"衢州市","parend_code":"330000","child_code":[{"code":"330801","name":"市辖区","parend_code":"330800"},{"code":"330802","name":"柯城区","parend_code":"330800"},{"code":"330803","name":"衢江区","parend_code":"330800"},{"code":"330822","name":"常山县","parend_code":"330800"},{"code":"330824","name":"开化县","parend_code":"330800"},{"code":"330825","name":"龙游县","parend_code":"330800"},{"code":"330881","name":"江山市","parend_code":"330800"}]},{"code":"330900","name":"舟山市","parend_code":"330000","child_code":[{"code":"330901","name":"市辖区","parend_code":"330900"},{"code":"330902","name":"定海区","parend_code":"330900"},{"code":"330903","name":"普陀区","parend_code":"330900"},{"code":"330921","name":"岱山县","parend_code":"330900"},{"code":"330922","name":"嵊泗县","parend_code":"330900"}]},{"code":"331000","name":"台州市","parend_code":"330000","child_code":[{"code":"331001","name":"市辖区","parend_code":"331000"},{"code":"331002","name":"椒江区","parend_code":"331000"},{"code":"331003","name":"黄岩区","parend_code":"331000"},{"code":"331004","name":"路桥区","parend_code":"331000"},{"code":"331021","name":"玉环县","parend_code":"331000"},{"code":"331022","name":"三门县","parend_code":"331000"},{"code":"331023","name":"天台县","parend_code":"331000"},{"code":"331024","name":"仙居县","parend_code":"331000"},{"code":"331081","name":"温岭市","parend_code":"331000"},{"code":"331082","name":"临海市","parend_code":"331000"}]},{"code":"331100","name":"丽水市","parend_code":"330000","child_code":[{"code":"331101","name":"市辖区","parend_code":"331100"},{"code":"331102","name":"莲都区","parend_code":"331100"},{"code":"331121","name":"青田县","parend_code":"331100"},{"code":"331122","name":"缙云县","parend_code":"331100"},{"code":"331123","name":"遂昌县","parend_code":"331100"},{"code":"331124","name":"松阳县","parend_code":"331100"},{"code":"331125","name":"云和县","parend_code":"331100"},{"code":"331126","name":"庆元县","parend_code":"331100"},{"code":"331127","name":"景宁畲族自治县","parend_code":"331100"},{"code":"331181","name":"龙泉市","parend_code":"331100"}]}]},{"code":"340000","name":"安徽省","parend_code":"0","child_code":[{"code":"340100","name":"合肥市","parend_code":"340000","child_code":[{"code":"340101","name":"市辖区","parend_code":"340100"},{"code":"340102","name":"瑶海区","parend_code":"340100"},{"code":"340103","name":"庐阳区","parend_code":"340100"},{"code":"340104","name":"蜀山区","parend_code":"340100"},{"code":"340111","name":"包河区","parend_code":"340100"},{"code":"340121","name":"长丰县","parend_code":"340100"},{"code":"340122","name":"肥东县","parend_code":"340100"},{"code":"340123","name":"肥西县","parend_code":"340100"}]},{"code":"340200","name":"芜湖市","parend_code":"340000","child_code":[{"code":"340201","name":"市辖区","parend_code":"340200"},{"code":"340202","name":"镜湖区","parend_code":"340200"},{"code":"340203","name":"马塘区","parend_code":"340200"},{"code":"340204","name":"新芜区","parend_code":"340200"},{"code":"340207","name":"鸠江区","parend_code":"340200"},{"code":"340221","name":"芜湖县","parend_code":"340200"},{"code":"340222","name":"繁昌县","parend_code":"340200"},{"code":"340223","name":"南陵县","parend_code":"340200"}]},{"code":"340300","name":"蚌埠市","parend_code":"340000","child_code":[{"code":"340301","name":"市辖区","parend_code":"340300"},{"code":"340302","name":"龙子湖区","parend_code":"340300"},{"code":"340303","name":"蚌山区","parend_code":"340300"},{"code":"340304","name":"禹会区","parend_code":"340300"},{"code":"340311","name":"淮上区","parend_code":"340300"},{"code":"340321","name":"怀远县","parend_code":"340300"},{"code":"340322","name":"五河县","parend_code":"340300"},{"code":"340323","name":"固镇县","parend_code":"340300"}]},{"code":"340400","name":"淮南市","parend_code":"340000","child_code":[{"code":"340401","name":"市辖区","parend_code":"340400"},{"code":"340402","name":"大通区","parend_code":"340400"},{"code":"340403","name":"田家庵区","parend_code":"340400"},{"code":"340404","name":"谢家集区","parend_code":"340400"},{"code":"340405","name":"八公山区","parend_code":"340400"},{"code":"340406","name":"潘集区","parend_code":"340400"},{"code":"340421","name":"凤台县","parend_code":"340400"}]},{"code":"340500","name":"马鞍山市","parend_code":"340000","child_code":[{"code":"340501","name":"市辖区","parend_code":"340500"},{"code":"340502","name":"金家庄区","parend_code":"340500"},{"code":"340503","name":"花山区","parend_code":"340500"},{"code":"340504","name":"雨山区","parend_code":"340500"},{"code":"340521","name":"当涂县","parend_code":"340500"}]},{"code":"340600","name":"淮北市","parend_code":"340000","child_code":[{"code":"340601","name":"市辖区","parend_code":"340600"},{"code":"340602","name":"杜集区","parend_code":"340600"},{"code":"340603","name":"相山区","parend_code":"340600"},{"code":"340604","name":"烈山区","parend_code":"340600"},{"code":"340621","name":"濉溪县","parend_code":"340600"}]},{"code":"340700","name":"铜陵市","parend_code":"340000","child_code":[{"code":"340701","name":"市辖区","parend_code":"340700"},{"code":"340702","name":"铜官山区","parend_code":"340700"},{"code":"340703","name":"狮子山区","parend_code":"340700"},{"code":"340711","name":"郊　区","parend_code":"340700"},{"code":"340721","name":"铜陵县","parend_code":"340700"}]},{"code":"340800","name":"安庆市","parend_code":"340000","child_code":[{"code":"340801","name":"市辖区","parend_code":"340800"},{"code":"340802","name":"迎江区","parend_code":"340800"},{"code":"340803","name":"大观区","parend_code":"340800"},{"code":"340811","name":"郊　区","parend_code":"340800"},{"code":"340822","name":"怀宁县","parend_code":"340800"},{"code":"340823","name":"枞阳县","parend_code":"340800"},{"code":"340824","name":"潜山县","parend_code":"340800"},{"code":"340825","name":"太湖县","parend_code":"340800"},{"code":"340826","name":"宿松县","parend_code":"340800"},{"code":"340827","name":"望江县","parend_code":"340800"},{"code":"340828","name":"岳西县","parend_code":"340800"},{"code":"340881","name":"桐城市","parend_code":"340800"}]},{"code":"341000","name":"黄山市","parend_code":"340000","child_code":[{"code":"341001","name":"市辖区","parend_code":"341000"},{"code":"341002","name":"屯溪区","parend_code":"341000"},{"code":"341003","name":"黄山区","parend_code":"341000"},{"code":"341004","name":"徽州区","parend_code":"341000"},{"code":"341021","name":"歙　县","parend_code":"341000"},{"code":"341022","name":"休宁县","parend_code":"341000"},{"code":"341023","name":"黟　县","parend_code":"341000"},{"code":"341024","name":"祁门县","parend_code":"341000"}]},{"code":"341100","name":"滁州市","parend_code":"340000","child_code":[{"code":"341101","name":"市辖区","parend_code":"341100"},{"code":"341102","name":"琅琊区","parend_code":"341100"},{"code":"341103","name":"南谯区","parend_code":"341100"},{"code":"341122","name":"来安县","parend_code":"341100"},{"code":"341124","name":"全椒县","parend_code":"341100"},{"code":"341125","name":"定远县","parend_code":"341100"},{"code":"341126","name":"凤阳县","parend_code":"341100"},{"code":"341181","name":"天长市","parend_code":"341100"},{"code":"341182","name":"明光市","parend_code":"341100"}]},{"code":"341200","name":"阜阳市","parend_code":"340000","child_code":[{"code":"341201","name":"市辖区","parend_code":"341200"},{"code":"341202","name":"颍州区","parend_code":"341200"},{"code":"341203","name":"颍东区","parend_code":"341200"},{"code":"341204","name":"颍泉区","parend_code":"341200"},{"code":"341221","name":"临泉县","parend_code":"341200"},{"code":"341222","name":"太和县","parend_code":"341200"},{"code":"341225","name":"阜南县","parend_code":"341200"},{"code":"341226","name":"颍上县","parend_code":"341200"},{"code":"341282","name":"界首市","parend_code":"341200"}]},{"code":"341300","name":"宿州市","parend_code":"340000","child_code":[{"code":"341301","name":"市辖区","parend_code":"341300"},{"code":"341302","name":"墉桥区","parend_code":"341300"},{"code":"341321","name":"砀山县","parend_code":"341300"},{"code":"341322","name":"萧　县","parend_code":"341300"},{"code":"341323","name":"灵璧县","parend_code":"341300"},{"code":"341324","name":"泗　县","parend_code":"341300"}]},{"code":"341400","name":"巢湖市","parend_code":"340000","child_code":[{"code":"341401","name":"市辖区","parend_code":"341400"},{"code":"341402","name":"居巢区","parend_code":"341400"},{"code":"341421","name":"庐江县","parend_code":"341400"},{"code":"341422","name":"无为县","parend_code":"341400"},{"code":"341423","name":"含山县","parend_code":"341400"},{"code":"341424","name":"和　县","parend_code":"341400"}]},{"code":"341500","name":"六安市","parend_code":"340000","child_code":[{"code":"341501","name":"市辖区","parend_code":"341500"},{"code":"341502","name":"金安区","parend_code":"341500"},{"code":"341503","name":"裕安区","parend_code":"341500"},{"code":"341521","name":"寿　县","parend_code":"341500"},{"code":"341522","name":"霍邱县","parend_code":"341500"},{"code":"341523","name":"舒城县","parend_code":"341500"},{"code":"341524","name":"金寨县","parend_code":"341500"},{"code":"341525","name":"霍山县","parend_code":"341500"}]},{"code":"341600","name":"亳州市","parend_code":"340000","child_code":[{"code":"341601","name":"市辖区","parend_code":"341600"},{"code":"341602","name":"谯城区","parend_code":"341600"},{"code":"341621","name":"涡阳县","parend_code":"341600"},{"code":"341622","name":"蒙城县","parend_code":"341600"},{"code":"341623","name":"利辛县","parend_code":"341600"}]},{"code":"341700","name":"池州市","parend_code":"340000","child_code":[{"code":"341701","name":"市辖区","parend_code":"341700"},{"code":"341702","name":"贵池区","parend_code":"341700"},{"code":"341721","name":"东至县","parend_code":"341700"},{"code":"341722","name":"石台县","parend_code":"341700"},{"code":"341723","name":"青阳县","parend_code":"341700"}]},{"code":"341800","name":"宣城市","parend_code":"340000","child_code":[{"code":"341801","name":"市辖区","parend_code":"341800"},{"code":"341802","name":"宣州区","parend_code":"341800"},{"code":"341821","name":"郎溪县","parend_code":"341800"},{"code":"341822","name":"广德县","parend_code":"341800"},{"code":"341823","name":"泾　县","parend_code":"341800"},{"code":"341824","name":"绩溪县","parend_code":"341800"},{"code":"341825","name":"旌德县","parend_code":"341800"},{"code":"341881","name":"宁国市","parend_code":"341800"}]}]},{"code":"350000","name":"福建省","parend_code":"0","child_code":[{"code":"350100","name":"福州市","parend_code":"350000","child_code":[{"code":"350101","name":"市辖区","parend_code":"350100"},{"code":"350102","name":"鼓楼区","parend_code":"350100"},{"code":"350103","name":"台江区","parend_code":"350100"},{"code":"350104","name":"仓山区","parend_code":"350100"},{"code":"350105","name":"马尾区","parend_code":"350100"},{"code":"350111","name":"晋安区","parend_code":"350100"},{"code":"350121","name":"闽侯县","parend_code":"350100"},{"code":"350122","name":"连江县","parend_code":"350100"},{"code":"350123","name":"罗源县","parend_code":"350100"},{"code":"350124","name":"闽清县","parend_code":"350100"},{"code":"350125","name":"永泰县","parend_code":"350100"},{"code":"350128","name":"平潭县","parend_code":"350100"},{"code":"350181","name":"福清市","parend_code":"350100"},{"code":"350182","name":"长乐市","parend_code":"350100"}]},{"code":"350200","name":"厦门市","parend_code":"350000","child_code":[{"code":"350201","name":"市辖区","parend_code":"350200"},{"code":"350203","name":"思明区","parend_code":"350200"},{"code":"350205","name":"海沧区","parend_code":"350200"},{"code":"350206","name":"湖里区","parend_code":"350200"},{"code":"350211","name":"集美区","parend_code":"350200"},{"code":"350212","name":"同安区","parend_code":"350200"},{"code":"350213","name":"翔安区","parend_code":"350200"}]},{"code":"350300","name":"莆田市","parend_code":"350000","child_code":[{"code":"350301","name":"市辖区","parend_code":"350300"},{"code":"350302","name":"城厢区","parend_code":"350300"},{"code":"350303","name":"涵江区","parend_code":"350300"},{"code":"350304","name":"荔城区","parend_code":"350300"},{"code":"350305","name":"秀屿区","parend_code":"350300"},{"code":"350322","name":"仙游县","parend_code":"350300"}]},{"code":"350400","name":"三明市","parend_code":"350000","child_code":[{"code":"350401","name":"市辖区","parend_code":"350400"},{"code":"350402","name":"梅列区","parend_code":"350400"},{"code":"350403","name":"三元区","parend_code":"350400"},{"code":"350421","name":"明溪县","parend_code":"350400"},{"code":"350423","name":"清流县","parend_code":"350400"},{"code":"350424","name":"宁化县","parend_code":"350400"},{"code":"350425","name":"大田县","parend_code":"350400"},{"code":"350426","name":"尤溪县","parend_code":"350400"},{"code":"350427","name":"沙　县","parend_code":"350400"},{"code":"350428","name":"将乐县","parend_code":"350400"},{"code":"350429","name":"泰宁县","parend_code":"350400"},{"code":"350430","name":"建宁县","parend_code":"350400"},{"code":"350481","name":"永安市","parend_code":"350400"}]},{"code":"350500","name":"泉州市","parend_code":"350000","child_code":[{"code":"350501","name":"市辖区","parend_code":"350500"},{"code":"350502","name":"鲤城区","parend_code":"350500"},{"code":"350503","name":"丰泽区","parend_code":"350500"},{"code":"350504","name":"洛江区","parend_code":"350500"},{"code":"350505","name":"泉港区","parend_code":"350500"},{"code":"350521","name":"惠安县","parend_code":"350500"},{"code":"350524","name":"安溪县","parend_code":"350500"},{"code":"350525","name":"永春县","parend_code":"350500"},{"code":"350526","name":"德化县","parend_code":"350500"},{"code":"350527","name":"金门县","parend_code":"350500"},{"code":"350581","name":"石狮市","parend_code":"350500"},{"code":"350582","name":"晋江市","parend_code":"350500"},{"code":"350583","name":"南安市","parend_code":"350500"}]},{"code":"350600","name":"漳州市","parend_code":"350000","child_code":[{"code":"350601","name":"市辖区","parend_code":"350600"},{"code":"350602","name":"芗城区","parend_code":"350600"},{"code":"350603","name":"龙文区","parend_code":"350600"},{"code":"350622","name":"云霄县","parend_code":"350600"},{"code":"350623","name":"漳浦县","parend_code":"350600"},{"code":"350624","name":"诏安县","parend_code":"350600"},{"code":"350625","name":"长泰县","parend_code":"350600"},{"code":"350626","name":"东山县","parend_code":"350600"},{"code":"350627","name":"南靖县","parend_code":"350600"},{"code":"350628","name":"平和县","parend_code":"350600"},{"code":"350629","name":"华安县","parend_code":"350600"},{"code":"350681","name":"龙海市","parend_code":"350600"}]},{"code":"350700","name":"南平市","parend_code":"350000","child_code":[{"code":"350701","name":"市辖区","parend_code":"350700"},{"code":"350702","name":"延平区","parend_code":"350700"},{"code":"350721","name":"顺昌县","parend_code":"350700"},{"code":"350722","name":"浦城县","parend_code":"350700"},{"code":"350723","name":"光泽县","parend_code":"350700"},{"code":"350724","name":"松溪县","parend_code":"350700"},{"code":"350725","name":"政和县","parend_code":"350700"},{"code":"350781","name":"邵武市","parend_code":"350700"},{"code":"350782","name":"武夷山市","parend_code":"350700"},{"code":"350783","name":"建瓯市","parend_code":"350700"},{"code":"350784","name":"建阳市","parend_code":"350700"}]},{"code":"350800","name":"龙岩市","parend_code":"350000","child_code":[{"code":"350801","name":"市辖区","parend_code":"350800"},{"code":"350802","name":"新罗区","parend_code":"350800"},{"code":"350821","name":"长汀县","parend_code":"350800"},{"code":"350822","name":"永定县","parend_code":"350800"},{"code":"350823","name":"上杭县","parend_code":"350800"},{"code":"350824","name":"武平县","parend_code":"350800"},{"code":"350825","name":"连城县","parend_code":"350800"},{"code":"350881","name":"漳平市","parend_code":"350800"}]},{"code":"350900","name":"宁德市","parend_code":"350000","child_code":[{"code":"350901","name":"市辖区","parend_code":"350900"},{"code":"350902","name":"蕉城区","parend_code":"350900"},{"code":"350921","name":"霞浦县","parend_code":"350900"},{"code":"350922","name":"古田县","parend_code":"350900"},{"code":"350923","name":"屏南县","parend_code":"350900"},{"code":"350924","name":"寿宁县","parend_code":"350900"},{"code":"350925","name":"周宁县","parend_code":"350900"},{"code":"350926","name":"柘荣县","parend_code":"350900"},{"code":"350981","name":"福安市","parend_code":"350900"},{"code":"350982","name":"福鼎市","parend_code":"350900"}]}]},{"code":"360000","name":"江西省","parend_code":"0","child_code":[{"code":"360100","name":"南昌市","parend_code":"360000","child_code":[{"code":"360101","name":"市辖区","parend_code":"360100"},{"code":"360102","name":"东湖区","parend_code":"360100"},{"code":"360103","name":"西湖区","parend_code":"360100"},{"code":"360104","name":"青云谱区","parend_code":"360100"},{"code":"360105","name":"湾里区","parend_code":"360100"},{"code":"360111","name":"青山湖区","parend_code":"360100"},{"code":"360121","name":"南昌县","parend_code":"360100"},{"code":"360122","name":"新建县","parend_code":"360100"},{"code":"360123","name":"安义县","parend_code":"360100"},{"code":"360124","name":"进贤县","parend_code":"360100"}]},{"code":"360200","name":"景德镇市","parend_code":"360000","child_code":[{"code":"360201","name":"市辖区","parend_code":"360200"},{"code":"360202","name":"昌江区","parend_code":"360200"},{"code":"360203","name":"珠山区","parend_code":"360200"},{"code":"360222","name":"浮梁县","parend_code":"360200"},{"code":"360281","name":"乐平市","parend_code":"360200"}]},{"code":"360300","name":"萍乡市","parend_code":"360000","child_code":[{"code":"360301","name":"市辖区","parend_code":"360300"},{"code":"360302","name":"安源区","parend_code":"360300"},{"code":"360313","name":"湘东区","parend_code":"360300"},{"code":"360321","name":"莲花县","parend_code":"360300"},{"code":"360322","name":"上栗县","parend_code":"360300"},{"code":"360323","name":"芦溪县","parend_code":"360300"}]},{"code":"360400","name":"九江市","parend_code":"360000","child_code":[{"code":"360401","name":"市辖区","parend_code":"360400"},{"code":"360402","name":"庐山区","parend_code":"360400"},{"code":"360403","name":"浔阳区","parend_code":"360400"},{"code":"360421","name":"九江县","parend_code":"360400"},{"code":"360423","name":"武宁县","parend_code":"360400"},{"code":"360424","name":"修水县","parend_code":"360400"},{"code":"360425","name":"永修县","parend_code":"360400"},{"code":"360426","name":"德安县","parend_code":"360400"},{"code":"360427","name":"星子县","parend_code":"360400"},{"code":"360428","name":"都昌县","parend_code":"360400"},{"code":"360429","name":"湖口县","parend_code":"360400"},{"code":"360430","name":"彭泽县","parend_code":"360400"},{"code":"360481","name":"瑞昌市","parend_code":"360400"}]},{"code":"360500","name":"新余市","parend_code":"360000","child_code":[{"code":"360501","name":"市辖区","parend_code":"360500"},{"code":"360502","name":"渝水区","parend_code":"360500"},{"code":"360521","name":"分宜县","parend_code":"360500"}]},{"code":"360600","name":"鹰潭市","parend_code":"360000","child_code":[{"code":"360601","name":"市辖区","parend_code":"360600"},{"code":"360602","name":"月湖区","parend_code":"360600"},{"code":"360622","name":"余江县","parend_code":"360600"},{"code":"360681","name":"贵溪市","parend_code":"360600"}]},{"code":"360700","name":"赣州市","parend_code":"360000","child_code":[{"code":"360701","name":"市辖区","parend_code":"360700"},{"code":"360702","name":"章贡区","parend_code":"360700"},{"code":"360721","name":"赣　县","parend_code":"360700"},{"code":"360722","name":"信丰县","parend_code":"360700"},{"code":"360723","name":"大余县","parend_code":"360700"},{"code":"360724","name":"上犹县","parend_code":"360700"},{"code":"360725","name":"崇义县","parend_code":"360700"},{"code":"360726","name":"安远县","parend_code":"360700"},{"code":"360727","name":"龙南县","parend_code":"360700"},{"code":"360728","name":"定南县","parend_code":"360700"},{"code":"360729","name":"全南县","parend_code":"360700"},{"code":"360730","name":"宁都县","parend_code":"360700"},{"code":"360731","name":"于都县","parend_code":"360700"},{"code":"360732","name":"兴国县","parend_code":"360700"},{"code":"360733","name":"会昌县","parend_code":"360700"},{"code":"360734","name":"寻乌县","parend_code":"360700"},{"code":"360735","name":"石城县","parend_code":"360700"},{"code":"360781","name":"瑞金市","parend_code":"360700"},{"code":"360782","name":"南康市","parend_code":"360700"}]},{"code":"360800","name":"吉安市","parend_code":"360000","child_code":[{"code":"360801","name":"市辖区","parend_code":"360800"},{"code":"360802","name":"吉州区","parend_code":"360800"},{"code":"360803","name":"青原区","parend_code":"360800"},{"code":"360821","name":"吉安县","parend_code":"360800"},{"code":"360822","name":"吉水县","parend_code":"360800"},{"code":"360823","name":"峡江县","parend_code":"360800"},{"code":"360824","name":"新干县","parend_code":"360800"},{"code":"360825","name":"永丰县","parend_code":"360800"},{"code":"360826","name":"泰和县","parend_code":"360800"},{"code":"360827","name":"遂川县","parend_code":"360800"},{"code":"360828","name":"万安县","parend_code":"360800"},{"code":"360829","name":"安福县","parend_code":"360800"},{"code":"360830","name":"永新县","parend_code":"360800"},{"code":"360881","name":"井冈山市","parend_code":"360800"}]},{"code":"360900","name":"宜春市","parend_code":"360000","child_code":[{"code":"360901","name":"市辖区","parend_code":"360900"},{"code":"360902","name":"袁州区","parend_code":"360900"},{"code":"360921","name":"奉新县","parend_code":"360900"},{"code":"360922","name":"万载县","parend_code":"360900"},{"code":"360923","name":"上高县","parend_code":"360900"},{"code":"360924","name":"宜丰县","parend_code":"360900"},{"code":"360925","name":"靖安县","parend_code":"360900"},{"code":"360926","name":"铜鼓县","parend_code":"360900"},{"code":"360981","name":"丰城市","parend_code":"360900"},{"code":"360982","name":"樟树市","parend_code":"360900"},{"code":"360983","name":"高安市","parend_code":"360900"}]},{"code":"361000","name":"抚州市","parend_code":"360000","child_code":[{"code":"361001","name":"市辖区","parend_code":"361000"},{"code":"361002","name":"临川区","parend_code":"361000"},{"code":"361021","name":"南城县","parend_code":"361000"},{"code":"361022","name":"黎川县","parend_code":"361000"},{"code":"361023","name":"南丰县","parend_code":"361000"},{"code":"361024","name":"崇仁县","parend_code":"361000"},{"code":"361025","name":"乐安县","parend_code":"361000"},{"code":"361026","name":"宜黄县","parend_code":"361000"},{"code":"361027","name":"金溪县","parend_code":"361000"},{"code":"361028","name":"资溪县","parend_code":"361000"},{"code":"361029","name":"东乡县","parend_code":"361000"},{"code":"361030","name":"广昌县","parend_code":"361000"}]},{"code":"361100","name":"上饶市","parend_code":"360000","child_code":[{"code":"361101","name":"市辖区","parend_code":"361100"},{"code":"361102","name":"信州区","parend_code":"361100"},{"code":"361121","name":"上饶县","parend_code":"361100"},{"code":"361122","name":"广丰县","parend_code":"361100"},{"code":"361123","name":"玉山县","parend_code":"361100"},{"code":"361124","name":"铅山县","parend_code":"361100"},{"code":"361125","name":"横峰县","parend_code":"361100"},{"code":"361126","name":"弋阳县","parend_code":"361100"},{"code":"361127","name":"余干县","parend_code":"361100"},{"code":"361128","name":"鄱阳县","parend_code":"361100"},{"code":"361129","name":"万年县","parend_code":"361100"},{"code":"361130","name":"婺源县","parend_code":"361100"},{"code":"361181","name":"德兴市","parend_code":"361100"}]}]},{"code":"370000","name":"山东省","parend_code":"0","child_code":[{"code":"370100","name":"济南市","parend_code":"370000","child_code":[{"code":"370101","name":"市辖区","parend_code":"370100"},{"code":"370102","name":"历下区","parend_code":"370100"},{"code":"370103","name":"市中区","parend_code":"370100"},{"code":"370104","name":"槐荫区","parend_code":"370100"},{"code":"370105","name":"天桥区","parend_code":"370100"},{"code":"370112","name":"历城区","parend_code":"370100"},{"code":"370113","name":"长清区","parend_code":"370100"},{"code":"370124","name":"平阴县","parend_code":"370100"},{"code":"370125","name":"济阳县","parend_code":"370100"},{"code":"370126","name":"商河县","parend_code":"370100"},{"code":"370181","name":"章丘市","parend_code":"370100"}]},{"code":"370200","name":"青岛市","parend_code":"370000","child_code":[{"code":"370201","name":"市辖区","parend_code":"370200"},{"code":"370202","name":"市南区","parend_code":"370200"},{"code":"370203","name":"市北区","parend_code":"370200"},{"code":"370205","name":"四方区","parend_code":"370200"},{"code":"370211","name":"黄岛区","parend_code":"370200"},{"code":"370212","name":"崂山区","parend_code":"370200"},{"code":"370213","name":"李沧区","parend_code":"370200"},{"code":"370214","name":"城阳区","parend_code":"370200"},{"code":"370281","name":"胶州市","parend_code":"370200"},{"code":"370282","name":"即墨市","parend_code":"370200"},{"code":"370283","name":"平度市","parend_code":"370200"},{"code":"370284","name":"胶南市","parend_code":"370200"},{"code":"370285","name":"莱西市","parend_code":"370200"}]},{"code":"370300","name":"淄博市","parend_code":"370000","child_code":[{"code":"370301","name":"市辖区","parend_code":"370300"},{"code":"370302","name":"淄川区","parend_code":"370300"},{"code":"370303","name":"张店区","parend_code":"370300"},{"code":"370304","name":"博山区","parend_code":"370300"},{"code":"370305","name":"临淄区","parend_code":"370300"},{"code":"370306","name":"周村区","parend_code":"370300"},{"code":"370321","name":"桓台县","parend_code":"370300"},{"code":"370322","name":"高青县","parend_code":"370300"},{"code":"370323","name":"沂源县","parend_code":"370300"}]},{"code":"370400","name":"枣庄市","parend_code":"370000","child_code":[{"code":"370401","name":"市辖区","parend_code":"370400"},{"code":"370402","name":"市中区","parend_code":"370400"},{"code":"370403","name":"薛城区","parend_code":"370400"},{"code":"370404","name":"峄城区","parend_code":"370400"},{"code":"370405","name":"台儿庄区","parend_code":"370400"},{"code":"370406","name":"山亭区","parend_code":"370400"},{"code":"370481","name":"滕州市","parend_code":"370400"}]},{"code":"370500","name":"东营市","parend_code":"370000","child_code":[{"code":"370501","name":"市辖区","parend_code":"370500"},{"code":"370502","name":"东营区","parend_code":"370500"},{"code":"370503","name":"河口区","parend_code":"370500"},{"code":"370521","name":"垦利县","parend_code":"370500"},{"code":"370522","name":"利津县","parend_code":"370500"},{"code":"370523","name":"广饶县","parend_code":"370500"}]},{"code":"370600","name":"烟台市","parend_code":"370000","child_code":[{"code":"370601","name":"市辖区","parend_code":"370600"},{"code":"370602","name":"芝罘区","parend_code":"370600"},{"code":"370611","name":"福山区","parend_code":"370600"},{"code":"370612","name":"牟平区","parend_code":"370600"},{"code":"370613","name":"莱山区","parend_code":"370600"},{"code":"370634","name":"长岛县","parend_code":"370600"},{"code":"370681","name":"龙口市","parend_code":"370600"},{"code":"370682","name":"莱阳市","parend_code":"370600"},{"code":"370683","name":"莱州市","parend_code":"370600"},{"code":"370684","name":"蓬莱市","parend_code":"370600"},{"code":"370685","name":"招远市","parend_code":"370600"},{"code":"370686","name":"栖霞市","parend_code":"370600"},{"code":"370687","name":"海阳市","parend_code":"370600"}]},{"code":"370700","name":"潍坊市","parend_code":"370000","child_code":[{"code":"370701","name":"市辖区","parend_code":"370700"},{"code":"370702","name":"潍城区","parend_code":"370700"},{"code":"370703","name":"寒亭区","parend_code":"370700"},{"code":"370704","name":"坊子区","parend_code":"370700"},{"code":"370705","name":"奎文区","parend_code":"370700"},{"code":"370724","name":"临朐县","parend_code":"370700"},{"code":"370725","name":"昌乐县","parend_code":"370700"},{"code":"370781","name":"青州市","parend_code":"370700"},{"code":"370782","name":"诸城市","parend_code":"370700"},{"code":"370783","name":"寿光市","parend_code":"370700"},{"code":"370784","name":"安丘市","parend_code":"370700"},{"code":"370785","name":"高密市","parend_code":"370700"},{"code":"370786","name":"昌邑市","parend_code":"370700"}]},{"code":"370800","name":"济宁市","parend_code":"370000","child_code":[{"code":"370801","name":"市辖区","parend_code":"370800"},{"code":"370802","name":"市中区","parend_code":"370800"},{"code":"370811","name":"任城区","parend_code":"370800"},{"code":"370826","name":"微山县","parend_code":"370800"},{"code":"370827","name":"鱼台县","parend_code":"370800"},{"code":"370828","name":"金乡县","parend_code":"370800"},{"code":"370829","name":"嘉祥县","parend_code":"370800"},{"code":"370830","name":"汶上县","parend_code":"370800"},{"code":"370831","name":"泗水县","parend_code":"370800"},{"code":"370832","name":"梁山县","parend_code":"370800"},{"code":"370881","name":"曲阜市","parend_code":"370800"},{"code":"370882","name":"兖州市","parend_code":"370800"},{"code":"370883","name":"邹城市","parend_code":"370800"}]},{"code":"370900","name":"泰安市","parend_code":"370000","child_code":[{"code":"370901","name":"市辖区","parend_code":"370900"},{"code":"370902","name":"泰山区","parend_code":"370900"},{"code":"370903","name":"岱岳区","parend_code":"370900"},{"code":"370921","name":"宁阳县","parend_code":"370900"},{"code":"370923","name":"东平县","parend_code":"370900"},{"code":"370982","name":"新泰市","parend_code":"370900"},{"code":"370983","name":"肥城市","parend_code":"370900"}]},{"code":"371000","name":"威海市","parend_code":"370000","child_code":[{"code":"371001","name":"市辖区","parend_code":"371000"},{"code":"371002","name":"环翠区","parend_code":"371000"},{"code":"371081","name":"文登市","parend_code":"371000"},{"code":"371082","name":"荣成市","parend_code":"371000"},{"code":"371083","name":"乳山市","parend_code":"371000"}]},{"code":"371100","name":"日照市","parend_code":"370000","child_code":[{"code":"371101","name":"市辖区","parend_code":"371100"},{"code":"371102","name":"东港区","parend_code":"371100"},{"code":"371103","name":"岚山区","parend_code":"371100"},{"code":"371121","name":"五莲县","parend_code":"371100"},{"code":"371122","name":"莒　县","parend_code":"371100"}]},{"code":"371200","name":"莱芜市","parend_code":"370000","child_code":[{"code":"371201","name":"市辖区","parend_code":"371200"},{"code":"371202","name":"莱城区","parend_code":"371200"},{"code":"371203","name":"钢城区","parend_code":"371200"}]},{"code":"371300","name":"临沂市","parend_code":"370000","child_code":[{"code":"371301","name":"市辖区","parend_code":"371300"},{"code":"371302","name":"兰山区","parend_code":"371300"},{"code":"371311","name":"罗庄区","parend_code":"371300"},{"code":"371312","name":"河东区","parend_code":"371300"},{"code":"371321","name":"沂南县","parend_code":"371300"},{"code":"371322","name":"郯城县","parend_code":"371300"},{"code":"371323","name":"沂水县","parend_code":"371300"},{"code":"371324","name":"苍山县","parend_code":"371300"},{"code":"371325","name":"费　县","parend_code":"371300"},{"code":"371326","name":"平邑县","parend_code":"371300"},{"code":"371327","name":"莒南县","parend_code":"371300"},{"code":"371328","name":"蒙阴县","parend_code":"371300"},{"code":"371329","name":"临沭县","parend_code":"371300"}]},{"code":"371400","name":"德州市","parend_code":"370000","child_code":[{"code":"371401","name":"市辖区","parend_code":"371400"},{"code":"371402","name":"德城区","parend_code":"371400"},{"code":"371421","name":"陵　县","parend_code":"371400"},{"code":"371422","name":"宁津县","parend_code":"371400"},{"code":"371423","name":"庆云县","parend_code":"371400"},{"code":"371424","name":"临邑县","parend_code":"371400"},{"code":"371425","name":"齐河县","parend_code":"371400"},{"code":"371426","name":"平原县","parend_code":"371400"},{"code":"371427","name":"夏津县","parend_code":"371400"},{"code":"371428","name":"武城县","parend_code":"371400"},{"code":"371481","name":"乐陵市","parend_code":"371400"},{"code":"371482","name":"禹城市","parend_code":"371400"}]},{"code":"371500","name":"聊城市","parend_code":"370000","child_code":[{"code":"371501","name":"市辖区","parend_code":"371500"},{"code":"371502","name":"东昌府区","parend_code":"371500"},{"code":"371521","name":"阳谷县","parend_code":"371500"},{"code":"371522","name":"莘　县","parend_code":"371500"},{"code":"371523","name":"茌平县","parend_code":"371500"},{"code":"371524","name":"东阿县","parend_code":"371500"},{"code":"371525","name":"冠　县","parend_code":"371500"},{"code":"371526","name":"高唐县","parend_code":"371500"},{"code":"371581","name":"临清市","parend_code":"371500"}]},{"code":"371600","name":"滨州市","parend_code":"370000","child_code":[{"code":"371601","name":"市辖区","parend_code":"371600"},{"code":"371602","name":"滨城区","parend_code":"371600"},{"code":"371621","name":"惠民县","parend_code":"371600"},{"code":"371622","name":"阳信县","parend_code":"371600"},{"code":"371623","name":"无棣县","parend_code":"371600"},{"code":"371624","name":"沾化县","parend_code":"371600"},{"code":"371625","name":"博兴县","parend_code":"371600"},{"code":"371626","name":"邹平县","parend_code":"371600"}]},{"code":"371700","name":"菏泽市","parend_code":"370000","child_code":[{"code":"371701","name":"市辖区","parend_code":"371700"},{"code":"371702","name":"牡丹区","parend_code":"371700"},{"code":"371721","name":"曹　县","parend_code":"371700"},{"code":"371722","name":"单　县","parend_code":"371700"},{"code":"371723","name":"成武县","parend_code":"371700"},{"code":"371724","name":"巨野县","parend_code":"371700"},{"code":"371725","name":"郓城县","parend_code":"371700"},{"code":"371726","name":"鄄城县","parend_code":"371700"},{"code":"371727","name":"定陶县","parend_code":"371700"},{"code":"371728","name":"东明县","parend_code":"371700"}]}]},{"code":"410000","name":"河南省","parend_code":"0","child_code":[{"code":"410100","name":"郑州市","parend_code":"410000","child_code":[{"code":"410101","name":"市辖区","parend_code":"410100"},{"code":"410102","name":"中原区","parend_code":"410100"},{"code":"410103","name":"二七区","parend_code":"410100"},{"code":"410104","name":"管城回族区","parend_code":"410100"},{"code":"410105","name":"金水区","parend_code":"410100"},{"code":"410106","name":"上街区","parend_code":"410100"},{"code":"410108","name":"邙山区","parend_code":"410100"},{"code":"410122","name":"中牟县","parend_code":"410100"},{"code":"410181","name":"巩义市","parend_code":"410100"},{"code":"410182","name":"荥阳市","parend_code":"410100"},{"code":"410183","name":"新密市","parend_code":"410100"},{"code":"410184","name":"新郑市","parend_code":"410100"},{"code":"410185","name":"登封市","parend_code":"410100"}]},{"code":"410200","name":"开封市","parend_code":"410000","child_code":[{"code":"410201","name":"市辖区","parend_code":"410200"},{"code":"410202","name":"龙亭区","parend_code":"410200"},{"code":"410203","name":"顺河回族区","parend_code":"410200"},{"code":"410204","name":"鼓楼区","parend_code":"410200"},{"code":"410205","name":"南关区","parend_code":"410200"},{"code":"410211","name":"郊　区","parend_code":"410200"},{"code":"410221","name":"杞　县","parend_code":"410200"},{"code":"410222","name":"通许县","parend_code":"410200"},{"code":"410223","name":"尉氏县","parend_code":"410200"},{"code":"410224","name":"开封县","parend_code":"410200"},{"code":"410225","name":"兰考县","parend_code":"410200"}]},{"code":"410300","name":"洛阳市","parend_code":"410000","child_code":[{"code":"410301","name":"市辖区","parend_code":"410300"},{"code":"410302","name":"老城区","parend_code":"410300"},{"code":"410303","name":"西工区","parend_code":"410300"},{"code":"410304","name":"廛河回族区","parend_code":"410300"},{"code":"410305","name":"涧西区","parend_code":"410300"},{"code":"410306","name":"吉利区","parend_code":"410300"},{"code":"410307","name":"洛龙区","parend_code":"410300"},{"code":"410322","name":"孟津县","parend_code":"410300"},{"code":"410323","name":"新安县","parend_code":"410300"},{"code":"410324","name":"栾川县","parend_code":"410300"},{"code":"410325","name":"嵩　县","parend_code":"410300"},{"code":"410326","name":"汝阳县","parend_code":"410300"},{"code":"410327","name":"宜阳县","parend_code":"410300"},{"code":"410328","name":"洛宁县","parend_code":"410300"},{"code":"410329","name":"伊川县","parend_code":"410300"},{"code":"410381","name":"偃师市","parend_code":"410300"}]},{"code":"410400","name":"平顶山市","parend_code":"410000","child_code":[{"code":"410401","name":"市辖区","parend_code":"410400"},{"code":"410402","name":"新华区","parend_code":"410400"},{"code":"410403","name":"卫东区","parend_code":"410400"},{"code":"410404","name":"石龙区","parend_code":"410400"},{"code":"410411","name":"湛河区","parend_code":"410400"},{"code":"410421","name":"宝丰县","parend_code":"410400"},{"code":"410422","name":"叶　县","parend_code":"410400"},{"code":"410423","name":"鲁山县","parend_code":"410400"},{"code":"410425","name":"郏　县","parend_code":"410400"},{"code":"410481","name":"舞钢市","parend_code":"410400"},{"code":"410482","name":"汝州市","parend_code":"410400"}]},{"code":"410500","name":"安阳市","parend_code":"410000","child_code":[{"code":"410501","name":"市辖区","parend_code":"410500"},{"code":"410502","name":"文峰区","parend_code":"410500"},{"code":"410503","name":"北关区","parend_code":"410500"},{"code":"410505","name":"殷都区","parend_code":"410500"},{"code":"410506","name":"龙安区","parend_code":"410500"},{"code":"410522","name":"安阳县","parend_code":"410500"},{"code":"410523","name":"汤阴县","parend_code":"410500"},{"code":"410526","name":"滑　县","parend_code":"410500"},{"code":"410527","name":"内黄县","parend_code":"410500"},{"code":"410581","name":"林州市","parend_code":"410500"}]},{"code":"410600","name":"鹤壁市","parend_code":"410000","child_code":[{"code":"410601","name":"市辖区","parend_code":"410600"},{"code":"410602","name":"鹤山区","parend_code":"410600"},{"code":"410603","name":"山城区","parend_code":"410600"},{"code":"410611","name":"淇滨区","parend_code":"410600"},{"code":"410621","name":"浚　县","parend_code":"410600"},{"code":"410622","name":"淇　县","parend_code":"410600"}]},{"code":"410700","name":"新乡市","parend_code":"410000","child_code":[{"code":"410701","name":"市辖区","parend_code":"410700"},{"code":"410702","name":"红旗区","parend_code":"410700"},{"code":"410703","name":"卫滨区","parend_code":"410700"},{"code":"410704","name":"凤泉区","parend_code":"410700"},{"code":"410711","name":"牧野区","parend_code":"410700"},{"code":"410721","name":"新乡县","parend_code":"410700"},{"code":"410724","name":"获嘉县","parend_code":"410700"},{"code":"410725","name":"原阳县","parend_code":"410700"},{"code":"410726","name":"延津县","parend_code":"410700"},{"code":"410727","name":"封丘县","parend_code":"410700"},{"code":"410728","name":"长垣县","parend_code":"410700"},{"code":"410781","name":"卫辉市","parend_code":"410700"},{"code":"410782","name":"辉县市","parend_code":"410700"}]},{"code":"410800","name":"焦作市","parend_code":"410000","child_code":[{"code":"410801","name":"市辖区","parend_code":"410800"},{"code":"410802","name":"解放区","parend_code":"410800"},{"code":"410803","name":"中站区","parend_code":"410800"},{"code":"410804","name":"马村区","parend_code":"410800"},{"code":"410811","name":"山阳区","parend_code":"410800"},{"code":"410821","name":"修武县","parend_code":"410800"},{"code":"410822","name":"博爱县","parend_code":"410800"},{"code":"410823","name":"武陟县","parend_code":"410800"},{"code":"410825","name":"温　县","parend_code":"410800"},{"code":"410881","name":"济源市","parend_code":"410800"},{"code":"410882","name":"沁阳市","parend_code":"410800"},{"code":"410883","name":"孟州市","parend_code":"410800"}]},{"code":"410900","name":"濮阳市","parend_code":"410000","child_code":[{"code":"410901","name":"市辖区","parend_code":"410900"},{"code":"410902","name":"华龙区","parend_code":"410900"},{"code":"410922","name":"清丰县","parend_code":"410900"},{"code":"410923","name":"南乐县","parend_code":"410900"},{"code":"410926","name":"范　县","parend_code":"410900"},{"code":"410927","name":"台前县","parend_code":"410900"},{"code":"410928","name":"濮阳县","parend_code":"410900"}]},{"code":"411000","name":"许昌市","parend_code":"410000","child_code":[{"code":"411001","name":"市辖区","parend_code":"411000"},{"code":"411002","name":"魏都区","parend_code":"411000"},{"code":"411023","name":"许昌县","parend_code":"411000"},{"code":"411024","name":"鄢陵县","parend_code":"411000"},{"code":"411025","name":"襄城县","parend_code":"411000"},{"code":"411081","name":"禹州市","parend_code":"411000"},{"code":"411082","name":"长葛市","parend_code":"411000"}]},{"code":"411100","name":"漯河市","parend_code":"410000","child_code":[{"code":"411101","name":"市辖区","parend_code":"411100"},{"code":"411102","name":"源汇区","parend_code":"411100"},{"code":"411103","name":"郾城区","parend_code":"411100"},{"code":"411104","name":"召陵区","parend_code":"411100"},{"code":"411121","name":"舞阳县","parend_code":"411100"},{"code":"411122","name":"临颍县","parend_code":"411100"}]},{"code":"411200","name":"三门峡市","parend_code":"410000","child_code":[{"code":"411201","name":"市辖区","parend_code":"411200"},{"code":"411202","name":"湖滨区","parend_code":"411200"},{"code":"411221","name":"渑池县","parend_code":"411200"},{"code":"411222","name":"陕　县","parend_code":"411200"},{"code":"411224","name":"卢氏县","parend_code":"411200"},{"code":"411281","name":"义马市","parend_code":"411200"},{"code":"411282","name":"灵宝市","parend_code":"411200"}]},{"code":"411300","name":"南阳市","parend_code":"410000","child_code":[{"code":"411301","name":"市辖区","parend_code":"411300"},{"code":"411302","name":"宛城区","parend_code":"411300"},{"code":"411303","name":"卧龙区","parend_code":"411300"},{"code":"411321","name":"南召县","parend_code":"411300"},{"code":"411322","name":"方城县","parend_code":"411300"},{"code":"411323","name":"西峡县","parend_code":"411300"},{"code":"411324","name":"镇平县","parend_code":"411300"},{"code":"411325","name":"内乡县","parend_code":"411300"},{"code":"411326","name":"淅川县","parend_code":"411300"},{"code":"411327","name":"社旗县","parend_code":"411300"},{"code":"411328","name":"唐河县","parend_code":"411300"},{"code":"411329","name":"新野县","parend_code":"411300"},{"code":"411330","name":"桐柏县","parend_code":"411300"},{"code":"411381","name":"邓州市","parend_code":"411300"}]},{"code":"411400","name":"商丘市","parend_code":"410000","child_code":[{"code":"411401","name":"市辖区","parend_code":"411400"},{"code":"411402","name":"梁园区","parend_code":"411400"},{"code":"411403","name":"睢阳区","parend_code":"411400"},{"code":"411421","name":"民权县","parend_code":"411400"},{"code":"411422","name":"睢　县","parend_code":"411400"},{"code":"411423","name":"宁陵县","parend_code":"411400"},{"code":"411424","name":"柘城县","parend_code":"411400"},{"code":"411425","name":"虞城县","parend_code":"411400"},{"code":"411426","name":"夏邑县","parend_code":"411400"},{"code":"411481","name":"永城市","parend_code":"411400"}]},{"code":"411500","name":"信阳市","parend_code":"410000","child_code":[{"code":"411501","name":"市辖区","parend_code":"411500"},{"code":"411502","name":"师河区","parend_code":"411500"},{"code":"411503","name":"平桥区","parend_code":"411500"},{"code":"411521","name":"罗山县","parend_code":"411500"},{"code":"411522","name":"光山县","parend_code":"411500"},{"code":"411523","name":"新　县","parend_code":"411500"},{"code":"411524","name":"商城县","parend_code":"411500"},{"code":"411525","name":"固始县","parend_code":"411500"},{"code":"411526","name":"潢川县","parend_code":"411500"},{"code":"411527","name":"淮滨县","parend_code":"411500"},{"code":"411528","name":"息　县","parend_code":"411500"}]},{"code":"411600","name":"周口市","parend_code":"410000","child_code":[{"code":"411601","name":"市辖区","parend_code":"411600"},{"code":"411602","name":"川汇区","parend_code":"411600"},{"code":"411621","name":"扶沟县","parend_code":"411600"},{"code":"411622","name":"西华县","parend_code":"411600"},{"code":"411623","name":"商水县","parend_code":"411600"},{"code":"411624","name":"沈丘县","parend_code":"411600"},{"code":"411625","name":"郸城县","parend_code":"411600"},{"code":"411626","name":"淮阳县","parend_code":"411600"},{"code":"411627","name":"太康县","parend_code":"411600"},{"code":"411628","name":"鹿邑县","parend_code":"411600"},{"code":"411681","name":"项城市","parend_code":"411600"}]},{"code":"411700","name":"驻马店市","parend_code":"410000","child_code":[{"code":"411701","name":"市辖区","parend_code":"411700"},{"code":"411702","name":"驿城区","parend_code":"411700"},{"code":"411721","name":"西平县","parend_code":"411700"},{"code":"411722","name":"上蔡县","parend_code":"411700"},{"code":"411723","name":"平舆县","parend_code":"411700"},{"code":"411724","name":"正阳县","parend_code":"411700"},{"code":"411725","name":"确山县","parend_code":"411700"},{"code":"411726","name":"泌阳县","parend_code":"411700"},{"code":"411727","name":"汝南县","parend_code":"411700"},{"code":"411728","name":"遂平县","parend_code":"411700"},{"code":"411729","name":"新蔡县","parend_code":"411700"}]}]},{"code":"420000","name":"湖北省","parend_code":"0","child_code":[{"code":"420100","name":"武汉市","parend_code":"420000","child_code":[{"code":"420101","name":"市辖区","parend_code":"420100"},{"code":"420102","name":"江岸区","parend_code":"420100"},{"code":"420103","name":"江汉区","parend_code":"420100"},{"code":"420104","name":"乔口区","parend_code":"420100"},{"code":"420105","name":"汉阳区","parend_code":"420100"},{"code":"420106","name":"武昌区","parend_code":"420100"},{"code":"420107","name":"青山区","parend_code":"420100"},{"code":"420111","name":"洪山区","parend_code":"420100"},{"code":"420112","name":"东西湖区","parend_code":"420100"},{"code":"420113","name":"汉南区","parend_code":"420100"},{"code":"420114","name":"蔡甸区","parend_code":"420100"},{"code":"420115","name":"江夏区","parend_code":"420100"},{"code":"420116","name":"黄陂区","parend_code":"420100"},{"code":"420117","name":"新洲区","parend_code":"420100"}]},{"code":"420200","name":"黄石市","parend_code":"420000","child_code":[{"code":"420201","name":"市辖区","parend_code":"420200"},{"code":"420202","name":"黄石港区","parend_code":"420200"},{"code":"420203","name":"西塞山区","parend_code":"420200"},{"code":"420204","name":"下陆区","parend_code":"420200"},{"code":"420205","name":"铁山区","parend_code":"420200"},{"code":"420222","name":"阳新县","parend_code":"420200"},{"code":"420281","name":"大冶市","parend_code":"420200"}]},{"code":"420300","name":"十堰市","parend_code":"420000","child_code":[{"code":"420301","name":"市辖区","parend_code":"420300"},{"code":"420302","name":"茅箭区","parend_code":"420300"},{"code":"420303","name":"张湾区","parend_code":"420300"},{"code":"420321","name":"郧　县","parend_code":"420300"},{"code":"420322","name":"郧西县","parend_code":"420300"},{"code":"420323","name":"竹山县","parend_code":"420300"},{"code":"420324","name":"竹溪县","parend_code":"420300"},{"code":"420325","name":"房　县","parend_code":"420300"},{"code":"420381","name":"丹江口市","parend_code":"420300"}]},{"code":"420500","name":"宜昌市","parend_code":"420000","child_code":[{"code":"420501","name":"市辖区","parend_code":"420500"},{"code":"420502","name":"西陵区","parend_code":"420500"},{"code":"420503","name":"伍家岗区","parend_code":"420500"},{"code":"420504","name":"点军区","parend_code":"420500"},{"code":"420505","name":"猇亭区","parend_code":"420500"},{"code":"420506","name":"夷陵区","parend_code":"420500"},{"code":"420525","name":"远安县","parend_code":"420500"},{"code":"420526","name":"兴山县","parend_code":"420500"},{"code":"420527","name":"秭归县","parend_code":"420500"},{"code":"420528","name":"长阳土家族自治县","parend_code":"420500"},{"code":"420529","name":"五峰土家族自治县","parend_code":"420500"},{"code":"420581","name":"宜都市","parend_code":"420500"},{"code":"420582","name":"当阳市","parend_code":"420500"},{"code":"420583","name":"枝江市","parend_code":"420500"}]},{"code":"420600","name":"襄樊市","parend_code":"420000","child_code":[{"code":"420601","name":"市辖区","parend_code":"420600"},{"code":"420602","name":"襄城区","parend_code":"420600"},{"code":"420606","name":"樊城区","parend_code":"420600"},{"code":"420607","name":"襄阳区","parend_code":"420600"},{"code":"420624","name":"南漳县","parend_code":"420600"},{"code":"420625","name":"谷城县","parend_code":"420600"},{"code":"420626","name":"保康县","parend_code":"420600"},{"code":"420682","name":"老河口市","parend_code":"420600"},{"code":"420683","name":"枣阳市","parend_code":"420600"},{"code":"420684","name":"宜城市","parend_code":"420600"}]},{"code":"420700","name":"鄂州市","parend_code":"420000","child_code":[{"code":"420701","name":"市辖区","parend_code":"420700"},{"code":"420702","name":"梁子湖区","parend_code":"420700"},{"code":"420703","name":"华容区","parend_code":"420700"},{"code":"420704","name":"鄂城区","parend_code":"420700"}]},{"code":"420800","name":"荆门市","parend_code":"420000","child_code":[{"code":"420801","name":"市辖区","parend_code":"420800"},{"code":"420802","name":"东宝区","parend_code":"420800"},{"code":"420804","name":"掇刀区","parend_code":"420800"},{"code":"420821","name":"京山县","parend_code":"420800"},{"code":"420822","name":"沙洋县","parend_code":"420800"},{"code":"420881","name":"钟祥市","parend_code":"420800"}]},{"code":"420900","name":"孝感市","parend_code":"420000","child_code":[{"code":"420901","name":"市辖区","parend_code":"420900"},{"code":"420902","name":"孝南区","parend_code":"420900"},{"code":"420921","name":"孝昌县","parend_code":"420900"},{"code":"420922","name":"大悟县","parend_code":"420900"},{"code":"420923","name":"云梦县","parend_code":"420900"},{"code":"420981","name":"应城市","parend_code":"420900"},{"code":"420982","name":"安陆市","parend_code":"420900"},{"code":"420984","name":"汉川市","parend_code":"420900"}]},{"code":"421000","name":"荆州市","parend_code":"420000","child_code":[{"code":"421001","name":"市辖区","parend_code":"421000"},{"code":"421002","name":"沙市区","parend_code":"421000"},{"code":"421003","name":"荆州区","parend_code":"421000"},{"code":"421022","name":"公安县","parend_code":"421000"},{"code":"421023","name":"监利县","parend_code":"421000"},{"code":"421024","name":"江陵县","parend_code":"421000"},{"code":"421081","name":"石首市","parend_code":"421000"},{"code":"421083","name":"洪湖市","parend_code":"421000"},{"code":"421087","name":"松滋市","parend_code":"421000"}]},{"code":"421100","name":"黄冈市","parend_code":"420000","child_code":[{"code":"421101","name":"市辖区","parend_code":"421100"},{"code":"421102","name":"黄州区","parend_code":"421100"},{"code":"421121","name":"团风县","parend_code":"421100"},{"code":"421122","name":"红安县","parend_code":"421100"},{"code":"421123","name":"罗田县","parend_code":"421100"},{"code":"421124","name":"英山县","parend_code":"421100"},{"code":"421125","name":"浠水县","parend_code":"421100"},{"code":"421126","name":"蕲春县","parend_code":"421100"},{"code":"421127","name":"黄梅县","parend_code":"421100"},{"code":"421181","name":"麻城市","parend_code":"421100"},{"code":"421182","name":"武穴市","parend_code":"421100"}]},{"code":"421200","name":"咸宁市","parend_code":"420000","child_code":[{"code":"421201","name":"市辖区","parend_code":"421200"},{"code":"421202","name":"咸安区","parend_code":"421200"},{"code":"421221","name":"嘉鱼县","parend_code":"421200"},{"code":"421222","name":"通城县","parend_code":"421200"},{"code":"421223","name":"崇阳县","parend_code":"421200"},{"code":"421224","name":"通山县","parend_code":"421200"},{"code":"421281","name":"赤壁市","parend_code":"421200"}]},{"code":"421300","name":"随州市","parend_code":"420000","child_code":[{"code":"421301","name":"市辖区","parend_code":"421300"},{"code":"421302","name":"曾都区","parend_code":"421300"},{"code":"421381","name":"广水市","parend_code":"421300"}]},{"code":"422800","name":"恩施土家族苗族自治州","parend_code":"420000","child_code":[{"code":"422801","name":"恩施市","parend_code":"422800"},{"code":"422802","name":"利川市","parend_code":"422800"},{"code":"422822","name":"建始县","parend_code":"422800"},{"code":"422823","name":"巴东县","parend_code":"422800"},{"code":"422825","name":"宣恩县","parend_code":"422800"},{"code":"422826","name":"咸丰县","parend_code":"422800"},{"code":"422827","name":"来凤县","parend_code":"422800"},{"code":"422828","name":"鹤峰县","parend_code":"422800"}]},{"code":"429000","name":"省直辖行政单位","parend_code":"420000","child_code":[{"code":"429004","name":"仙桃市","parend_code":"429000"},{"code":"429005","name":"潜江市","parend_code":"429000"},{"code":"429006","name":"天门市","parend_code":"429000"},{"code":"429021","name":"神农架林区","parend_code":"429000"}]}]},{"code":"430000","name":"湖南省","parend_code":"0","child_code":[{"code":"430100","name":"长沙市","parend_code":"430000","child_code":[{"code":"430101","name":"市辖区","parend_code":"430100"},{"code":"430102","name":"芙蓉区","parend_code":"430100"},{"code":"430103","name":"天心区","parend_code":"430100"},{"code":"430104","name":"岳麓区","parend_code":"430100"},{"code":"430105","name":"开福区","parend_code":"430100"},{"code":"430111","name":"雨花区","parend_code":"430100"},{"code":"430121","name":"长沙县","parend_code":"430100"},{"code":"430122","name":"望城县","parend_code":"430100"},{"code":"430124","name":"宁乡县","parend_code":"430100"},{"code":"430181","name":"浏阳市","parend_code":"430100"}]},{"code":"430200","name":"株洲市","parend_code":"430000","child_code":[{"code":"430201","name":"市辖区","parend_code":"430200"},{"code":"430202","name":"荷塘区","parend_code":"430200"},{"code":"430203","name":"芦淞区","parend_code":"430200"},{"code":"430204","name":"石峰区","parend_code":"430200"},{"code":"430211","name":"天元区","parend_code":"430200"},{"code":"430221","name":"株洲县","parend_code":"430200"},{"code":"430223","name":"攸　县","parend_code":"430200"},{"code":"430224","name":"茶陵县","parend_code":"430200"},{"code":"430225","name":"炎陵县","parend_code":"430200"},{"code":"430281","name":"醴陵市","parend_code":"430200"}]},{"code":"430300","name":"湘潭市","parend_code":"430000","child_code":[{"code":"430301","name":"市辖区","parend_code":"430300"},{"code":"430302","name":"雨湖区","parend_code":"430300"},{"code":"430304","name":"岳塘区","parend_code":"430300"},{"code":"430321","name":"湘潭县","parend_code":"430300"},{"code":"430381","name":"湘乡市","parend_code":"430300"},{"code":"430382","name":"韶山市","parend_code":"430300"}]},{"code":"430400","name":"衡阳市","parend_code":"430000","child_code":[{"code":"430401","name":"市辖区","parend_code":"430400"},{"code":"430405","name":"珠晖区","parend_code":"430400"},{"code":"430406","name":"雁峰区","parend_code":"430400"},{"code":"430407","name":"石鼓区","parend_code":"430400"},{"code":"430408","name":"蒸湘区","parend_code":"430400"},{"code":"430412","name":"南岳区","parend_code":"430400"},{"code":"430421","name":"衡阳县","parend_code":"430400"},{"code":"430422","name":"衡南县","parend_code":"430400"},{"code":"430423","name":"衡山县","parend_code":"430400"},{"code":"430424","name":"衡东县","parend_code":"430400"},{"code":"430426","name":"祁东县","parend_code":"430400"},{"code":"430481","name":"耒阳市","parend_code":"430400"},{"code":"430482","name":"常宁市","parend_code":"430400"}]},{"code":"430500","name":"邵阳市","parend_code":"430000","child_code":[{"code":"430501","name":"市辖区","parend_code":"430500"},{"code":"430502","name":"双清区","parend_code":"430500"},{"code":"430503","name":"大祥区","parend_code":"430500"},{"code":"430511","name":"北塔区","parend_code":"430500"},{"code":"430521","name":"邵东县","parend_code":"430500"},{"code":"430522","name":"新邵县","parend_code":"430500"},{"code":"430523","name":"邵阳县","parend_code":"430500"},{"code":"430524","name":"隆回县","parend_code":"430500"},{"code":"430525","name":"洞口县","parend_code":"430500"},{"code":"430527","name":"绥宁县","parend_code":"430500"},{"code":"430528","name":"新宁县","parend_code":"430500"},{"code":"430529","name":"城步苗族自治县","parend_code":"430500"},{"code":"430581","name":"武冈市","parend_code":"430500"}]},{"code":"430600","name":"岳阳市","parend_code":"430000","child_code":[{"code":"430601","name":"市辖区","parend_code":"430600"},{"code":"430602","name":"岳阳楼区","parend_code":"430600"},{"code":"430603","name":"云溪区","parend_code":"430600"},{"code":"430611","name":"君山区","parend_code":"430600"},{"code":"430621","name":"岳阳县","parend_code":"430600"},{"code":"430623","name":"华容县","parend_code":"430600"},{"code":"430624","name":"湘阴县","parend_code":"430600"},{"code":"430626","name":"平江县","parend_code":"430600"},{"code":"430681","name":"汨罗市","parend_code":"430600"},{"code":"430682","name":"临湘市","parend_code":"430600"}]},{"code":"430700","name":"常德市","parend_code":"430000","child_code":[{"code":"430701","name":"市辖区","parend_code":"430700"},{"code":"430702","name":"武陵区","parend_code":"430700"},{"code":"430703","name":"鼎城区","parend_code":"430700"},{"code":"430721","name":"安乡县","parend_code":"430700"},{"code":"430722","name":"汉寿县","parend_code":"430700"},{"code":"430723","name":"澧　县","parend_code":"430700"},{"code":"430724","name":"临澧县","parend_code":"430700"},{"code":"430725","name":"桃源县","parend_code":"430700"},{"code":"430726","name":"石门县","parend_code":"430700"},{"code":"430781","name":"津市市","parend_code":"430700"}]},{"code":"430800","name":"张家界市","parend_code":"430000","child_code":[{"code":"430801","name":"市辖区","parend_code":"430800"},{"code":"430802","name":"永定区","parend_code":"430800"},{"code":"430811","name":"武陵源区","parend_code":"430800"},{"code":"430821","name":"慈利县","parend_code":"430800"},{"code":"430822","name":"桑植县","parend_code":"430800"}]},{"code":"430900","name":"益阳市","parend_code":"430000","child_code":[{"code":"430901","name":"市辖区","parend_code":"430900"},{"code":"430902","name":"资阳区","parend_code":"430900"},{"code":"430903","name":"赫山区","parend_code":"430900"},{"code":"430921","name":"南　县","parend_code":"430900"},{"code":"430922","name":"桃江县","parend_code":"430900"},{"code":"430923","name":"安化县","parend_code":"430900"},{"code":"430981","name":"沅江市","parend_code":"430900"}]},{"code":"431000","name":"郴州市","parend_code":"430000","child_code":[{"code":"431001","name":"市辖区","parend_code":"431000"},{"code":"431002","name":"北湖区","parend_code":"431000"},{"code":"431003","name":"苏仙区","parend_code":"431000"},{"code":"431021","name":"桂阳县","parend_code":"431000"},{"code":"431022","name":"宜章县","parend_code":"431000"},{"code":"431023","name":"永兴县","parend_code":"431000"},{"code":"431024","name":"嘉禾县","parend_code":"431000"},{"code":"431025","name":"临武县","parend_code":"431000"},{"code":"431026","name":"汝城县","parend_code":"431000"},{"code":"431027","name":"桂东县","parend_code":"431000"},{"code":"431028","name":"安仁县","parend_code":"431000"},{"code":"431081","name":"资兴市","parend_code":"431000"}]},{"code":"431100","name":"永州市","parend_code":"430000","child_code":[{"code":"431101","name":"市辖区","parend_code":"431100"},{"code":"431102","name":"芝山区","parend_code":"431100"},{"code":"431103","name":"冷水滩区","parend_code":"431100"},{"code":"431121","name":"祁阳县","parend_code":"431100"},{"code":"431122","name":"东安县","parend_code":"431100"},{"code":"431123","name":"双牌县","parend_code":"431100"},{"code":"431124","name":"道　县","parend_code":"431100"},{"code":"431125","name":"江永县","parend_code":"431100"},{"code":"431126","name":"宁远县","parend_code":"431100"},{"code":"431127","name":"蓝山县","parend_code":"431100"},{"code":"431128","name":"新田县","parend_code":"431100"},{"code":"431129","name":"江华瑶族自治县","parend_code":"431100"}]},{"code":"431200","name":"怀化市","parend_code":"430000","child_code":[{"code":"431201","name":"市辖区","parend_code":"431200"},{"code":"431202","name":"鹤城区","parend_code":"431200"},{"code":"431221","name":"中方县","parend_code":"431200"},{"code":"431222","name":"沅陵县","parend_code":"431200"},{"code":"431223","name":"辰溪县","parend_code":"431200"},{"code":"431224","name":"溆浦县","parend_code":"431200"},{"code":"431225","name":"会同县","parend_code":"431200"},{"code":"431226","name":"麻阳苗族自治县","parend_code":"431200"},{"code":"431227","name":"新晃侗族自治县","parend_code":"431200"},{"code":"431228","name":"芷江侗族自治县","parend_code":"431200"},{"code":"431229","name":"靖州苗族侗族自治县","parend_code":"431200"},{"code":"431230","name":"通道侗族自治县","parend_code":"431200"},{"code":"431281","name":"洪江市","parend_code":"431200"}]},{"code":"431300","name":"娄底市","parend_code":"430000","child_code":[{"code":"431301","name":"市辖区","parend_code":"431300"},{"code":"431302","name":"娄星区","parend_code":"431300"},{"code":"431321","name":"双峰县","parend_code":"431300"},{"code":"431322","name":"新化县","parend_code":"431300"},{"code":"431381","name":"冷水江市","parend_code":"431300"},{"code":"431382","name":"涟源市","parend_code":"431300"}]},{"code":"433100","name":"湘西土家族苗族自治州","parend_code":"430000","child_code":[{"code":"433101","name":"吉首市","parend_code":"433100"},{"code":"433122","name":"泸溪县","parend_code":"433100"},{"code":"433123","name":"凤凰县","parend_code":"433100"},{"code":"433124","name":"花垣县","parend_code":"433100"},{"code":"433125","name":"保靖县","parend_code":"433100"},{"code":"433126","name":"古丈县","parend_code":"433100"},{"code":"433127","name":"永顺县","parend_code":"433100"},{"code":"433130","name":"龙山县","parend_code":"433100"}]}]},{"code":"440000","name":"广东省","parend_code":"0","child_code":[{"code":"440100","name":"广州市","parend_code":"440000","child_code":[{"code":"440101","name":"市辖区","parend_code":"440100"},{"code":"440102","name":"东山区","parend_code":"440100"},{"code":"440103","name":"荔湾区","parend_code":"440100"},{"code":"440104","name":"越秀区","parend_code":"440100"},{"code":"440105","name":"海珠区","parend_code":"440100"},{"code":"440106","name":"天河区","parend_code":"440100"},{"code":"440107","name":"芳村区","parend_code":"440100"},{"code":"440111","name":"白云区","parend_code":"440100"},{"code":"440112","name":"黄埔区","parend_code":"440100"},{"code":"440113","name":"番禺区","parend_code":"440100"},{"code":"440114","name":"花都区","parend_code":"440100"},{"code":"440183","name":"增城市","parend_code":"440100"},{"code":"440184","name":"从化市","parend_code":"440100"}]},{"code":"440200","name":"韶关市","parend_code":"440000","child_code":[{"code":"440201","name":"市辖区","parend_code":"440200"},{"code":"440203","name":"武江区","parend_code":"440200"},{"code":"440204","name":"浈江区","parend_code":"440200"},{"code":"440205","name":"曲江区","parend_code":"440200"},{"code":"440222","name":"始兴县","parend_code":"440200"},{"code":"440224","name":"仁化县","parend_code":"440200"},{"code":"440229","name":"翁源县","parend_code":"440200"},{"code":"440232","name":"乳源瑶族自治县","parend_code":"440200"},{"code":"440233","name":"新丰县","parend_code":"440200"},{"code":"440281","name":"乐昌市","parend_code":"440200"},{"code":"440282","name":"南雄市","parend_code":"440200"}]},{"code":"440300","name":"深圳市","parend_code":"440000","child_code":[{"code":"440301","name":"市辖区","parend_code":"440300"},{"code":"440303","name":"罗湖区","parend_code":"440300"},{"code":"440304","name":"福田区","parend_code":"440300"},{"code":"440305","name":"南山区","parend_code":"440300"},{"code":"440306","name":"宝安区","parend_code":"440300"},{"code":"440307","name":"龙岗区","parend_code":"440300"},{"code":"440308","name":"盐田区","parend_code":"440300"}]},{"code":"440400","name":"珠海市","parend_code":"440000","child_code":[{"code":"440401","name":"市辖区","parend_code":"440400"},{"code":"440402","name":"香洲区","parend_code":"440400"},{"code":"440403","name":"斗门区","parend_code":"440400"},{"code":"440404","name":"金湾区","parend_code":"440400"}]},{"code":"440500","name":"汕头市","parend_code":"440000","child_code":[{"code":"440501","name":"市辖区","parend_code":"440500"},{"code":"440507","name":"龙湖区","parend_code":"440500"},{"code":"440511","name":"金平区","parend_code":"440500"},{"code":"440512","name":"濠江区","parend_code":"440500"},{"code":"440513","name":"潮阳区","parend_code":"440500"},{"code":"440514","name":"潮南区","parend_code":"440500"},{"code":"440515","name":"澄海区","parend_code":"440500"},{"code":"440523","name":"南澳县","parend_code":"440500"}]},{"code":"440600","name":"佛山市","parend_code":"440000","child_code":[{"code":"440601","name":"市辖区","parend_code":"440600"},{"code":"440604","name":"禅城区","parend_code":"440600"},{"code":"440605","name":"南海区","parend_code":"440600"},{"code":"440606","name":"顺德区","parend_code":"440600"},{"code":"440607","name":"三水区","parend_code":"440600"},{"code":"440608","name":"高明区","parend_code":"440600"}]},{"code":"440700","name":"江门市","parend_code":"440000","child_code":[{"code":"440701","name":"市辖区","parend_code":"440700"},{"code":"440703","name":"蓬江区","parend_code":"440700"},{"code":"440704","name":"江海区","parend_code":"440700"},{"code":"440705","name":"新会区","parend_code":"440700"},{"code":"440781","name":"台山市","parend_code":"440700"},{"code":"440783","name":"开平市","parend_code":"440700"},{"code":"440784","name":"鹤山市","parend_code":"440700"},{"code":"440785","name":"恩平市","parend_code":"440700"}]},{"code":"440800","name":"湛江市","parend_code":"440000","child_code":[{"code":"440801","name":"市辖区","parend_code":"440800"},{"code":"440802","name":"赤坎区","parend_code":"440800"},{"code":"440803","name":"霞山区","parend_code":"440800"},{"code":"440804","name":"坡头区","parend_code":"440800"},{"code":"440811","name":"麻章区","parend_code":"440800"},{"code":"440823","name":"遂溪县","parend_code":"440800"},{"code":"440825","name":"徐闻县","parend_code":"440800"},{"code":"440881","name":"廉江市","parend_code":"440800"},{"code":"440882","name":"雷州市","parend_code":"440800"},{"code":"440883","name":"吴川市","parend_code":"440800"}]},{"code":"440900","name":"茂名市","parend_code":"440000","child_code":[{"code":"440901","name":"市辖区","parend_code":"440900"},{"code":"440902","name":"茂南区","parend_code":"440900"},{"code":"440903","name":"茂港区","parend_code":"440900"},{"code":"440923","name":"电白县","parend_code":"440900"},{"code":"440981","name":"高州市","parend_code":"440900"},{"code":"440982","name":"化州市","parend_code":"440900"},{"code":"440983","name":"信宜市","parend_code":"440900"}]},{"code":"441200","name":"肇庆市","parend_code":"440000","child_code":[{"code":"441201","name":"市辖区","parend_code":"441200"},{"code":"441202","name":"端州区","parend_code":"441200"},{"code":"441203","name":"鼎湖区","parend_code":"441200"},{"code":"441223","name":"广宁县","parend_code":"441200"},{"code":"441224","name":"怀集县","parend_code":"441200"},{"code":"441225","name":"封开县","parend_code":"441200"},{"code":"441226","name":"德庆县","parend_code":"441200"},{"code":"441283","name":"高要市","parend_code":"441200"},{"code":"441284","name":"四会市","parend_code":"441200"}]},{"code":"441300","name":"惠州市","parend_code":"440000","child_code":[{"code":"441301","name":"市辖区","parend_code":"441300"},{"code":"441302","name":"惠城区","parend_code":"441300"},{"code":"441303","name":"惠阳区","parend_code":"441300"},{"code":"441322","name":"博罗县","parend_code":"441300"},{"code":"441323","name":"惠东县","parend_code":"441300"},{"code":"441324","name":"龙门县","parend_code":"441300"}]},{"code":"441400","name":"梅州市","parend_code":"440000","child_code":[{"code":"441401","name":"市辖区","parend_code":"441400"},{"code":"441402","name":"梅江区","parend_code":"441400"},{"code":"441421","name":"梅　县","parend_code":"441400"},{"code":"441422","name":"大埔县","parend_code":"441400"},{"code":"441423","name":"丰顺县","parend_code":"441400"},{"code":"441424","name":"五华县","parend_code":"441400"},{"code":"441426","name":"平远县","parend_code":"441400"},{"code":"441427","name":"蕉岭县","parend_code":"441400"},{"code":"441481","name":"兴宁市","parend_code":"441400"}]},{"code":"441500","name":"汕尾市","parend_code":"440000","child_code":[{"code":"441501","name":"市辖区","parend_code":"441500"},{"code":"441502","name":"城　区","parend_code":"441500"},{"code":"441521","name":"海丰县","parend_code":"441500"},{"code":"441523","name":"陆河县","parend_code":"441500"},{"code":"441581","name":"陆丰市","parend_code":"441500"}]},{"code":"441600","name":"河源市","parend_code":"440000","child_code":[{"code":"441601","name":"市辖区","parend_code":"441600"},{"code":"441602","name":"源城区","parend_code":"441600"},{"code":"441621","name":"紫金县","parend_code":"441600"},{"code":"441622","name":"龙川县","parend_code":"441600"},{"code":"441623","name":"连平县","parend_code":"441600"},{"code":"441624","name":"和平县","parend_code":"441600"},{"code":"441625","name":"东源县","parend_code":"441600"}]},{"code":"441700","name":"阳江市","parend_code":"440000","child_code":[{"code":"441701","name":"市辖区","parend_code":"441700"},{"code":"441702","name":"江城区","parend_code":"441700"},{"code":"441721","name":"阳西县","parend_code":"441700"},{"code":"441723","name":"阳东县","parend_code":"441700"},{"code":"441781","name":"阳春市","parend_code":"441700"}]},{"code":"441800","name":"清远市","parend_code":"440000","child_code":[{"code":"441801","name":"市辖区","parend_code":"441800"},{"code":"441802","name":"清城区","parend_code":"441800"},{"code":"441821","name":"佛冈县","parend_code":"441800"},{"code":"441823","name":"阳山县","parend_code":"441800"},{"code":"441825","name":"连山壮族瑶族自治县","parend_code":"441800"},{"code":"441826","name":"连南瑶族自治县","parend_code":"441800"},{"code":"441827","name":"清新县","parend_code":"441800"},{"code":"441881","name":"英德市","parend_code":"441800"},{"code":"441882","name":"连州市","parend_code":"441800"}]},{"code":"441900","name":"东莞市","parend_code":"440000","child_code":[]},{"code":"442000","name":"中山市","parend_code":"440000","child_code":[]},{"code":"445100","name":"潮州市","parend_code":"440000","child_code":[{"code":"445101","name":"市辖区","parend_code":"445100"},{"code":"445102","name":"湘桥区","parend_code":"445100"},{"code":"445121","name":"潮安县","parend_code":"445100"},{"code":"445122","name":"饶平县","parend_code":"445100"}]},{"code":"445200","name":"揭阳市","parend_code":"440000","child_code":[{"code":"445201","name":"市辖区","parend_code":"445200"},{"code":"445202","name":"榕城区","parend_code":"445200"},{"code":"445221","name":"揭东县","parend_code":"445200"},{"code":"445222","name":"揭西县","parend_code":"445200"},{"code":"445224","name":"惠来县","parend_code":"445200"},{"code":"445281","name":"普宁市","parend_code":"445200"}]},{"code":"445300","name":"云浮市","parend_code":"440000","child_code":[{"code":"445301","name":"市辖区","parend_code":"445300"},{"code":"445302","name":"云城区","parend_code":"445300"},{"code":"445321","name":"新兴县","parend_code":"445300"},{"code":"445322","name":"郁南县","parend_code":"445300"},{"code":"445323","name":"云安县","parend_code":"445300"},{"code":"445381","name":"罗定市","parend_code":"445300"}]}]},{"code":"450000","name":"广西壮族自治区","parend_code":"0","child_code":[{"code":"450100","name":"南宁市","parend_code":"450000","child_code":[{"code":"450101","name":"市辖区","parend_code":"450100"},{"code":"450102","name":"兴宁区","parend_code":"450100"},{"code":"450103","name":"青秀区","parend_code":"450100"},{"code":"450105","name":"江南区","parend_code":"450100"},{"code":"450107","name":"西乡塘区","parend_code":"450100"},{"code":"450108","name":"良庆区","parend_code":"450100"},{"code":"450109","name":"邕宁区","parend_code":"450100"},{"code":"450122","name":"武鸣县","parend_code":"450100"},{"code":"450123","name":"隆安县","parend_code":"450100"},{"code":"450124","name":"马山县","parend_code":"450100"},{"code":"450125","name":"上林县","parend_code":"450100"},{"code":"450126","name":"宾阳县","parend_code":"450100"},{"code":"450127","name":"横　县","parend_code":"450100"}]},{"code":"450200","name":"柳州市","parend_code":"450000","child_code":[{"code":"450201","name":"市辖区","parend_code":"450200"},{"code":"450202","name":"城中区","parend_code":"450200"},{"code":"450203","name":"鱼峰区","parend_code":"450200"},{"code":"450204","name":"柳南区","parend_code":"450200"},{"code":"450205","name":"柳北区","parend_code":"450200"},{"code":"450221","name":"柳江县","parend_code":"450200"},{"code":"450222","name":"柳城县","parend_code":"450200"},{"code":"450223","name":"鹿寨县","parend_code":"450200"},{"code":"450224","name":"融安县","parend_code":"450200"},{"code":"450225","name":"融水苗族自治县","parend_code":"450200"},{"code":"450226","name":"三江侗族自治县","parend_code":"450200"}]},{"code":"450300","name":"桂林市","parend_code":"450000","child_code":[{"code":"450301","name":"市辖区","parend_code":"450300"},{"code":"450302","name":"秀峰区","parend_code":"450300"},{"code":"450303","name":"叠彩区","parend_code":"450300"},{"code":"450304","name":"象山区","parend_code":"450300"},{"code":"450305","name":"七星区","parend_code":"450300"},{"code":"450311","name":"雁山区","parend_code":"450300"},{"code":"450321","name":"阳朔县","parend_code":"450300"},{"code":"450322","name":"临桂县","parend_code":"450300"},{"code":"450323","name":"灵川县","parend_code":"450300"},{"code":"450324","name":"全州县","parend_code":"450300"},{"code":"450325","name":"兴安县","parend_code":"450300"},{"code":"450326","name":"永福县","parend_code":"450300"},{"code":"450327","name":"灌阳县","parend_code":"450300"},{"code":"450328","name":"龙胜各族自治县","parend_code":"450300"},{"code":"450329","name":"资源县","parend_code":"450300"},{"code":"450330","name":"平乐县","parend_code":"450300"},{"code":"450331","name":"荔蒲县","parend_code":"450300"},{"code":"450332","name":"恭城瑶族自治县","parend_code":"450300"}]},{"code":"450400","name":"梧州市","parend_code":"450000","child_code":[{"code":"450401","name":"市辖区","parend_code":"450400"},{"code":"450403","name":"万秀区","parend_code":"450400"},{"code":"450404","name":"蝶山区","parend_code":"450400"},{"code":"450405","name":"长洲区","parend_code":"450400"},{"code":"450421","name":"苍梧县","parend_code":"450400"},{"code":"450422","name":"藤　县","parend_code":"450400"},{"code":"450423","name":"蒙山县","parend_code":"450400"},{"code":"450481","name":"岑溪市","parend_code":"450400"}]},{"code":"450500","name":"北海市","parend_code":"450000","child_code":[{"code":"450501","name":"市辖区","parend_code":"450500"},{"code":"450502","name":"海城区","parend_code":"450500"},{"code":"450503","name":"银海区","parend_code":"450500"},{"code":"450512","name":"铁山港区","parend_code":"450500"},{"code":"450521","name":"合浦县","parend_code":"450500"}]},{"code":"450600","name":"防城港市","parend_code":"450000","child_code":[{"code":"450601","name":"市辖区","parend_code":"450600"},{"code":"450602","name":"港口区","parend_code":"450600"},{"code":"450603","name":"防城区","parend_code":"450600"},{"code":"450621","name":"上思县","parend_code":"450600"},{"code":"450681","name":"东兴市","parend_code":"450600"}]},{"code":"450700","name":"钦州市","parend_code":"450000","child_code":[{"code":"450701","name":"市辖区","parend_code":"450700"},{"code":"450702","name":"钦南区","parend_code":"450700"},{"code":"450703","name":"钦北区","parend_code":"450700"},{"code":"450721","name":"灵山县","parend_code":"450700"},{"code":"450722","name":"浦北县","parend_code":"450700"}]},{"code":"450800","name":"贵港市","parend_code":"450000","child_code":[{"code":"450801","name":"市辖区","parend_code":"450800"},{"code":"450802","name":"港北区","parend_code":"450800"},{"code":"450803","name":"港南区","parend_code":"450800"},{"code":"450804","name":"覃塘区","parend_code":"450800"},{"code":"450821","name":"平南县","parend_code":"450800"},{"code":"450881","name":"桂平市","parend_code":"450800"}]},{"code":"450900","name":"玉林市","parend_code":"450000","child_code":[{"code":"450901","name":"市辖区","parend_code":"450900"},{"code":"450902","name":"玉州区","parend_code":"450900"},{"code":"450921","name":"容　县","parend_code":"450900"},{"code":"450922","name":"陆川县","parend_code":"450900"},{"code":"450923","name":"博白县","parend_code":"450900"},{"code":"450924","name":"兴业县","parend_code":"450900"},{"code":"450981","name":"北流市","parend_code":"450900"}]},{"code":"451000","name":"百色市","parend_code":"450000","child_code":[{"code":"451001","name":"市辖区","parend_code":"451000"},{"code":"451002","name":"右江区","parend_code":"451000"},{"code":"451021","name":"田阳县","parend_code":"451000"},{"code":"451022","name":"田东县","parend_code":"451000"},{"code":"451023","name":"平果县","parend_code":"451000"},{"code":"451024","name":"德保县","parend_code":"451000"},{"code":"451025","name":"靖西县","parend_code":"451000"},{"code":"451026","name":"那坡县","parend_code":"451000"},{"code":"451027","name":"凌云县","parend_code":"451000"},{"code":"451028","name":"乐业县","parend_code":"451000"},{"code":"451029","name":"田林县","parend_code":"451000"},{"code":"451030","name":"西林县","parend_code":"451000"},{"code":"451031","name":"隆林各族自治县","parend_code":"451000"}]},{"code":"451100","name":"贺州市","parend_code":"450000","child_code":[{"code":"451101","name":"市辖区","parend_code":"451100"},{"code":"451102","name":"八步区","parend_code":"451100"},{"code":"451121","name":"昭平县","parend_code":"451100"},{"code":"451122","name":"钟山县","parend_code":"451100"},{"code":"451123","name":"富川瑶族自治县","parend_code":"451100"}]},{"code":"451200","name":"河池市","parend_code":"450000","child_code":[{"code":"451201","name":"市辖区","parend_code":"451200"},{"code":"451202","name":"金城江区","parend_code":"451200"},{"code":"451221","name":"南丹县","parend_code":"451200"},{"code":"451222","name":"天峨县","parend_code":"451200"},{"code":"451223","name":"凤山县","parend_code":"451200"},{"code":"451224","name":"东兰县","parend_code":"451200"},{"code":"451225","name":"罗城仫佬族自治县","parend_code":"451200"},{"code":"451226","name":"环江毛南族自治县","parend_code":"451200"},{"code":"451227","name":"巴马瑶族自治县","parend_code":"451200"},{"code":"451228","name":"都安瑶族自治县","parend_code":"451200"},{"code":"451229","name":"大化瑶族自治县","parend_code":"451200"},{"code":"451281","name":"宜州市","parend_code":"451200"}]},{"code":"451300","name":"来宾市","parend_code":"450000","child_code":[{"code":"451301","name":"市辖区","parend_code":"451300"},{"code":"451302","name":"兴宾区","parend_code":"451300"},{"code":"451321","name":"忻城县","parend_code":"451300"},{"code":"451322","name":"象州县","parend_code":"451300"},{"code":"451323","name":"武宣县","parend_code":"451300"},{"code":"451324","name":"金秀瑶族自治县","parend_code":"451300"},{"code":"451381","name":"合山市","parend_code":"451300"}]},{"code":"451400","name":"崇左市","parend_code":"450000","child_code":[{"code":"451401","name":"市辖区","parend_code":"451400"},{"code":"451402","name":"江洲区","parend_code":"451400"},{"code":"451421","name":"扶绥县","parend_code":"451400"},{"code":"451422","name":"宁明县","parend_code":"451400"},{"code":"451423","name":"龙州县","parend_code":"451400"},{"code":"451424","name":"大新县","parend_code":"451400"},{"code":"451425","name":"天等县","parend_code":"451400"},{"code":"451481","name":"凭祥市","parend_code":"451400"}]}]},{"code":"460000","name":"海南省","parend_code":"0","child_code":[{"code":"460100","name":"海口市","parend_code":"460000","child_code":[{"code":"460101","name":"市辖区","parend_code":"460100"},{"code":"460105","name":"秀英区","parend_code":"460100"},{"code":"460106","name":"龙华区","parend_code":"460100"},{"code":"460107","name":"琼山区","parend_code":"460100"},{"code":"460108","name":"美兰区","parend_code":"460100"}]},{"code":"460200","name":"三亚市","parend_code":"460000","child_code":[{"code":"460201","name":"市辖区","parend_code":"460200"}]},{"code":"469000","name":"省直辖县级行政单位","parend_code":"460000","child_code":[{"code":"469001","name":"五指山市","parend_code":"469000"},{"code":"469002","name":"琼海市","parend_code":"469000"},{"code":"469003","name":"儋州市","parend_code":"469000"},{"code":"469005","name":"文昌市","parend_code":"469000"},{"code":"469006","name":"万宁市","parend_code":"469000"},{"code":"469007","name":"东方市","parend_code":"469000"},{"code":"469025","name":"定安县","parend_code":"469000"},{"code":"469026","name":"屯昌县","parend_code":"469000"},{"code":"469027","name":"澄迈县","parend_code":"469000"},{"code":"469028","name":"临高县","parend_code":"469000"},{"code":"469030","name":"白沙黎族自治县","parend_code":"469000"},{"code":"469031","name":"昌江黎族自治县","parend_code":"469000"},{"code":"469033","name":"乐东黎族自治县","parend_code":"469000"},{"code":"469034","name":"陵水黎族自治县","parend_code":"469000"},{"code":"469035","name":"保亭黎族苗族自治县","parend_code":"469000"},{"code":"469036","name":"琼中黎族苗族自治县","parend_code":"469000"},{"code":"469037","name":"西沙群岛","parend_code":"469000"},{"code":"469038","name":"南沙群岛","parend_code":"469000"},{"code":"469039","name":"中沙群岛的岛礁及其海域","parend_code":"469000"}]}]},{"code":"500000","name":"重庆市","parend_code":"0","child_code":[{"code":"500100","name":"市辖区","parend_code":"500000","child_code":[{"code":"500101","name":"万州区","parend_code":"500100"},{"code":"500102","name":"涪陵区","parend_code":"500100"},{"code":"500103","name":"渝中区","parend_code":"500100"},{"code":"500104","name":"大渡口区","parend_code":"500100"},{"code":"500105","name":"江北区","parend_code":"500100"},{"code":"500106","name":"沙坪坝区","parend_code":"500100"},{"code":"500107","name":"九龙坡区","parend_code":"500100"},{"code":"500108","name":"南岸区","parend_code":"500100"},{"code":"500109","name":"北碚区","parend_code":"500100"},{"code":"500110","name":"万盛区","parend_code":"500100"},{"code":"500111","name":"双桥区","parend_code":"500100"},{"code":"500112","name":"渝北区","parend_code":"500100"},{"code":"500113","name":"巴南区","parend_code":"500100"},{"code":"500114","name":"黔江区","parend_code":"500100"},{"code":"500115","name":"长寿区","parend_code":"500100"}]},{"code":"500200","name":"县","parend_code":"500000","child_code":[{"code":"500222","name":"綦江县","parend_code":"500200"},{"code":"500223","name":"潼南县","parend_code":"500200"},{"code":"500224","name":"铜梁县","parend_code":"500200"},{"code":"500225","name":"大足县","parend_code":"500200"},{"code":"500226","name":"荣昌县","parend_code":"500200"},{"code":"500227","name":"璧山县","parend_code":"500200"},{"code":"500228","name":"梁平县","parend_code":"500200"},{"code":"500229","name":"城口县","parend_code":"500200"},{"code":"500230","name":"丰都县","parend_code":"500200"},{"code":"500231","name":"垫江县","parend_code":"500200"},{"code":"500232","name":"武隆县","parend_code":"500200"},{"code":"500233","name":"忠　县","parend_code":"500200"},{"code":"500234","name":"开　县","parend_code":"500200"},{"code":"500235","name":"云阳县","parend_code":"500200"},{"code":"500236","name":"奉节县","parend_code":"500200"},{"code":"500237","name":"巫山县","parend_code":"500200"},{"code":"500238","name":"巫溪县","parend_code":"500200"},{"code":"500240","name":"石柱土家族自治县","parend_code":"500200"},{"code":"500241","name":"秀山土家族苗族自治县","parend_code":"500200"},{"code":"500242","name":"酉阳土家族苗族自治县","parend_code":"500200"},{"code":"500243","name":"彭水苗族土家族自治县","parend_code":"500200"}]},{"code":"500300","name":"市","parend_code":"500000","child_code":[{"code":"500381","name":"江津市","parend_code":"500300"},{"code":"500382","name":"合川市","parend_code":"500300"},{"code":"500383","name":"永川市","parend_code":"500300"},{"code":"500384","name":"南川市","parend_code":"500300"}]}]},{"code":"510000","name":"四川省","parend_code":"0","child_code":[{"code":"510100","name":"成都市","parend_code":"510000","child_code":[{"code":"510101","name":"市辖区","parend_code":"510100"},{"code":"510104","name":"锦江区","parend_code":"510100"},{"code":"510105","name":"青羊区","parend_code":"510100"},{"code":"510106","name":"金牛区","parend_code":"510100"},{"code":"510107","name":"武侯区","parend_code":"510100"},{"code":"510108","name":"成华区","parend_code":"510100"},{"code":"510112","name":"龙泉驿区","parend_code":"510100"},{"code":"510113","name":"青白江区","parend_code":"510100"},{"code":"510114","name":"新都区","parend_code":"510100"},{"code":"510115","name":"温江区","parend_code":"510100"},{"code":"510121","name":"金堂县","parend_code":"510100"},{"code":"510122","name":"双流县","parend_code":"510100"},{"code":"510124","name":"郫　县","parend_code":"510100"},{"code":"510129","name":"大邑县","parend_code":"510100"},{"code":"510131","name":"蒲江县","parend_code":"510100"},{"code":"510132","name":"新津县","parend_code":"510100"},{"code":"510181","name":"都江堰市","parend_code":"510100"},{"code":"510182","name":"彭州市","parend_code":"510100"},{"code":"510183","name":"邛崃市","parend_code":"510100"},{"code":"510184","name":"崇州市","parend_code":"510100"}]},{"code":"510300","name":"自贡市","parend_code":"510000","child_code":[{"code":"510301","name":"市辖区","parend_code":"510300"},{"code":"510302","name":"自流井区","parend_code":"510300"},{"code":"510303","name":"贡井区","parend_code":"510300"},{"code":"510304","name":"大安区","parend_code":"510300"},{"code":"510311","name":"沿滩区","parend_code":"510300"},{"code":"510321","name":"荣　县","parend_code":"510300"},{"code":"510322","name":"富顺县","parend_code":"510300"}]},{"code":"510400","name":"攀枝花市","parend_code":"510000","child_code":[{"code":"510401","name":"市辖区","parend_code":"510400"},{"code":"510402","name":"东　区","parend_code":"510400"},{"code":"510403","name":"西　区","parend_code":"510400"},{"code":"510411","name":"仁和区","parend_code":"510400"},{"code":"510421","name":"米易县","parend_code":"510400"},{"code":"510422","name":"盐边县","parend_code":"510400"}]},{"code":"510500","name":"泸州市","parend_code":"510000","child_code":[{"code":"510501","name":"市辖区","parend_code":"510500"},{"code":"510502","name":"江阳区","parend_code":"510500"},{"code":"510503","name":"纳溪区","parend_code":"510500"},{"code":"510504","name":"龙马潭区","parend_code":"510500"},{"code":"510521","name":"泸　县","parend_code":"510500"},{"code":"510522","name":"合江县","parend_code":"510500"},{"code":"510524","name":"叙永县","parend_code":"510500"},{"code":"510525","name":"古蔺县","parend_code":"510500"}]},{"code":"510600","name":"德阳市","parend_code":"510000","child_code":[{"code":"510601","name":"市辖区","parend_code":"510600"},{"code":"510603","name":"旌阳区","parend_code":"510600"},{"code":"510623","name":"中江县","parend_code":"510600"},{"code":"510626","name":"罗江县","parend_code":"510600"},{"code":"510681","name":"广汉市","parend_code":"510600"},{"code":"510682","name":"什邡市","parend_code":"510600"},{"code":"510683","name":"绵竹市","parend_code":"510600"}]},{"code":"510700","name":"绵阳市","parend_code":"510000","child_code":[{"code":"510701","name":"市辖区","parend_code":"510700"},{"code":"510703","name":"涪城区","parend_code":"510700"},{"code":"510704","name":"游仙区","parend_code":"510700"},{"code":"510722","name":"三台县","parend_code":"510700"},{"code":"510723","name":"盐亭县","parend_code":"510700"},{"code":"510724","name":"安　县","parend_code":"510700"},{"code":"510725","name":"梓潼县","parend_code":"510700"},{"code":"510726","name":"北川羌族自治县","parend_code":"510700"},{"code":"510727","name":"平武县","parend_code":"510700"},{"code":"510781","name":"江油市","parend_code":"510700"}]},{"code":"510800","name":"广元市","parend_code":"510000","child_code":[{"code":"510801","name":"市辖区","parend_code":"510800"},{"code":"510802","name":"市中区","parend_code":"510800"},{"code":"510811","name":"元坝区","parend_code":"510800"},{"code":"510812","name":"朝天区","parend_code":"510800"},{"code":"510821","name":"旺苍县","parend_code":"510800"},{"code":"510822","name":"青川县","parend_code":"510800"},{"code":"510823","name":"剑阁县","parend_code":"510800"},{"code":"510824","name":"苍溪县","parend_code":"510800"}]},{"code":"510900","name":"遂宁市","parend_code":"510000","child_code":[{"code":"510901","name":"市辖区","parend_code":"510900"},{"code":"510903","name":"船山区","parend_code":"510900"},{"code":"510904","name":"安居区","parend_code":"510900"},{"code":"510921","name":"蓬溪县","parend_code":"510900"},{"code":"510922","name":"射洪县","parend_code":"510900"},{"code":"510923","name":"大英县","parend_code":"510900"}]},{"code":"511000","name":"内江市","parend_code":"510000","child_code":[{"code":"511001","name":"市辖区","parend_code":"511000"},{"code":"511002","name":"市中区","parend_code":"511000"},{"code":"511011","name":"东兴区","parend_code":"511000"},{"code":"511024","name":"威远县","parend_code":"511000"},{"code":"511025","name":"资中县","parend_code":"511000"},{"code":"511028","name":"隆昌县","parend_code":"511000"}]},{"code":"511100","name":"乐山市","parend_code":"510000","child_code":[{"code":"511101","name":"市辖区","parend_code":"511100"},{"code":"511102","name":"市中区","parend_code":"511100"},{"code":"511111","name":"沙湾区","parend_code":"511100"},{"code":"511112","name":"五通桥区","parend_code":"511100"},{"code":"511113","name":"金口河区","parend_code":"511100"},{"code":"511123","name":"犍为县","parend_code":"511100"},{"code":"511124","name":"井研县","parend_code":"511100"},{"code":"511126","name":"夹江县","parend_code":"511100"},{"code":"511129","name":"沐川县","parend_code":"511100"},{"code":"511132","name":"峨边彝族自治县","parend_code":"511100"},{"code":"511133","name":"马边彝族自治县","parend_code":"511100"},{"code":"511181","name":"峨眉山市","parend_code":"511100"}]},{"code":"511300","name":"南充市","parend_code":"510000","child_code":[{"code":"511301","name":"市辖区","parend_code":"511300"},{"code":"511302","name":"顺庆区","parend_code":"511300"},{"code":"511303","name":"高坪区","parend_code":"511300"},{"code":"511304","name":"嘉陵区","parend_code":"511300"},{"code":"511321","name":"南部县","parend_code":"511300"},{"code":"511322","name":"营山县","parend_code":"511300"},{"code":"511323","name":"蓬安县","parend_code":"511300"},{"code":"511324","name":"仪陇县","parend_code":"511300"},{"code":"511325","name":"西充县","parend_code":"511300"},{"code":"511381","name":"阆中市","parend_code":"511300"}]},{"code":"511400","name":"眉山市","parend_code":"510000","child_code":[{"code":"511401","name":"市辖区","parend_code":"511400"},{"code":"511402","name":"东坡区","parend_code":"511400"},{"code":"511421","name":"仁寿县","parend_code":"511400"},{"code":"511422","name":"彭山县","parend_code":"511400"},{"code":"511423","name":"洪雅县","parend_code":"511400"},{"code":"511424","name":"丹棱县","parend_code":"511400"},{"code":"511425","name":"青神县","parend_code":"511400"}]},{"code":"511500","name":"宜宾市","parend_code":"510000","child_code":[{"code":"511501","name":"市辖区","parend_code":"511500"},{"code":"511502","name":"翠屏区","parend_code":"511500"},{"code":"511521","name":"宜宾县","parend_code":"511500"},{"code":"511522","name":"南溪县","parend_code":"511500"},{"code":"511523","name":"江安县","parend_code":"511500"},{"code":"511524","name":"长宁县","parend_code":"511500"},{"code":"511525","name":"高　县","parend_code":"511500"},{"code":"511526","name":"珙　县","parend_code":"511500"},{"code":"511527","name":"筠连县","parend_code":"511500"},{"code":"511528","name":"兴文县","parend_code":"511500"},{"code":"511529","name":"屏山县","parend_code":"511500"}]},{"code":"511600","name":"广安市","parend_code":"510000","child_code":[{"code":"511601","name":"市辖区","parend_code":"511600"},{"code":"511602","name":"广安区","parend_code":"511600"},{"code":"511621","name":"岳池县","parend_code":"511600"},{"code":"511622","name":"武胜县","parend_code":"511600"},{"code":"511623","name":"邻水县","parend_code":"511600"},{"code":"511681","name":"华莹市","parend_code":"511600"}]},{"code":"511700","name":"达州市","parend_code":"510000","child_code":[{"code":"511701","name":"市辖区","parend_code":"511700"},{"code":"511702","name":"通川区","parend_code":"511700"},{"code":"511721","name":"达　县","parend_code":"511700"},{"code":"511722","name":"宣汉县","parend_code":"511700"},{"code":"511723","name":"开江县","parend_code":"511700"},{"code":"511724","name":"大竹县","parend_code":"511700"},{"code":"511725","name":"渠　县","parend_code":"511700"},{"code":"511781","name":"万源市","parend_code":"511700"}]},{"code":"511800","name":"雅安市","parend_code":"510000","child_code":[{"code":"511801","name":"市辖区","parend_code":"511800"},{"code":"511802","name":"雨城区","parend_code":"511800"},{"code":"511821","name":"名山县","parend_code":"511800"},{"code":"511822","name":"荥经县","parend_code":"511800"},{"code":"511823","name":"汉源县","parend_code":"511800"},{"code":"511824","name":"石棉县","parend_code":"511800"},{"code":"511825","name":"天全县","parend_code":"511800"},{"code":"511826","name":"芦山县","parend_code":"511800"},{"code":"511827","name":"宝兴县","parend_code":"511800"}]},{"code":"511900","name":"巴中市","parend_code":"510000","child_code":[{"code":"511901","name":"市辖区","parend_code":"511900"},{"code":"511902","name":"巴州区","parend_code":"511900"},{"code":"511921","name":"通江县","parend_code":"511900"},{"code":"511922","name":"南江县","parend_code":"511900"},{"code":"511923","name":"平昌县","parend_code":"511900"}]},{"code":"512000","name":"资阳市","parend_code":"510000","child_code":[{"code":"512001","name":"市辖区","parend_code":"512000"},{"code":"512002","name":"雁江区","parend_code":"512000"},{"code":"512021","name":"安岳县","parend_code":"512000"},{"code":"512022","name":"乐至县","parend_code":"512000"},{"code":"512081","name":"简阳市","parend_code":"512000"}]},{"code":"513200","name":"阿坝藏族羌族自治州","parend_code":"510000","child_code":[{"code":"513221","name":"汶川县","parend_code":"513200"},{"code":"513222","name":"理　县","parend_code":"513200"},{"code":"513223","name":"茂　县","parend_code":"513200"},{"code":"513224","name":"松潘县","parend_code":"513200"},{"code":"513225","name":"九寨沟县","parend_code":"513200"},{"code":"513226","name":"金川县","parend_code":"513200"},{"code":"513227","name":"小金县","parend_code":"513200"},{"code":"513228","name":"黑水县","parend_code":"513200"},{"code":"513229","name":"马尔康县","parend_code":"513200"},{"code":"513230","name":"壤塘县","parend_code":"513200"},{"code":"513231","name":"阿坝县","parend_code":"513200"},{"code":"513232","name":"若尔盖县","parend_code":"513200"},{"code":"513233","name":"红原县","parend_code":"513200"}]},{"code":"513300","name":"甘孜藏族自治州","parend_code":"510000","child_code":[{"code":"513321","name":"康定县","parend_code":"513300"},{"code":"513322","name":"泸定县","parend_code":"513300"},{"code":"513323","name":"丹巴县","parend_code":"513300"},{"code":"513324","name":"九龙县","parend_code":"513300"},{"code":"513325","name":"雅江县","parend_code":"513300"},{"code":"513326","name":"道孚县","parend_code":"513300"},{"code":"513327","name":"炉霍县","parend_code":"513300"},{"code":"513328","name":"甘孜县","parend_code":"513300"},{"code":"513329","name":"新龙县","parend_code":"513300"},{"code":"513330","name":"德格县","parend_code":"513300"},{"code":"513331","name":"白玉县","parend_code":"513300"},{"code":"513332","name":"石渠县","parend_code":"513300"},{"code":"513333","name":"色达县","parend_code":"513300"},{"code":"513334","name":"理塘县","parend_code":"513300"},{"code":"513335","name":"巴塘县","parend_code":"513300"},{"code":"513336","name":"乡城县","parend_code":"513300"},{"code":"513337","name":"稻城县","parend_code":"513300"},{"code":"513338","name":"得荣县","parend_code":"513300"}]},{"code":"513400","name":"凉山彝族自治州","parend_code":"510000","child_code":[{"code":"513401","name":"西昌市","parend_code":"513400"},{"code":"513422","name":"木里藏族自治县","parend_code":"513400"},{"code":"513423","name":"盐源县","parend_code":"513400"},{"code":"513424","name":"德昌县","parend_code":"513400"},{"code":"513425","name":"会理县","parend_code":"513400"},{"code":"513426","name":"会东县","parend_code":"513400"},{"code":"513427","name":"宁南县","parend_code":"513400"},{"code":"513428","name":"普格县","parend_code":"513400"},{"code":"513429","name":"布拖县","parend_code":"513400"},{"code":"513430","name":"金阳县","parend_code":"513400"},{"code":"513431","name":"昭觉县","parend_code":"513400"},{"code":"513432","name":"喜德县","parend_code":"513400"},{"code":"513433","name":"冕宁县","parend_code":"513400"},{"code":"513434","name":"越西县","parend_code":"513400"},{"code":"513435","name":"甘洛县","parend_code":"513400"},{"code":"513436","name":"美姑县","parend_code":"513400"},{"code":"513437","name":"雷波县","parend_code":"513400"}]}]},{"code":"520000","name":"贵州省","parend_code":"0","child_code":[{"code":"520100","name":"贵阳市","parend_code":"520000","child_code":[{"code":"520101","name":"市辖区","parend_code":"520100"},{"code":"520102","name":"南明区","parend_code":"520100"},{"code":"520103","name":"云岩区","parend_code":"520100"},{"code":"520111","name":"花溪区","parend_code":"520100"},{"code":"520112","name":"乌当区","parend_code":"520100"},{"code":"520113","name":"白云区","parend_code":"520100"},{"code":"520114","name":"小河区","parend_code":"520100"},{"code":"520121","name":"开阳县","parend_code":"520100"},{"code":"520122","name":"息烽县","parend_code":"520100"},{"code":"520123","name":"修文县","parend_code":"520100"},{"code":"520181","name":"清镇市","parend_code":"520100"}]},{"code":"520200","name":"六盘水市","parend_code":"520000","child_code":[{"code":"520201","name":"钟山区","parend_code":"520200"},{"code":"520203","name":"六枝特区","parend_code":"520200"},{"code":"520221","name":"水城县","parend_code":"520200"},{"code":"520222","name":"盘　县","parend_code":"520200"}]},{"code":"520300","name":"遵义市","parend_code":"520000","child_code":[{"code":"520301","name":"市辖区","parend_code":"520300"},{"code":"520302","name":"红花岗区","parend_code":"520300"},{"code":"520303","name":"汇川区","parend_code":"520300"},{"code":"520321","name":"遵义县","parend_code":"520300"},{"code":"520322","name":"桐梓县","parend_code":"520300"},{"code":"520323","name":"绥阳县","parend_code":"520300"},{"code":"520324","name":"正安县","parend_code":"520300"},{"code":"520325","name":"道真仡佬族苗族自治县","parend_code":"520300"},{"code":"520326","name":"务川仡佬族苗族自治县","parend_code":"520300"},{"code":"520327","name":"凤冈县","parend_code":"520300"},{"code":"520328","name":"湄潭县","parend_code":"520300"},{"code":"520329","name":"余庆县","parend_code":"520300"},{"code":"520330","name":"习水县","parend_code":"520300"},{"code":"520381","name":"赤水市","parend_code":"520300"},{"code":"520382","name":"仁怀市","parend_code":"520300"}]},{"code":"520400","name":"安顺市","parend_code":"520000","child_code":[{"code":"520401","name":"市辖区","parend_code":"520400"},{"code":"520402","name":"西秀区","parend_code":"520400"},{"code":"520421","name":"平坝县","parend_code":"520400"},{"code":"520422","name":"普定县","parend_code":"520400"},{"code":"520423","name":"镇宁布依族苗族自治县","parend_code":"520400"},{"code":"520424","name":"关岭布依族苗族自治县","parend_code":"520400"},{"code":"520425","name":"紫云苗族布依族自治县","parend_code":"520400"}]},{"code":"522200","name":"铜仁地区","parend_code":"520000","child_code":[{"code":"522201","name":"铜仁市","parend_code":"522200"},{"code":"522222","name":"江口县","parend_code":"522200"},{"code":"522223","name":"玉屏侗族自治县","parend_code":"522200"},{"code":"522224","name":"石阡县","parend_code":"522200"},{"code":"522225","name":"思南县","parend_code":"522200"},{"code":"522226","name":"印江土家族苗族自治县","parend_code":"522200"},{"code":"522227","name":"德江县","parend_code":"522200"},{"code":"522228","name":"沿河土家族自治县","parend_code":"522200"},{"code":"522229","name":"松桃苗族自治县","parend_code":"522200"},{"code":"522230","name":"万山特区","parend_code":"522200"}]},{"code":"522300","name":"黔西南布依族苗族自治州","parend_code":"520000","child_code":[{"code":"522301","name":"兴义市","parend_code":"522300"},{"code":"522322","name":"兴仁县","parend_code":"522300"},{"code":"522323","name":"普安县","parend_code":"522300"},{"code":"522324","name":"晴隆县","parend_code":"522300"},{"code":"522325","name":"贞丰县","parend_code":"522300"},{"code":"522326","name":"望谟县","parend_code":"522300"},{"code":"522327","name":"册亨县","parend_code":"522300"},{"code":"522328","name":"安龙县","parend_code":"522300"}]},{"code":"522400","name":"毕节地区","parend_code":"520000","child_code":[{"code":"522401","name":"毕节市","parend_code":"522400"},{"code":"522422","name":"大方县","parend_code":"522400"},{"code":"522423","name":"黔西县","parend_code":"522400"},{"code":"522424","name":"金沙县","parend_code":"522400"},{"code":"522425","name":"织金县","parend_code":"522400"},{"code":"522426","name":"纳雍县","parend_code":"522400"},{"code":"522427","name":"威宁彝族回族苗族自治县","parend_code":"522400"},{"code":"522428","name":"赫章县","parend_code":"522400"}]},{"code":"522600","name":"黔东南苗族侗族自治州","parend_code":"520000","child_code":[{"code":"522601","name":"凯里市","parend_code":"522600"},{"code":"522622","name":"黄平县","parend_code":"522600"},{"code":"522623","name":"施秉县","parend_code":"522600"},{"code":"522624","name":"三穗县","parend_code":"522600"},{"code":"522625","name":"镇远县","parend_code":"522600"},{"code":"522626","name":"岑巩县","parend_code":"522600"},{"code":"522627","name":"天柱县","parend_code":"522600"},{"code":"522628","name":"锦屏县","parend_code":"522600"},{"code":"522629","name":"剑河县","parend_code":"522600"},{"code":"522630","name":"台江县","parend_code":"522600"},{"code":"522631","name":"黎平县","parend_code":"522600"},{"code":"522632","name":"榕江县","parend_code":"522600"},{"code":"522633","name":"从江县","parend_code":"522600"},{"code":"522634","name":"雷山县","parend_code":"522600"},{"code":"522635","name":"麻江县","parend_code":"522600"},{"code":"522636","name":"丹寨县","parend_code":"522600"}]},{"code":"522700","name":"黔南布依族苗族自治州","parend_code":"520000","child_code":[{"code":"522701","name":"都匀市","parend_code":"522700"},{"code":"522702","name":"福泉市","parend_code":"522700"},{"code":"522722","name":"荔波县","parend_code":"522700"},{"code":"522723","name":"贵定县","parend_code":"522700"},{"code":"522725","name":"瓮安县","parend_code":"522700"},{"code":"522726","name":"独山县","parend_code":"522700"},{"code":"522727","name":"平塘县","parend_code":"522700"},{"code":"522728","name":"罗甸县","parend_code":"522700"},{"code":"522729","name":"长顺县","parend_code":"522700"},{"code":"522730","name":"龙里县","parend_code":"522700"},{"code":"522731","name":"惠水县","parend_code":"522700"},{"code":"522732","name":"三都水族自治县","parend_code":"522700"}]}]},{"code":"530000","name":"云南省","parend_code":"0","child_code":[{"code":"530100","name":"昆明市","parend_code":"530000","child_code":[{"code":"530101","name":"市辖区","parend_code":"530100"},{"code":"530102","name":"五华区","parend_code":"530100"},{"code":"530103","name":"盘龙区","parend_code":"530100"},{"code":"530111","name":"官渡区","parend_code":"530100"},{"code":"530112","name":"西山区","parend_code":"530100"},{"code":"530113","name":"东川区","parend_code":"530100"},{"code":"530121","name":"呈贡县","parend_code":"530100"},{"code":"530122","name":"晋宁县","parend_code":"530100"},{"code":"530124","name":"富民县","parend_code":"530100"},{"code":"530125","name":"宜良县","parend_code":"530100"},{"code":"530126","name":"石林彝族自治县","parend_code":"530100"},{"code":"530127","name":"嵩明县","parend_code":"530100"},{"code":"530128","name":"禄劝彝族苗族自治县","parend_code":"530100"},{"code":"530129","name":"寻甸回族彝族自治县","parend_code":"530100"},{"code":"530181","name":"安宁市","parend_code":"530100"}]},{"code":"530300","name":"曲靖市","parend_code":"530000","child_code":[{"code":"530301","name":"市辖区","parend_code":"530300"},{"code":"530302","name":"麒麟区","parend_code":"530300"},{"code":"530321","name":"马龙县","parend_code":"530300"},{"code":"530322","name":"陆良县","parend_code":"530300"},{"code":"530323","name":"师宗县","parend_code":"530300"},{"code":"530324","name":"罗平县","parend_code":"530300"},{"code":"530325","name":"富源县","parend_code":"530300"},{"code":"530326","name":"会泽县","parend_code":"530300"},{"code":"530328","name":"沾益县","parend_code":"530300"},{"code":"530381","name":"宣威市","parend_code":"530300"}]},{"code":"530400","name":"玉溪市","parend_code":"530000","child_code":[{"code":"530401","name":"市辖区","parend_code":"530400"},{"code":"530402","name":"红塔区","parend_code":"530400"},{"code":"530421","name":"江川县","parend_code":"530400"},{"code":"530422","name":"澄江县","parend_code":"530400"},{"code":"530423","name":"通海县","parend_code":"530400"},{"code":"530424","name":"华宁县","parend_code":"530400"},{"code":"530425","name":"易门县","parend_code":"530400"},{"code":"530426","name":"峨山彝族自治县","parend_code":"530400"},{"code":"530427","name":"新平彝族傣族自治县","parend_code":"530400"},{"code":"530428","name":"元江哈尼族彝族傣族自治县","parend_code":"530400"}]},{"code":"530500","name":"保山市","parend_code":"530000","child_code":[{"code":"530501","name":"市辖区","parend_code":"530500"},{"code":"530502","name":"隆阳区","parend_code":"530500"},{"code":"530521","name":"施甸县","parend_code":"530500"},{"code":"530522","name":"腾冲县","parend_code":"530500"},{"code":"530523","name":"龙陵县","parend_code":"530500"},{"code":"530524","name":"昌宁县","parend_code":"530500"}]},{"code":"530600","name":"昭通市","parend_code":"530000","child_code":[{"code":"530601","name":"市辖区","parend_code":"530600"},{"code":"530602","name":"昭阳区","parend_code":"530600"},{"code":"530621","name":"鲁甸县","parend_code":"530600"},{"code":"530622","name":"巧家县","parend_code":"530600"},{"code":"530623","name":"盐津县","parend_code":"530600"},{"code":"530624","name":"大关县","parend_code":"530600"},{"code":"530625","name":"永善县","parend_code":"530600"},{"code":"530626","name":"绥江县","parend_code":"530600"},{"code":"530627","name":"镇雄县","parend_code":"530600"},{"code":"530628","name":"彝良县","parend_code":"530600"},{"code":"530629","name":"威信县","parend_code":"530600"},{"code":"530630","name":"水富县","parend_code":"530600"}]},{"code":"530700","name":"丽江市","parend_code":"530000","child_code":[{"code":"530701","name":"市辖区","parend_code":"530700"},{"code":"530702","name":"古城区","parend_code":"530700"},{"code":"530721","name":"玉龙纳西族自治县","parend_code":"530700"},{"code":"530722","name":"永胜县","parend_code":"530700"},{"code":"530723","name":"华坪县","parend_code":"530700"},{"code":"530724","name":"宁蒗彝族自治县","parend_code":"530700"}]},{"code":"530800","name":"思茅市","parend_code":"530000","child_code":[{"code":"530801","name":"市辖区","parend_code":"530800"},{"code":"530802","name":"翠云区","parend_code":"530800"},{"code":"530821","name":"普洱哈尼族彝族自治县","parend_code":"530800"},{"code":"530822","name":"墨江哈尼族自治县","parend_code":"530800"},{"code":"530823","name":"景东彝族自治县","parend_code":"530800"},{"code":"530824","name":"景谷傣族彝族自治县","parend_code":"530800"},{"code":"530825","name":"镇沅彝族哈尼族拉祜族自治县","parend_code":"530800"},{"code":"530826","name":"江城哈尼族彝族自治县","parend_code":"530800"},{"code":"530827","name":"孟连傣族拉祜族佤族自治县","parend_code":"530800"},{"code":"530828","name":"澜沧拉祜族自治县","parend_code":"530800"},{"code":"530829","name":"西盟佤族自治县","parend_code":"530800"}]},{"code":"530900","name":"临沧市","parend_code":"530000","child_code":[{"code":"530901","name":"市辖区","parend_code":"530900"},{"code":"530902","name":"临翔区","parend_code":"530900"},{"code":"530921","name":"凤庆县","parend_code":"530900"},{"code":"530922","name":"云　县","parend_code":"530900"},{"code":"530923","name":"永德县","parend_code":"530900"},{"code":"530924","name":"镇康县","parend_code":"530900"},{"code":"530925","name":"双江拉祜族佤族布朗族傣族自治县","parend_code":"530900"},{"code":"530926","name":"耿马傣族佤族自治县","parend_code":"530900"},{"code":"530927","name":"沧源佤族自治县","parend_code":"530900"}]},{"code":"532300","name":"楚雄彝族自治州","parend_code":"530000","child_code":[{"code":"532301","name":"楚雄市","parend_code":"532300"},{"code":"532322","name":"双柏县","parend_code":"532300"},{"code":"532323","name":"牟定县","parend_code":"532300"},{"code":"532324","name":"南华县","parend_code":"532300"},{"code":"532325","name":"姚安县","parend_code":"532300"},{"code":"532326","name":"大姚县","parend_code":"532300"},{"code":"532327","name":"永仁县","parend_code":"532300"},{"code":"532328","name":"元谋县","parend_code":"532300"},{"code":"532329","name":"武定县","parend_code":"532300"},{"code":"532331","name":"禄丰县","parend_code":"532300"}]},{"code":"532500","name":"红河哈尼族彝族自治州","parend_code":"530000","child_code":[{"code":"532501","name":"个旧市","parend_code":"532500"},{"code":"532502","name":"开远市","parend_code":"532500"},{"code":"532522","name":"蒙自县","parend_code":"532500"},{"code":"532523","name":"屏边苗族自治县","parend_code":"532500"},{"code":"532524","name":"建水县","parend_code":"532500"},{"code":"532525","name":"石屏县","parend_code":"532500"},{"code":"532526","name":"弥勒县","parend_code":"532500"},{"code":"532527","name":"泸西县","parend_code":"532500"},{"code":"532528","name":"元阳县","parend_code":"532500"},{"code":"532529","name":"红河县","parend_code":"532500"},{"code":"532530","name":"金平苗族瑶族傣族自治县","parend_code":"532500"},{"code":"532531","name":"绿春县","parend_code":"532500"},{"code":"532532","name":"河口瑶族自治县","parend_code":"532500"}]},{"code":"532600","name":"文山壮族苗族自治州","parend_code":"530000","child_code":[{"code":"532621","name":"文山县","parend_code":"532600"},{"code":"532622","name":"砚山县","parend_code":"532600"},{"code":"532623","name":"西畴县","parend_code":"532600"},{"code":"532624","name":"麻栗坡县","parend_code":"532600"},{"code":"532625","name":"马关县","parend_code":"532600"},{"code":"532626","name":"丘北县","parend_code":"532600"},{"code":"532627","name":"广南县","parend_code":"532600"},{"code":"532628","name":"富宁县","parend_code":"532600"}]},{"code":"532800","name":"西双版纳傣族自治州","parend_code":"530000","child_code":[{"code":"532801","name":"景洪市","parend_code":"532800"},{"code":"532822","name":"勐海县","parend_code":"532800"},{"code":"532823","name":"勐腊县","parend_code":"532800"}]},{"code":"532900","name":"大理白族自治州","parend_code":"530000","child_code":[{"code":"532901","name":"大理市","parend_code":"532900"},{"code":"532922","name":"漾濞彝族自治县","parend_code":"532900"},{"code":"532923","name":"祥云县","parend_code":"532900"},{"code":"532924","name":"宾川县","parend_code":"532900"},{"code":"532925","name":"弥渡县","parend_code":"532900"},{"code":"532926","name":"南涧彝族自治县","parend_code":"532900"},{"code":"532927","name":"巍山彝族回族自治县","parend_code":"532900"},{"code":"532928","name":"永平县","parend_code":"532900"},{"code":"532929","name":"云龙县","parend_code":"532900"},{"code":"532930","name":"洱源县","parend_code":"532900"},{"code":"532931","name":"剑川县","parend_code":"532900"},{"code":"532932","name":"鹤庆县","parend_code":"532900"}]},{"code":"533100","name":"德宏傣族景颇族自治州","parend_code":"530000","child_code":[{"code":"533102","name":"瑞丽市","parend_code":"533100"},{"code":"533103","name":"潞西市","parend_code":"533100"},{"code":"533122","name":"梁河县","parend_code":"533100"},{"code":"533123","name":"盈江县","parend_code":"533100"},{"code":"533124","name":"陇川县","parend_code":"533100"}]},{"code":"533300","name":"怒江傈僳族自治州","parend_code":"530000","child_code":[{"code":"533321","name":"泸水县","parend_code":"533300"},{"code":"533323","name":"福贡县","parend_code":"533300"},{"code":"533324","name":"贡山独龙族怒族自治县","parend_code":"533300"},{"code":"533325","name":"兰坪白族普米族自治县","parend_code":"533300"}]},{"code":"533400","name":"迪庆藏族自治州","parend_code":"530000","child_code":[{"code":"533421","name":"香格里拉县","parend_code":"533400"},{"code":"533422","name":"德钦县","parend_code":"533400"},{"code":"533423","name":"维西傈僳族自治县","parend_code":"533400"}]}]},{"code":"540000","name":"西藏自治区","parend_code":"0","child_code":[{"code":"540100","name":"拉萨市","parend_code":"540000","child_code":[{"code":"540101","name":"市辖区","parend_code":"540100"},{"code":"540102","name":"城关区","parend_code":"540100"},{"code":"540121","name":"林周县","parend_code":"540100"},{"code":"540122","name":"当雄县","parend_code":"540100"},{"code":"540123","name":"尼木县","parend_code":"540100"},{"code":"540124","name":"曲水县","parend_code":"540100"},{"code":"540125","name":"堆龙德庆县","parend_code":"540100"},{"code":"540126","name":"达孜县","parend_code":"540100"},{"code":"540127","name":"墨竹工卡县","parend_code":"540100"}]},{"code":"542100","name":"昌都地区","parend_code":"540000","child_code":[{"code":"542121","name":"昌都县","parend_code":"542100"},{"code":"542122","name":"江达县","parend_code":"542100"},{"code":"542123","name":"贡觉县","parend_code":"542100"},{"code":"542124","name":"类乌齐县","parend_code":"542100"},{"code":"542125","name":"丁青县","parend_code":"542100"},{"code":"542126","name":"察雅县","parend_code":"542100"},{"code":"542127","name":"八宿县","parend_code":"542100"},{"code":"542128","name":"左贡县","parend_code":"542100"},{"code":"542129","name":"芒康县","parend_code":"542100"},{"code":"542132","name":"洛隆县","parend_code":"542100"},{"code":"542133","name":"边坝县","parend_code":"542100"}]},{"code":"542200","name":"山南地区","parend_code":"540000","child_code":[{"code":"542221","name":"乃东县","parend_code":"542200"},{"code":"542222","name":"扎囊县","parend_code":"542200"},{"code":"542223","name":"贡嘎县","parend_code":"542200"},{"code":"542224","name":"桑日县","parend_code":"542200"},{"code":"542225","name":"琼结县","parend_code":"542200"},{"code":"542226","name":"曲松县","parend_code":"542200"},{"code":"542227","name":"措美县","parend_code":"542200"},{"code":"542228","name":"洛扎县","parend_code":"542200"},{"code":"542229","name":"加查县","parend_code":"542200"},{"code":"542231","name":"隆子县","parend_code":"542200"},{"code":"542232","name":"错那县","parend_code":"542200"},{"code":"542233","name":"浪卡子县","parend_code":"542200"}]},{"code":"542300","name":"日喀则地区","parend_code":"540000","child_code":[{"code":"542301","name":"日喀则市","parend_code":"542300"},{"code":"542322","name":"南木林县","parend_code":"542300"},{"code":"542323","name":"江孜县","parend_code":"542300"},{"code":"542324","name":"定日县","parend_code":"542300"},{"code":"542325","name":"萨迦县","parend_code":"542300"},{"code":"542326","name":"拉孜县","parend_code":"542300"},{"code":"542327","name":"昂仁县","parend_code":"542300"},{"code":"542328","name":"谢通门县","parend_code":"542300"},{"code":"542329","name":"白朗县","parend_code":"542300"},{"code":"542330","name":"仁布县","parend_code":"542300"},{"code":"542331","name":"康马县","parend_code":"542300"},{"code":"542332","name":"定结县","parend_code":"542300"},{"code":"542333","name":"仲巴县","parend_code":"542300"},{"code":"542334","name":"亚东县","parend_code":"542300"},{"code":"542335","name":"吉隆县","parend_code":"542300"},{"code":"542336","name":"聂拉木县","parend_code":"542300"},{"code":"542337","name":"萨嘎县","parend_code":"542300"},{"code":"542338","name":"岗巴县","parend_code":"542300"}]},{"code":"542400","name":"那曲地区","parend_code":"540000","child_code":[{"code":"542421","name":"那曲县","parend_code":"542400"},{"code":"542422","name":"嘉黎县","parend_code":"542400"},{"code":"542423","name":"比如县","parend_code":"542400"},{"code":"542424","name":"聂荣县","parend_code":"542400"},{"code":"542425","name":"安多县","parend_code":"542400"},{"code":"542426","name":"申扎县","parend_code":"542400"},{"code":"542427","name":"索　县","parend_code":"542400"},{"code":"542428","name":"班戈县","parend_code":"542400"},{"code":"542429","name":"巴青县","parend_code":"542400"},{"code":"542430","name":"尼玛县","parend_code":"542400"}]},{"code":"542500","name":"阿里地区","parend_code":"540000","child_code":[{"code":"542521","name":"普兰县","parend_code":"542500"},{"code":"542522","name":"札达县","parend_code":"542500"},{"code":"542523","name":"噶尔县","parend_code":"542500"},{"code":"542524","name":"日土县","parend_code":"542500"},{"code":"542525","name":"革吉县","parend_code":"542500"},{"code":"542526","name":"改则县","parend_code":"542500"},{"code":"542527","name":"措勤县","parend_code":"542500"}]},{"code":"542600","name":"林芝地区","parend_code":"540000","child_code":[{"code":"542621","name":"林芝县","parend_code":"542600"},{"code":"542622","name":"工布江达县","parend_code":"542600"},{"code":"542623","name":"米林县","parend_code":"542600"},{"code":"542624","name":"墨脱县","parend_code":"542600"},{"code":"542625","name":"波密县","parend_code":"542600"},{"code":"542626","name":"察隅县","parend_code":"542600"},{"code":"542627","name":"朗　县","parend_code":"542600"}]}]},{"code":"610000","name":"陕西省","parend_code":"0","child_code":[{"code":"610100","name":"西安市","parend_code":"610000","child_code":[{"code":"610101","name":"市辖区","parend_code":"610100"},{"code":"610102","name":"新城区","parend_code":"610100"},{"code":"610103","name":"碑林区","parend_code":"610100"},{"code":"610104","name":"莲湖区","parend_code":"610100"},{"code":"610111","name":"灞桥区","parend_code":"610100"},{"code":"610112","name":"未央区","parend_code":"610100"},{"code":"610113","name":"雁塔区","parend_code":"610100"},{"code":"610114","name":"阎良区","parend_code":"610100"},{"code":"610115","name":"临潼区","parend_code":"610100"},{"code":"610116","name":"长安区","parend_code":"610100"},{"code":"610122","name":"蓝田县","parend_code":"610100"},{"code":"610124","name":"周至县","parend_code":"610100"},{"code":"610125","name":"户　县","parend_code":"610100"},{"code":"610126","name":"高陵县","parend_code":"610100"}]},{"code":"610200","name":"铜川市","parend_code":"610000","child_code":[{"code":"610201","name":"市辖区","parend_code":"610200"},{"code":"610202","name":"王益区","parend_code":"610200"},{"code":"610203","name":"印台区","parend_code":"610200"},{"code":"610204","name":"耀州区","parend_code":"610200"},{"code":"610222","name":"宜君县","parend_code":"610200"}]},{"code":"610300","name":"宝鸡市","parend_code":"610000","child_code":[{"code":"610301","name":"市辖区","parend_code":"610300"},{"code":"610302","name":"渭滨区","parend_code":"610300"},{"code":"610303","name":"金台区","parend_code":"610300"},{"code":"610304","name":"陈仓区","parend_code":"610300"},{"code":"610322","name":"凤翔县","parend_code":"610300"},{"code":"610323","name":"岐山县","parend_code":"610300"},{"code":"610324","name":"扶风县","parend_code":"610300"},{"code":"610326","name":"眉　县","parend_code":"610300"},{"code":"610327","name":"陇　县","parend_code":"610300"},{"code":"610328","name":"千阳县","parend_code":"610300"},{"code":"610329","name":"麟游县","parend_code":"610300"},{"code":"610330","name":"凤　县","parend_code":"610300"},{"code":"610331","name":"太白县","parend_code":"610300"}]},{"code":"610400","name":"咸阳市","parend_code":"610000","child_code":[{"code":"610401","name":"市辖区","parend_code":"610400"},{"code":"610402","name":"秦都区","parend_code":"610400"},{"code":"610403","name":"杨凌区","parend_code":"610400"},{"code":"610404","name":"渭城区","parend_code":"610400"},{"code":"610422","name":"三原县","parend_code":"610400"},{"code":"610423","name":"泾阳县","parend_code":"610400"},{"code":"610424","name":"乾　县","parend_code":"610400"},{"code":"610425","name":"礼泉县","parend_code":"610400"},{"code":"610426","name":"永寿县","parend_code":"610400"},{"code":"610427","name":"彬　县","parend_code":"610400"},{"code":"610428","name":"长武县","parend_code":"610400"},{"code":"610429","name":"旬邑县","parend_code":"610400"},{"code":"610430","name":"淳化县","parend_code":"610400"},{"code":"610431","name":"武功县","parend_code":"610400"},{"code":"610481","name":"兴平市","parend_code":"610400"}]},{"code":"610500","name":"渭南市","parend_code":"610000","child_code":[{"code":"610501","name":"市辖区","parend_code":"610500"},{"code":"610502","name":"临渭区","parend_code":"610500"},{"code":"610521","name":"华　县","parend_code":"610500"},{"code":"610522","name":"潼关县","parend_code":"610500"},{"code":"610523","name":"大荔县","parend_code":"610500"},{"code":"610524","name":"合阳县","parend_code":"610500"},{"code":"610525","name":"澄城县","parend_code":"610500"},{"code":"610526","name":"蒲城县","parend_code":"610500"},{"code":"610527","name":"白水县","parend_code":"610500"},{"code":"610528","name":"富平县","parend_code":"610500"},{"code":"610581","name":"韩城市","parend_code":"610500"},{"code":"610582","name":"华阴市","parend_code":"610500"}]},{"code":"610600","name":"延安市","parend_code":"610000","child_code":[{"code":"610601","name":"市辖区","parend_code":"610600"},{"code":"610602","name":"宝塔区","parend_code":"610600"},{"code":"610621","name":"延长县","parend_code":"610600"},{"code":"610622","name":"延川县","parend_code":"610600"},{"code":"610623","name":"子长县","parend_code":"610600"},{"code":"610624","name":"安塞县","parend_code":"610600"},{"code":"610625","name":"志丹县","parend_code":"610600"},{"code":"610626","name":"吴旗县","parend_code":"610600"},{"code":"610627","name":"甘泉县","parend_code":"610600"},{"code":"610628","name":"富　县","parend_code":"610600"},{"code":"610629","name":"洛川县","parend_code":"610600"},{"code":"610630","name":"宜川县","parend_code":"610600"},{"code":"610631","name":"黄龙县","parend_code":"610600"},{"code":"610632","name":"黄陵县","parend_code":"610600"}]},{"code":"610700","name":"汉中市","parend_code":"610000","child_code":[{"code":"610701","name":"市辖区","parend_code":"610700"},{"code":"610702","name":"汉台区","parend_code":"610700"},{"code":"610721","name":"南郑县","parend_code":"610700"},{"code":"610722","name":"城固县","parend_code":"610700"},{"code":"610723","name":"洋　县","parend_code":"610700"},{"code":"610724","name":"西乡县","parend_code":"610700"},{"code":"610725","name":"勉　县","parend_code":"610700"},{"code":"610726","name":"宁强县","parend_code":"610700"},{"code":"610727","name":"略阳县","parend_code":"610700"},{"code":"610728","name":"镇巴县","parend_code":"610700"},{"code":"610729","name":"留坝县","parend_code":"610700"},{"code":"610730","name":"佛坪县","parend_code":"610700"}]},{"code":"610800","name":"榆林市","parend_code":"610000","child_code":[{"code":"610801","name":"市辖区","parend_code":"610800"},{"code":"610802","name":"榆阳区","parend_code":"610800"},{"code":"610821","name":"神木县","parend_code":"610800"},{"code":"610822","name":"府谷县","parend_code":"610800"},{"code":"610823","name":"横山县","parend_code":"610800"},{"code":"610824","name":"靖边县","parend_code":"610800"},{"code":"610825","name":"定边县","parend_code":"610800"},{"code":"610826","name":"绥德县","parend_code":"610800"},{"code":"610827","name":"米脂县","parend_code":"610800"},{"code":"610828","name":"佳　县","parend_code":"610800"},{"code":"610829","name":"吴堡县","parend_code":"610800"},{"code":"610830","name":"清涧县","parend_code":"610800"},{"code":"610831","name":"子洲县","parend_code":"610800"}]},{"code":"610900","name":"安康市","parend_code":"610000","child_code":[{"code":"610901","name":"市辖区","parend_code":"610900"},{"code":"610902","name":"汉滨区","parend_code":"610900"},{"code":"610921","name":"汉阴县","parend_code":"610900"},{"code":"610922","name":"石泉县","parend_code":"610900"},{"code":"610923","name":"宁陕县","parend_code":"610900"},{"code":"610924","name":"紫阳县","parend_code":"610900"},{"code":"610925","name":"岚皋县","parend_code":"610900"},{"code":"610926","name":"平利县","parend_code":"610900"},{"code":"610927","name":"镇坪县","parend_code":"610900"},{"code":"610928","name":"旬阳县","parend_code":"610900"},{"code":"610929","name":"白河县","parend_code":"610900"}]},{"code":"611000","name":"商洛市","parend_code":"610000","child_code":[{"code":"611001","name":"市辖区","parend_code":"611000"},{"code":"611002","name":"商州区","parend_code":"611000"},{"code":"611021","name":"洛南县","parend_code":"611000"},{"code":"611022","name":"丹凤县","parend_code":"611000"},{"code":"611023","name":"商南县","parend_code":"611000"},{"code":"611024","name":"山阳县","parend_code":"611000"},{"code":"611025","name":"镇安县","parend_code":"611000"},{"code":"611026","name":"柞水县","parend_code":"611000"}]}]},{"code":"620000","name":"甘肃省","parend_code":"0","child_code":[{"code":"620100","name":"兰州市","parend_code":"620000","child_code":[{"code":"620101","name":"市辖区","parend_code":"620100"},{"code":"620102","name":"城关区","parend_code":"620100"},{"code":"620103","name":"七里河区","parend_code":"620100"},{"code":"620104","name":"西固区","parend_code":"620100"},{"code":"620105","name":"安宁区","parend_code":"620100"},{"code":"620111","name":"红古区","parend_code":"620100"},{"code":"620121","name":"永登县","parend_code":"620100"},{"code":"620122","name":"皋兰县","parend_code":"620100"},{"code":"620123","name":"榆中县","parend_code":"620100"}]},{"code":"620200","name":"嘉峪关市","parend_code":"620000","child_code":[{"code":"620201","name":"市辖区","parend_code":"620200"}]},{"code":"620300","name":"金昌市","parend_code":"620000","child_code":[{"code":"620301","name":"市辖区","parend_code":"620300"},{"code":"620302","name":"金川区","parend_code":"620300"},{"code":"620321","name":"永昌县","parend_code":"620300"}]},{"code":"620400","name":"白银市","parend_code":"620000","child_code":[{"code":"620401","name":"市辖区","parend_code":"620400"},{"code":"620402","name":"白银区","parend_code":"620400"},{"code":"620403","name":"平川区","parend_code":"620400"},{"code":"620421","name":"靖远县","parend_code":"620400"},{"code":"620422","name":"会宁县","parend_code":"620400"},{"code":"620423","name":"景泰县","parend_code":"620400"}]},{"code":"620500","name":"天水市","parend_code":"620000","child_code":[{"code":"620501","name":"市辖区","parend_code":"620500"},{"code":"620502","name":"秦城区","parend_code":"620500"},{"code":"620503","name":"北道区","parend_code":"620500"},{"code":"620521","name":"清水县","parend_code":"620500"},{"code":"620522","name":"秦安县","parend_code":"620500"},{"code":"620523","name":"甘谷县","parend_code":"620500"},{"code":"620524","name":"武山县","parend_code":"620500"},{"code":"620525","name":"张家川回族自治县","parend_code":"620500"}]},{"code":"620600","name":"武威市","parend_code":"620000","child_code":[{"code":"620601","name":"市辖区","parend_code":"620600"},{"code":"620602","name":"凉州区","parend_code":"620600"},{"code":"620621","name":"民勤县","parend_code":"620600"},{"code":"620622","name":"古浪县","parend_code":"620600"},{"code":"620623","name":"天祝藏族自治县","parend_code":"620600"}]},{"code":"620700","name":"张掖市","parend_code":"620000","child_code":[{"code":"620701","name":"市辖区","parend_code":"620700"},{"code":"620702","name":"甘州区","parend_code":"620700"},{"code":"620721","name":"肃南裕固族自治县","parend_code":"620700"},{"code":"620722","name":"民乐县","parend_code":"620700"},{"code":"620723","name":"临泽县","parend_code":"620700"},{"code":"620724","name":"高台县","parend_code":"620700"},{"code":"620725","name":"山丹县","parend_code":"620700"}]},{"code":"620800","name":"平凉市","parend_code":"620000","child_code":[{"code":"620801","name":"市辖区","parend_code":"620800"},{"code":"620802","name":"崆峒区","parend_code":"620800"},{"code":"620821","name":"泾川县","parend_code":"620800"},{"code":"620822","name":"灵台县","parend_code":"620800"},{"code":"620823","name":"崇信县","parend_code":"620800"},{"code":"620824","name":"华亭县","parend_code":"620800"},{"code":"620825","name":"庄浪县","parend_code":"620800"},{"code":"620826","name":"静宁县","parend_code":"620800"}]},{"code":"620900","name":"酒泉市","parend_code":"620000","child_code":[{"code":"620901","name":"市辖区","parend_code":"620900"},{"code":"620902","name":"肃州区","parend_code":"620900"},{"code":"620921","name":"金塔县","parend_code":"620900"},{"code":"620922","name":"安西县","parend_code":"620900"},{"code":"620923","name":"肃北蒙古族自治县","parend_code":"620900"},{"code":"620924","name":"阿克塞哈萨克族自治县","parend_code":"620900"},{"code":"620981","name":"玉门市","parend_code":"620900"},{"code":"620982","name":"敦煌市","parend_code":"620900"}]},{"code":"621000","name":"庆阳市","parend_code":"620000","child_code":[{"code":"621001","name":"市辖区","parend_code":"621000"},{"code":"621002","name":"西峰区","parend_code":"621000"},{"code":"621021","name":"庆城县","parend_code":"621000"},{"code":"621022","name":"环　县","parend_code":"621000"},{"code":"621023","name":"华池县","parend_code":"621000"},{"code":"621024","name":"合水县","parend_code":"621000"},{"code":"621025","name":"正宁县","parend_code":"621000"},{"code":"621026","name":"宁　县","parend_code":"621000"},{"code":"621027","name":"镇原县","parend_code":"621000"}]},{"code":"621100","name":"定西市","parend_code":"620000","child_code":[{"code":"621101","name":"市辖区","parend_code":"621100"},{"code":"621102","name":"安定区","parend_code":"621100"},{"code":"621121","name":"通渭县","parend_code":"621100"},{"code":"621122","name":"陇西县","parend_code":"621100"},{"code":"621123","name":"渭源县","parend_code":"621100"},{"code":"621124","name":"临洮县","parend_code":"621100"},{"code":"621125","name":"漳　县","parend_code":"621100"},{"code":"621126","name":"岷　县","parend_code":"621100"}]},{"code":"621200","name":"陇南市","parend_code":"620000","child_code":[{"code":"621201","name":"市辖区","parend_code":"621200"},{"code":"621202","name":"武都区","parend_code":"621200"},{"code":"621221","name":"成　县","parend_code":"621200"},{"code":"621222","name":"文　县","parend_code":"621200"},{"code":"621223","name":"宕昌县","parend_code":"621200"},{"code":"621224","name":"康　县","parend_code":"621200"},{"code":"621225","name":"西和县","parend_code":"621200"},{"code":"621226","name":"礼　县","parend_code":"621200"},{"code":"621227","name":"徽　县","parend_code":"621200"},{"code":"621228","name":"两当县","parend_code":"621200"}]},{"code":"622900","name":"临夏回族自治州","parend_code":"620000","child_code":[{"code":"622901","name":"临夏市","parend_code":"622900"},{"code":"622921","name":"临夏县","parend_code":"622900"},{"code":"622922","name":"康乐县","parend_code":"622900"},{"code":"622923","name":"永靖县","parend_code":"622900"},{"code":"622924","name":"广河县","parend_code":"622900"},{"code":"622925","name":"和政县","parend_code":"622900"},{"code":"622926","name":"东乡族自治县","parend_code":"622900"},{"code":"622927","name":"积石山保安族东乡族撒拉族自治县","parend_code":"622900"}]},{"code":"623000","name":"甘南藏族自治州","parend_code":"620000","child_code":[{"code":"623001","name":"合作市","parend_code":"623000"},{"code":"623021","name":"临潭县","parend_code":"623000"},{"code":"623022","name":"卓尼县","parend_code":"623000"},{"code":"623023","name":"舟曲县","parend_code":"623000"},{"code":"623024","name":"迭部县","parend_code":"623000"},{"code":"623025","name":"玛曲县","parend_code":"623000"},{"code":"623026","name":"碌曲县","parend_code":"623000"},{"code":"623027","name":"夏河县","parend_code":"623000"}]}]},{"code":"630000","name":"青海省","parend_code":"0","child_code":[{"code":"630100","name":"西宁市","parend_code":"630000","child_code":[{"code":"630101","name":"市辖区","parend_code":"630100"},{"code":"630102","name":"城东区","parend_code":"630100"},{"code":"630103","name":"城中区","parend_code":"630100"},{"code":"630104","name":"城西区","parend_code":"630100"},{"code":"630105","name":"城北区","parend_code":"630100"},{"code":"630121","name":"大通回族土族自治县","parend_code":"630100"},{"code":"630122","name":"湟中县","parend_code":"630100"},{"code":"630123","name":"湟源县","parend_code":"630100"}]},{"code":"632100","name":"海东地区","parend_code":"630000","child_code":[{"code":"632121","name":"平安县","parend_code":"632100"},{"code":"632122","name":"民和回族土族自治县","parend_code":"632100"},{"code":"632123","name":"乐都县","parend_code":"632100"},{"code":"632126","name":"互助土族自治县","parend_code":"632100"},{"code":"632127","name":"化隆回族自治县","parend_code":"632100"},{"code":"632128","name":"循化撒拉族自治县","parend_code":"632100"}]},{"code":"632200","name":"海北藏族自治州","parend_code":"630000","child_code":[{"code":"632221","name":"门源回族自治县","parend_code":"632200"},{"code":"632222","name":"祁连县","parend_code":"632200"},{"code":"632223","name":"海晏县","parend_code":"632200"},{"code":"632224","name":"刚察县","parend_code":"632200"}]},{"code":"632300","name":"黄南藏族自治州","parend_code":"630000","child_code":[{"code":"632321","name":"同仁县","parend_code":"632300"},{"code":"632322","name":"尖扎县","parend_code":"632300"},{"code":"632323","name":"泽库县","parend_code":"632300"},{"code":"632324","name":"河南蒙古族自治县","parend_code":"632300"}]},{"code":"632500","name":"海南藏族自治州","parend_code":"630000","child_code":[{"code":"632521","name":"共和县","parend_code":"632500"},{"code":"632522","name":"同德县","parend_code":"632500"},{"code":"632523","name":"贵德县","parend_code":"632500"},{"code":"632524","name":"兴海县","parend_code":"632500"},{"code":"632525","name":"贵南县","parend_code":"632500"}]},{"code":"632600","name":"果洛藏族自治州","parend_code":"630000","child_code":[{"code":"632621","name":"玛沁县","parend_code":"632600"},{"code":"632622","name":"班玛县","parend_code":"632600"},{"code":"632623","name":"甘德县","parend_code":"632600"},{"code":"632624","name":"达日县","parend_code":"632600"},{"code":"632625","name":"久治县","parend_code":"632600"},{"code":"632626","name":"玛多县","parend_code":"632600"}]},{"code":"632700","name":"玉树藏族自治州","parend_code":"630000","child_code":[{"code":"632721","name":"玉树县","parend_code":"632700"},{"code":"632722","name":"杂多县","parend_code":"632700"},{"code":"632723","name":"称多县","parend_code":"632700"},{"code":"632724","name":"治多县","parend_code":"632700"},{"code":"632725","name":"囊谦县","parend_code":"632700"},{"code":"632726","name":"曲麻莱县","parend_code":"632700"}]},{"code":"632800","name":"海西蒙古族藏族自治州","parend_code":"630000","child_code":[{"code":"632801","name":"格尔木市","parend_code":"632800"},{"code":"632802","name":"德令哈市","parend_code":"632800"},{"code":"632821","name":"乌兰县","parend_code":"632800"},{"code":"632822","name":"都兰县","parend_code":"632800"},{"code":"632823","name":"天峻县","parend_code":"632800"}]}]},{"code":"640000","name":"宁夏回族自治区","parend_code":"0","child_code":[{"code":"640100","name":"银川市","parend_code":"640000","child_code":[{"code":"640101","name":"市辖区","parend_code":"640100"},{"code":"640104","name":"兴庆区","parend_code":"640100"},{"code":"640105","name":"西夏区","parend_code":"640100"},{"code":"640106","name":"金凤区","parend_code":"640100"},{"code":"640121","name":"永宁县","parend_code":"640100"},{"code":"640122","name":"贺兰县","parend_code":"640100"},{"code":"640181","name":"灵武市","parend_code":"640100"}]},{"code":"640200","name":"石嘴山市","parend_code":"640000","child_code":[{"code":"640201","name":"市辖区","parend_code":"640200"},{"code":"640202","name":"大武口区","parend_code":"640200"},{"code":"640205","name":"惠农区","parend_code":"640200"},{"code":"640221","name":"平罗县","parend_code":"640200"}]},{"code":"640300","name":"吴忠市","parend_code":"640000","child_code":[{"code":"640301","name":"市辖区","parend_code":"640300"},{"code":"640302","name":"利通区","parend_code":"640300"},{"code":"640323","name":"盐池县","parend_code":"640300"},{"code":"640324","name":"同心县","parend_code":"640300"},{"code":"640381","name":"青铜峡市","parend_code":"640300"}]},{"code":"640400","name":"固原市","parend_code":"640000","child_code":[{"code":"640401","name":"市辖区","parend_code":"640400"},{"code":"640402","name":"原州区","parend_code":"640400"},{"code":"640422","name":"西吉县","parend_code":"640400"},{"code":"640423","name":"隆德县","parend_code":"640400"},{"code":"640424","name":"泾源县","parend_code":"640400"},{"code":"640425","name":"彭阳县","parend_code":"640400"}]},{"code":"640500","name":"中卫市","parend_code":"640000","child_code":[{"code":"640501","name":"市辖区","parend_code":"640500"},{"code":"640502","name":"沙坡头区","parend_code":"640500"},{"code":"640521","name":"中宁县","parend_code":"640500"},{"code":"640522","name":"海原县","parend_code":"640500"}]}]},{"code":"650000","name":"新疆维吾尔自治区","parend_code":"0","child_code":[{"code":"650100","name":"乌鲁木齐市","parend_code":"650000","child_code":[{"code":"650101","name":"市辖区","parend_code":"650100"},{"code":"650102","name":"天山区","parend_code":"650100"},{"code":"650103","name":"沙依巴克区","parend_code":"650100"},{"code":"650104","name":"新市区","parend_code":"650100"},{"code":"650105","name":"水磨沟区","parend_code":"650100"},{"code":"650106","name":"头屯河区","parend_code":"650100"},{"code":"650107","name":"达坂城区","parend_code":"650100"},{"code":"650108","name":"东山区","parend_code":"650100"},{"code":"650121","name":"乌鲁木齐县","parend_code":"650100"}]},{"code":"650200","name":"克拉玛依市","parend_code":"650000","child_code":[{"code":"650201","name":"市辖区","parend_code":"650200"},{"code":"650202","name":"独山子区","parend_code":"650200"},{"code":"650203","name":"克拉玛依区","parend_code":"650200"},{"code":"650204","name":"白碱滩区","parend_code":"650200"},{"code":"650205","name":"乌尔禾区","parend_code":"650200"}]},{"code":"652100","name":"吐鲁番地区","parend_code":"650000","child_code":[{"code":"652101","name":"吐鲁番市","parend_code":"652100"},{"code":"652122","name":"鄯善县","parend_code":"652100"},{"code":"652123","name":"托克逊县","parend_code":"652100"}]},{"code":"652200","name":"哈密地区","parend_code":"650000","child_code":[{"code":"652201","name":"哈密市","parend_code":"652200"},{"code":"652222","name":"巴里坤哈萨克自治县","parend_code":"652200"},{"code":"652223","name":"伊吾县","parend_code":"652200"}]},{"code":"652300","name":"昌吉回族自治州","parend_code":"650000","child_code":[{"code":"652301","name":"昌吉市","parend_code":"652300"},{"code":"652302","name":"阜康市","parend_code":"652300"},{"code":"652303","name":"米泉市","parend_code":"652300"},{"code":"652323","name":"呼图壁县","parend_code":"652300"},{"code":"652324","name":"玛纳斯县","parend_code":"652300"},{"code":"652325","name":"奇台县","parend_code":"652300"},{"code":"652327","name":"吉木萨尔县","parend_code":"652300"},{"code":"652328","name":"木垒哈萨克自治县","parend_code":"652300"}]},{"code":"652700","name":"博尔塔拉蒙古自治州","parend_code":"650000","child_code":[{"code":"652701","name":"博乐市","parend_code":"652700"},{"code":"652722","name":"精河县","parend_code":"652700"},{"code":"652723","name":"温泉县","parend_code":"652700"}]},{"code":"652800","name":"巴音郭楞蒙古自治州","parend_code":"650000","child_code":[{"code":"652801","name":"库尔勒市","parend_code":"652800"},{"code":"652822","name":"轮台县","parend_code":"652800"},{"code":"652823","name":"尉犁县","parend_code":"652800"},{"code":"652824","name":"若羌县","parend_code":"652800"},{"code":"652825","name":"且末县","parend_code":"652800"},{"code":"652826","name":"焉耆回族自治县","parend_code":"652800"},{"code":"652827","name":"和静县","parend_code":"652800"},{"code":"652828","name":"和硕县","parend_code":"652800"},{"code":"652829","name":"博湖县","parend_code":"652800"}]},{"code":"652900","name":"阿克苏地区","parend_code":"650000","child_code":[{"code":"652901","name":"阿克苏市","parend_code":"652900"},{"code":"652922","name":"温宿县","parend_code":"652900"},{"code":"652923","name":"库车县","parend_code":"652900"},{"code":"652924","name":"沙雅县","parend_code":"652900"},{"code":"652925","name":"新和县","parend_code":"652900"},{"code":"652926","name":"拜城县","parend_code":"652900"},{"code":"652927","name":"乌什县","parend_code":"652900"},{"code":"652928","name":"阿瓦提县","parend_code":"652900"},{"code":"652929","name":"柯坪县","parend_code":"652900"}]},{"code":"653000","name":"克孜勒苏柯尔克孜自治州","parend_code":"650000","child_code":[{"code":"653001","name":"阿图什市","parend_code":"653000"},{"code":"653022","name":"阿克陶县","parend_code":"653000"},{"code":"653023","name":"阿合奇县","parend_code":"653000"},{"code":"653024","name":"乌恰县","parend_code":"653000"}]},{"code":"653100","name":"喀什地区","parend_code":"650000","child_code":[{"code":"653101","name":"喀什市","parend_code":"653100"},{"code":"653121","name":"疏附县","parend_code":"653100"},{"code":"653122","name":"疏勒县","parend_code":"653100"},{"code":"653123","name":"英吉沙县","parend_code":"653100"},{"code":"653124","name":"泽普县","parend_code":"653100"},{"code":"653125","name":"莎车县","parend_code":"653100"},{"code":"653126","name":"叶城县","parend_code":"653100"},{"code":"653127","name":"麦盖提县","parend_code":"653100"},{"code":"653128","name":"岳普湖县","parend_code":"653100"},{"code":"653129","name":"伽师县","parend_code":"653100"},{"code":"653130","name":"巴楚县","parend_code":"653100"},{"code":"653131","name":"塔什库尔干塔吉克自治县","parend_code":"653100"}]},{"code":"653200","name":"和田地区","parend_code":"650000","child_code":[{"code":"653201","name":"和田市","parend_code":"653200"},{"code":"653221","name":"和田县","parend_code":"653200"},{"code":"653222","name":"墨玉县","parend_code":"653200"},{"code":"653223","name":"皮山县","parend_code":"653200"},{"code":"653224","name":"洛浦县","parend_code":"653200"},{"code":"653225","name":"策勒县","parend_code":"653200"},{"code":"653226","name":"于田县","parend_code":"653200"},{"code":"653227","name":"民丰县","parend_code":"653200"}]},{"code":"654000","name":"伊犁哈萨克自治州","parend_code":"650000","child_code":[{"code":"654002","name":"伊宁市","parend_code":"654000"},{"code":"654003","name":"奎屯市","parend_code":"654000"},{"code":"654021","name":"伊宁县","parend_code":"654000"},{"code":"654022","name":"察布查尔锡伯自治县","parend_code":"654000"},{"code":"654023","name":"霍城县","parend_code":"654000"},{"code":"654024","name":"巩留县","parend_code":"654000"},{"code":"654025","name":"新源县","parend_code":"654000"},{"code":"654026","name":"昭苏县","parend_code":"654000"},{"code":"654027","name":"特克斯县","parend_code":"654000"},{"code":"654028","name":"尼勒克县","parend_code":"654000"}]},{"code":"654200","name":"塔城地区","parend_code":"650000","child_code":[{"code":"654201","name":"塔城市","parend_code":"654200"},{"code":"654202","name":"乌苏市","parend_code":"654200"},{"code":"654221","name":"额敏县","parend_code":"654200"},{"code":"654223","name":"沙湾县","parend_code":"654200"},{"code":"654224","name":"托里县","parend_code":"654200"},{"code":"654225","name":"裕民县","parend_code":"654200"},{"code":"654226","name":"和布克赛尔蒙古自治县","parend_code":"654200"}]},{"code":"654300","name":"阿勒泰地区","parend_code":"650000","child_code":[{"code":"654301","name":"阿勒泰市","parend_code":"654300"},{"code":"654321","name":"布尔津县","parend_code":"654300"},{"code":"654322","name":"富蕴县","parend_code":"654300"},{"code":"654323","name":"福海县","parend_code":"654300"},{"code":"654324","name":"哈巴河县","parend_code":"654300"},{"code":"654325","name":"青河县","parend_code":"654300"},{"code":"654326","name":"吉木乃县","parend_code":"654300"}]},{"code":"659000","name":"省直辖行政单位","parend_code":"650000","child_code":[{"code":"659001","name":"石河子市","parend_code":"659000"},{"code":"659002","name":"阿拉尔市","parend_code":"659000"},{"code":"659003","name":"图木舒克市","parend_code":"659000"},{"code":"659004","name":"五家渠市","parend_code":"659000"}]}]},{"code":"710000","name":"台湾省","parend_code":"0","child_code":[]},{"code":"810000","name":"香港特别行政区","parend_code":"0","child_code":[]},{"code":"820000","name":"澳门特别行政区","parend_code":"0","child_code":[]}]

/***/ }),

/***/ 421:
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
  }, [_c('el-breadcrumb-item', [_vm._v("信息管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("销往单位管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "单位名称",
      "prop": "hospital_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "销往单位"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.hospital_name),
      callback: function($$v) {
        _vm.$set(_vm.params, "hospital_name", $$v)
      },
      expression: "params.hospital_name"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "单位类型",
      "prop": "hospital_type"
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
      value: (_vm.params.hospital_type),
      callback: function($$v) {
        _vm.$set(_vm.params, "hospital_type", $$v)
      },
      expression: "params.hospital_type"
    }
  }, [_c('el-option', {
    key: "销售单位",
    attrs: {
      "label": "销售单位",
      "value": "销售单位"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "调货单位",
    attrs: {
      "label": "调货单位",
      "value": "调货单位"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',31,') > -1),
      expression: "authCode.indexOf(',31,') > -1"
    }],
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
      value: (_vm.authCode.indexOf(',31,') > -1),
      expression: "authCode.indexOf(',31,') > -1"
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
      value: (_vm.authCode.indexOf(',28,') > -1),
      expression: "authCode.indexOf(',28,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.addShow
    }
  }, [_vm._v("新增")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.hospitals,
      "size": "mini",
      "stripe": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "prop": "hospital_name",
      "label": "单位名称"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hospital_type",
      "label": "单位类型",
      "width": "120px"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hospital_area",
      "label": "单位区域"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hospital_address",
      "label": "单位地址"
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
            value: (_vm.authCode.indexOf(',29,') > -1),
            expression: "authCode.indexOf(',29,') > -1"
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
            value: (_vm.authCode.indexOf(',30,') > -1),
            expression: "authCode.indexOf(',30,') > -1"
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
      "page-sizes": [5, 10, 50, 100],
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
      "title": _vm.title == 1 ? '新增单位' : '修改单位',
      "width": "500px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-form', {
    ref: "hospital",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.hospital,
      "status-icon": "",
      "rules": _vm.hospitalRule,
      "label-width": "80px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "单位类型",
      "prop": "hospital_type"
    }
  }, [_c('el-checkbox-group', {
    model: {
      value: (_vm.hospital.hospital_type),
      callback: function($$v) {
        _vm.$set(_vm.hospital, "hospital_type", $$v)
      },
      expression: "hospital.hospital_type"
    }
  }, [_c('el-checkbox', {
    attrs: {
      "label": "销售单位"
    }
  }, [_vm._v("销售单位")]), _vm._v(" "), _c('el-checkbox', {
    attrs: {
      "label": "调货单位"
    }
  }, [_vm._v("调货单位")])], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "单位名称",
      "prop": "hospital_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "350px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 50,
      "placeholder": "请输入销售机构名称"
    },
    model: {
      value: (_vm.hospital.hospital_name),
      callback: function($$v) {
        _vm.$set(_vm.hospital, "hospital_name", $$v)
      },
      expression: "hospital.hospital_name"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "单位区域",
      "prop": "hospital_area"
    }
  }, [_c('el-cascader', {
    staticStyle: {
      "width": "350px"
    },
    attrs: {
      "options": _vm.options,
      "props": _vm.props,
      "change-on-select": true
    },
    model: {
      value: (_vm.hospital.hospital_area),
      callback: function($$v) {
        _vm.$set(_vm.hospital, "hospital_area", $$v)
      },
      expression: "hospital.hospital_area"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "单位地址",
      "prop": "hospital_address"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "350px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 100,
      "placeholder": "请输入机构地址"
    },
    model: {
      value: (_vm.hospital.hospital_address),
      callback: function($$v) {
        _vm.$set(_vm.hospital, "hospital_address", $$v)
      },
      expression: "hospital.hospital_address"
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
      "loading": _vm.loading,
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.add('hospital')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-3e73cb4a", module.exports)
  }
}

/***/ }),

/***/ 422:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(423);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-b7287018!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./contacts.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-b7287018!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./contacts.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 423:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 424:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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

		var validateName = function validateName(rule, value, callback) {
			if (!value) {
				callback(new Error('请再输入销售医院'));
			} else {
				if (_this.title == 1) {
					_this.jquery("/iae/contacts/exitsContactsName", { contact: _this.contact }, function (res) {
						if (res.message.length > 0) {
							callback(new Error('该联系人已存在'));
						} else {
							callback();
						}
					});
				} else {
					callback();
				}
			}
		};
		var validatePhone = function validatePhone(rule, value, callback) {
			if (value && !/^1[3|4|5|7|8|9][0-9]{9}$/.test(value)) {
				callback(new Error('请再输入正确的手机号码'));
			} else {
				callback();
			}
		};
		return {
			title: 1,
			dialogFormVisible: false,
			loading: false,
			authCode: "",
			contact: {
				contacts_name: "",
				contacts_phone: "",
				contact_remark: "",
				account_name: "",
				account_number: "",
				account_address: "",
				contact_type: ['佣金品种']
			},
			contactsRule: {
				contacts_name: [{ validator: validateName, labelname: '联系人', trigger: 'blur' }],
				contacts_phone: [{ validator: validatePhone, trigger: 'blur' }]
			},
			contacts: [],
			pageNum: 10,
			currentPage: 1,
			count: 0,
			params: {
				contacts_name: ""
			}
		};
	},
	activated: function activated() {
		this.getContactsList();
	},
	mounted: function mounted() {
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},

	methods: {
		formatterAccount: function formatterAccount(row, column, cellValue) {
			if (row.contact_type.indexOf("调货") > -1 || row.contact_type.indexOf("业务员") > -1) {
				return cellValue;
			} else {
				return "-";
			}
		},
		editRow: function editRow(scope) {
			//编辑药品信息
			this.dialogFormVisible = true;
			this.title = 2;
			var temp = JSON.stringify(scope.row);
			this.contact = JSON.parse(temp);
			this.contact.front_message = temp;
			this.contact.contact_type = this.contact.contact_type ? this.contact.contact_type.split(",") : [];
			var _self = this;
			setTimeout(function () {
				_self.$refs["contact"].clearValidate();
			});
		},
		deleteRow: function deleteRow(scope) {
			var _this2 = this;

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
			this.jquery('/iae/contacts/deleteContacts', {
				contacts_id: scope.row.contacts_id
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getContactsList();
				_self.dialogFormVisible = false;
			});
		},
		addShow: function addShow() {
			this.contact = {
				contacts_name: "",
				contacts_phone: "",
				contact_remark: "",
				account_name: "",
				account_number: "",
				account_address: "",
				contact_type: ['佣金品种']
			};
			var _self = this;
			setTimeout(function () {
				_self.$refs["contact"].clearValidate();
			});
			this.title = 1;
			this.dialogFormVisible = true;
		},
		add: function add(formName) {
			var _this3 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this3.loading = true;
					if (_this3.title == 1) {
						_this3.jquery('/iae/contacts/saveContacts', _self.contact, function (res) {
							_self.$message({ showClose: true, message: '新增成功', type: 'success' });
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getContactsList();
						});
					} else {
						_this3.jquery('/iae/contacts/editContacts', _self.contact, function (res) {
							_self.$message({ showClose: true, message: '修改成功', type: 'success' });
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getContactsList();
						});
					}
				} else {
					return false;
				}
			});
		},
		searchContactsList: function searchContactsList() {
			this.currentPage = 1;
			this.getContactsList();
		},
		getContactsList: function getContactsList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 10;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/contacts/getContacts', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.contacts = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getContactsList();
		},
		handleSizeChange: function handleSizeChange(val) {
			this.currentPage = 1;
			this.getContactsList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getContactsList();
		}
	}
};

/***/ }),

/***/ 425:
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
  }, [_c('el-breadcrumb-item', [_vm._v("信息管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("联系人管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "联系人",
      "prop": "contacts_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "联系人"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.contacts_name),
      callback: function($$v) {
        _vm.$set(_vm.params, "contacts_name", $$v)
      },
      expression: "params.contacts_name"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "联系人类型",
      "prop": "contact_type"
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
      value: (_vm.params.contact_type),
      callback: function($$v) {
        _vm.$set(_vm.params, "contact_type", $$v)
      },
      expression: "params.contact_type"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _c('el-option', {
    key: "佣金品种",
    attrs: {
      "label": "佣金品种",
      "value": "佣金品种"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "高打品种",
    attrs: {
      "label": "高打品种",
      "value": "高打品种"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "调货",
    attrs: {
      "label": "调货",
      "value": "调货"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "业务员",
    attrs: {
      "label": "业务员",
      "value": "业务员"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',35,') > -1),
      expression: "authCode.indexOf(',35,') > -1"
    }],
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
      value: (_vm.authCode.indexOf(',35,') > -1),
      expression: "authCode.indexOf(',35,') > -1"
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
      value: (_vm.authCode.indexOf(',32,') > -1),
      expression: "authCode.indexOf(',32,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.addShow
    }
  }, [_vm._v("新增")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.contacts,
      "size": "mini",
      "stripe": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "联系人"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contact_type",
      "label": "联系人类型"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_phone",
      "label": "电话"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "account_name",
      "label": "积分账号姓名",
      "formatter": _vm.formatterAccount
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "account_number",
      "label": "积分账号",
      "formatter": _vm.formatterAccount
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "account_address",
      "label": "账号地址",
      "formatter": _vm.formatterAccount
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contact_remark",
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
            value: (_vm.authCode.indexOf(',34,') > -1),
            expression: "authCode.indexOf(',34,') > -1"
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
            value: (_vm.authCode.indexOf(',33,') > -1),
            expression: "authCode.indexOf(',33,') > -1"
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
      "page-sizes": [5, 10, 50, 100],
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
      "title": _vm.title == 1 ? '新增联系人' : '修改联系人',
      "width": "600px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-form', {
    ref: "contact",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.contact,
      "status-icon": "",
      "rules": _vm.contactsRule,
      "inline": true,
      "label-width": "90px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "联系人类型",
      "prop": "contact_type"
    }
  }, [_c('el-checkbox-group', {
    model: {
      value: (_vm.contact.contact_type),
      callback: function($$v) {
        _vm.$set(_vm.contact, "contact_type", $$v)
      },
      expression: "contact.contact_type"
    }
  }, [_c('el-checkbox', {
    attrs: {
      "label": "佣金品种"
    }
  }), _vm._v(" "), _c('el-checkbox', {
    attrs: {
      "label": "高打品种"
    }
  }), _vm._v(" "), _c('el-checkbox', {
    attrs: {
      "label": "调货"
    }
  }), _vm._v(" "), _c('el-checkbox', {
    attrs: {
      "label": "业务员"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "联系人",
      "prop": "contacts_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "175px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 20,
      "placeholder": "请输入联系人姓名"
    },
    model: {
      value: (_vm.contact.contacts_name),
      callback: function($$v) {
        _vm.$set(_vm.contact, "contacts_name", $$v)
      },
      expression: "contact.contacts_name"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "手机号码",
      "prop": "contacts_phone"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "175px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 11,
      "placeholder": "请输入联系人手机号码"
    },
    model: {
      value: (_vm.contact.contacts_phone),
      callback: function($$v) {
        _vm.$set(_vm.contact, "contacts_phone", $$v)
      },
      expression: "contact.contacts_phone"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.contact.contact_type.join(',').indexOf('调货') > -1 || _vm.contact.contact_type.join(',').indexOf('业务员') > -1),
      expression: "contact.contact_type.join(',').indexOf('调货') > -1 || contact.contact_type.join(',').indexOf('业务员') > -1"
    }],
    attrs: {
      "label": "积分账号",
      "prop": "account_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "175px"
    },
    attrs: {
      "auto-complete": "off",
      "placeholder": "请输入积分账号"
    },
    model: {
      value: (_vm.contact.account_number),
      callback: function($$v) {
        _vm.$set(_vm.contact, "account_number", $$v)
      },
      expression: "contact.account_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.contact.contact_type.join(',').indexOf('调货') > -1 || _vm.contact.contact_type.join(',').indexOf('业务员') > -1),
      expression: "contact.contact_type.join(',').indexOf('调货') > -1 || contact.contact_type.join(',').indexOf('业务员') > -1"
    }],
    attrs: {
      "label": "账号姓名",
      "prop": "account_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "175px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 20,
      "placeholder": "请输入积分账号姓名"
    },
    model: {
      value: (_vm.contact.account_name),
      callback: function($$v) {
        _vm.$set(_vm.contact, "account_name", $$v)
      },
      expression: "contact.account_name"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.contact.contact_type.join(',').indexOf('调货') > -1 || _vm.contact.contact_type.join(',').indexOf('业务员') > -1),
      expression: "contact.contact_type.join(',').indexOf('调货') > -1 || contact.contact_type.join(',').indexOf('业务员') > -1"
    }],
    attrs: {
      "label": "账号地址",
      "prop": "account_address"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "453px"
    },
    attrs: {
      "auto-complete": "off",
      "placeholder": "请输入账号地址"
    },
    model: {
      value: (_vm.contact.account_address),
      callback: function($$v) {
        _vm.$set(_vm.contact, "account_address", $$v)
      },
      expression: "contact.account_address"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备注",
      "prop": "contact_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "453px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 500,
      "placeholder": "请输入备注"
    },
    model: {
      value: (_vm.contact.contact_remark),
      callback: function($$v) {
        _vm.$set(_vm.contact, "contact_remark", $$v)
      },
      expression: "contact.contact_remark"
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
        _vm.add('contact')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-b7287018", module.exports)
  }
}

/***/ }),

/***/ 426:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(427);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-2f1ba8e1!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./business.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-2f1ba8e1!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./business.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 427:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 428:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
			dialogFormVisible: false,
			business: {
				business_name: "",
				business_mark: ""
			},
			businessRule: {
				business_name: [{ required: true, message: '请输入商业名称', trigger: 'blur' }]
			},
			title: 1,
			authCode: "",
			loading: false,
			businessList: [],
			pageNum: 10,
			currentPage: 1,
			count: 0,
			deleteId: null,
			params: {
				business_name: ""
			}
		};
	},
	activated: function activated() {
		this.getBusinessList();
	},
	mounted: function mounted() {
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},

	methods: {
		editRow: function editRow(scope) {
			//编辑药品信息
			this.dialogFormVisible = true;
			this.title = 2;
			var temp = JSON.stringify(scope.row);
			this.business = JSON.parse(temp);
			this.business.front_message = temp;
			var _self = this;
			setTimeout(function () {
				_self.$refs["business"].clearValidate();
			});
		},
		deleteRow: function deleteRow(scope) {
			var _this = this;

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
			this.jquery('/iae/business/deleteBusiness', {
				business_id: scope.row.business_id
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getBusinessList();
				_self.dialogFormVisible = false;
			});
		},
		addShow: function addShow() {
			this.business = {
				business_name: "",
				business_mark: ""
			};
			this.title = 1;
			this.dialogFormVisible = true;
		},
		add: function add(formName) {
			var _this2 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this2.loading = true;
					if (_this2.title == 1) {
						_this2.jquery('/iae/business/saveBusiness', _self.business, function (res) {
							_self.$message({ showClose: true, message: '新增成功', type: 'success' });
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getBusinessList();
						});
					} else {
						_this2.jquery('/iae/business/editBusiness', _self.business, function (res) {
							_self.$message({ showClose: true, message: '修改成功', type: 'success' });
							_self.loading = false;
							_self.dialogFormVisible = false;
							_self.getBusinessList();
						});
					}
				} else {
					return false;
				}
			});
		},
		searchHospitalsList: function searchHospitalsList() {
			this.currentPage = 1;
			this.getBusinessList();
		},
		getBusinessList: function getBusinessList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 10;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/business/getBusiness', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.businessList = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getBusinessList();
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getBusinessList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getBusinessList();
		}
	}
};

/***/ }),

/***/ 429:
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
  }, [_c('el-breadcrumb-item', [_vm._v("信息管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("商业管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "商业名称",
      "prop": "business_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "商业名称"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.business_name),
      callback: function($$v) {
        _vm.$set(_vm.params, "business_name", $$v)
      },
      expression: "params.business_name"
    }
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',89,') > -1),
      expression: "authCode.indexOf(',89,') > -1"
    }],
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
      value: (_vm.authCode.indexOf(',89,') > -1),
      expression: "authCode.indexOf(',89,') > -1"
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
      value: (_vm.authCode.indexOf(',92,') > -1),
      expression: "authCode.indexOf(',92,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.addShow
    }
  }, [_vm._v("新增")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.businessList,
      "size": "mini",
      "stripe": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业名称"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_mark",
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
            name: "dbClick",
            rawName: "v-dbClick"
          }, {
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',90,') > -1),
            expression: "authCode.indexOf(',90,') > -1"
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
            value: (_vm.authCode.indexOf(',91,') > -1),
            expression: "authCode.indexOf(',91,') > -1"
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
      "page-sizes": [5, 10, 50, 100],
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
      "title": _vm.title == 1 ? '新增商业' : '修改商业',
      "width": "500px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-form', {
    ref: "business",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.business,
      "status-icon": "",
      "rules": _vm.businessRule,
      "label-width": "80px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "商业名称",
      "prop": "business_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "350px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 50,
      "placeholder": "请输入商业名称"
    },
    model: {
      value: (_vm.business.business_name),
      callback: function($$v) {
        _vm.$set(_vm.business, "business_name", $$v)
      },
      expression: "business.business_name"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "机构地址",
      "prop": "business_mark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "350px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 100,
      "placeholder": "请输入备注"
    },
    model: {
      value: (_vm.business.business_mark),
      callback: function($$v) {
        _vm.$set(_vm.business, "business_mark", $$v)
      },
      expression: "business.business_mark"
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
      "loading": _vm.loading,
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.add('business')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-2f1ba8e1", module.exports)
  }
}

/***/ }),

/***/ 430:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(431);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-54fd65ee!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./tag.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-54fd65ee!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./tag.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 431:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 432:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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

		var validateTag = function validateTag(rule, value, callback) {
			var _self = _this;
			if (value === '') {
				callback(new Error('请输入标签名称'));
			} else {
				_this.jquery('/iae/tag/exitsTag', _self.tag, function (res) {
					if (_self.title == 1 && res.message.length > 0) {
						callback(new Error('该标签已存在'));
					} else {
						callback();
					}
				});
			}
		};
		return {
			title: 1,
			dialogFormVisible: false,
			loading: false,
			authCode: "",
			tag: {
				tag_name: "",
				tag_type: ""
			},
			tagRule: {
				tag_name: [{ validator: validateTag, trigger: 'blur' }],
				tag_type: [{ required: true, message: '请选择标签类型', trigger: 'change' }]
			},
			tags: [],
			pageNum: 10,
			currentPage: 1,
			count: 0,
			params: {
				tag_name: "",
				tag_type: ""
			}
		};
	},
	activated: function activated() {
		this.getTagsList();
	},
	mounted: function mounted() {
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},

	methods: {
		formatTagType: function formatTagType(row, column, cellValue, index) {
			if (cellValue == "0") {
				return "运营方式";
			} else if (cellValue == "1") {
				return "医院科室";
			} else if (cellValue == "2") {
				return "药品分类";
			} else if (cellValue == "3") {
				return "其它";
			}
		},
		editRow: function editRow(scope) {
			//编辑药品信息
			this.dialogFormVisible = true;
			this.title = 2;
			var temp = JSON.stringify(scope.row);
			this.tag = JSON.parse(temp);
			this.tag.front_message = temp;
			var _self = this;
			setTimeout(function () {
				_self.$refs["tag"].clearValidate();
			});
		},
		deleteRow: function deleteRow(scope) {
			var _this2 = this;

			if (scope.row.tag_quote_num == "0") {
				this.$confirm('是否删除?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(function () {
					_this2.deleteItem(scope);
				}).catch(function () {});
			} else {
				this.$alert('引用数据大于0，不可删除', '提示', {
					confirmButtonText: '确定',
					callback: function callback(action) {}
				});
			}
		},
		deleteItem: function deleteItem(scope) {
			var _self = this;
			this.jquery('/iae/tag/deleteTag', {
				tag_id: scope.row.tag_id
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getTagsList();
				_self.dialogFormVisible = false;
			});
		},
		addShow: function addShow() {
			this.tag = {
				tag_name: "",
				tag_type: ""
			};
			this.title = 1;
			this.dialogFormVisible = true;
			var _self = this;
			setTimeout(function () {
				_self.$refs["tag"].clearValidate();
			});
		},
		add: function add(formName) {
			var _this3 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this3.loading = true;
					if (_this3.title == 1) {
						_this3.jquery('/iae/tag/saveTag', _self.tag, function (res) {
							_self.$message({ showClose: true, message: '新增成功', type: 'success' });
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getTagsList();
						});
					} else {
						_this3.jquery('/iae/tag/editTag', _self.tag, function (res) {
							_self.$message({ showClose: true, message: '修改成功', type: 'success' });
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getTagsList();
						});
					}
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		},
		searchContactsList: function searchContactsList() {
			this.currentPage = 1;
			this.getTagsList();
		},
		getTagsList: function getTagsList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 10;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/tag/getTags', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.tags = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getTagsList();
		},
		handleSizeChange: function handleSizeChange(val) {
			this.currentPage = 1;
			this.pageNum = val;
			this.getTagsList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getTagsList();
		}
	}
};

/***/ }),

/***/ 433:
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
  }, [_c('el-breadcrumb-item', [_vm._v("信息管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("标签管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "标签名称",
      "prop": "tag_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "标签名称"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.tag_name),
      callback: function($$v) {
        _vm.$set(_vm.params, "tag_name", $$v)
      },
      expression: "params.tag_name"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "标签类型",
      "prop": "tag_type"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.params.tag_type),
      callback: function($$v) {
        _vm.$set(_vm.params, "tag_type", $$v)
      },
      expression: "params.tag_type"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "请选择",
      "value": ""
    }
  }), _vm._v(" "), _c('el-option', {
    key: "1",
    attrs: {
      "label": "医院科室",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "药品分类",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "0",
    attrs: {
      "label": "运营方式",
      "value": "0"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "其它",
      "value": "3"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',94,') > -1),
      expression: "authCode.indexOf(',94,') > -1"
    }],
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
      value: (_vm.authCode.indexOf(',94,') > -1),
      expression: "authCode.indexOf(',94,') > -1"
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
      value: (_vm.authCode.indexOf(',97,') > -1),
      expression: "authCode.indexOf(',97,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.addShow
    }
  }, [_vm._v("新增")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.tags,
      "size": "mini",
      "stripe": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "prop": "tag_name",
      "label": "标签名称"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "tag_type",
      "label": "标签类型",
      "formatter": _vm.formatTagType
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "tag_quote_num",
      "label": "引用次数"
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
            value: (_vm.authCode.indexOf(',96,') > -1),
            expression: "authCode.indexOf(',96,') > -1"
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
            value: (_vm.authCode.indexOf(',95,') > -1),
            expression: "authCode.indexOf(',95,') > -1"
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
      "page-sizes": [5, 10, 50, 100],
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
      "title": _vm.title == 1 ? '新增标签' : '修改标签',
      "width": "500px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-form', {
    ref: "tag",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.tag,
      "status-icon": "",
      "rules": _vm.tagRule,
      "label-width": "90px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "标签类型",
      "prop": "tag_type"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "350px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.tag.tag_type),
      callback: function($$v) {
        _vm.$set(_vm.tag, "tag_type", $$v)
      },
      expression: "tag.tag_type"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "请选择",
      "value": ""
    }
  }), _vm._v(" "), _c('el-option', {
    key: "1",
    attrs: {
      "label": "医院科室",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "药品分类",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "0",
    attrs: {
      "label": "运营方式",
      "value": "0"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "其它",
      "value": "3"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "标签名称",
      "prop": "tag_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "350px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 20,
      "placeholder": "请输入标签名称"
    },
    model: {
      value: (_vm.tag.tag_name),
      callback: function($$v) {
        _vm.$set(_vm.tag, "tag_name", $$v)
      },
      expression: "tag.tag_name"
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
        _vm.add('tag')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-54fd65ee", module.exports)
  }
}

/***/ }),

/***/ 434:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(435);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-55143fe1!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./account.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-55143fe1!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./account.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 435:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 436:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
			title: 1,
			dialogFormVisible: false,
			loading: false,
			authCode: "",
			account: {
				account_number: "",
				account_person: ""
			},
			accountRule: {
				account_number: [{ required: true, message: '请输入积分账号', trigger: 'blur' }]
			},
			accounts: [],
			pageNum: 10,
			currentPage: 1,
			count: 0,
			params: {
				account_person: ""
			}
		};
	},
	activated: function activated() {
		this.getAccountsList();
	},
	mounted: function mounted() {
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},

	methods: {
		formatterType: function formatterType(row, column, cellValue) {
			return cellValue == "0" ? "回款账户" : "收款账户";
		},
		editRow: function editRow(scope) {
			//编辑药品信息
			this.dialogFormVisible = true;
			this.title = 2;
			var temp = JSON.stringify(scope.row);
			this.account = JSON.parse(temp);
			this.account.front_account = temp;
			var _self = this;
			setTimeout(function () {
				_self.$refs["account"].clearValidate();
			});
		},
		deleteRow: function deleteRow(scope) {
			var _this = this;

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
			this.jquery('/iae/bankaccount/deleteAccount', {
				account_id: scope.row.account_id
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getAccountsList();
				_self.dialogFormVisible = false;
			});
		},
		addShow: function addShow() {
			this.title = 1;
			this.account = {
				account_number: "",
				account_person: ""
			};
			this.dialogFormVisible = true;
		},
		add: function add(formName) {
			var _this2 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this2.loading = true;
					if (_this2.title == 1) {
						_this2.jquery('/iae/bankaccount/saveAccounts', _self.account, function (res) {
							_self.$message({ showClose: true, message: '新增成功', type: 'success' });
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getAccountsList();
						});
					} else {
						_this2.jquery('/iae/bankaccount/editAccounts', _self.account, function (res) {
							_self.$message({ showClose: true, message: '修改成功', type: 'success' });
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getAccountsList();
						});
					}
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		},
		getAccountsList: function getAccountsList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 10;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/bankaccount/getAccounts', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.accounts = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getAccountsList();
		},
		handleSizeChange: function handleSizeChange(val) {
			this.currentPage = 1;
			this.getAccountsList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getAccountsList();
		}
	}
};

/***/ }),

/***/ 437:
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
  }, [_c('el-breadcrumb-item', [_vm._v("财务管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("积分账号管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "积分账号姓名",
      "prop": "contacts_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "持卡人"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.account_person),
      callback: function($$v) {
        _vm.$set(_vm.params, "account_person", $$v)
      },
      expression: "params.account_person"
    }
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',67,') > -1),
      expression: "authCode.indexOf(',67,') > -1"
    }],
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
      value: (_vm.authCode.indexOf(',67,') > -1),
      expression: "authCode.indexOf(',67,') > -1"
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
      value: (_vm.authCode.indexOf(',68,') > -1),
      expression: "authCode.indexOf(',68,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.addShow
    }
  }, [_vm._v("新增")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.accounts,
      "size": "mini",
      "stripe": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "prop": "account_number",
      "label": "积分账号"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "account_person",
      "label": "积分账号姓名"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "money",
      "label": "积分"
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
            value: (_vm.authCode.indexOf(',69,') > -1),
            expression: "authCode.indexOf(',69,') > -1"
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
            value: (_vm.authCode.indexOf(',70,') > -1),
            expression: "authCode.indexOf(',70,') > -1"
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
      "page-sizes": [5, 10, 50, 100],
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
      "title": _vm.title == 1 ? '新增积分账号' : '修改积分账号',
      "width": "500px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-form', {
    ref: "account",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.account,
      "status-icon": "",
      "rules": _vm.accountRule,
      "label-width": "110px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "积分账号",
      "prop": "account_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "340px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 20,
      "placeholder": "请输入积分账号"
    },
    model: {
      value: (_vm.account.account_number),
      callback: function($$v) {
        _vm.$set(_vm.account, "account_number", $$v)
      },
      expression: "account.account_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "积分账号姓名",
      "prop": "account_person"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "340px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 11,
      "placeholder": "请输入积分账号姓名"
    },
    model: {
      value: (_vm.account.account_person),
      callback: function($$v) {
        _vm.$set(_vm.account, "account_person", $$v)
      },
      expression: "account.account_person"
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
        _vm.add('account')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-55143fe1", module.exports)
  }
}

/***/ }),

/***/ 438:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(439);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-0082c912!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./accountDetail.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-0082c912!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./accountDetail.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 439:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 440:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

exports.default = {
	data: function data() {
		var _this = this;

		var validateMoney = function validateMoney(rule, value, callback) {
			var reg = /^(([1-9]\d+(.[0-9]{1,4})?|\d(.[0-9]{1,4})?)|([-]([1-9]\d+(.[0-9]{1,4})?|\d(.[0-9]{1,4})?)))$/;
			if (_this.isEmpty(value)) {
				callback(new Error('请再输入金额'));
			} else if (!reg.test(value)) {
				callback(new Error('请再输入正确的金额'));
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
			title: 1,
			dialogFormVisible: false,
			loading: false,
			authCode: "",
			accountDetail: {
				account_detail_time: "",
				account_detail_money: "",
				account_detail_mark: "",
				account_id: ""
			},
			accountDetailRule: {
				account_detail_time: [{ required: true, message: '请选择日期', trigger: 'blur' }],
				account_detail_money: [{ validator: validateMoney, trigger: 'blur' }],
				account_detail_mark: [{ required: true, message: '请输入事项', trigger: 'blur' }],
				account_id: [{ required: true, message: '请选择账号', trigger: 'change' }]
			},
			accountsDetails: [],
			accounts: [], //账号列表
			pageNum: 10,
			currentPage: 1,
			count: 0,
			params: {
				account_id: "",
				account_detail_time: [],
				textarea: "",
				account_type: ""
			}
		};
	},
	activated: function activated() {
		this.getAccountsDetailsList();
		this.getAccounts();
	},
	mounted: function mounted() {
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},

	methods: {
		getAccounts: function getAccounts() {
			var _self = this;
			this.jquery('/iae/bankaccount/getAllAccounts', {}, function (res) {
				_self.accounts = res.message;
			});
		},
		editRow: function editRow(scope) {
			//编辑药品信息
			this.dialogFormVisible = true;
			this.title = 2;
			var temp = JSON.stringify(scope.row);
			this.accountDetail = JSON.parse(temp);
			this.accountDetail.front_accountDetail = temp;
			var _self = this;
			setTimeout(function () {
				_self.$refs["accountDetail"].clearValidate();
			});
		},
		deleteRow: function deleteRow(scope) {
			var _this2 = this;

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
			this.jquery('/iae/bankaccountdetail/deleteAccountDetail', {
				account_detail_id: scope.row.account_detail_id
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getAccountsDetailsList();
				_self.dialogFormVisible = false;
			});
		},
		addShow: function addShow() {
			var _self = this;
			setTimeout(function () {
				_self.$refs["accountDetail"].resetFields();
			}, 10);
			this.title = 1;
			this.accountDetail = {
				account_detail_time: "",
				account_detail_money: "",
				account_detail_mark: "",
				account_id: ""
			}, this.dialogFormVisible = true;
		},
		add: function add(formName) {
			var _this3 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this3.loading = true;
					if (_this3.title == 1) {
						_this3.jquery('/iae/bankaccountdetail/saveAccountsDetail', _self.accountDetail, function (res) {
							_self.$message({ showClose: true, message: '新增成功', type: 'success' });
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getAccountsDetailsList();
						});
					} else {
						_this3.jquery('/iae/bankaccountdetail/editAccountsDetail', _self.accountDetail, function (res) {
							_self.$message({ showClose: true, message: '修改成功', type: 'success' });
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getAccountsDetailsList();
						});
					}
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		},
		getAccountsDetailsList: function getAccountsDetailsList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 10;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/bankaccountdetail/getAccountsDetails', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.accountsDetails = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		formatterIncome: function formatterIncome(row, column, cellValue) {
			if (cellValue >= 0) {
				return cellValue;
			} else {
				return "-";
			}
		},
		formatterExpenditure: function formatterExpenditure(row, column, cellValue) {
			if (cellValue < 0) {
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
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getAccountsDetailsList();
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getAccountsDetailsList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getAccountsDetailsList();
		}
	}
};

/***/ }),

/***/ 441:
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
  }, [_c('el-breadcrumb-item', [_vm._v("财务管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("积分流水账管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "日期",
      "prop": "account_detail_time"
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
      value: (_vm.params.account_detail_time),
      callback: function($$v) {
        _vm.$set(_vm.params, "account_detail_time", $$v)
      },
      expression: "params.account_detail_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "积分账户",
      "prop": "account_id"
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
      value: (_vm.params.account_id),
      callback: function($$v) {
        _vm.$set(_vm.params, "account_id", $$v)
      },
      expression: "params.account_id"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.accounts), function(item) {
    return _c('el-option', {
      key: item.account_id,
      attrs: {
        "label": item.account_number,
        "value": item.account_id
      }
    })
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "收支",
      "prop": "account_type"
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
      value: (_vm.params.account_type),
      callback: function($$v) {
        _vm.$set(_vm.params, "account_type", $$v)
      },
      expression: "params.account_type"
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
      "label": "收入",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "支出",
      "value": "2"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "事项",
      "prop": "textarea"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "size": "mini",
      "placeholder": "事项"
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && $event.keyCode !== 13) { return null; }
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.textarea),
      callback: function($$v) {
        _vm.$set(_vm.params, "textarea", $$v)
      },
      expression: "params.textarea"
    }
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',73,') > -1),
      expression: "authCode.indexOf(',73,') > -1"
    }],
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
      value: (_vm.authCode.indexOf(',73,') > -1),
      expression: "authCode.indexOf(',73,') > -1"
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
      value: (_vm.authCode.indexOf(',76,') > -1),
      expression: "authCode.indexOf(',76,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.addShow
    }
  }, [_vm._v("新增")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.accountsDetails,
      "size": "mini",
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "prop": "account_detail_time",
      "label": "日期",
      "width": "100",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "account_detail_money",
      "label": "收入",
      "width": "120",
      "formatter": _vm.formatterIncome
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "account_detail_money",
      "label": "支出",
      "width": "120",
      "formatter": _vm.formatterExpenditure
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "account_number",
      "label": "账户",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "account_detail_mark",
      "label": "事项"
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
            value: (_vm.authCode.indexOf(',75,') > -1),
            expression: "authCode.indexOf(',75,') > -1"
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
            value: (_vm.authCode.indexOf(',74,') > -1),
            expression: "authCode.indexOf(',74,') > -1"
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
      "page-sizes": [5, 10, 50, 100],
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
      "title": _vm.title == 1 ? '新增流水' : '修改流水',
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-form', {
    ref: "accountDetail",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.accountDetail,
      "status-icon": "",
      "rules": _vm.accountDetailRule,
      "inline": true,
      "label-width": "60px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "日期",
      "prop": "account_detail_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择日期"
    },
    model: {
      value: (_vm.accountDetail.account_detail_time),
      callback: function($$v) {
        _vm.$set(_vm.accountDetail, "account_detail_time", $$v)
      },
      expression: "accountDetail.account_detail_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "金额",
      "prop": "account_detail_money",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "请输入金额",
      "required": true
    },
    model: {
      value: (_vm.accountDetail.account_detail_money),
      callback: function($$v) {
        _vm.$set(_vm.accountDetail, "account_detail_money", $$v)
      },
      expression: "accountDetail.account_detail_money"
    }
  })], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "账号",
      "prop": "account_id"
    }
  }, [_c('el-select', {
    attrs: {
      "filterable": "",
      "placeholder": "请选择账号"
    },
    model: {
      value: (_vm.accountDetail.account_id),
      callback: function($$v) {
        _vm.$set(_vm.accountDetail, "account_id", $$v)
      },
      expression: "accountDetail.account_id"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "请选择",
      "value": ""
    }
  }), _vm._v(" "), _vm._l((_vm.accounts), function(item) {
    return _c('el-option', {
      key: item.account_id,
      attrs: {
        "label": item.account_number,
        "value": item.account_id
      }
    })
  })], 2)], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "事项",
      "prop": "account_detail_mark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "462px"
    },
    attrs: {
      "type": "textarea",
      "maxlength": "200",
      "autosize": {
        minRows: 5,
        maxRows: 4
      },
      "placeholder": "请输入事项"
    },
    model: {
      value: (_vm.accountDetail.account_detail_mark),
      callback: function($$v) {
        _vm.$set(_vm.accountDetail, "account_detail_mark", $$v)
      },
      expression: "accountDetail.account_detail_mark"
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
        _vm.add('accountDetail')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-0082c912", module.exports)
  }
}

/***/ }),

/***/ 442:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(443);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-58a936a7!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./businesscommission.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-58a936a7!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./businesscommission.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 443:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 444:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _businesscommissionList = __webpack_require__(445);

var _businesscommissionList2 = _interopRequireDefault(_businesscommissionList);

var _businesscommissionConfig = __webpack_require__(450);

var _businesscommissionConfig2 = _interopRequireDefault(_businesscommissionConfig);

var _returnmoneyList = __webpack_require__(204);

var _returnmoneyList2 = _interopRequireDefault(_returnmoneyList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	data: function data() {
		return {};
	},

	components: {
		'businesscommission-list': _businesscommissionList2.default,
		'businesscommission-config': _businesscommissionConfig2.default,
		'return-money-list': _returnmoneyList2.default
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

/***/ }),

/***/ 445:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(446)

/* script */
__vue_exports__ = __webpack_require__(448)

/* template */
var __vue_template__ = __webpack_require__(449)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/bank_account/businesscommissionList.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-58822ce5", __vue_options__)
  } else {
    hotAPI.reload("data-v-58822ce5", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] businesscommissionList.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 446:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(447);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-58822ce5!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./businesscommissionList.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-58822ce5!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./businesscommissionList.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 447:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.small_input input{\n  padding:0px 7px !important;\n  height: 23px !important;\n  line-height: 23px !important;\n}\n.commission_config_div{\n  background-color: #ffffff;\n  height: 40px;\n  margin-bottom: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 448:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

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

exports.default = {
  data: function data() {
    return _defineProperty({
      dialogFormVisible: false,
      loading: false,
      authCode: "",
      account: {
        account_number: "",
        account_person: ""
      },
      accountRule: {
        account_number: [{ required: true, message: '请输入银行账号', trigger: 'blur' }]
      },
      commission: [],
      commissionTemp: [], //用于前端分页
      commissionConfig: {
        commission_config_id: "",
        commission_start_money: "",
        commission_fixed_rate: ""
      },
      pageNum: 10,
      currentPage: 1,
      count: 0,
      params: {
        hospitalsId: "",
        business: "",
        startTime: null,
        endTime: null
      },
      business: [], //商业表
      hospitals: [] }, "account", {
      smAccount: 0,
      rgpAccount: 0,
      rgptAccount: 0,
      profitAccount: 0,
      dayAvgprofitAccount: 0
    });
  },
  activated: function activated() {
    this.getBuninessCommissionList();
    this.getProductBusiness();
    this.getHospitals();
  },
  mounted: function mounted() {
    this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
  },

  methods: {
    saveRate: function saveRate(scope) {
      var reg = /^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/;
      if (this.isEmpty(scope.row.hb_fixed_rate) || this.isEmpty(scope.row.hb_floating_rate)) {
        return;
      } else if (!reg.test(scope.row.hb_fixed_rate) || !reg.test(scope.row.hb_floating_rate)) {
        return;
      }
      var _self = this;
      this.jquery('/iae/businesscommission/saveBunsinessCommission', {
        commission_id: scope.row.commission_id,
        commission_time: scope.row.bd,
        commission_hospital_id: scope.row.hospital_id,
        commission_business: scope.row.product_business,
        commission_fixed_rate: scope.row.hb_fixed_rate,
        commission_floating_rate: scope.row.hb_floating_rate
      }, function (res) {
        _self.getBuninessCommissionList();
      });
    },
    formatPercent: function formatPercent(row, column, cellValue) {
      if (!this.isEmpty(cellValue)) {
        return cellValue + "%";
      } else {
        return "";
      }
    },
    formatMoney: function formatMoney(row, column, cellValue) {
      if (!this.isEmpty(cellValue)) {
        return (cellValue + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        return 0;
      }
    },
    getHospitals: function getHospitals() {
      var _self = this;
      this.jquery('/iae/hospitals/getAllHospitals', { hospital_type: '销售单位' }, function (res) {
        _self.hospitals = res.message;
      });
    },
    getProductBusiness: function getProductBusiness() {
      var _self = this;
      this.jquery("/iae/business/getAllBusiness", null, function (res) {
        //查询商业
        _self.business = res.message;
      });
    },
    editRow: function editRow(scope) {
      //编辑药品信息
      this.dialogFormVisible = true;
      var temp = JSON.stringify(scope.row);
      this.account = JSON.parse(temp);
      var _self = this;
      setTimeout(function () {
        _self.$refs["account"].clearValidate();
      });
    },
    deleteRow: function deleteRow(scope) {
      var _this = this;

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
      this.jquery('/iae/bankaccount/deleteAccount', {
        account_id: scope.row.account_id
      }, function (res) {
        _self.$message({ showClose: true, message: '删除成功', type: 'success' });
        _self.getBuninessCommissionList();
        _self.dialogFormVisible = false;
      });
    },
    addShow: function addShow() {
      this.account = {
        account_number: "",
        account_person: ""
      };
      this.dialogFormVisible = true;
    },
    add: function add(formName) {
      var _this2 = this;

      var _self = this;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this2.loading = true;
          if (_this2.title == 1) {
            _this2.jquery('/iae/bankaccount/saveAccounts', _self.account, function (res) {
              _self.$message({ showClose: true, message: '新增成功', type: 'success' });
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.getBuninessCommissionList();
            });
          } else {
            _this2.jquery('/iae/bankaccount/editAccounts', _self.account, function (res) {
              _self.$message({ showClose: true, message: '修改成功', type: 'success' });
              _self.dialogFormVisible = false;
              _self.loading = false;
            });
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    getBuninessCommissionList: function getBuninessCommissionList() {
      var _self = this;
      if (!_self.currentPage) {
        _self.currentPage = 1;
      }
      if (!_self.pageNum) {
        _self.pageNum = 10;
      }
      var page = {
        start: (_self.currentPage - 1) * _self.pageNum,
        limit: _self.pageNum
      };
      this.jquery('/iae/businesscommission/getBuninessCommission', {
        data: _self.params,
        page: page
      }, function (res) {
        _self.commissionTemp = res.message.data;
        _self.account = res.message.account;
        _self.account.smAccount = (_self.account.smAccount + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _self.account.rgpAccount = (_self.account.rgpAccount + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _self.account.rgptAccount = (_self.account.rgptAccount + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _self.account.profitAccount = (_self.account.profitAccount + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _self.account.dayAvgprofitAccount = (_self.account.dayAvgprofitAccount + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        _self.frontPage();
        _self.pageNum = parseInt(res.message.limit);
        _self.count = res.message.totalCount;
      });
    },
    reSearch: function reSearch(arg) {
      if (arg) {
        this.$refs["params"].resetFields();
      }
      this.currentPage = 1;
      this.getBuninessCommissionList();
    },
    handleSizeChange: function handleSizeChange(val) {
      this.currentPage = 1;
      this.frontPage();
    },
    handleCurrentChange: function handleCurrentChange(val) {
      this.currentPage = val;
      this.frontPage();
    },
    frontPage: function frontPage() {
      var start = (this.currentPage - 1) * this.pageNum;
      var end = this.currentPage * this.pageNum;
      this.commission = this.commissionTemp.slice(start, end);
    }
  }
};

/***/ }),

/***/ 449:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "销售机构",
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
      "label": "　商业",
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
      "label": "开始日期",
      "prop": "startTime"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "type": "month",
      "size": "mini",
      "placeholder": "选择开始日期"
    },
    model: {
      value: (_vm.params.startTime),
      callback: function($$v) {
        _vm.$set(_vm.params, "startTime", $$v)
      },
      expression: "params.startTime"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "结束日期",
      "prop": "endTime"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "type": "month",
      "size": "mini",
      "placeholder": "选择结束日期"
    },
    model: {
      value: (_vm.params.endTime),
      callback: function($$v) {
        _vm.$set(_vm.params, "endTime", $$v)
      },
      expression: "params.endTime"
    }
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',79,') > -1),
      expression: "authCode.indexOf(',79,') > -1"
    }],
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
      value: (_vm.authCode.indexOf(',79,') > -1),
      expression: "authCode.indexOf(',79,') > -1"
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
  }, [_vm._v("重置")])], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "sum_money"
  }, [_vm._v("销售总额："), _c('a', [_vm._v(_vm._s(_vm.account.smAccount))]), _vm._v(" 元；真实毛利："), _c('a', [_vm._v(_vm._s(_vm.account.rgpAccount))]), _vm._v(" 元；真实毛利(不含税)："), _c('a', [_vm._v(_vm._s(_vm.account.rgptAccount))]), _vm._v(" 元；商业提成："), _c('a', [_vm._v(_vm._s(_vm.account.profitAccount))]), _vm._v(" 元；商业提成（按日均算）："), _c('a', [_vm._v(_vm._s(_vm.account.dayAvgprofitAccount))]), _vm._v(" 元")]), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.commission,
      "size": "mini",
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "prop": "bd",
      "label": "日期",
      "width": "70",
      "fixed": ""
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hospital_name",
      "label": "医院名称",
      "width": "150"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "sm",
      "label": "销售额",
      "width": "80",
      "formatter": _vm.formatMoney
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "rgp",
      "label": "真实毛利（含税）",
      "width": "120",
      "formatter": _vm.formatMoney
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "rgpPercent",
      "label": "真实毛利率（含税）",
      "width": "120",
      "formatter": _vm.formatPercent
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "rgpt",
      "label": "真实毛利（不含税）",
      "width": "120",
      "formatter": _vm.formatMoney
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "rgptPercent",
      "label": "真实毛利率（不含税）",
      "formatter": _vm.formatPercent,
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hb_fixed_rate",
      "label": "固定成本率",
      "width": "50"
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(scope) {
        return [_c('el-input', {
          staticClass: "small_input",
          attrs: {
            "size": "mini"
          },
          on: {
            "blur": function($event) {
              _vm.saveRate(scope)
            }
          },
          model: {
            value: (scope.row.hb_fixed_rate),
            callback: function($$v) {
              _vm.$set(scope.row, "hb_fixed_rate", $$v)
            },
            expression: "scope.row.hb_fixed_rate"
          }
        })]
      }
    }])
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hb_floating_rate",
      "label": "成本率/月",
      "width": "50"
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(scope) {
        return [_c('el-input', {
          staticClass: "small_input",
          attrs: {
            "size": "mini"
          },
          on: {
            "blur": function($event) {
              _vm.saveRate(scope)
            }
          },
          model: {
            value: (scope.row.hb_floating_rate),
            callback: function($$v) {
              _vm.$set(scope.row, "hb_floating_rate", $$v)
            },
            expression: "scope.row.hb_floating_rate"
          }
        })]
      }
    }])
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "ownMoney",
      "label": "月末应收金额",
      "width": "100",
      "formatter": _vm.formatMoney
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "mouthCoefficient",
      "label": "月末应收系数",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "day_avg",
      "label": "日均应收金额",
      "width": "100",
      "formatter": _vm.formatMoney
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "dayAvgCoefficient",
      "label": "日均应收系数",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "profit",
      "label": "商务提成",
      "width": "100",
      "formatter": _vm.formatMoney,
      "fixed": "right"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "profitCoefficient",
      "label": "商务提成系数",
      "width": "100",
      "fixed": "right"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "dayAvgprofit",
      "label": "商务提成（按日均算）",
      "width": "100",
      "formatter": _vm.formatMoney,
      "fixed": "right"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "dayAvgprofitCoefficient",
      "label": "商务提成系数（按日均算）",
      "width": "100",
      "fixed": "right"
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "page_div"
  }, [_c('el-pagination', {
    attrs: {
      "background": "",
      "current-page": _vm.currentPage,
      "page-sizes": [5, 10, 50, 100],
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
      "title": "手动核算利润",
      "width": "500px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-form', {
    ref: "account",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.account,
      "status-icon": "",
      "rules": _vm.accountRule,
      "label-width": "90px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "银行账号",
      "prop": "account_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "370px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 20,
      "placeholder": "请输入银行账号"
    },
    model: {
      value: (_vm.account.account_number),
      callback: function($$v) {
        _vm.$set(_vm.account, "account_number", $$v)
      },
      expression: "account.account_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "持卡人",
      "prop": "account_person"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "370px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 11,
      "placeholder": "请输入持卡人"
    },
    model: {
      value: (_vm.account.account_person),
      callback: function($$v) {
        _vm.$set(_vm.account, "account_person", $$v)
      },
      expression: "account.account_person"
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
        _vm.add('account')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-58822ce5", module.exports)
  }
}

/***/ }),

/***/ 450:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(451)

/* script */
__vue_exports__ = __webpack_require__(453)

/* template */
var __vue_template__ = __webpack_require__(454)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/bank_account/businesscommissionConfig.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c924c46e", __vue_options__)
  } else {
    hotAPI.reload("data-v-c924c46e", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] businesscommissionConfig.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 451:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(452);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-c924c46e!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./businesscommissionConfig.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-c924c46e!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./businesscommissionConfig.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 452:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 453:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

exports.default = {
	data: function data() {
		var _this = this;

		var validateMoney = function validateMoney(rule, value, callback) {
			var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
			if (_this.isEmpty(value)) {
				callback(new Error('请再输入' + rule.labelname));
			} else if (!reg.test(value)) {
				callback(new Error('请再输入正确的' + rule.labelname));
			} else {
				callback();
			}
		};
		var validatePercent = function validatePercent(rule, value, callback) {
			if (_this.isEmpty(value)) {
				callback(new Error('请再输入' + rule.labelname));
			} else if (!/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
				callback(new Error('请再输入正确的' + rule.labelname));
			} else {
				callback();
			}
		};
		return {
			dialogFormVisible: false,
			config: {
				hb_start_time: null,
				hb_start_money: "",
				hb_fixed_rate: "",
				hb_floating_rate: ""
			},
			configRule: {
				hb_start_time: [{ required: true, message: '请选择成本计算开始时间', trigger: 'change' }],
				hb_start_money: [{ validator: validateMoney, labelname: '期初未回款金额', trigger: 'blur' }],
				hb_fixed_rate: [{ validator: validatePercent, labelname: '固定成本率', trigger: 'blur' }],
				hb_floating_rate: [{ validator: validatePercent, labelname: '成本率/月', trigger: 'blur' }]
			},
			authCode: "",
			loading: false,
			businessList: [],
			pageNum: 10,
			currentPage: 1,
			count: 0,
			deleteId: null,
			params: {
				business_id: "",
				hospital_id: ""
			},
			hospitals: [],
			business: []
		};
	},
	activated: function activated() {
		this.getBusinessList();
		this.getProductBusiness();
		this.getHospitals();
	},
	mounted: function mounted() {
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},

	methods: {
		getHospitals: function getHospitals() {
			var _self = this;
			this.jquery('/iae/hospitals/getAllHospitals', { hospital_type: '销售单位' }, function (res) {
				_self.hospitals = res.message;
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
		editRow: function editRow(scope) {
			//编辑药品信息
			this.dialogFormVisible = true;
			var temp = JSON.stringify(scope.row);
			this.config = JSON.parse(temp);
			this.config.front_message = temp;
			if (this.$refs["config"]) {
				this.$refs["config"].clearValidate();
			}
		},
		add: function add(formName) {
			var _this2 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this2.loading = true;
					_this2.jquery('/iae/hospitalbusinessconfig/editBuninessConfig', {
						hb_config_id: _self.config.hb_config_id,
						hb_start_time: _self.config.hb_start_time,
						hb_start_money: _self.config.hb_start_money,
						hb_fixed_rate: _self.config.hb_fixed_rate,
						hb_floating_rate: _self.config.hb_floating_rate,
						hb_business_id: _self.config.business_id,
						hb_hospital_id: _self.config.hospital_id,
						front_message: _self.config.front_message
					}, function (res) {
						_self.$message({ showClose: true, message: '保存成功', type: 'success' });
						_self.loading = false;
						_self.dialogFormVisible = false;
						_self.getBusinessList();
					});
				} else {
					return false;
				}
			});
		},
		getBusinessList: function getBusinessList() {
			var _self = this;
			if (!_self.currentPage) {
				_self.currentPage = 1;
			}
			if (!_self.pageNum) {
				_self.pageNum = 10;
			}
			var page = {
				start: (_self.currentPage - 1) * _self.pageNum,
				limit: _self.pageNum
			};
			this.jquery('/iae/hospitalbusinessconfig/getBuninessConfig', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.businessList = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getBusinessList();
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getBusinessList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getBusinessList();
		}
	}
};

/***/ }),

/***/ 454:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "销售机构",
      "prop": "hospital_id"
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
      value: (_vm.params.hospital_id),
      callback: function($$v) {
        _vm.$set(_vm.params, "hospital_id", $$v)
      },
      expression: "params.hospital_id"
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
      "label": "　商业",
      "prop": "business_id"
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
      value: (_vm.params.business_id),
      callback: function($$v) {
        _vm.$set(_vm.params, "business_id", $$v)
      },
      expression: "params.business_id"
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
      value: (_vm.authCode.indexOf(',79,') > -1),
      expression: "authCode.indexOf(',79,') > -1"
    }],
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
      value: (_vm.authCode.indexOf(',79,') > -1),
      expression: "authCode.indexOf(',79,') > -1"
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
  }, [_vm._v("重置")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.businessList,
      "size": "mini",
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "prop": "hospital_name",
      "label": "医院名称"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业名称"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hb_start_time",
      "label": "成本计算开始时间",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hb_start_money",
      "label": "期初未回款金额"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hb_fixed_rate",
      "label": "固定成本率(%)"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hb_floating_rate",
      "label": "成本率/月(%)"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "right",
      "label": "操作",
      "width": "60"
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
            value: (_vm.authCode.indexOf(',80,') > -1),
            expression: "authCode.indexOf(',80,') > -1"
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
      "page-sizes": [5, 10, 50, 100],
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
      "title": "修改商业成本配置",
      "width": "500px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-form', {
    ref: "config",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.config,
      "status-icon": "",
      "rules": _vm.configRule,
      "label-width": "140px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "成本计算开始时间",
      "prop": "hb_start_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "300px"
    },
    attrs: {
      "placeholder": "选择成本计算开始时间"
    },
    model: {
      value: (_vm.config.hb_start_time),
      callback: function($$v) {
        _vm.$set(_vm.config, "hb_start_time", $$v)
      },
      expression: "config.hb_start_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "期初未回款金额",
      "prop": "hb_start_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "300px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 50,
      "placeholder": "请输入期初未回款金额"
    },
    model: {
      value: (_vm.config.hb_start_money),
      callback: function($$v) {
        _vm.$set(_vm.config, "hb_start_money", $$v)
      },
      expression: "config.hb_start_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "固定成本率(%)",
      "prop": "hb_fixed_rate"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "300px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 50,
      "placeholder": "请输入固定成本率(如：0-100)"
    },
    model: {
      value: (_vm.config.hb_fixed_rate),
      callback: function($$v) {
        _vm.$set(_vm.config, "hb_fixed_rate", $$v)
      },
      expression: "config.hb_fixed_rate"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "成本率/月(%)",
      "prop": "hb_floating_rate"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "300px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 50,
      "placeholder": "请输入成本率/月(如：0-100)"
    },
    model: {
      value: (_vm.config.hb_floating_rate),
      callback: function($$v) {
        _vm.$set(_vm.config, "hb_floating_rate", $$v)
      },
      expression: "config.hb_floating_rate"
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
      "loading": _vm.loading,
      "size": "small"
    },
    on: {
      "click": function($event) {
        _vm.add('config')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-c924c46e", module.exports)
  }
}

/***/ }),

/***/ 455:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(456);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-5d3fdf82!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./returnmoneyList.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-5d3fdf82!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./returnmoneyList.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 456:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.commission_config_div{\n  background-color: #ffffff;\n  height: 40px;\n  margin-bottom: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 457:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

exports.default = {
  data: function data() {
    var _this = this;

    var validateReturnMoney = function validateReturnMoney(rule, value, callback) {
      var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
      if (_this.isEmpty(value)) {
        callback(new Error('请输入回款金额'));
      } else if (!reg.test(value)) {
        callback(new Error('请输入正确的回款金额'));
      } else {
        callback();
      }
    };
    return {
      title: 1,
      dialogFormVisible: false,
      loading: false,
      authCode: "",
      returnMoney: {
        return_money_time: "",
        return_money: "",
        return_money_hospital: "",
        return_money_business: ""
      },
      returnMoneyRule: {
        return_money_time: [{ required: true, message: '请选择回款时间', trigger: 'blur,change' }],
        return_money: [{ validator: validateReturnMoney, trigger: 'blur' }],
        return_money_hospital: [{ required: true, message: '请选择回款医院', trigger: 'blur,change' }],
        return_money_business: [{ required: true, message: '请选择商业', trigger: 'blur,change' }]
      },
      pageNum: 10,
      currentPage: 1,
      count: 0,
      params: {
        hospitalsId: "",
        business: "",
        startTime: null,
        endTime: null
      },
      business: [], //商业表
      hospitals: [], //医院表
      returnMoneys: [] //返款列表
    };
  },
  activated: function activated() {
    this.getReturnMoneyList();
    this.getProductBusiness();
    this.getHospitals();
  },
  mounted: function mounted() {
    this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
  },

  methods: {
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
    formatterMoney: function formatterMoney(row, column, cellValue) {
      return cellValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    getHospitals: function getHospitals() {
      var _self = this;
      this.jquery('/iae/hospitals/getAllHospitals', { hospital_type: '销售单位' }, function (res) {
        _self.hospitals = res.message;
      });
    },
    getProductBusiness: function getProductBusiness() {
      var _self = this;
      this.jquery("/iae/business/getAllBusiness", null, function (res) {
        //查询商业
        _self.business = res.message;
      });
    },
    editRow: function editRow(scope) {
      //编辑药品信息
      this.dialogFormVisible = true;
      this.title = 2;
      var temp = JSON.stringify(scope.row);
      this.returnMoney = JSON.parse(temp);
      this.returnMoney.front_message = temp;
      var _self = this;
      setTimeout(function () {
        _self.$refs["returnMoney"].clearValidate();
      });
    },
    deleteRow: function deleteRow(scope) {
      var _this2 = this;

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
      this.jquery('/iae/hospitalreturnmoney/deleteReturnMoney', {
        return_money_id: scope.row.return_money_id
      }, function (res) {
        _self.$message({ showClose: true, message: '删除成功', type: 'success' });
        _self.getReturnMoneyList();
        _self.dialogFormVisible = false;
      });
    },
    addShow: function addShow() {
      this.title = 1;
      this.returnMoney = {
        return_money_time: "",
        return_money: "",
        return_money_hospital: "",
        return_money_business: ""
      };
      if (this.$refs["returnMoney"]) {
        this.$refs["returnMoney"].resetFields();
        this.$refs["returnMoney"].clearValidate();
      }
      this.dialogFormVisible = true;
    },
    add: function add(formName) {
      var _this3 = this;

      var _self = this;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this3.loading = true;
          if (_this3.title == 1) {
            _this3.jquery('/iae/hospitalreturnmoney/saveReturnMoney', _self.returnMoney, function (res) {
              _self.$message({ showClose: true, message: '新增成功', type: 'success' });
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.getReturnMoneyList();
            });
          } else {
            _this3.jquery('/iae/hospitalreturnmoney/editReturnMoney', _self.returnMoney, function (res) {
              _self.$message({ showClose: true, message: '修改成功', type: 'success' });
              _self.dialogFormVisible = false;
              _self.getReturnMoneyList();
              _self.loading = false;
            });
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    getReturnMoneyList: function getReturnMoneyList() {
      var _self = this;
      if (!_self.currentPage) {
        _self.currentPage = 1;
      }
      if (!_self.pageNum) {
        _self.pageNum = 10;
      }
      var page = {
        start: (_self.currentPage - 1) * _self.pageNum,
        limit: _self.pageNum
      };
      this.jquery('/iae/hospitalreturnmoney/getReturnMoney', {
        data: _self.params,
        page: page
      }, function (res) {
        _self.returnMoneys = res.message.data;
        _self.pageNum = parseInt(res.message.limit);
        _self.count = res.message.totalCount;
      });
    },
    reSearch: function reSearch(arg) {
      if (arg) {
        this.$refs["params"].resetFields();
      }
      this.currentPage = 1;
      this.getReturnMoneyList();
    },
    handleSizeChange: function handleSizeChange(val) {
      this.currentPage = 1;
      this.getReturnMoneyList();
    },
    handleCurrentChange: function handleCurrentChange(val) {
      this.currentPage = val;
      this.getReturnMoneyList();
    }
  }
};

/***/ }),

/***/ 458:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "回款医院",
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
      "label": "　商业",
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
      "label": "开始日期",
      "prop": "startTime"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "type": "month",
      "size": "mini",
      "placeholder": "选择开始日期"
    },
    model: {
      value: (_vm.params.startTime),
      callback: function($$v) {
        _vm.$set(_vm.params, "startTime", $$v)
      },
      expression: "params.startTime"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "结束日期",
      "prop": "endTime"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "210px"
    },
    attrs: {
      "type": "month",
      "size": "mini",
      "placeholder": "选择结束日期"
    },
    model: {
      value: (_vm.params.endTime),
      callback: function($$v) {
        _vm.$set(_vm.params, "endTime", $$v)
      },
      expression: "params.endTime"
    }
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',84,') > -1),
      expression: "authCode.indexOf(',84,') > -1"
    }],
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
      value: (_vm.authCode.indexOf(',84,') > -1),
      expression: "authCode.indexOf(',84,') > -1"
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
      value: (_vm.authCode.indexOf(',87,') > -1),
      expression: "authCode.indexOf(',87,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.addShow
    }
  }, [_vm._v("新增")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.returnMoneys,
      "size": "mini",
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "prop": "return_money_time",
      "label": "日期",
      "formatter": _vm.formatterDate,
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "return_money",
      "label": "回款金额",
      "formatter": _vm.formatterMoney,
      "width": "150"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hospital_name",
      "label": "医院名称",
      "width": "350"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业"
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
            value: (_vm.authCode.indexOf(',86,') > -1),
            expression: "authCode.indexOf(',86,') > -1"
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
            value: (_vm.authCode.indexOf(',85,') > -1),
            expression: "authCode.indexOf(',85,') > -1"
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
      "page-sizes": [5, 10, 50, 100],
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
      "title": _vm.title == 1 ? '新增回款' : '修改回款',
      "width": "700px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-form', {
    ref: "returnMoney",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.returnMoney,
      "status-icon": "",
      "rules": _vm.returnMoneyRule,
      "inline": true,
      "label-width": "90px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "回款日期",
      "prop": "return_money_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择回款日期"
    },
    model: {
      value: (_vm.returnMoney.return_money_time),
      callback: function($$v) {
        _vm.$set(_vm.returnMoney, "return_money_time", $$v)
      },
      expression: "returnMoney.return_money_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "回款金额",
      "prop": "return_money",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "请输入回款金额"
    },
    model: {
      value: (_vm.returnMoney.return_money),
      callback: function($$v) {
        _vm.$set(_vm.returnMoney, "return_money", $$v)
      },
      expression: "returnMoney.return_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "回款医院",
      "prop": "return_money_hospital"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "filterable": "",
      "placeholder": "请选择回款医院"
    },
    model: {
      value: (_vm.returnMoney.return_money_hospital),
      callback: function($$v) {
        _vm.$set(_vm.returnMoney, "return_money_hospital", $$v)
      },
      expression: "returnMoney.return_money_hospital"
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
      "label": "　商业",
      "prop": "return_money_business"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "filterable": "",
      "placeholder": "请选择商业"
    },
    model: {
      value: (_vm.returnMoney.return_money_business),
      callback: function($$v) {
        _vm.$set(_vm.returnMoney, "return_money_business", $$v)
      },
      expression: "returnMoney.return_money_business"
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
  })], 2)], 1)], 1), _vm._v(" "), _c('div', {
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
        _vm.add('returnMoney')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-5d3fdf82", module.exports)
  }
}

/***/ }),

/***/ 459:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticStyle: {
      "box-sizing": "border-box"
    }
  }, [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("财务管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("商务提成管理")])], 1), _vm._v(" "), _c('el-tabs', {
    staticStyle: {
      "margin-top": "10px"
    },
    attrs: {
      "tab-position": "left"
    }
  }, [_c('el-tab-pane', {
    attrs: {
      "label": "商业提成列表"
    }
  }, [_c('businesscommission-list')], 1), _vm._v(" "), _c('el-tab-pane', {
    attrs: {
      "label": "回款管理"
    }
  }, [_c('return-money-list')], 1), _vm._v(" "), _c('el-tab-pane', {
    attrs: {
      "label": "商业成本配置"
    }
  }, [_c('businesscommission-config')], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-58a936a7", module.exports)
  }
}

/***/ }),

/***/ 460:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(461);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(100)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-7c8a8078!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./returnmoney.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-7c8a8078!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./returnmoney.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 461:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 462:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _returnmoneyList = __webpack_require__(204);

var _returnmoneyList2 = _interopRequireDefault(_returnmoneyList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	data: function data() {
		return {};
	},

	components: {
		'return-money-list': _returnmoneyList2.default
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

/***/ }),

/***/ 463:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticStyle: {
      "box-sizing": "border-box"
    }
  }, [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("财务管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("医院回款管理")])], 1), _vm._v(" "), _c('return-money-list')], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-7c8a8078", module.exports)
  }
}

/***/ }),

/***/ 53:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(417)

/* script */
__vue_exports__ = __webpack_require__(419)

/* template */
var __vue_template__ = __webpack_require__(421)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/message/hospital.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3e73cb4a", __vue_options__)
  } else {
    hotAPI.reload("data-v-3e73cb4a", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] hospital.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 54:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(422)

/* script */
__vue_exports__ = __webpack_require__(424)

/* template */
var __vue_template__ = __webpack_require__(425)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/message/contacts.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-b7287018", __vue_options__)
  } else {
    hotAPI.reload("data-v-b7287018", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] contacts.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 55:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(426)

/* script */
__vue_exports__ = __webpack_require__(428)

/* template */
var __vue_template__ = __webpack_require__(429)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/message/business.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2f1ba8e1", __vue_options__)
  } else {
    hotAPI.reload("data-v-2f1ba8e1", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] business.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 56:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(430)

/* script */
__vue_exports__ = __webpack_require__(432)

/* template */
var __vue_template__ = __webpack_require__(433)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/message/tag.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-54fd65ee", __vue_options__)
  } else {
    hotAPI.reload("data-v-54fd65ee", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] tag.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 57:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(434)

/* script */
__vue_exports__ = __webpack_require__(436)

/* template */
var __vue_template__ = __webpack_require__(437)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/bank_account/account.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-55143fe1", __vue_options__)
  } else {
    hotAPI.reload("data-v-55143fe1", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] account.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 58:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(438)

/* script */
__vue_exports__ = __webpack_require__(440)

/* template */
var __vue_template__ = __webpack_require__(441)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/bank_account/accountDetail.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-0082c912", __vue_options__)
  } else {
    hotAPI.reload("data-v-0082c912", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] accountDetail.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 59:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(442)

/* script */
__vue_exports__ = __webpack_require__(444)

/* template */
var __vue_template__ = __webpack_require__(459)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/bank_account/businesscommission.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-58a936a7", __vue_options__)
  } else {
    hotAPI.reload("data-v-58a936a7", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] businesscommission.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 60:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(460)

/* script */
__vue_exports__ = __webpack_require__(462)

/* template */
var __vue_template__ = __webpack_require__(463)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/bank_account/returnmoney.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7c8a8078", __vue_options__)
  } else {
    hotAPI.reload("data-v-7c8a8078", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] returnmoney.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ })

});