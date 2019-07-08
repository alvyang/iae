webpackJsonp([8],{

/***/ 100:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(922)

/* script */
__vue_exports__ = __webpack_require__(924)

/* template */
var __vue_template__ = __webpack_require__(925)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/sales/salesPolicy.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c9d01edc", __vue_options__)
  } else {
    hotAPI.reload("data-v-c9d01edc", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] salesPolicy.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 101:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(926)

/* script */
__vue_exports__ = __webpack_require__(928)

/* template */
var __vue_template__ = __webpack_require__(929)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/sales/salesPolicyDrugs.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-67b36411", __vue_options__)
  } else {
    hotAPI.reload("data-v-67b36411", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] salesPolicyDrugs.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

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

/***/ 914:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(915);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-20d21ef4!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./allotPolicy.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-20d21ef4!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./allotPolicy.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 915:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.el-collapse-item__content > div{\n  display: inline-block;\n  width: 30%;\n}\n.el-collapse-item__content > div > span{\n  display: inline-block;\n  width: 56px;\n  text-align: right;\n  padding-right: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 916:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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

    var validateBatchPercent = function validateBatchPercent(rule, value, callback) {
      if (_this.isEmpty(value) && _this.policy.allot_policy_formula != '8') {
        callback(new Error('请再输入政策点数'));
      } else if (!_this.isEmpty(value) && !/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
        callback(new Error('请再输入正确的政策点数'));
      } else {
        _this.policy.allot_policy_money = _this.getShouldPayMoney(_this.policy.allot_policy_formula, _this.drug.product_price, _this.drug.product_return_money, _this.policy.allot_policy_percent, 0, _this.policy.allot_policy_money);
        _this.policy.allot_policy_money = Math.round(_this.policy.allot_policy_money * 100) / 100;
        callback();
      }
    };
    var validateBatchMoney = function validateBatchMoney(rule, value, callback) {
      var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
      if (_this.isEmpty(value)) {
        callback(new Error('请再输入' + rule.labelname));
      } else if (!reg.test(value)) {
        callback(new Error('请再输入正确的' + rule.labelname));
      } else {
        _this.policy.allot_policy_money = _this.getShouldPayMoney(_this.policy.allot_policy_formula, _this.drug.product_price, _this.drug.product_return_money, _this.policy.allot_policy_percent, 0, _this.policy.allot_policy_money);
        _this.policy.allot_policy_money = Math.round(_this.policy.allot_policy_money * 100) / 100;
        callback();
      }
    };
    return {
      drugPolicy: [],
      hospitals: [],
      contacts: [],
      drug: {},
      params: {
        hospitalId: "",
        productCommonName: "",
        contactId: "",
        productCode: ""
      },
      policy: {
        allot_policy_formula: "",
        allot_policy_percent: "",
        allot_policy_money: "",
        allot_policy_contact_id: "",
        allot_policy_remark: ""
      },
      copyPolicyParams: {
        hospital_id: "",
        hospital_id_copy: ""
      },
      copyPolicyParamsRule: {
        hospital_id: [{ required: true, message: '请选择被复制销往单位', trigger: 'change' }],
        hospital_id_copy: [{ required: true, message: '请选择复制的销住单位', trigger: 'change' }]
      },
      policyBatch: {
        allot_policy_formula: "1",
        allot_policy_percent: "",
        allot_policy_contact_id: "",
        allot_policy_remark: ""
      },
      policyBatchRule: {
        allot_policy_percent: [{ validator: validateBatchPercent, trigger: 'blur' }],
        allot_policy_money: [{ validator: validateBatchMoney, labelname: "调货积分", trigger: 'blur' }],
        allot_policy_contact_id: [{ required: true, message: '请选择联系人', trigger: 'change' }]
      },
      authCode: "",
      pageNum: 10,
      currentPage: 1,
      count: 0,
      dialogFormVisible: false,
      dialogFormVisiblePolicy: false,
      dialogFormVisibleBatch: false,
      loading: false
    };
  },
  activated: function activated() {
    this.getHospitals();
    this.getContacts();
    this.getAllotPolicy();
    this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
  },

  methods: {
    formulaChange: function formulaChange() {
      // if(this.policy.allot_policy_percent){
      this.policy.allot_policy_money = this.getShouldPayMoney(this.policy.allot_policy_formula, this.drug.product_price, this.drug.product_return_money, this.policy.allot_policy_percent, 0, this.policy.allot_policy_money);
      this.policy.allot_policy_money = Math.round(this.policy.allot_policy_money * 100) / 100;
      // }
    },
    copyPolicy: function copyPolicy(formName) {
      //政策复制
      var _self = this;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _self.loading = true;
          _self.jquery('/iae/allotPolicy/copyAllotPolicy', _self.copyPolicyParams, function (res) {
            _self.loading = false;
            _self.$message({ showClose: true, message: '复制成功', type: 'success' });
          });
        } else {
          return false;
        }
      });
    },
    formatterPercent: function formatterPercent(row, column, cellValue, index) {
      if (!this.isEmpty(row.allot_policy_money) && !this.isEmpty(row.product_return_money) && row.product_return_money != '0') {
        return Math.round(row.allot_policy_money * 100 / row.product_return_money) + "%";
      } else {
        return "";
      }
    },
    formatterFormula: function formatterFormula(row, column, cellValue, index) {
      var message = "";
      switch (cellValue) {
        case "1":
          message = "中标价*政策点数";
          break;
        case "2":
          message = "中标价*政策点数-补点/费用票";
          break;
        case "3":
          message = "实收上游积分或上游政策积分*政策点数";
          break;
        case "4":
          message = "实收上游积分或上游政策积分*政策点数-补点/费用票";
          break;
        case "5":
          message = "实收上游积分或上游政策积分-中标价*政策点数";
          break;
        case "6":
          message = "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票";
          break;
        case "7":
          message = "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分";
          break;
        case "8":
          message = "固定政策（上游政策修改后，需几时调整下游政策）";
          break;
        default:

      }
      return message;
    },
    editRow: function editRow(scope) {
      //编辑药品信息
      this.dialogFormVisible = true;
      var temp = JSON.stringify(scope.row);
      this.drug = JSON.parse(temp);
      this.policy.front_message = JSON.stringify({
        allot_policy_money: this.drug.allot_policy_money,
        allot_policy_contact_id: this.drug.allot_policy_contact_id,
        allot_policy_remark: this.drug.allot_policy_remark,
        allot_policy_percent: this.drug.allot_policy_percent,
        allot_policy_formula: this.drug.allot_policy_formula
      });
      this.policy.allot_policy_formula = this.drug.allot_policy_formula;
      this.policy.allot_policy_percent = this.drug.allot_policy_percent;
      this.policy.allot_policy_money = this.drug.allot_policy_money;
      this.policy.allot_policy_contact_id = this.drug.allot_policy_contact_id;
      this.policy.allot_policy_remark = this.drug.allot_policy_remark;
      this.policy.product_price = this.drug.product_price;
      this.policy.product_return_money = this.drug.product_return_money;
    },
    editBatchRow: function editBatchRow() {
      if (this.drugId.length > 0) {
        this.dialogFormVisibleBatch = true;
      }
    },
    selectionChange: function selectionChange(val) {
      this.drugId = [];
      for (var i = 0; i < val.length; i++) {
        this.drugId.push({
          id: val[i].product_id,
          price: val[i].product_price,
          product_code: val[i].product_code,
          returnMoney: val[i].product_return_money,
          hospitalId: val[i].allot_hospital_id
        });
      }
    },
    editSalesBatch: function editSalesBatch(formName) {
      var _this2 = this;

      var _self = this;
      _self.policyBatch.allot_hospital_id = this.params.hospitalId;
      _self.policyBatch.allotDrugs = this.drugId;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this2.loading = true;
          _self.jquery('/iae/allotPolicy/editAllotPolicyBatch', _self.policyBatch, function (res) {
            _self.$refs["policyBatch"].resetFields();
            _self.dialogFormVisibleBatch = false;
            _self.loading = false;
            _self.getAllotPolicy();
            _self.$message({ showClose: true, message: '批量修改成功', type: 'success' });
          });
        } else {
          return false;
        }
      });
    },
    getContacts: function getContacts() {
      var _self = this;
      this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['调货'] }, function (res) {
        _self.contacts = res.message;
      });
    },
    exportAllotPolicy: function exportAllotPolicy() {
      var url = this.$bus.data.host + "/iae/allotPolicy/exportAllotPolicy";
      this.download(url, this.params);
    },
    getAllotPolicy: function getAllotPolicy() {
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
      this.jquery('/iae/allotPolicy/getAllotPolicy', {
        data: _self.params,
        page: page
      }, function (res) {
        _self.drugPolicy = res.message.data;
        _self.pageNum = parseInt(res.message.limit);
        _self.count = res.message.totalCount;
      });
    },
    editSales: function editSales(formName) {
      var _this3 = this;

      var _self = this;
      _self.policy.allot_hospital_id = this.drug.allot_hospital_id;
      _self.policy.allot_drug_id = this.drug.product_id;
      _self.policy.product_code = this.drug.product_code;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this3.loading = true;
          _self.jquery('/iae/allotPolicy/editAllotPolicy', _self.policy, function (res) {
            _self.dialogFormVisible = false;
            _self.loading = false;
            _self.$message({ showClose: true, message: '修改成功', type: 'success' });
            _self.getAllotPolicy();
          });
        } else {
          return false;
        }
      });
    },
    getHospitals: function getHospitals() {
      var _self = this;
      this.jquery('/iae/hospitals/getAllHospitals', { hospital_type: '调货单位' }, function (res) {
        _self.hospitals = res.message;
      });
    },
    reSearch: function reSearch(arg) {
      this.$refs["params"].resetFields();
      this.currentPage = 1;
      this.getAllotPolicy();
    },
    handleSizeChange: function handleSizeChange(val) {
      this.pageNum = val;
      this.currentPage = 1;
      this.getAllotPolicy();
    },
    handleCurrentChange: function handleCurrentChange(val) {
      this.currentPage = val;
      this.getAllotPolicy();
    }
  }
};

/***/ }),

/***/ 917:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("积分管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("调货政策管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "调货单位",
      "prop": "hospitalId"
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
      value: (_vm.params.hospitalId),
      callback: function($$v) {
        _vm.$set(_vm.params, "hospitalId", $$v)
      },
      expression: "params.hospitalId"
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
      "label": "产品编码",
      "prop": "productCode"
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
        _vm.getAllotPolicy()
      }
    },
    model: {
      value: (_vm.params.productCode),
      callback: function($$v) {
        _vm.$set(_vm.params, "productCode", $$v)
      },
      expression: "params.productCode"
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
        _vm.getAllotPolicy()
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
  })], 2)], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',132,') > -1),
      expression: "authCode.indexOf(',132,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.getAllotPolicy()
      }
    }
  }, [_vm._v("查询")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',132,') > -1),
      expression: "authCode.indexOf(',132,') > -1"
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
      value: (_vm.authCode.indexOf(',119,') > -1),
      expression: "authCode.indexOf(',119,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.$router.push('/main/allotpolicydrugs');
      }
    }
  }, [_vm._v("新增")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',135,') > -1),
      expression: "authCode.indexOf(',135,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.exportAllotPolicy
    }
  }, [_vm._v("导出")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',133,') > -1),
      expression: "authCode.indexOf(',133,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.dialogFormVisiblePolicy = true
      }
    }
  }, [_vm._v("政策复制")])], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "allot_policy"
  }, [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',119,') > -1),
      expression: "authCode.indexOf(',119,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    nativeOn: {
      "click": function($event) {
        $event.preventDefault();
        _vm.editBatchRow()
      }
    }
  }, [_vm._v("批量修改")])], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.drugPolicy,
      "size": "mini",
      "stripe": true,
      "border": true
    },
    on: {
      "selection-change": _vm.selectionChange
    }
  }, [_c('el-table-column', {
    attrs: {
      "type": "selection",
      "width": "55"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "hospital_name",
      "label": "销往单位",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "product_common_name",
      "label": "产品名称",
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
      "prop": "product_return_money",
      "label": "积分",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allot_policy_money",
      "label": "调货积分",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allot_policy_percent",
      "label": "政策点数",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allot_policy_formula",
      "label": "政策公式",
      "width": "80",
      "formatter": _vm.formatterFormula
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "积分比例",
      "formatter": _vm.formatterPercent
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "allot_policy_remark",
      "label": "积分备注",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "调货联系人"
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
            value: (_vm.authCode.indexOf(',133,') > -1),
            expression: "authCode.indexOf(',133,') > -1"
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
      "layout": "total, sizes, prev, pager, next",
      "total": _vm.count
    },
    on: {
      "size-change": _vm.handleSizeChange,
      "current-change": _vm.handleCurrentChange
    }
  })], 1), _vm._v(" "), _c('el-dialog', {
    staticClass: "copy_form",
    attrs: {
      "title": "政策复制",
      "width": "700px",
      "visible": _vm.dialogFormVisiblePolicy
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisiblePolicy = $event
      }
    }
  }, [_c('el-form', {
    ref: "copyPolicyParams",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.copyPolicyParams,
      "rules": _vm.copyPolicyParamsRule,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "将",
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
      value: (_vm.copyPolicyParams.hospital_id),
      callback: function($$v) {
        _vm.$set(_vm.copyPolicyParams, "hospital_id", $$v)
      },
      expression: "copyPolicyParams.hospital_id"
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
      "label": "的政策复制到",
      "prop": "hospital_id_copy"
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
      value: (_vm.copyPolicyParams.hospital_id_copy),
      callback: function($$v) {
        _vm.$set(_vm.copyPolicyParams, "hospital_id_copy", $$v)
      },
      expression: "copyPolicyParams.hospital_id_copy"
    }
  }, _vm._l((_vm.hospitals), function(item) {
    return _c('el-option', {
      key: item.hospital_id,
      attrs: {
        "label": item.hospital_name,
        "value": item.hospital_id
      }
    })
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
        _vm.dialogFormVisiblePolicy = false
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
        _vm.copyPolicy('copyPolicyParams')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "修改调货政策",
      "width": "700px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-collapse', {
    staticStyle: {
      "text-align": "left"
    },
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
  }, [_c('div', [_c('span', [_vm._v("规格:")]), _vm._v(_vm._s(_vm.drug.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.drug.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("积分:")]), _vm._v(_vm._s(_vm.drug.product_return_money))]), _vm._v(" "), _c('div', {
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
      "model": _vm.policy,
      "status-icon": "",
      "rules": _vm.policyBatchRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "政策公式",
      "prop": "allot_policy_formula"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "472px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    on: {
      "change": _vm.formulaChange
    },
    model: {
      value: (_vm.policy.allot_policy_formula),
      callback: function($$v) {
        _vm.$set(_vm.policy, "allot_policy_formula", $$v)
      },
      expression: "policy.allot_policy_formula"
    }
  }, [_c('el-option', {
    key: "1",
    attrs: {
      "label": "中标价*政策点数",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "中标价*政策点数-补点/费用票",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "4",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数-补点/费用票",
      "value": "4"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "5",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数",
      "value": "5"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "6",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票",
      "value": "6"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "7",
    attrs: {
      "label": "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分",
      "value": "7"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "8",
    attrs: {
      "label": "固定政策（上游政策修改后，需手动调整下游政策）",
      "value": "8"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.policy.allot_policy_formula != '8'),
      expression: "policy.allot_policy_formula != '8'"
    }],
    attrs: {
      "label": "政策点数",
      "prop": "allot_policy_percent",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "政策点数（如：60）"
    },
    on: {
      "change": _vm.formulaChange
    },
    model: {
      value: (_vm.policy.allot_policy_percent),
      callback: function($$v) {
        _vm.$set(_vm.policy, "allot_policy_percent", $$v)
      },
      expression: "policy.allot_policy_percent"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货积分",
      "prop": "allot_policy_money",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "调货积分"
    },
    model: {
      value: (_vm.policy.allot_policy_money),
      callback: function($$v) {
        _vm.$set(_vm.policy, "allot_policy_money", $$v)
      },
      expression: "policy.allot_policy_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货联系人",
      "prop": "allot_policy_contact_id"
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
      value: (_vm.policy.allot_policy_contact_id),
      callback: function($$v) {
        _vm.$set(_vm.policy, "allot_policy_contact_id", $$v)
      },
      expression: "policy.allot_policy_contact_id"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "",
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
      "label": "积分备注",
      "prop": "allot_policy_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "积分备注"
    },
    model: {
      value: (_vm.policy.allot_policy_remark),
      callback: function($$v) {
        _vm.$set(_vm.policy, "allot_policy_remark", $$v)
      },
      expression: "policy.allot_policy_remark"
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
    attrs: {
      "title": "批量修改调货政策",
      "width": "700px",
      "visible": _vm.dialogFormVisibleBatch
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisibleBatch = $event
      }
    }
  }, [_c('el-form', {
    ref: "policyBatch",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.policyBatch,
      "status-icon": "",
      "rules": _vm.policyBatchRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "政策公式",
      "prop": "allot_policy_formula"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "472px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.policyBatch.allot_policy_formula),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "allot_policy_formula", $$v)
      },
      expression: "policyBatch.allot_policy_formula"
    }
  }, [_c('el-option', {
    key: "1",
    attrs: {
      "label": "中标价*政策点数",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "中标价*政策点数-补点/费用票",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "4",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数-补点/费用票",
      "value": "4"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "5",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数",
      "value": "5"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "6",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票",
      "value": "6"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "7",
    attrs: {
      "label": "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分",
      "value": "7"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "政策点数",
      "prop": "allot_policy_percent",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "政策点数（如：60）"
    },
    model: {
      value: (_vm.policyBatch.allot_policy_percent),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "allot_policy_percent", $$v)
      },
      expression: "policyBatch.allot_policy_percent"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货联系人",
      "prop": "allot_policy_contact_id"
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
      value: (_vm.policyBatch.allot_policy_contact_id),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "allot_policy_contact_id", $$v)
      },
      expression: "policyBatch.allot_policy_contact_id"
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
      "label": "积分备注",
      "prop": "allot_policy_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "积分备注"
    },
    model: {
      value: (_vm.policyBatch.allot_policy_remark),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "allot_policy_remark", $$v)
      },
      expression: "policyBatch.allot_policy_remark"
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
        _vm.dialogFormVisibleBatch = false
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
        _vm.editSalesBatch('policyBatch')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-20d21ef4", module.exports)
  }
}

/***/ }),

/***/ 918:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(919);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-13cb86c6!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./allotPolicyDrugs.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-13cb86c6!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./allotPolicyDrugs.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 919:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.el-collapse-item__content > div{\n  display: inline-block;\n  width: 30%;\n}\n.el-collapse-item__content > div > span{\n  display: inline-block;\n  width: 56px;\n  text-align: right;\n  padding-right: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 920:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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

    var validateBatchPercent = function validateBatchPercent(rule, value, callback) {
      if (_this.isEmpty(value) && _this.policy.allot_policy_formula != '8') {
        callback(new Error('请再输入政策点数'));
      } else if (!_this.isEmpty(value) && !/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
        callback(new Error('请再输入正确的政策点数'));
      } else {
        _this.policy.allot_policy_money = _this.getShouldPayMoney(_this.policy.allot_policy_formula, _this.drug.product_price, _this.drug.product_return_money, _this.policy.allot_policy_percent, 0, _this.policy.allot_policy_money);
        _this.policy.allot_policy_money = Math.round(_this.policy.allot_policy_money * 100) / 100;
        callback();
      }
    };
    var validateBatchMoney = function validateBatchMoney(rule, value, callback) {
      var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
      if (_this.isEmpty(value)) {
        callback(new Error('请再输入' + rule.labelname));
      } else if (!reg.test(value)) {
        callback(new Error('请再输入正确的' + rule.labelname));
      } else {
        _this.policy.allot_policy_money = _this.getShouldPayMoney(_this.policy.allot_policy_formula, _this.drug.product_price, _this.drug.product_return_money, _this.policy.allot_policy_percent, 0, _this.policy.allot_policy_money);
        _this.policy.allot_policy_money = Math.round(_this.policy.allot_policy_money * 100) / 100;
        callback();
      }
    };
    return {
      drugPolicy: [],
      hospitals: [],
      contacts: [],
      drug: {},
      drugId: [],
      params: {
        hospitalId: "",
        productCommonName: "",
        productCode: ""
      },
      policy: {
        contactId: "",
        hospitalId: "",
        allot_policy_formula: "1",
        allot_policy_percent: "",
        allot_policy_money: "",
        allot_policy_contact_id: "",
        allot_policy_remark: ""
      },
      policyBatch: {
        allot_policy_formula: "1",
        allot_policy_percent: "",
        allot_policy_contact_id: "",
        allot_policy_remark: ""
      },
      policyBatchRule: {
        allot_policy_percent: [{ validator: validateBatchPercent, trigger: 'blur' }],
        allot_policy_money: [{ validator: validateBatchMoney, labelname: "调货积分", trigger: 'blur' }],
        allot_policy_contact_id: [{ required: true, message: '请选择联系人', trigger: 'change' }]
      },
      authCode: "",
      pageNum: 10,
      currentPage: 1,
      count: 0,
      dialogFormVisible: false,
      dialogFormVisibleBatch: false,
      loading: false
    };
  },
  activated: function activated() {
    this.getHospitals();
    this.getContacts();
    var _self = this;
    setTimeout(function () {
      _self.$refs["params"].resetFields();
      _self.drugPolicy = [];
    });
    this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
  },

  methods: {
    formulaChange: function formulaChange() {
      // if(this.policy.allot_policy_percent){
      this.policy.allot_policy_money = this.getShouldPayMoney(this.policy.allot_policy_formula, this.drug.product_price, this.drug.product_return_money, this.policy.allot_policy_percent, 0, this.policy.allot_policy_money);
      this.policy.allot_policy_money = Math.round(this.policy.allot_policy_money * 100) / 100;
      // }
    },
    editRow: function editRow(scope) {
      //编辑药品信息
      this.dialogFormVisible = true;
      var temp = JSON.stringify(scope.row);
      this.drug = JSON.parse(temp);
      this.policy.allot_policy_money = "";
      this.policy.allot_policy_contact_id = "";
      this.policy.allot_policy_remark = "";
      this.policy.allot_policy_formula = "1";
      this.policy.allot_policy_percent = "";
      var _self = this;
      setTimeout(function () {
        _self.$refs["policy"].clearValidate();
      }, 10);
    },
    editBatchRow: function editBatchRow() {
      if (this.drugId.length > 0) {
        this.dialogFormVisibleBatch = true;
      }
    },
    getContacts: function getContacts() {
      var _self = this;
      this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['调货'] }, function (res) {
        _self.contacts = res.message;
      });
    },
    getAllotPolicy: function getAllotPolicy() {
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
      this.jquery('/iae/allotPolicy/getAllotPolicyDrugs', {
        data: _self.params,
        page: page
      }, function (res) {
        _self.drugPolicy = res.message.data;
        _self.pageNum = parseInt(res.message.limit);
        _self.count = res.message.totalCount;
      });
    },
    selectionChange: function selectionChange(val) {
      this.drugId = [];
      for (var i = 0; i < val.length; i++) {
        this.drugId.push({
          id: val[i].product_id,
          price: val[i].product_price,
          product_code: val[i].product_code,
          returnMoney: val[i].product_return_money
        });
      }
    },
    editSalesBatch: function editSalesBatch(formName) {
      var _this2 = this;

      var _self = this;
      _self.policyBatch.allot_hospital_id = this.params.hospitalId;
      _self.policyBatch.allotDrugs = this.drugId;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this2.loading = true;
          _self.jquery('/iae/allotPolicy/editAllotPolicyBatch', _self.policyBatch, function (res) {
            _self.$confirm('新增成功', '提示', {
              confirmButtonText: '继续添加',
              cancelButtonText: '返回调货列表',
              type: 'success'
            }).then(function () {
              _self.$refs["policyBatch"].resetFields();
              _self.dialogFormVisibleBatch = false;
              _self.loading = false;
              _self.getAllotPolicy();
            }).catch(function () {
              _self.$refs["policyBatch"].resetFields();
              _self.dialogFormVisibleBatch = false;
              _self.loading = false;
              _self.$router.push({ path: '/main/allotPolicy' });
            });
          });
        } else {
          return false;
        }
      });
    },
    editSales: function editSales(formName) {
      var _this3 = this;

      var _self = this;
      _self.policy.allot_hospital_id = this.params.hospitalId;
      _self.policy.allot_drug_id = this.drug.product_id;
      _self.policy.product_code = this.drug.product_code;
      _self.policy.product_price = this.drug.product_price;
      _self.policy.product_return_money = this.drug.product_return_money;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this3.loading = true;
          _self.jquery('/iae/allotPolicy/editAllotPolicy', _self.policy, function (res) {
            _self.$confirm('新增成功', '提示', {
              confirmButtonText: '继续添加',
              cancelButtonText: '返回销售列表',
              type: 'success'
            }).then(function () {
              _self.$refs["policy"].resetFields();
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.getAllotPolicy();
            }).catch(function () {
              _self.$refs["policy"].resetFields();
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.$router.push({ path: '/main/allotPolicy' });
            });
          });
        } else {
          return false;
        }
      });
    },
    getHospitals: function getHospitals() {
      var _self = this;
      this.jquery('/iae/hospitals/getAllHospitals', { hospital_type: '调货单位' }, function (res) {
        _self.hospitals = res.message;
      });
    },
    reSearch: function reSearch(arg) {
      if (arg || !this.params.hospitalId) {
        this.$refs["params"].resetFields();
        this.drugPolicy = [];
      } else {
        this.currentPage = 1;
        this.getAllotPolicy();
      }
    },
    handleSizeChange: function handleSizeChange(val) {
      this.pageNum = val;
      this.currentPage = 1;
      this.getAllotPolicy();
    },
    handleCurrentChange: function handleCurrentChange(val) {
      this.currentPage = val;
      this.getAllotPolicy();
    }
  }
};

/***/ }),

/***/ 921:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("积分管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("调货政策管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("调货政策-选择药品"), _c('a', {
    staticStyle: {
      "color": "#f24040"
    }
  }, [_vm._v("（请先选择调货单位）")])])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "调货单位",
      "prop": "hospitalId"
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
      value: (_vm.params.hospitalId),
      callback: function($$v) {
        _vm.$set(_vm.params, "hospitalId", $$v)
      },
      expression: "params.hospitalId"
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
      "label": "产品编码",
      "prop": "productCode"
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
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.productCode),
      callback: function($$v) {
        _vm.$set(_vm.params, "productCode", $$v)
      },
      expression: "params.productCode"
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
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',119,') > -1),
      expression: "authCode.indexOf(',119,') > -1"
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
      value: (_vm.authCode.indexOf(',119,') > -1),
      expression: "authCode.indexOf(',119,') > -1"
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
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.$router.push('/main/allotpolicy');
      }
    }
  }, [_vm._v("返回列表")])], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "allot_policy"
  }, [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',119,') > -1),
      expression: "authCode.indexOf(',119,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    nativeOn: {
      "click": function($event) {
        $event.preventDefault();
        _vm.editBatchRow()
      }
    }
  }, [_vm._v("批量选择")])], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.drugPolicy,
      "size": "mini",
      "stripe": true,
      "border": true
    },
    on: {
      "selection-change": _vm.selectionChange
    }
  }, [_c('el-table-column', {
    attrs: {
      "type": "selection",
      "width": "55"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "product_common_name",
      "label": "产品名称",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_code",
      "label": "产品编码",
      "width": "140"
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
      "width": "200"
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
      "prop": "product_return_money",
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
            name: "dbClick",
            rawName: "v-dbClick"
          }, {
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',119,') > -1),
            expression: "authCode.indexOf(',119,') > -1"
          }],
          attrs: {
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.editRow(scope)
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
      "page-sizes": [5, 10, 50, 100],
      "page-size": _vm.pageNum,
      "layout": "total, sizes, prev, pager, next",
      "total": _vm.count
    },
    on: {
      "size-change": _vm.handleSizeChange,
      "current-change": _vm.handleCurrentChange
    }
  }), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "新增调货政策",
      "width": "700px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-collapse', {
    staticStyle: {
      "text-align": "left"
    },
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
  }, [_c('div', [_c('span', [_vm._v("规格:")]), _vm._v(_vm._s(_vm.drug.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.drug.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("积分:")]), _vm._v(_vm._s(_vm.drug.product_return_money))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.drug.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "policy",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px",
      "text-align": "left"
    },
    attrs: {
      "model": _vm.policy,
      "status-icon": "",
      "rules": _vm.policyBatchRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "政策公式",
      "prop": "allot_policy_formula"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "472px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    on: {
      "change": _vm.formulaChange
    },
    model: {
      value: (_vm.policy.allot_policy_formula),
      callback: function($$v) {
        _vm.$set(_vm.policy, "allot_policy_formula", $$v)
      },
      expression: "policy.allot_policy_formula"
    }
  }, [_c('el-option', {
    key: "1",
    attrs: {
      "label": "中标价*政策点数",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "中标价*政策点数-补点/费用票",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "4",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数-补点/费用票",
      "value": "4"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "5",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数",
      "value": "5"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "6",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票",
      "value": "6"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "7",
    attrs: {
      "label": "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分",
      "value": "7"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "8",
    attrs: {
      "label": "固定政策（上游政策修改后，需手动调整下游政策）",
      "value": "8"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.policy.allot_policy_formula != '8'),
      expression: "policy.allot_policy_formula != '8'"
    }],
    attrs: {
      "label": "政策点数",
      "prop": "allot_policy_percent",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "政策点数（如：60）"
    },
    model: {
      value: (_vm.policy.allot_policy_percent),
      callback: function($$v) {
        _vm.$set(_vm.policy, "allot_policy_percent", $$v)
      },
      expression: "policy.allot_policy_percent"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货积分",
      "prop": "allot_policy_money",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "调货积分"
    },
    model: {
      value: (_vm.policy.allot_policy_money),
      callback: function($$v) {
        _vm.$set(_vm.policy, "allot_policy_money", $$v)
      },
      expression: "policy.allot_policy_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货联系人",
      "prop": "allot_policy_contact_id"
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
      value: (_vm.policy.allot_policy_contact_id),
      callback: function($$v) {
        _vm.$set(_vm.policy, "allot_policy_contact_id", $$v)
      },
      expression: "policy.allot_policy_contact_id"
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
      "label": "积分备注",
      "prop": "allot_policy_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "积分备注"
    },
    model: {
      value: (_vm.policy.allot_policy_remark),
      callback: function($$v) {
        _vm.$set(_vm.policy, "allot_policy_remark", $$v)
      },
      expression: "policy.allot_policy_remark"
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
        _vm.editSales('policy')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "批量新增调货政策",
      "width": "700px",
      "visible": _vm.dialogFormVisibleBatch
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisibleBatch = $event
      }
    }
  }, [_c('el-form', {
    ref: "policyBatch",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px",
      "text-align": "left"
    },
    attrs: {
      "model": _vm.policyBatch,
      "status-icon": "",
      "rules": _vm.policyBatchRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "政策公式",
      "prop": "allot_policy_formula"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "472px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.policyBatch.allot_policy_formula),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "allot_policy_formula", $$v)
      },
      expression: "policyBatch.allot_policy_formula"
    }
  }, [_c('el-option', {
    key: "1",
    attrs: {
      "label": "中标价*政策点数",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "中标价*政策点数-补点/费用票",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "4",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数-补点/费用票",
      "value": "4"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "5",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数",
      "value": "5"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "6",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票",
      "value": "6"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "7",
    attrs: {
      "label": "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分",
      "value": "7"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "政策点数",
      "prop": "allot_policy_percent",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "政策点数（如：60）"
    },
    model: {
      value: (_vm.policyBatch.allot_policy_percent),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "allot_policy_percent", $$v)
      },
      expression: "policyBatch.allot_policy_percent"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货联系人",
      "prop": "allot_policy_contact_id"
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
      value: (_vm.policyBatch.allot_policy_contact_id),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "allot_policy_contact_id", $$v)
      },
      expression: "policyBatch.allot_policy_contact_id"
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
      "label": "积分备注",
      "prop": "allot_policy_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "积分备注"
    },
    model: {
      value: (_vm.policyBatch.allot_policy_remark),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "allot_policy_remark", $$v)
      },
      expression: "policyBatch.allot_policy_remark"
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
        _vm.dialogFormVisibleBatch = false
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
        _vm.editSalesBatch('policyBatch')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-13cb86c6", module.exports)
  }
}

/***/ }),

/***/ 922:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(923);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-c9d01edc!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./salesPolicy.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-c9d01edc!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./salesPolicy.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 923:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.copy_form .search .el-form-item__label {\n  padding-left: 0px !important;\n}\n.copy_form .el-form--inline .el-form-item{\n  margin-right: 4px !important;\n}\n.copy_form  .el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before{\n  display: none;\n}\n.el-collapse-item__content > div{\n  display: inline-block;\n  width: 30%;\n}\n.el-collapse-item__content > div > span{\n  display: inline-block;\n  width: 56px;\n  text-align: right;\n  padding-right: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 924:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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

    var validateBatchPercent = function validateBatchPercent(rule, value, callback) {
      if (!value && _this.policy.sale_policy_formula != '8') {
        callback(new Error('请再输入政策点数'));
      } else if (value && !/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
        callback(new Error('请输入正确的政策点数'));
      } else {
        _this.policy.sale_policy_money = _this.getShouldPayMoney(_this.policy.sale_policy_formula, _this.drug.product_price, _this.drug.product_return_money, _this.policy.sale_policy_percent, 0, _this.policy.sale_policy_money);
        _this.policy.sale_policy_money = Math.round(_this.policy.sale_policy_money * 100) / 100;
        callback();
      }
    };
    var validateBatchMoney = function validateBatchMoney(rule, value, callback) {
      var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
      if (_this.isEmpty(value)) {
        callback(new Error('请再输入' + rule.labelname));
      } else if (!reg.test(value)) {
        callback(new Error('请再输入正确的' + rule.labelname));
      } else {
        _this.policy.sale_policy_money = _this.getShouldPayMoney(_this.policy.sale_policy_formula, _this.drug.product_price, _this.drug.product_return_money, _this.policy.sale_policy_percent, 0, _this.policy.sale_policy_money);
        _this.policy.sale_policy_money = Math.round(_this.policy.sale_policy_money * 100) / 100;
        callback();
      }
    };
    return {
      drugPolicy: [],
      hospitals: [],
      contacts: [],
      drug: {},
      drugId: [],
      params: {
        hospitalId: "",
        productCommonName: "",
        sale_contact_id: "",
        productCode: ""
      },
      policy: {
        sale_policy_formula: "",
        sale_policy_percent: "",
        sale_policy_money: "",
        sale_policy_contact_id: "",
        sale_policy_remark: ""
      },
      copyPolicyParams: {
        hospital_id: "",
        hospital_id_copy: ""
      },
      copyPolicyParamsRule: {
        hospital_id: [{ required: true, message: '请选择被复制销往单位', trigger: 'change' }],
        hospital_id_copy: [{ required: true, message: '请选择复制的销住单位', trigger: 'change' }]
      },
      policyBatch: {
        sale_policy_formula: "1",
        sale_policy_percent: "",
        sale_policy_contact_id: "",
        sale_policy_remark: ""
      },
      policyBatchRule: {
        sale_policy_percent: [{ validator: validateBatchPercent, trigger: 'blur' }],
        sale_policy_money: [{ validator: validateBatchMoney, labelname: "销售积分", trigger: 'blur' }],
        sale_policy_contact_id: [{ required: true, message: '请选择联系人', trigger: 'change' }]
      },
      authCode: "",
      pageNum: 10,
      currentPage: 1,
      count: 0,
      dialogFormVisible: false,
      dialogFormVisiblePolicy: false,
      dialogFormVisibleBatch: false,
      loading: false
    };
  },
  activated: function activated() {
    this.getHospitals();
    this.getContacts();
    this.getSalesPolicy();
    this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
  },

  methods: {
    formulaChange: function formulaChange() {
      // if(this.policy.sale_policy_percent){
      this.policy.sale_policy_money = this.getShouldPayMoney(this.policy.sale_policy_formula, this.drug.product_price, this.drug.product_return_money, this.policy.sale_policy_percent, 0, this.policy.sale_policy_money);
      this.policy.sale_policy_money = Math.round(this.policy.sale_policy_money * 100) / 100;
      // }
    },
    copyPolicy: function copyPolicy(formName) {
      //政策复制
      var _self = this;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _self.loading = true;
          _self.jquery('/iae/salesPolicy/copySalesPolicy', _self.copyPolicyParams, function (res) {
            // _self.dialogFormVisiblePolicy = false;
            _self.loading = false;
            _self.$message({ showClose: true, message: '复制成功', type: 'success' });
          });
        } else {
          return false;
        }
      });
    },
    exportSalePolicy: function exportSalePolicy() {
      var url = this.$bus.data.host + "/iae/salesPolicy/exportSalesPolicy";
      this.download(url, this.params);
    },
    formatterFormula: function formatterFormula(row, column, cellValue, index) {
      var message = "";
      switch (cellValue) {
        case "1":
          message = "中标价*政策点数";
          break;
        case "2":
          message = "中标价*政策点数-补点/费用票";
          break;
        case "3":
          message = "实收上游积分或上游政策积分*政策点数";
          break;
        case "4":
          message = "实收上游积分或上游政策积分*政策点数-补点/费用票";
          break;
        case "5":
          message = "实收上游积分或上游政策积分-中标价*政策点数";
          break;
        case "6":
          message = "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票";
          break;
        case "7":
          message = "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分";
          break;
        case "8":
          message = "固定政策（上游政策修改后，需几时调整下游政策）";
          break;
        default:

      }
      return message;
    },
    formatterPercent: function formatterPercent(row, column, cellValue, index) {
      if (!this.isEmpty(row.sale_policy_money) && !this.isEmpty(row.product_return_money) && row.product_return_money != '0') {
        return Math.round(row.sale_policy_money * 100 / row.product_return_money) + "%";
      } else {
        return "";
      }
    },
    selectionChange: function selectionChange(val) {
      this.drugId = [];
      for (var i = 0; i < val.length; i++) {
        this.drugId.push({
          id: val[i].product_id,
          price: val[i].product_price,
          product_code: val[i].product_code,
          returnMoney: val[i].product_return_money,
          hospitalId: val[i].sale_hospital_id
        });
      }
    },
    editRow: function editRow(scope) {
      //编辑药品信息
      this.dialogFormVisible = true;
      var temp = JSON.stringify(scope.row);
      this.drug = JSON.parse(temp);
      this.policy.front_message = JSON.stringify({
        sale_policy_money: this.drug.sale_policy_money,
        sale_policy_contact_id: this.drug.sale_policy_contact_id,
        sale_policy_remark: this.drug.sale_policy_remark,
        sale_policy_percent: this.drug.sale_policy_percent,
        sale_policy_formula: this.drug.sale_policy_formula
      });
      this.policy.sale_policy_formula = this.drug.sale_policy_formula;
      this.policy.sale_policy_percent = this.drug.sale_policy_percent;
      this.policy.sale_policy_money = this.drug.sale_policy_money;
      this.policy.sale_policy_contact_id = this.drug.sale_policy_contact_id;
      this.policy.sale_policy_remark = this.drug.sale_policy_remark;
      this.policy.product_price = this.drug.product_price;
      this.policy.product_return_money = this.drug.product_return_money;
    },
    editBatchRow: function editBatchRow() {
      if (this.drugId.length > 0) {
        this.dialogFormVisibleBatch = true;
      }
    },
    getContacts: function getContacts() {
      var _self = this;
      this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['业务员'] }, function (res) {
        _self.contacts = res.message;
      });
    },
    getSalesPolicy: function getSalesPolicy() {
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
      this.jquery('/iae/salesPolicy/getSalesPolicy', {
        data: _self.params,
        page: page
      }, function (res) {
        _self.drugPolicy = res.message.data;
        _self.pageNum = parseInt(res.message.limit);
        _self.count = res.message.totalCount;
      });
    },
    editSales: function editSales(formName) {
      var _this2 = this;

      var _self = this;
      _self.policy.sale_hospital_id = this.drug.sale_hospital_id;
      _self.policy.sale_drug_id = this.drug.product_id;
      _self.policy.product_code = this.drug.product_code;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this2.loading = true;
          _self.jquery('/iae/salesPolicy/editSalesPolicy', _self.policy, function (res) {
            _self.dialogFormVisible = false;
            _self.loading = false;
            _self.$message({ showClose: true, message: '修改成功', type: 'success' });
            _self.getSalesPolicy();
          });
        } else {
          return false;
        }
      });
    },
    editSalesBatch: function editSalesBatch(formName) {
      var _this3 = this;

      var _self = this;
      _self.policyBatch.sale_hospital_id = this.params.hospitalId;
      _self.policyBatch.saleDrugs = this.drugId;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this3.loading = true;
          _self.jquery('/iae/salesPolicy/editSalesPolicyBatch', _self.policyBatch, function (res) {
            _self.$refs["policyBatch"].resetFields();
            _self.dialogFormVisibleBatch = false;
            _self.loading = false;
            _self.getSalesPolicy();
            _self.$message({ showClose: true, message: '批量修改成功', type: 'success' });
          });
        } else {
          return false;
        }
      });
    },
    getHospitals: function getHospitals() {
      var _self = this;
      this.jquery('/iae/hospitals/getAllHospitals', { hospital_type: '销售单位' }, function (res) {
        _self.hospitals = res.message;
      });
    },
    reSearch: function reSearch(arg) {
      this.$refs["params"].resetFields();
      this.currentPage = 1;
      this.getSalesPolicy();
    },
    handleSizeChange: function handleSizeChange(val) {
      this.pageNum = val;
      this.currentPage = 1;
      this.getSalesPolicy();
    },
    handleCurrentChange: function handleCurrentChange(val) {
      this.currentPage = val;
      this.getSalesPolicy();
    }
  }
};

/***/ }),

/***/ 925:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("积分管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("销售政策管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "销往单位",
      "prop": "hospitalId"
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
      value: (_vm.params.hospitalId),
      callback: function($$v) {
        _vm.$set(_vm.params, "hospitalId", $$v)
      },
      expression: "params.hospitalId"
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
      "label": "产品编码",
      "prop": "productCode"
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
        _vm.getSalesPolicy()
      }
    },
    model: {
      value: (_vm.params.productCode),
      callback: function($$v) {
        _vm.$set(_vm.params, "productCode", $$v)
      },
      expression: "params.productCode"
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
        _vm.getSalesPolicy()
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
      "label": "　业务员",
      "prop": "sale_contact_id"
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
      value: (_vm.params.sale_contact_id),
      callback: function($$v) {
        _vm.$set(_vm.params, "sale_contact_id", $$v)
      },
      expression: "params.sale_contact_id"
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
  })], 2)], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',130,') > -1),
      expression: "authCode.indexOf(',130,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.getSalesPolicy()
      }
    }
  }, [_vm._v("查询")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',130,') > -1),
      expression: "authCode.indexOf(',130,') > -1"
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
      value: (_vm.authCode.indexOf(',118,') > -1),
      expression: "authCode.indexOf(',118,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.$router.push('/main/salespolicydrugs');
      }
    }
  }, [_vm._v("新增")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',134,') > -1),
      expression: "authCode.indexOf(',134,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.exportSalePolicy
    }
  }, [_vm._v("导出")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',131,') > -1),
      expression: "authCode.indexOf(',131,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.dialogFormVisiblePolicy = true
      }
    }
  }, [_vm._v("政策复制")])], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "allot_policy"
  }, [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',131,') > -1),
      expression: "authCode.indexOf(',131,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    nativeOn: {
      "click": function($event) {
        $event.preventDefault();
        _vm.editBatchRow()
      }
    }
  }, [_vm._v("批量修改")])], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.drugPolicy,
      "size": "mini",
      "stripe": true,
      "border": true
    },
    on: {
      "selection-change": _vm.selectionChange
    }
  }, [_c('el-table-column', {
    attrs: {
      "type": "selection",
      "width": "55"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "hospital_name",
      "label": "销往单位",
      "width": "120"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "product_common_name",
      "label": "产品名称",
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
      "prop": "product_return_money",
      "label": "积分",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "sale_policy_money",
      "label": "销售积分",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "sale_policy_percent",
      "label": "政策点数",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "sale_policy_formula",
      "label": "政策公式",
      "width": "80",
      "formatter": _vm.formatterFormula
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "积分比例",
      "width": "80",
      "formatter": _vm.formatterPercent
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "sale_policy_remark",
      "label": "积分备注",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "业务员"
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
            value: (_vm.authCode.indexOf(',131,') > -1),
            expression: "authCode.indexOf(',131,') > -1"
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
      "layout": "total, sizes, prev, pager, next",
      "total": _vm.count
    },
    on: {
      "size-change": _vm.handleSizeChange,
      "current-change": _vm.handleCurrentChange
    }
  })], 1), _vm._v(" "), _c('el-dialog', {
    staticClass: "copy_form",
    attrs: {
      "title": "政策复制",
      "width": "700px",
      "visible": _vm.dialogFormVisiblePolicy
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisiblePolicy = $event
      }
    }
  }, [_c('el-form', {
    ref: "copyPolicyParams",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.copyPolicyParams,
      "rules": _vm.copyPolicyParamsRule,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "将",
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
      value: (_vm.copyPolicyParams.hospital_id),
      callback: function($$v) {
        _vm.$set(_vm.copyPolicyParams, "hospital_id", $$v)
      },
      expression: "copyPolicyParams.hospital_id"
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
      "label": "的政策复制到",
      "prop": "hospital_id_copy"
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
      value: (_vm.copyPolicyParams.hospital_id_copy),
      callback: function($$v) {
        _vm.$set(_vm.copyPolicyParams, "hospital_id_copy", $$v)
      },
      expression: "copyPolicyParams.hospital_id_copy"
    }
  }, _vm._l((_vm.hospitals), function(item) {
    return _c('el-option', {
      key: item.hospital_id,
      attrs: {
        "label": item.hospital_name,
        "value": item.hospital_id
      }
    })
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
        _vm.dialogFormVisiblePolicy = false
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
        _vm.copyPolicy('copyPolicyParams')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "修改销售政策",
      "width": "700px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-collapse', {
    staticStyle: {
      "text-align": "left"
    },
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
  }, [_c('div', [_c('span', [_vm._v("规格:")]), _vm._v(_vm._s(_vm.drug.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.drug.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("积分:")]), _vm._v(_vm._s(_vm.drug.product_return_money))]), _vm._v(" "), _c('div', {
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
      "model": _vm.policy,
      "status-icon": "",
      "rules": _vm.policyBatchRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "政策公式",
      "prop": "sale_policy_formula"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "472px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    on: {
      "change": _vm.formulaChange
    },
    model: {
      value: (_vm.policy.sale_policy_formula),
      callback: function($$v) {
        _vm.$set(_vm.policy, "sale_policy_formula", $$v)
      },
      expression: "policy.sale_policy_formula"
    }
  }, [_c('el-option', {
    key: "1",
    attrs: {
      "label": "中标价*政策点数",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "中标价*政策点数-补点/费用票",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "4",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数-补点/费用票",
      "value": "4"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "5",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数",
      "value": "5"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "6",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票",
      "value": "6"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "7",
    attrs: {
      "label": "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分",
      "value": "7"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "8",
    attrs: {
      "label": "固定政策（上游政策修改后，需手动调整下游政策）",
      "value": "8"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.policy.sale_policy_formula != '8'),
      expression: "policy.sale_policy_formula != '8'"
    }],
    attrs: {
      "label": "政策点数",
      "prop": "sale_policy_percent",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "政策点数（如：60）"
    },
    model: {
      value: (_vm.policy.sale_policy_percent),
      callback: function($$v) {
        _vm.$set(_vm.policy, "sale_policy_percent", $$v)
      },
      expression: "policy.sale_policy_percent"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销售积分",
      "prop": "sale_policy_money",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "销售积分"
    },
    model: {
      value: (_vm.policy.sale_policy_money),
      callback: function($$v) {
        _vm.$set(_vm.policy, "sale_policy_money", $$v)
      },
      expression: "policy.sale_policy_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "业务员",
      "prop": "sale_policy_contact_id"
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
      value: (_vm.policy.sale_policy_contact_id),
      callback: function($$v) {
        _vm.$set(_vm.policy, "sale_policy_contact_id", $$v)
      },
      expression: "policy.sale_policy_contact_id"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "",
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
      "label": "积分备注",
      "prop": "sale_policy_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "积分备注"
    },
    model: {
      value: (_vm.policy.sale_policy_remark),
      callback: function($$v) {
        _vm.$set(_vm.policy, "sale_policy_remark", $$v)
      },
      expression: "policy.sale_policy_remark"
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
    attrs: {
      "title": "批量修改销售政策",
      "width": "700px",
      "visible": _vm.dialogFormVisibleBatch
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisibleBatch = $event
      }
    }
  }, [_c('el-form', {
    ref: "policyBatch",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.policyBatch,
      "status-icon": "",
      "rules": _vm.policyBatchRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "政策公式",
      "prop": "sale_policy_formula"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "472px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.policyBatch.sale_policy_formula),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "sale_policy_formula", $$v)
      },
      expression: "policyBatch.sale_policy_formula"
    }
  }, [_c('el-option', {
    key: "1",
    attrs: {
      "label": "中标价*政策点数",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "中标价*政策点数-补点/费用票",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "4",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数-补点/费用票",
      "value": "4"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "5",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数",
      "value": "5"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "6",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票",
      "value": "6"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "7",
    attrs: {
      "label": "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分",
      "value": "7"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "政策点数",
      "prop": "sale_policy_percent",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "政策点数（如：60）"
    },
    model: {
      value: (_vm.policyBatch.sale_policy_percent),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "sale_policy_percent", $$v)
      },
      expression: "policyBatch.sale_policy_percent"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货联系人",
      "prop": "sale_policy_contact_id"
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
      value: (_vm.policyBatch.sale_policy_contact_id),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "sale_policy_contact_id", $$v)
      },
      expression: "policyBatch.sale_policy_contact_id"
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
      "label": "积分备注",
      "prop": "sale_policy_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "积分备注"
    },
    model: {
      value: (_vm.policyBatch.sale_policy_remark),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "sale_policy_remark", $$v)
      },
      expression: "policyBatch.sale_policy_remark"
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
        _vm.dialogFormVisibleBatch = false
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
        _vm.editSalesBatch('policyBatch')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-c9d01edc", module.exports)
  }
}

/***/ }),

/***/ 926:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(927);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-67b36411!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./salesPolicyDrugs.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-67b36411!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./salesPolicyDrugs.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 927:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.copy_form .search .el-form-item__label {\n  padding-left: 0px !important;\n}\n.copy_form .el-form--inline .el-form-item{\n  margin-right: 4px !important;\n}\n.copy_form  .el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before{\n  display: none;\n}\n.el-collapse-item__content > div{\n  display: inline-block;\n  width: 30%;\n}\n.el-collapse-item__content > div > span{\n  display: inline-block;\n  width: 56px;\n  text-align: right;\n  padding-right: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 928:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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

    var validateBatchPercent = function validateBatchPercent(rule, value, callback) {
      if (!value && _this.policy.sale_policy_formula != '8') {
        callback(new Error('请再输入政策点数'));
      } else if (value && !/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
        callback(new Error('请输入正确的政策点数'));
      } else {
        _this.policy.sale_policy_money = _this.getShouldPayMoney(_this.policy.sale_policy_formula, _this.drug.product_price, _this.drug.product_return_money, _this.policy.sale_policy_percent, 0, _this.policy.sale_policy_money);
        _this.policy.sale_policy_money = Math.round(_this.policy.sale_policy_money * 100) / 100;
        callback();
      }
    };
    var validateBatchMoney = function validateBatchMoney(rule, value, callback) {
      var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
      if (_this.isEmpty(value)) {
        callback(new Error('请再输入' + rule.labelname));
      } else if (!reg.test(value)) {
        callback(new Error('请再输入正确的' + rule.labelname));
      } else {
        _this.policy.sale_policy_money = _this.getShouldPayMoney(_this.policy.sale_policy_formula, _this.drug.product_price, _this.drug.product_return_money, _this.policy.sale_policy_percent, 0, _this.policy.sale_policy_money);
        _this.policy.sale_policy_money = Math.round(_this.policy.sale_policy_money * 100) / 100;
        callback();
      }
    };
    return {
      drugPolicy: [],
      hospitals: [],
      contacts: [],
      drug: {},
      drugId: [],
      params: {
        hospitalId: "",
        productCommonName: "",
        productCode: ""
      },
      policy: {
        sale_policy_formula: "1",
        sale_policy_percent: "",
        sale_policy_money: "",
        sale_policy_contact_id: "",
        sale_policy_remark: ""
      },
      policyBatch: {
        sale_policy_formula: "1",
        sale_policy_percent: "",
        sale_policy_contact_id: "",
        sale_policy_remark: ""
      },
      policyBatchRule: {
        sale_policy_percent: [{ validator: validateBatchPercent, trigger: 'blur' }],
        sale_policy_money: [{ validator: validateBatchMoney, labelname: "销售积分", trigger: 'blur' }],
        sale_policy_contact_id: [{ required: true, message: '请选择联系人', trigger: 'change' }]
      },
      authCode: "",
      pageNum: 10,
      currentPage: 1,
      count: 0,
      dialogFormVisible: false,
      dialogFormVisiblePolicy: false,
      dialogFormVisibleBatch: false,
      loading: false
    };
  },
  activated: function activated() {
    this.getHospitals();
    this.getContacts();
    var _self = this;
    setTimeout(function () {
      _self.$refs["params"].resetFields();
      _self.drugPolicy = [];
    });
    this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
  },

  methods: {
    formulaChange: function formulaChange() {
      // if(this.policy.sale_policy_percent){
      this.policy.sale_policy_money = this.getShouldPayMoney(this.policy.sale_policy_formula, this.drug.product_price, this.drug.product_return_money, this.policy.sale_policy_percent, 0, this.policy.sale_policy_money);
      this.policy.sale_policy_money = Math.round(this.policy.sale_policy_money * 100) / 100;
      // }
    },
    editRow: function editRow(scope) {
      //编辑药品信息
      this.dialogFormVisible = true;
      var temp = JSON.stringify(scope.row);
      this.drug = JSON.parse(temp);
      this.policy.sale_policy_money = "";
      this.policy.sale_policy_contact_id = "";
      this.policy.sale_policy_remark = "";
      this.policy.sale_policy_formula = "1";
      this.policy.sale_policy_percent = "";
      var _self = this;
      setTimeout(function () {
        _self.$refs["policy"].clearValidate();
      }, 10);
    },
    editBatchRow: function editBatchRow() {
      if (this.drugId.length > 0) {
        this.dialogFormVisibleBatch = true;
      }
    },
    getContacts: function getContacts() {
      var _self = this;
      this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['业务员'] }, function (res) {
        _self.contacts = res.message;
      });
    },
    getSalesPolicy: function getSalesPolicy() {
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
      this.jquery('/iae/salesPolicy/getSalesPolicyDrugs', {
        data: _self.params,
        page: page
      }, function (res) {
        _self.drugPolicy = res.message.data;
        _self.pageNum = parseInt(res.message.limit);
        _self.count = res.message.totalCount;
      });
    },
    selectionChange: function selectionChange(val) {
      this.drugId = [];
      for (var i = 0; i < val.length; i++) {
        this.drugId.push({
          id: val[i].product_id,
          product_code: val[i].product_code,
          price: val[i].product_price,
          returnMoney: val[i].product_return_money
        });
      }
    },
    editSalesBatch: function editSalesBatch(formName) {
      var _this2 = this;

      var _self = this;
      _self.policyBatch.sale_hospital_id = this.params.hospitalId;
      _self.policyBatch.saleDrugs = this.drugId;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this2.loading = true;
          _self.jquery('/iae/salesPolicy/editSalesPolicyBatch', _self.policyBatch, function (res) {
            _self.$confirm('新增成功', '提示', {
              confirmButtonText: '继续添加',
              cancelButtonText: '返回调货列表',
              type: 'success'
            }).then(function () {
              _self.$refs["policyBatch"].resetFields();
              _self.dialogFormVisibleBatch = false;
              _self.loading = false;
              _self.getSalesPolicy();
            }).catch(function () {
              _self.$refs["policyBatch"].resetFields();
              _self.dialogFormVisibleBatch = false;
              _self.loading = false;
              _self.$router.push({ path: '/main/salesPolicy' });
            });
          });
        } else {
          return false;
        }
      });
    },
    editSales: function editSales(formName) {
      var _this3 = this;

      var _self = this;
      _self.policy.sale_hospital_id = this.params.hospitalId;
      _self.policy.sale_drug_id = this.drug.product_id;
      _self.policy.product_code = this.drug.product_code;
      _self.policy.product_price = this.drug.product_price;
      _self.policy.product_return_money = this.drug.product_return_money;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this3.loading = true;
          _self.jquery('/iae/salesPolicy/editSalesPolicy', _self.policy, function (res) {
            _self.$confirm('新增成功', '提示', {
              confirmButtonText: '继续添加',
              cancelButtonText: '返回销售列表',
              type: 'success'
            }).then(function () {
              _self.$refs["policy"].resetFields();
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.getSalesPolicy();
            }).catch(function () {
              _self.$refs["policy"].resetFields();
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.$router.push({ path: '/main/salesPolicy' });
            });
          });
        } else {
          return false;
        }
      });
    },
    getHospitals: function getHospitals() {
      var _self = this;
      this.jquery('/iae/hospitals/getAllHospitals', { hospital_type: '销售单位' }, function (res) {
        _self.hospitals = res.message;
      });
    },
    reSearch: function reSearch(arg) {
      if (arg || !this.params.hospitalId) {
        this.$refs["params"].resetFields();
        this.drugPolicy = [];
      } else {
        this.currentPage = 1;
        this.getSalesPolicy();
      }
    },
    handleSizeChange: function handleSizeChange(val) {
      this.pageNum = val;
      this.currentPage = 1;
      this.getSalesPolicy();
    },
    handleCurrentChange: function handleCurrentChange(val) {
      this.currentPage = val;
      this.getSalesPolicy();
    }
  }
};

/***/ }),

/***/ 929:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("积分管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("销售政策管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("销售政策管理-选择药品"), _c('a', {
    staticStyle: {
      "color": "#f24040"
    }
  }, [_vm._v("（请先选择销往单位）")])])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "销往单位",
      "prop": "hospitalId"
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
      value: (_vm.params.hospitalId),
      callback: function($$v) {
        _vm.$set(_vm.params, "hospitalId", $$v)
      },
      expression: "params.hospitalId"
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
      "label": "产品编码",
      "prop": "productCode"
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
        _vm.reSearch(false)
      }
    },
    model: {
      value: (_vm.params.productCode),
      callback: function($$v) {
        _vm.$set(_vm.params, "productCode", $$v)
      },
      expression: "params.productCode"
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
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',118,') > -1),
      expression: "authCode.indexOf(',118,') > -1"
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
      value: (_vm.authCode.indexOf(',118,') > -1),
      expression: "authCode.indexOf(',118,') > -1"
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
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.$router.push('/main/salespolicy');
      }
    }
  }, [_vm._v("返回列表")])], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "allot_policy"
  }, [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',118,') > -1),
      expression: "authCode.indexOf(',118,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    nativeOn: {
      "click": function($event) {
        $event.preventDefault();
        _vm.editBatchRow()
      }
    }
  }, [_vm._v("批量选择")])], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.drugPolicy,
      "size": "mini",
      "stripe": true,
      "border": true
    },
    on: {
      "selection-change": _vm.selectionChange
    }
  }, [_c('el-table-column', {
    attrs: {
      "type": "selection",
      "width": "55"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "product_common_name",
      "label": "产品名称",
      "width": "150"
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
      "width": "200"
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
      "prop": "product_return_money",
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
            name: "dbClick",
            rawName: "v-dbClick"
          }, {
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',118,') > -1),
            expression: "authCode.indexOf(',118,') > -1"
          }],
          attrs: {
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.editRow(scope)
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
      "page-sizes": [5, 10, 50, 100],
      "page-size": _vm.pageNum,
      "layout": "total, sizes, prev, pager, next",
      "total": _vm.count
    },
    on: {
      "size-change": _vm.handleSizeChange,
      "current-change": _vm.handleCurrentChange
    }
  }), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "新增销售政策",
      "width": "700px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
      }
    }
  }, [_c('el-collapse', {
    staticStyle: {
      "text-align": "left"
    },
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
  }, [_c('div', [_c('span', [_vm._v("规格:")]), _vm._v(_vm._s(_vm.drug.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.drug.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("积分:")]), _vm._v(_vm._s(_vm.drug.product_return_money))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.drug.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "policy",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px",
      "text-align": "left"
    },
    attrs: {
      "model": _vm.policy,
      "status-icon": "",
      "rules": _vm.policyBatchRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "政策公式",
      "prop": "sale_policy_formula"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "472px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    on: {
      "change": _vm.formulaChange
    },
    model: {
      value: (_vm.policy.sale_policy_formula),
      callback: function($$v) {
        _vm.$set(_vm.policy, "sale_policy_formula", $$v)
      },
      expression: "policy.sale_policy_formula"
    }
  }, [_c('el-option', {
    key: "1",
    attrs: {
      "label": "中标价*政策点数",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "中标价*政策点数-补点/费用票",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "4",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数-补点/费用票",
      "value": "4"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "5",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数",
      "value": "5"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "6",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票",
      "value": "6"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "7",
    attrs: {
      "label": "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分",
      "value": "7"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "8",
    attrs: {
      "label": "固定政策（上游政策修改后，需手动调整下游政策）",
      "value": "8"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.policy.sale_policy_formula != '8'),
      expression: "policy.sale_policy_formula != '8'"
    }],
    attrs: {
      "label": "政策点数",
      "prop": "sale_policy_percent",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "政策点数（如：60）"
    },
    model: {
      value: (_vm.policy.sale_policy_percent),
      callback: function($$v) {
        _vm.$set(_vm.policy, "sale_policy_percent", $$v)
      },
      expression: "policy.sale_policy_percent"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "销售积分",
      "prop": "sale_policy_money",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "销售积分"
    },
    model: {
      value: (_vm.policy.sale_policy_money),
      callback: function($$v) {
        _vm.$set(_vm.policy, "sale_policy_money", $$v)
      },
      expression: "policy.sale_policy_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "业务员",
      "prop": "sale_policy_contact_id"
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
      value: (_vm.policy.sale_policy_contact_id),
      callback: function($$v) {
        _vm.$set(_vm.policy, "sale_policy_contact_id", $$v)
      },
      expression: "policy.sale_policy_contact_id"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "",
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
      "label": "积分备注",
      "prop": "sale_policy_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "积分备注"
    },
    model: {
      value: (_vm.policy.sale_policy_remark),
      callback: function($$v) {
        _vm.$set(_vm.policy, "sale_policy_remark", $$v)
      },
      expression: "policy.sale_policy_remark"
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
        _vm.editSales('policy')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "批量新增销售政策",
      "width": "700px",
      "visible": _vm.dialogFormVisibleBatch
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisibleBatch = $event
      }
    }
  }, [_c('el-form', {
    ref: "policyBatch",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px",
      "text-align": "left"
    },
    attrs: {
      "model": _vm.policyBatch,
      "status-icon": "",
      "rules": _vm.policyBatchRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "政策公式",
      "prop": "sale_policy_formula"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "472px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.policyBatch.sale_policy_formula),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "sale_policy_formula", $$v)
      },
      expression: "policyBatch.sale_policy_formula"
    }
  }, [_c('el-option', {
    key: "1",
    attrs: {
      "label": "中标价*政策点数",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "中标价*政策点数-补点/费用票",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "4",
    attrs: {
      "label": "实收上游积分或上游政策积分*政策点数-补点/费用票",
      "value": "4"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "5",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数",
      "value": "5"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "6",
    attrs: {
      "label": "实收上游积分或上游政策积分-中标价*政策点数-补点/费用票",
      "value": "6"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "7",
    attrs: {
      "label": "实收上游积分或上游政策积分>中标价*政策点数?(中标价*政策点数):实收上游积分",
      "value": "7"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "政策点数",
      "prop": "sale_policy_percent",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "政策点数（如：60）"
    },
    model: {
      value: (_vm.policyBatch.sale_policy_percent),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "sale_policy_percent", $$v)
      },
      expression: "policyBatch.sale_policy_percent"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "调货联系人",
      "prop": "sale_policy_contact_id"
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
      value: (_vm.policyBatch.sale_policy_contact_id),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "sale_policy_contact_id", $$v)
      },
      expression: "policyBatch.sale_policy_contact_id"
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
      "label": "积分备注",
      "prop": "sale_policy_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "积分备注"
    },
    model: {
      value: (_vm.policyBatch.sale_policy_remark),
      callback: function($$v) {
        _vm.$set(_vm.policyBatch, "sale_policy_remark", $$v)
      },
      expression: "policyBatch.sale_policy_remark"
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
        _vm.dialogFormVisibleBatch = false
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
        _vm.editSalesBatch('policyBatch')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-67b36411", module.exports)
  }
}

/***/ }),

/***/ 98:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(914)

/* script */
__vue_exports__ = __webpack_require__(916)

/* template */
var __vue_template__ = __webpack_require__(917)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/allot/allotPolicy.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-20d21ef4", __vue_options__)
  } else {
    hotAPI.reload("data-v-20d21ef4", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] allotPolicy.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 99:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(918)

/* script */
__vue_exports__ = __webpack_require__(920)

/* template */
var __vue_template__ = __webpack_require__(921)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/allot/allotPolicyDrugs.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-13cb86c6", __vue_options__)
  } else {
    hotAPI.reload("data-v-13cb86c6", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] allotPolicyDrugs.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ })

});