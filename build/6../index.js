webpackJsonp([6],{

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

/***/ 352:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(353);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-5a9e1bea!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchaseRecovery.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-5a9e1bea!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchaseRecovery.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 353:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 354:
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

exports.default = {
	data: function data() {
		var validateBatchNumber = function validateBatchNumber(rule, value, callback) {
			var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
			if (value === '') {
				callback(new Error('请输入采退金额'));
			} else if (!reg.test(value)) {
				callback(new Error('请输入正确的采退金额'));
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
			purchasesrecovery: [],
			purchaserecovery: {
				purchaserecovery_time: null,
				purchaserecovery_money: "",
				purchaserecovery_number: "",
				purchaserecovery_return_money_time: null
			},
			contacts: [],
			money: 0, //总额统计
			pageNum: 20,
			currentPage: 1,
			count: 0,
			remarks: [],
			dialogFormVisible: false,
			loading: false,
			params: {
				product_makesmakers: "",
				productCommonName: "",
				contactId: "",
				time: [],
				product_code: "",
				business: ""
			},
			purchaserecoveryRule: {
				purchaserecovery_money: [{ validator: validateBatchNumber, trigger: 'blur' }],
				purchaserecovery_time: [{ required: true, message: '请选择采退时间', trigger: 'change' }]
			},
			authCode: "",
			business: [],
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
		this.getPurchasesLossList();
		this.getProductBusiness();
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted: function mounted() {},

	methods: {
		getProductBusiness: function getProductBusiness() {
			var _self = this;
			this.jquery("/iae/business/getAllBusiness", null, function (res) {
				//查询商业
				_self.business = res.message;
				sessionStorage["productbusiness"] = JSON.stringify(_self.business);
			});
		},
		editpurchaserecovery: function editpurchaserecovery(formName) {
			var _this = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this.loading = true;
					_self.jquery('/iae/purchaserecovery/editPurchaseRecovery', _self.purchaserecovery, function (res) {
						_self.dialogFormVisible = false;
						_self.loading = false;
						_self.$message({ showClose: true, message: '修改成功', type: 'success' });
						_self.getPurchasesLossList();
					});
				} else {
					return false;
				}
			});
		},
		getContacts: function getContacts() {
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['高打品种'] }, function (res) {
				_self.contacts = res.message;
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
			this.purchaserecovery = JSON.parse(temp);
			this.purchaserecovery.front_purchaserecovery = temp;
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
			this.jquery('/iae/purchaserecovery/deletePurchasesRecovery', {
				purchaserecovery_id: scope.row.purchaserecovery_id,
				purchaserecovery_drug_id: scope.row.purchaserecovery_drug_id,
				purchaserecovery_purchase_id: scope.row.purchaserecovery_purchase_id,
				purchaserecovery_number: scope.row.purchaserecovery_number,
				delete_flag: ""
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getPurchasesLossList();
				_self.dialogFormVisible = false;
			});
		},

		//跳转到编辑页面
		add: function add() {
			this.$router.push("/main/purchaserecoverydrugs");
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getPurchasesLossList();
		},
		getPurchasesLossList: function getPurchasesLossList() {
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
			this.jquery('/iae/purchaserecovery/getPurchasesRecorveryList', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.purchasesrecovery = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getPurchasesLossList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getPurchasesLossList();
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 355:
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
  }, [_c('el-breadcrumb-item', [_vm._v("采购管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("采退管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "采退时间",
      "prop": "time"
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
      value: (_vm.params.time),
      callback: function($$v) {
        _vm.$set(_vm.params, "time", $$v)
      },
      expression: "params.time"
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
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',110,') > -1),
      expression: "authCode.indexOf(',110,') > -1"
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
      value: (_vm.authCode.indexOf(',110,') > -1),
      expression: "authCode.indexOf(',110,') > -1"
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
      value: (_vm.authCode.indexOf(',113,') > -1),
      expression: "authCode.indexOf(',113,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.add
    }
  }, [_vm._v("新增")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.purchasesrecovery,
      "size": "mini",
      "height": _vm.tableHeight,
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "purchaserecovery_time",
      "label": "采退时间",
      "width": "80",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
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
      "prop": "product_price",
      "label": "中标价",
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
      "prop": "purchaserecovery_batch_stock_time",
      "label": "入库时间",
      "width": "60",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchaserecovery_batch_number",
      "label": "批号",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchaserecovery_number",
      "label": "采退数量",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchaserecovery_money",
      "label": "采退金额",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchaserecovery_return_money_time",
      "label": "退款时间",
      "width": "90",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "联系人",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "business_name",
      "label": "商业",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchase_recovery_remark",
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
            value: (_vm.authCode.indexOf(',111,') > -1),
            expression: "authCode.indexOf(',111,') > -1"
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
            value: (_vm.authCode.indexOf(',112,') > -1),
            expression: "authCode.indexOf(',112,') > -1"
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
      "title": "修改采退记录",
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
      "title": '药品信息（药品名：' + _vm.purchaserecovery.product_common_name + '）',
      "name": "2"
    }
  }, [_c('div', [_c('span', [_vm._v("产品编号:")]), _vm._v(_vm._s(_vm.purchaserecovery.product_code))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("产品规格:")]), _vm._v(_vm._s(_vm.purchaserecovery.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.purchaserecovery.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("包装:")]), _vm._v(_vm._s(_vm.purchaserecovery.product_packing))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("单位:")]), _vm._v(_vm._s(_vm.purchaserecovery.product_unit))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("打款价:")]), _vm._v(_vm._s(_vm.purchaserecovery.product_mack_price))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.purchaserecovery.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "purchaserecovery",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.purchaserecovery,
      "status-icon": "",
      "rules": _vm.purchaserecoveryRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "采退时间",
      "prop": "purchaserecovery_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择采退时间"
    },
    model: {
      value: (_vm.purchaserecovery.purchaserecovery_time),
      callback: function($$v) {
        _vm.$set(_vm.purchaserecovery, "purchaserecovery_time", $$v)
      },
      expression: "purchaserecovery.purchaserecovery_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "退款时间",
      "prop": "purchaserecovery_return_money_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择退款时间"
    },
    model: {
      value: (_vm.purchaserecovery.purchaserecovery_return_money_time),
      callback: function($$v) {
        _vm.$set(_vm.purchaserecovery, "purchaserecovery_return_money_time", $$v)
      },
      expression: "purchaserecovery.purchaserecovery_return_money_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "采退数量",
      "prop": "purchaserecovery_number",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "readonly": true,
      "maxlength": 10,
      "placeholder": "请输入采退数量"
    },
    model: {
      value: (_vm.purchaserecovery.purchaserecovery_number),
      callback: function($$v) {
        _vm.$set(_vm.purchaserecovery, "purchaserecovery_number", $$v)
      },
      expression: "purchaserecovery.purchaserecovery_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "采退金额",
      "prop": "purchaserecovery_money",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入采退金额"
    },
    model: {
      value: (_vm.purchaserecovery.purchaserecovery_money),
      callback: function($$v) {
        _vm.$set(_vm.purchaserecovery, "purchaserecovery_money", $$v)
      },
      expression: "purchaserecovery.purchaserecovery_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备　　注",
      "prop": "purchase_recovery_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "备注"
    },
    model: {
      value: (_vm.purchaserecovery.purchase_recovery_remark),
      callback: function($$v) {
        _vm.$set(_vm.purchaserecovery, "purchase_recovery_remark", $$v)
      },
      expression: "purchaserecovery.purchase_recovery_remark"
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
        _vm.editpurchaserecovery('purchaserecovery')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-5a9e1bea", module.exports)
  }
}

/***/ }),

/***/ 356:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(357);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-e9e53390!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchaseRecoveryDrugs.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-e9e53390!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchaseRecoveryDrugs.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 357:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 358:
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

exports.default = {
	data: function data() {
		var _this = this;

		var validateNum = function validateNum(rule, value, callback) {
			var regu = /^\+?[1-9][0-9]*$/;
			if (value === '') {
				callback(new Error('请输入采退数量'));
			} else if (!regu.test(value)) {
				callback(new Error('请输入正整数'));
			} else if (parseInt(value) > parseInt(_this.drug.batch_stock_number)) {
				callback(new Error('采退整数大于当前库存'));
			} else {
				_this.purchaserecovery.purchaserecovery_money = _this.purchaserecovery.purchaserecovery_money ? _this.purchaserecovery.purchaserecovery_money : _this.purchaserecovery.purchaserecovery_number * _this.drug.product_mack_price;
				_this.purchaserecovery.purchaserecovery_money = Math.round(_this.purchaserecovery.purchaserecovery_money * 100) / 100;
				callback();
			}
		};
		var validateBatchNumber = function validateBatchNumber(rule, value, callback) {
			var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
			if (value === '') {
				callback(new Error('请输入采退金额'));
			} else if (!reg.test(value)) {
				callback(new Error('请输入正确的采退金额'));
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
			purchasesrecorvery: [],
			purchaserecovery: {
				purchaserecovery_time: null,
				purchaserecovery_money: "",
				purchaserecovery_number: "",
				purchaserecovery_return_money_time: null
			},
			contacts: [],
			drug: {},
			money: 0, //总额统计
			pageNum: 20,
			currentPage: 1,
			count: 0,
			dialogFormVisible: false,
			loading: false,
			params: {
				product_makesmakers: "",
				productCommonName: "",
				contactId: "",
				time: [],
				product_code: "",
				business: ""
			},
			purchaserecoveryRule: {
				purchaserecovery_number: [{ validator: validateNum, trigger: 'blur' }],
				purchaserecovery_money: [{ validator: validateBatchNumber, trigger: 'blur' }],
				purchaserecovery_time: [{ required: true, message: '请选择采退时间', trigger: 'blur,change' }]
			},
			authCode: "",
			business: [],
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
		this.getpurchasesrecorveryDrugsList();
		this.getProductBusiness();
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted: function mounted() {},

	methods: {
		returnpurchaserecovery: function returnpurchaserecovery() {
			this.$router.push({ path: "/main/purchaserecovery" });
		},
		addpurchaserecovery: function addpurchaserecovery(formName) {
			var _this2 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this2.loading = true;
					_self.purchaserecovery.purchaserecovery_product_code = _self.drug.product_code;
					_self.purchaserecovery.purchaserecovery_batch_stock_time = _self.drug.batch_stock_time;
					_self.purchaserecovery.purchaserecovery_batch_number = _self.drug.batch_number;
					_self.purchaserecovery.purchaserecovery_purchase_id = _self.drug.batch_stock_purchase_id;
					_self.purchaserecovery.purchaserecovery_drug_id = _self.drug.batch_stock_drug_id;
					_self.purchaserecovery.product_return_money = _self.drug.product_return_money;
					_self.jquery('/iae/purchaserecovery/savePurchasesrecorvery', _self.purchaserecovery, function (res) {
						_self.$confirm('新增成功', '提示', {
							confirmButtonText: '继续添加',
							cancelButtonText: '返回报损列表',
							type: 'success'
						}).then(function () {
							_self.$refs["purchaserecovery"].resetFields();
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getpurchasesrecorveryDrugsList();
						}).catch(function () {
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.$router.push({ path: '/main/purchaserecovery' });
						});
					});
				} else {
					return false;
				}
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
		getContacts: function getContacts() {
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['高打品种'] }, function (res) {
				_self.contacts = res.message;
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
		selectRow: function selectRow(scope) {
			//编辑药品信息
			if (this.$refs["purchaserecovery"]) {
				this.$refs["purchaserecovery"].resetFields();
			}
			this.dialogFormVisible = true;
			var temp = JSON.stringify(scope.row);
			this.drug = JSON.parse(temp);
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getpurchasesrecorveryDrugsList();
		},
		getpurchasesrecorveryDrugsList: function getpurchasesrecorveryDrugsList() {
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
			this.jquery('/iae/purchaserecovery/getPurchasesRecorveryDrugs', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.purchasesrecorvery = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getpurchasesrecorveryDrugsList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getpurchasesrecorveryDrugsList();
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 359:
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
  }, [_c('el-breadcrumb-item', [_vm._v("采购管理")]), _vm._v(" "), _c('el-breadcrumb-item', {
    attrs: {
      "to": {
        path: '/main/purchaserecovery'
      }
    }
  }, [_vm._v("采退管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("采退管理-选择采退药品")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "入库时间",
      "prop": "time"
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
      value: (_vm.params.time),
      callback: function($$v) {
        _vm.$set(_vm.params, "time", $$v)
      },
      expression: "params.time"
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
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',110,') > -1),
      expression: "authCode.indexOf(',110,') > -1"
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
      value: (_vm.authCode.indexOf(',110,') > -1),
      expression: "authCode.indexOf(',110,') > -1"
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
      "click": _vm.returnpurchaserecovery
    }
  }, [_vm._v("返回列表")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.purchasesrecorvery,
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
      "prop": "product_mack_price",
      "label": "打款价",
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
      "prop": "batch_stock_time",
      "label": "入库时间",
      "width": "90",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "batch_number",
      "label": "批号",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "batch_stock_number",
      "label": "批次库存",
      "width": "90"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "联系人",
      "width": "60"
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
            value: (_vm.authCode.indexOf(',110,') > -1),
            expression: "authCode.indexOf(',110,') > -1"
          }, {
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
      "title": "新增采退记录",
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
      "title": '药品信息（药品名：' + _vm.drug.product_common_name + '；  库存：' + _vm.drug.batch_stock_number + '）',
      "name": "2"
    }
  }, [_c('div', [_c('span', [_vm._v("产品编号:")]), _vm._v(_vm._s(_vm.drug.product_code))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("产品规格:")]), _vm._v(_vm._s(_vm.drug.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.drug.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("包装:")]), _vm._v(_vm._s(_vm.drug.product_packing))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("单位:")]), _vm._v(_vm._s(_vm.drug.product_unit))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("打款价:")]), _vm._v(_vm._s(_vm.drug.product_mack_price))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.drug.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "purchaserecovery",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.purchaserecovery,
      "status-icon": "",
      "rules": _vm.purchaserecoveryRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "采退时间",
      "prop": "purchaserecovery_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择采退时间"
    },
    model: {
      value: (_vm.purchaserecovery.purchaserecovery_time),
      callback: function($$v) {
        _vm.$set(_vm.purchaserecovery, "purchaserecovery_time", $$v)
      },
      expression: "purchaserecovery.purchaserecovery_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "退款时间",
      "prop": "purchaserecovery_return_money_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择退款时间"
    },
    model: {
      value: (_vm.purchaserecovery.purchaserecovery_return_money_time),
      callback: function($$v) {
        _vm.$set(_vm.purchaserecovery, "purchaserecovery_return_money_time", $$v)
      },
      expression: "purchaserecovery.purchaserecovery_return_money_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "采退数量",
      "prop": "purchaserecovery_number",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入采退数量"
    },
    model: {
      value: (_vm.purchaserecovery.purchaserecovery_number),
      callback: function($$v) {
        _vm.$set(_vm.purchaserecovery, "purchaserecovery_number", $$v)
      },
      expression: "purchaserecovery.purchaserecovery_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "采退金额",
      "prop": "purchaserecovery_money",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入采退金额"
    },
    model: {
      value: (_vm.purchaserecovery.purchaserecovery_money),
      callback: function($$v) {
        _vm.$set(_vm.purchaserecovery, "purchaserecovery_money", $$v)
      },
      expression: "purchaserecovery.purchaserecovery_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备　　注",
      "prop": "purchase_recovery_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "备注"
    },
    model: {
      value: (_vm.purchaserecovery.purchase_recovery_remark),
      callback: function($$v) {
        _vm.$set(_vm.purchaserecovery, "purchase_recovery_remark", $$v)
      },
      expression: "purchaserecovery.purchase_recovery_remark"
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
        _vm.addpurchaserecovery('purchaserecovery')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-e9e53390", module.exports)
  }
}

/***/ }),

/***/ 360:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(361);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-5748214b!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchaseLoss.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-5748214b!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchaseLoss.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 361:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 362:
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

exports.default = {
	data: function data() {
		var validateBatchNumber = function validateBatchNumber(rule, value, callback) {
			var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
			if (value === '') {
				callback(new Error('请输入报损金额'));
			} else if (!reg.test(value)) {
				callback(new Error('请输入正确的报损金额'));
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
			purchasesloss: [],
			purchaseloss: {
				purchaseloss_time: null,
				purchaseloss_money: "",
				purchaseloss_number: ""
			},
			contacts: [],
			money: 0, //总额统计
			pageNum: 20,
			currentPage: 1,
			count: 0,
			remarks: [],
			dialogFormVisible: false,
			loading: false,
			params: {
				product_makesmakers: "",
				productCommonName: "",
				contactId: "",
				time: [],
				product_code: "",
				business: ""
			},
			purchaselossRule: {
				purchaseloss_money: [{ validator: validateBatchNumber, trigger: 'blur' }],
				purchaseloss_time: [{ required: true, message: '请选择报损时间', trigger: 'blur,change' }]
			},
			authCode: "",
			business: [],
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
		this.getContacts();
		this.getPurchasesLossList();
		this.getProductBusiness();
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted: function mounted() {},

	methods: {
		getProductBusiness: function getProductBusiness() {
			var _self = this;
			this.jquery("/iae/business/getAllBusiness", null, function (res) {
				//查询商业
				_self.business = res.message;
				sessionStorage["productbusiness"] = JSON.stringify(_self.business);
			});
		},
		editpurchaseloss: function editpurchaseloss(formName) {
			var _this = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this.loading = true;
					_self.jquery('/iae/purchaseloss/editPurchaseLoss', _self.purchaseloss, function (res) {
						_self.dialogFormVisible = false;
						_self.loading = false;
						_self.$message({ showClose: true, message: '修改成功', type: 'success' });
						_self.getPurchasesLossList();
					});
				} else {
					return false;
				}
			});
		},
		getContacts: function getContacts() {
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['高打品种'] }, function (res) {
				_self.contacts = res.message;
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
			this.purchaseloss = JSON.parse(temp);
			this.purchaseloss.front_purchaseloss = temp;
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
			this.jquery('/iae/purchaseloss/deletePurchasesLoss', {
				purchaseloss_id: scope.row.purchaseloss_id,
				purchaseloss_drug_id: scope.row.purchaseloss_drug_id,
				purchaseloss_purchase_id: scope.row.purchaseloss_purchase_id,
				purchaseloss_number: scope.row.purchaseloss_number,
				delete_flag: ""
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getPurchasesLossList();
				_self.dialogFormVisible = false;
			});
		},

		//跳转到编辑页面
		add: function add() {
			this.$router.push("/main/purchaselossdrugs");
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getPurchasesLossList();
		},
		getPurchasesLossList: function getPurchasesLossList() {
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
			this.jquery('/iae/purchaseloss/getPurchasesLossList', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.purchasesloss = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getPurchasesLossList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getPurchasesLossList();
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 363:
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
  }, [_c('el-breadcrumb-item', [_vm._v("采购管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("报损管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "报损时间",
      "prop": "time"
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
      value: (_vm.params.time),
      callback: function($$v) {
        _vm.$set(_vm.params, "time", $$v)
      },
      expression: "params.time"
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
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',114,') > -1),
      expression: "authCode.indexOf(',114,') > -1"
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
      value: (_vm.authCode.indexOf(',114,') > -1),
      expression: "authCode.indexOf(',114,') > -1"
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
      value: (_vm.authCode.indexOf(',117,') > -1),
      expression: "authCode.indexOf(',117,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.add
    }
  }, [_vm._v("新增")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.purchasesloss,
      "size": "mini",
      "height": _vm.tableHeight,
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "purchaseloss_time",
      "label": "报损时间",
      "width": "80",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
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
      "prop": "product_price",
      "label": "中标价",
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
      "prop": "purchaseloss_batch_stock_time",
      "label": "入库时间",
      "width": "60",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchaseloss_batch_number",
      "label": "批号",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchaseloss_number",
      "label": "报数数量",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchaseloss_money",
      "label": "报损金额",
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
      "prop": "business_name",
      "label": "商业",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchase_loss_remark",
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
            value: (_vm.authCode.indexOf(',115,') > -1),
            expression: "authCode.indexOf(',115,') > -1"
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
            value: (_vm.authCode.indexOf(',116,') > -1),
            expression: "authCode.indexOf(',116,') > -1"
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
      "title": "修改报损记录",
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
      "title": '药品信息（药品名：' + _vm.purchaseloss.product_common_name + '）',
      "name": "2"
    }
  }, [_c('div', [_c('span', [_vm._v("产品编号:")]), _vm._v(_vm._s(_vm.purchaseloss.product_code))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("产品规格:")]), _vm._v(_vm._s(_vm.purchaseloss.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.purchaseloss.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("包装:")]), _vm._v(_vm._s(_vm.purchaseloss.product_packing))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("单位:")]), _vm._v(_vm._s(_vm.purchaseloss.product_unit))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("打款价:")]), _vm._v(_vm._s(_vm.purchaseloss.product_mack_price))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.purchaseloss.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "purchaseloss",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.purchaseloss,
      "status-icon": "",
      "rules": _vm.purchaselossRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "报损时间",
      "prop": "purchaseloss_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择报损时间"
    },
    model: {
      value: (_vm.purchaseloss.purchaseloss_time),
      callback: function($$v) {
        _vm.$set(_vm.purchaseloss, "purchaseloss_time", $$v)
      },
      expression: "purchaseloss.purchaseloss_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "报损数量",
      "prop": "purchaseloss_number",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "readonly": true,
      "maxlength": 10,
      "placeholder": "请输入报损数量"
    },
    model: {
      value: (_vm.purchaseloss.purchaseloss_number),
      callback: function($$v) {
        _vm.$set(_vm.purchaseloss, "purchaseloss_number", $$v)
      },
      expression: "purchaseloss.purchaseloss_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "报损金额",
      "prop": "purchaseloss_money",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入报损金额"
    },
    model: {
      value: (_vm.purchaseloss.purchaseloss_money),
      callback: function($$v) {
        _vm.$set(_vm.purchaseloss, "purchaseloss_money", $$v)
      },
      expression: "purchaseloss.purchaseloss_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备　　注",
      "prop": "purchase_loss_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "备注"
    },
    model: {
      value: (_vm.purchaseloss.purchase_loss_remark),
      callback: function($$v) {
        _vm.$set(_vm.purchaseloss, "purchase_loss_remark", $$v)
      },
      expression: "purchaseloss.purchase_loss_remark"
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
        _vm.editpurchaseloss('purchaseloss')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-5748214b", module.exports)
  }
}

/***/ }),

/***/ 364:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(365);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-245c8210!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchaseLossDrugs.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-245c8210!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchaseLossDrugs.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 365:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),

/***/ 366:
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

exports.default = {
	data: function data() {
		var _this = this;

		var validateNum = function validateNum(rule, value, callback) {
			var regu = /^\+?[1-9][0-9]*$/;
			if (value === '') {
				callback(new Error('请输入报损数量'));
			} else if (!regu.test(value)) {
				callback(new Error('请输入正整数'));
			} else if (parseInt(value) > parseInt(_this.drug.batch_stock_number)) {
				callback(new Error('报损整数大于当前库存'));
			} else {
				_this.purchaseloss.purchaseloss_money = _this.purchaseloss.purchaseloss_money ? _this.purchaseloss.purchaseloss_money : _this.purchaseloss.purchaseloss_number * _this.drug.product_mack_price;
				_this.purchaseloss.purchaseloss_money = Math.round(_this.purchaseloss.purchaseloss_money * 100) / 100;
				callback();
			}
		};
		var validateBatchNumber = function validateBatchNumber(rule, value, callback) {
			var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
			if (value === '') {
				callback(new Error('请输入报损金额'));
			} else if (!reg.test(value)) {
				callback(new Error('请输入正确的报损金额'));
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
			purchasesloss: [],
			purchaseloss: {
				purchaseloss_time: null,
				purchaseloss_money: "",
				purchaseloss_number: ""
			},
			contacts: [],
			drug: {},
			money: 0, //总额统计
			pageNum: 20,
			currentPage: 1,
			count: 0,
			dialogFormVisible: false,
			loading: false,
			params: {
				product_makesmakers: "",
				productCommonName: "",
				contactId: "",
				time: [],
				product_code: "",
				business: ""
			},
			purchaselossRule: {
				purchaseloss_number: [{ validator: validateNum, trigger: 'blur' }],
				purchaseloss_money: [{ validator: validateBatchNumber, trigger: 'blur' }],
				purchaseloss_time: [{ required: true, message: '请选择报损时间', trigger: 'blur,change' }]
			},
			authCode: "",
			business: [],
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
		this.getContacts();
		this.getPurchasesLossDrugsList();
		this.getProductBusiness();
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted: function mounted() {},

	methods: {
		returnPurchaseLoss: function returnPurchaseLoss() {
			this.$router.push({ path: "/main/purchaseloss" });
		},
		addpurchaseloss: function addpurchaseloss(formName) {
			var _this2 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this2.loading = true;
					_self.purchaseloss.purchaseloss_product_code = _self.drug.product_code;
					_self.purchaseloss.purchaseloss_batch_stock_time = _self.drug.batch_stock_time;
					_self.purchaseloss.purchaseloss_batch_number = _self.drug.batch_number;
					_self.purchaseloss.purchaseloss_purchase_id = _self.drug.batch_stock_purchase_id;
					_self.purchaseloss.purchaseloss_drug_id = _self.drug.batch_stock_drug_id;
					_self.jquery('/iae/purchaseloss/savePurchasesLoss', _self.purchaseloss, function (res) {
						_self.$confirm('新增成功', '提示', {
							confirmButtonText: '继续添加',
							cancelButtonText: '返回报损列表',
							type: 'success'
						}).then(function () {
							_self.$refs["purchaseloss"].resetFields();
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.getPurchasesLossDrugsList();
						}).catch(function () {
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.$router.push({ path: '/main/purchaseloss' });
						});
					});
				} else {
					return false;
				}
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
		getContacts: function getContacts() {
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['高打品种'] }, function (res) {
				_self.contacts = res.message;
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
		selectRow: function selectRow(scope) {
			//编辑药品信息
			if (this.$refs["purchaseloss"]) {
				this.$refs["purchaseloss"].resetFields();
			}
			this.dialogFormVisible = true;
			var temp = JSON.stringify(scope.row);
			this.drug = JSON.parse(temp);
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getPurchasesLossDrugsList();
		},
		getPurchasesLossDrugsList: function getPurchasesLossDrugsList() {
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
			this.jquery('/iae/purchaseloss/getPurchasesLossDrugs', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.purchasesloss = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
			});
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getPurchasesLossDrugsList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getPurchasesLossDrugsList();
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 367:
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
  }, [_c('el-breadcrumb-item', [_vm._v("采购管理")]), _vm._v(" "), _c('el-breadcrumb-item', {
    attrs: {
      "to": {
        path: '/main/purchaseloss'
      }
    }
  }, [_vm._v("报损管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("报损管理-选择报损药品")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "入库时间",
      "prop": "time"
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
      value: (_vm.params.time),
      callback: function($$v) {
        _vm.$set(_vm.params, "time", $$v)
      },
      expression: "params.time"
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
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',114,') > -1),
      expression: "authCode.indexOf(',114,') > -1"
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
      value: (_vm.authCode.indexOf(',114,') > -1),
      expression: "authCode.indexOf(',114,') > -1"
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
      "click": _vm.returnPurchaseLoss
    }
  }, [_vm._v("返回列表")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.purchasesloss,
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
      "prop": "product_mack_price",
      "label": "打款价",
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
      "prop": "batch_stock_time",
      "label": "入库时间",
      "width": "90",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "batch_number",
      "label": "批号",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "batch_stock_number",
      "label": "批次库存",
      "width": "90"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "联系人",
      "width": "60"
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
            value: (_vm.authCode.indexOf(',114,') > -1),
            expression: "authCode.indexOf(',114,') > -1"
          }, {
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
      "title": "新增报损记录",
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
      "title": '药品信息（药品名：' + _vm.drug.product_common_name + '；  库存：' + _vm.drug.batch_stock_number + '）',
      "name": "2"
    }
  }, [_c('div', [_c('span', [_vm._v("产品编号:")]), _vm._v(_vm._s(_vm.drug.product_code))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("产品规格:")]), _vm._v(_vm._s(_vm.drug.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.drug.product_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("包装:")]), _vm._v(_vm._s(_vm.drug.product_packing))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("单位:")]), _vm._v(_vm._s(_vm.drug.product_unit))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("打款价:")]), _vm._v(_vm._s(_vm.drug.product_mack_price))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.drug.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "purchaseloss",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.purchaseloss,
      "status-icon": "",
      "rules": _vm.purchaselossRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "报损时间",
      "prop": "purchaseloss_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择报损时间"
    },
    model: {
      value: (_vm.purchaseloss.purchaseloss_time),
      callback: function($$v) {
        _vm.$set(_vm.purchaseloss, "purchaseloss_time", $$v)
      },
      expression: "purchaseloss.purchaseloss_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "报损数量",
      "prop": "purchaseloss_number",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入报损数量"
    },
    model: {
      value: (_vm.purchaseloss.purchaseloss_number),
      callback: function($$v) {
        _vm.$set(_vm.purchaseloss, "purchaseloss_number", $$v)
      },
      expression: "purchaseloss.purchaseloss_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "报损金额",
      "prop": "purchaseloss_money",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "maxlength": 10,
      "placeholder": "请输入报损金额"
    },
    model: {
      value: (_vm.purchaseloss.purchaseloss_money),
      callback: function($$v) {
        _vm.$set(_vm.purchaseloss, "purchaseloss_money", $$v)
      },
      expression: "purchaseloss.purchaseloss_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备　　注",
      "prop": "purchase_loss_remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "备注"
    },
    model: {
      value: (_vm.purchaseloss.purchase_loss_remark),
      callback: function($$v) {
        _vm.$set(_vm.purchaseloss, "purchase_loss_remark", $$v)
      },
      expression: "purchaseloss.purchase_loss_remark"
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
        _vm.addpurchaseloss('purchaseloss')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-245c8210", module.exports)
  }
}

/***/ }),

/***/ 368:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(369);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-1e9f97f4!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchase.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-1e9f97f4!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchase.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 369:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.sum_money_purchase > a{\n\tpadding-left: 20px;\n\tcolor: #606266;\n}\n.sum_money_purchase > span{\n\tcolor:#606266;\n}\n.sum_money_purchase .more_detail{\n\tposition: absolute;\n\tright: 10px;\n\theight: 30px;\n\tline-height: 30px;\n\tcolor: #409EFF;\n\ttext-decoration: none;\n}\n.sum_money_purchase{\n\tposition: relative;\n\tbackground-color: #fff;\n\tborder-bottom: 1px solid #ebeef5;\n\theight: 30px;\n\tcolor:#f24040;\n\tline-height: 30px;\n\tfont-size: 14px;\n}\n", ""]);

// exports


/***/ }),

/***/ 37:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(352)

/* script */
__vue_exports__ = __webpack_require__(354)

/* template */
var __vue_template__ = __webpack_require__(355)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/purchase_recovery/purchaseRecovery.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5a9e1bea", __vue_options__)
  } else {
    hotAPI.reload("data-v-5a9e1bea", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] purchaseRecovery.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 370:
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

exports.default = {
	data: function data() {
		var _this = this;

		var validateNum = function validateNum(rule, value, callback) {
			var regu = /^\+?[1-9][0-9]*$/;
			if (value === '') {
				callback(new Error('请输入购入数量'));
			} else if (!regu.test(value)) {
				callback(new Error('请输入正整数'));
			} else {
				_this.purchase.purchase_money = _this.purchase.purchase_money ? _this.purchase.purchase_money : _this.purchase.purchase_number * _this.purchase.purchase_mack_price;
				_this.purchase.purchase_money = Math.round(_this.purchase.purchase_money * 100) / 100;
				callback();
			}
		};
		var validateBatchNumber = function validateBatchNumber(rule, value, callback) {
			var regu = /^\+?[1-9][0-9]*$/;
			if (_this.purchase.storage_time && _this.isEmpty(value)) {
				callback(new Error('请输入批号'));
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
			purchases: [],
			purchase: {},
			contacts: [],
			money: 0, //总额统计
			pageNum: 20,
			currentPage: 1,
			count: 0,
			remarks: [],
			dialogFormVisible: false,
			loading: false,
			params: {
				otherMoneyFlag: "",
				product_makesmakers: "",
				productCommonName: "",
				contactId: "",
				time: [],
				product_code: "",
				status: "",
				remark: "",
				business: "",
				batch_number: ""
			},
			purchaseRule: {
				purchase_number: [{ validator: validateNum, trigger: 'blur' }],
				batch_number: [{ validator: validateBatchNumber, trigger: 'blur' }],
				time: [{ required: true, message: '请选择备货时间', trigger: 'blur,change' }]
			},
			authCode: "",
			business: [],
			errorMessage: "",
			importPurchasesUrl: "",
			loadingImport: false,
			uploadButtom: "导入采进记录",
			dialogFormVisibleImport: false,
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
		this.getContacts();
		this.getPurchaseRemarks();
		this.getPurchasesList();
		this.getProductBusiness();
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted: function mounted() {
		this.importDrugsUrl = this.$bus.data.host + "/iae/purchase/importPurchases";
	},

	methods: {
		beforeUpload: function beforeUpload(file) {
			this.errorMessage = "";
			this.uploadButtom = "上传成功，正在导入...";
			this.loadingImport = true;
		},
		importDrugsSuccess: function importDrugsSuccess(response, file, fileList) {
			this.uploadButtom = "导入采进记录";
			this.loadingImport = false;
			var downloadErrorMessage = "<a style='color:red;' href='" + this.$bus.data.host + "/iae/purchase/downloadErrorPurchases'>下载错误数据</a>";
			this.errorMessage = response.message + downloadErrorMessage;
		},
		importShow: function importShow() {
			this.dialogFormVisibleImport = true;
			this.errorMessage = "";
			if (this.$refs.upload) {
				this.$refs.upload.clearFiles();
			}
		},
		downloadTemplate: function downloadTemplate() {
			window.location.href = this.$bus.data.host + "/download/template_purchases.xlsx";
		},
		formatPercent: function formatPercent(row, column, cellValue, index) {
			if (!this.isEmpty(cellValue)) {
				return cellValue + " %";
			} else {
				return "-";
			}
		},
		getProductBusiness: function getProductBusiness() {
			var _self = this;
			this.jquery("/iae/business/getAllBusiness", null, function (res) {
				//查询商业
				_self.business = res.message;
				sessionStorage["productbusiness"] = JSON.stringify(_self.business);
			});
		},
		exportExcel: function exportExcel() {
			var url = this.$bus.data.host + "/iae/purchase/exportPurchases";
			this.download(url, this.params);
		},
		handleSelect: function handleSelect(item) {
			this.purchase.remark = item.remark;
		},
		querySearch: function querySearch(queryString, cb) {
			var remarks = this.remarks;
			var results = queryString ? remarks.filter(this.createFilter(queryString)) : remarks;
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		createFilter: function createFilter(queryString) {
			var _self = this;
			return function (remarks) {
				if (!_self.isEmpty(remarks.remark)) {
					return remarks.remark.toLowerCase().indexOf(queryString.toLowerCase()) > -1;
				} else {
					return;
				}
			};
		},
		editPurchases: function editPurchases(formName) {
			var _this2 = this;

			var _self = this;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this2.loading = true;
					_self.jquery('/iae/purchase/editPurchase', _self.purchase, function (res) {
						_self.dialogFormVisible = false;
						_self.loading = false;
						_self.$message({ showClose: true, message: '修改成功', type: 'success' });
						_self.getPurchasesList();
					});
				} else {
					return false;
				}
			});
		},
		getContacts: function getContacts() {
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['高打品种'] }, function (res) {
				_self.contacts = res.message;
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
			this.purchase = JSON.parse(temp);
			this.purchase.front_purchase = temp;
			this.purchase.purchase_number_temp = this.purchase.purchase_number;
			this.purchase.storage_time_temp = this.purchase.storage_time;
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
			this.jquery('/iae/purchase/deletePurchases', {
				purchase_id: scope.row.purchase_id,
				delete_flag: "",
				storage_time: scope.row.storage_time,
				product_id: scope.row.product_id,
				stock: scope.row.stock,
				purchase_number: scope.row.purchase_number
			}, function (res) {
				_self.$message({ showClose: true, message: '删除成功', type: 'success' });
				_self.getPurchasesList();
				_self.dialogFormVisible = false;
			});
		},

		//跳转到编辑页面
		add: function add() {
			sessionStorage["remarks"] = JSON.stringify(this.remarks);
			this.$router.push("/main/purchasedrugs");
		},
		reSearch: function reSearch(arg) {
			if (arg) {
				this.$refs["params"].resetFields();
			}
			this.currentPage = 1;
			this.getPurchasesList();
		},
		getPurchaseRemarks: function getPurchaseRemarks() {
			var _self = this;
			this.jquery('/iae/purchase/getPurchaseRemarks', null, function (res) {
				_self.remarks = res.message;
			});
		},
		getPurchasesList: function getPurchasesList() {
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
			this.jquery('/iae/purchase/getPurchases', {
				data: _self.params,
				page: page
			}, function (res) {
				_self.purchases = res.message.data;
				_self.pageNum = parseInt(res.message.limit);
				_self.count = res.message.totalCount;
				_self.money = (res.message.purchaseMoney + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			});
		},
		handleSizeChange: function handleSizeChange(val) {
			this.pageNum = val;
			this.currentPage = 1;
			this.getPurchasesList();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.currentPage = val;
			this.getPurchasesList();
		}
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),

/***/ 371:
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
  }, [_c('el-breadcrumb-item', [_vm._v("采购管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("采进管理")])], 1), _vm._v(" "), _c('el-form', {
    ref: "params",
    staticClass: "demo-form-inline search",
    attrs: {
      "inline": true,
      "model": _vm.params,
      "size": "mini"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "备货时间",
      "prop": "time"
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
      value: (_vm.params.time),
      callback: function($$v) {
        _vm.$set(_vm.params, "time", $$v)
      },
      expression: "params.time"
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
      "label": "备货状态",
      "prop": "status"
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
      value: (_vm.params.status),
      callback: function($$v) {
        _vm.$set(_vm.params, "status", $$v)
      },
      expression: "params.status"
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
      "label": "未打款",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "打款,未发货",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "发货,未入库",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "4",
    attrs: {
      "label": "已入库",
      "value": "4"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "　费用票",
      "prop": "otherMoneyFlag"
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
      value: (_vm.params.otherMoneyFlag),
      callback: function($$v) {
        _vm.$set(_vm.params, "otherMoneyFlag", $$v)
      },
      expression: "params.otherMoneyFlag"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "全部",
      "value": ""
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "已开",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "未开",
      "value": "2"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "　　备注",
      "prop": "remark"
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
      value: (_vm.params.remark),
      callback: function($$v) {
        _vm.$set(_vm.params, "remark", $$v)
      },
      expression: "params.remark"
    }
  }, _vm._l((_vm.remarks), function(item) {
    return _c('el-option', {
      key: item.remark,
      attrs: {
        "label": item.remark,
        "value": item.remark
      }
    })
  }))], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',56,') > -1),
      expression: "authCode.indexOf(',56,') > -1"
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
      value: (_vm.authCode.indexOf(',56,') > -1),
      expression: "authCode.indexOf(',56,') > -1"
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
      value: (_vm.authCode.indexOf(',53,') > -1),
      expression: "authCode.indexOf(',53,') > -1"
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
      value: (_vm.authCode.indexOf(',57,') > -1),
      expression: "authCode.indexOf(',57,') > -1"
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
      value: (_vm.authCode.indexOf(',143,') > -1),
      expression: "authCode.indexOf(',143,') > -1"
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
      value: (_vm.authCode.indexOf(',143,') > -1),
      expression: "authCode.indexOf(',143,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.downloadTemplate
    }
  }, [_vm._v("导入模板下载")])], 1)], 1), _vm._v(" "), _c('div', {
    staticClass: "sum_money_purchase"
  }, [_c('a', [_vm._v("采购总额：")]), _vm._v(_vm._s(_vm.money) + " "), _c('span', [_vm._v("元")])]), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.purchases,
      "size": "mini",
      "height": _vm.tableHeight,
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
    attrs: {
      "fixed": "",
      "prop": "time",
      "label": "备货时间",
      "width": "80",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
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
      "prop": "purchase_number",
      "label": "购入数量",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchase_money",
      "label": "购入金额",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchase_other_money",
      "label": "补点/费用票",
      "width": "80"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchase_mack_price",
      "label": "打款价",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "purchase_price",
      "label": "中标价",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "puchase_gross_rate",
      "label": "毛利率",
      "width": "60",
      "formatter": _vm.formatPercent
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "batch_number",
      "label": "批号",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "ticket_number",
      "label": "税票号",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "联系人",
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
      "prop": "make_money_time",
      "label": "打款时间",
      "width": "80",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "send_out_time",
      "label": "发货时间",
      "width": "80",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "storage_time",
      "label": "入库时间",
      "width": "80",
      "formatter": _vm.formatterDate
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "remark",
      "label": "备注",
      "width": "200"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "fixed": "right",
      "prop": "remark",
      "label": "备货状态",
      "width": "80"
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(scope) {
        return [_c('el-tag', {
          directives: [{
            name: "show",
            rawName: "v-show",
            value: (scope.row.storage_time),
            expression: "scope.row.storage_time"
          }],
          attrs: {
            "type": "success",
            "size": "mini"
          }
        }, [_vm._v("已入库")]), _vm._v(" "), _c('el-tag', {
          directives: [{
            name: "show",
            rawName: "v-show",
            value: (scope.row.make_money_time && !scope.row.send_out_time),
            expression: "scope.row.make_money_time && !scope.row.send_out_time"
          }],
          attrs: {
            "type": "info",
            "size": "mini"
          }
        }, [_vm._v("未发货")]), _vm._v(" "), _c('el-tag', {
          directives: [{
            name: "show",
            rawName: "v-show",
            value: (scope.row.send_out_time && !scope.row.storage_time),
            expression: "scope.row.send_out_time && !scope.row.storage_time"
          }],
          attrs: {
            "type": "warning",
            "size": "mini"
          }
        }, [_vm._v("未入库")]), _vm._v(" "), _c('el-tag', {
          directives: [{
            name: "show",
            rawName: "v-show",
            value: (!scope.row.make_money_time),
            expression: "!scope.row.make_money_time"
          }],
          attrs: {
            "type": "danger",
            "size": "mini"
          }
        }, [_vm._v("未打款")])]
      }
    }])
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
            value: (_vm.authCode.indexOf(',55,') > -1),
            expression: "authCode.indexOf(',55,') > -1"
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
            value: (_vm.authCode.indexOf(',54,') > -1),
            expression: "authCode.indexOf(',54,') > -1"
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
      "title": "修改备货记录",
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
      "title": '药品信息（药品名：' + _vm.purchase.product_common_name + '）',
      "name": "2"
    }
  }, [_c('div', [_c('span', [_vm._v("产品编号:")]), _vm._v(_vm._s(_vm.purchase.product_code))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("产品规格:")]), _vm._v(_vm._s(_vm.purchase.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.purchase.purchase_price))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("包装:")]), _vm._v(_vm._s(_vm.purchase.product_packing))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("单位:")]), _vm._v(_vm._s(_vm.purchase.product_unit))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("打款价:")]), _vm._v(_vm._s(_vm.purchase.purchase_mack_price))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.purchase.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "purchase",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.purchase,
      "status-icon": "",
      "rules": _vm.purchaseRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "购入数量",
      "prop": "purchase_number",
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
      value: (_vm.purchase.purchase_number),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "purchase_number", $$v)
      },
      expression: "purchase.purchase_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "购入金额",
      "prop": "purchase_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    model: {
      value: (_vm.purchase.purchase_money),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "purchase_money", $$v)
      },
      expression: "purchase.purchase_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备货时间",
      "prop": "time"
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
      value: (_vm.purchase.time),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "time", $$v)
      },
      expression: "purchase.time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "补点/费用票",
      "prop": "purchase_other_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "补点/费用票"
    },
    model: {
      value: (_vm.purchase.purchase_other_money),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "purchase_other_money", $$v)
      },
      expression: "purchase.purchase_other_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "打款时间",
      "prop": "make_money_time"
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
      value: (_vm.purchase.make_money_time),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "make_money_time", $$v)
      },
      expression: "purchase.make_money_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "发货时间",
      "prop": "send_out_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择发货时间"
    },
    model: {
      value: (_vm.purchase.send_out_time),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "send_out_time", $$v)
      },
      expression: "purchase.send_out_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "入库时间",
      "prop": "storage_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "clearable": false,
      "placeholder": "请选择入库时间"
    },
    model: {
      value: (_vm.purchase.storage_time),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "storage_time", $$v)
      },
      expression: "purchase.storage_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "批号",
      "prop": "batch_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    model: {
      value: (_vm.purchase.batch_number),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "batch_number", $$v)
      },
      expression: "purchase.batch_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "税票号",
      "prop": "ticket_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    model: {
      value: (_vm.purchase.ticket_number),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "ticket_number", $$v)
      },
      expression: "purchase.ticket_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备注",
      "prop": "remark"
    }
  }, [_c('el-autocomplete', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "popper-class": "my-autocomplete",
      "fetch-suggestions": _vm.querySearch,
      "placeholder": "备注"
    },
    on: {
      "select": _vm.handleSelect
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(ref) {
        var item = ref.item;

        return [_c('div', {
          staticClass: "name"
        }, [_vm._v(_vm._s(item.remark))])]
      }
    }]),
    model: {
      value: (_vm.purchase.remark),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "remark", $$v)
      },
      expression: "purchase.remark"
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
        _vm.editPurchases('purchase')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1), _vm._v(" "), _c('el-dialog', {
    staticClass: "import_record",
    attrs: {
      "title": "导入采进记录",
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
     require("vue-hot-reload-api").rerender("data-v-1e9f97f4", module.exports)
  }
}

/***/ }),

/***/ 372:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(373);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(104)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-2881adc6&scoped=true!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchaseDrugs.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-2881adc6&scoped=true!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./purchaseDrugs.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 373:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.el-table .cell[data-v-2881adc6]{\n\twhite-space: nowrap;\n}\n", ""]);

// exports


/***/ }),

/***/ 374:
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

exports.default = {
	data: function data() {
		var _this = this;

		var validateNum = function validateNum(rule, value, callback) {
			var regu = /^\+?[1-9][0-9]*$/;
			if (value === '') {
				callback(new Error('请输入购入数量'));
			} else if (!regu.test(value)) {
				callback(new Error('请输入正整数'));
			} else {
				_this.purchase.purchase_money = _this.purchase.purchase_money ? _this.purchase.purchase_money : _this.purchase.purchase_number * _this.drug.product_mack_price;
				_this.purchase.purchase_money = Math.round(_this.purchase.purchase_money * 100) / 100;
				callback();
			}
		};
		var validateRealReturnMoney = function validateRealReturnMoney(rule, value, callback) {
			var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
			if (!reg.test(value)) {
				callback(new Error('请输入正确的实返金额'));
			} else if (_this.purchase.shoule_return_money && parseFloat(value) > parseFloat(_this.purchase.shoule_return_money)) {
				callback(new Error('实返金额不能大于应返金额'));
			} else {
				callback();
			}
		};
		var validateBatchNumber = function validateBatchNumber(rule, value, callback) {
			var regu = /^\+?[1-9][0-9]*$/;
			if (_this.purchase.storage_time && !value) {
				callback(new Error('请输入批号'));
			} else {
				callback();
			}
		};
		return {
			loading: false,
			dialogFormVisible: false,
			drugs: [],
			drug: {},
			contacts: [],
			business: [],
			pageNum: 20,
			currentPage: 1,
			count: 0,
			params: {
				product_type: ['高打', '高打(底价)'],
				productCommonName: "",
				contactId: "",
				product_code: "",
				business: "",
				product_distribution_flag: "0"
			},
			remarks: [],
			purchase: {
				drug_id: "",
				purchase_number: "",
				purchase_money: "",
				time: new Date(),
				storage_time: null,
				make_money_time: null,
				send_out_time: null,
				purchase_price: "",
				purchase_mack_price: "",
				puchase_gross_rate: "",
				remark: "",
				purchase_return_flag: "",
				batch_number: "",
				ticket_number: "",
				purchase_other_money: ""
			},
			purchaseRule: {
				batch_number: [{ validator: validateBatchNumber, trigger: 'blur' }],
				purchase_number: [{ validator: validateNum, trigger: 'blur' }],
				time: [{ required: true, message: '请选择备货时间', trigger: 'blur,change' }]
			},
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
		this.remarks = JSON.parse(sessionStorage["remarks"]);
		this.business = JSON.parse(sessionStorage["productbusiness"]);
	},
	mounted: function mounted() {},

	methods: {
		getContacts: function getContacts() {
			var _self = this;
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['高打品种'] }, function (res) {
				_self.contacts = res.message;
			});
		},
		handleSelect: function handleSelect(item) {
			this.purchase.remark = item.remark;
		},
		querySearch: function querySearch(queryString, cb) {
			var remarks = this.remarks;
			var results = queryString ? remarks.filter(this.createFilter(queryString)) : remarks;
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		createFilter: function createFilter(queryString) {
			var _self = this;
			return function (remarks) {
				if (!_self.isEmpty(remarks.remark)) {
					return remarks.remark.toLowerCase().indexOf(queryString.toLowerCase()) > -1;
				} else {
					return;
				}
			};
		},
		formatPercent: function formatPercent(row, column, cellValue, index) {
			return (100 - row.product_discount).toFixed(0) + "%";
		},

		//选择要进货的药品
		selectRow: function selectRow(scope) {
			var temp = JSON.stringify(scope.row);
			this.drug = JSON.parse(temp);
			if (this.$refs["purchase"]) {
				this.$refs["purchase"].resetFields();
			}
			this.dialogFormVisible = true;
		},

		//搜索所有药品信息
		searchDrugsList: function searchDrugsList() {
			this.getDrugsList();
		},
		returnPurchase: function returnPurchase() {
			this.$router.push("/main/purchase");
		},
		addPurchases: function addPurchases(formName) {
			var _this2 = this;

			var _self = this;
			this.purchase.purchase_price = this.drug.product_price;
			this.purchase.purchase_mack_price = this.drug.product_mack_price;
			this.purchase.drug_id = this.drug.product_id;
			this.purchase.stock = this.drug.stock, this.purchase.puchase_gross_rate = (100 - this.drug.product_discount).toFixed(0);
			this.purchase.purchase_return_flag = this.drug.product_return_statistics;
			this.purchase.product_return_money = this.drug.product_return_money;
			this.purchase.product_return_time_type = this.drug.product_return_time_type;
			this.purchase.product_return_time_day = this.drug.product_return_time_day;
			this.purchase.product_return_time_day_num = this.drug.product_return_time_day_num;
			this.purchase.refunds_policy_money = this.drug.product_return_money;
			this.purchase.product_high_discount = this.drug.product_high_discount;
			this.purchase.product_floor_price = this.drug.product_floor_price;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this2.loading = true;
					_self.jquery('/iae/purchase/savePurchases', _self.purchase, function (res) {
						_self.$confirm('新增成功', '提示', {
							confirmButtonText: '继续添加',
							cancelButtonText: '返回备货列表',
							type: 'success'
						}).then(function () {
							_self.$refs["purchase"].resetFields();
							_self.dialogFormVisible = false;
							_self.loading = false;
						}).catch(function () {
							_self.dialogFormVisible = false;
							_self.loading = false;
							_self.$router.push({ path: '/main/purchase' });
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

/***/ 375:
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
  }, [_c('el-breadcrumb-item', [_vm._v("采购管理")]), _vm._v(" "), _c('el-breadcrumb-item', {
    attrs: {
      "to": {
        path: '/main/purchase'
      }
    }
  }, [_vm._v("采进管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("选择药品"), _c('a', {
    staticStyle: {
      "color": "#f24040"
    }
  }, [_vm._v("（请先选择备货药品）")])])], 1), _vm._v(" "), _c('el-form', {
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
  })], 2)], 1), _vm._v(" "), _c('el-form-item', {
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
      "click": _vm.returnPurchase
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
      "width": "200"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_code",
      "label": "产品编号",
      "width": "150"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_specifications",
      "label": "产品规格",
      "width": "150"
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
      "prop": "product_price",
      "label": "中标价",
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
      "prop": "product_discount",
      "label": "毛利率(百分比)",
      "formatter": _vm.formatPercent,
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "contacts_name",
      "label": "联系人",
      "width": "60"
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
      "title": "新增备货记录",
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
    ref: "purchase",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.purchase,
      "status-icon": "",
      "rules": _vm.purchaseRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "购入数量",
      "prop": "purchase_number",
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
      value: (_vm.purchase.purchase_number),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "purchase_number", $$v)
      },
      expression: "purchase.purchase_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "购入金额",
      "prop": "purchase_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    model: {
      value: (_vm.purchase.purchase_money),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "purchase_money", $$v)
      },
      expression: "purchase.purchase_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备货时间",
      "prop": "time"
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
      value: (_vm.purchase.time),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "time", $$v)
      },
      expression: "purchase.time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "补点/费用票",
      "prop": "purchase_other_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "补点/费用票"
    },
    model: {
      value: (_vm.purchase.purchase_other_money),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "purchase_other_money", $$v)
      },
      expression: "purchase.purchase_other_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "打款时间",
      "prop": "make_money_time"
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
      value: (_vm.purchase.make_money_time),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "make_money_time", $$v)
      },
      expression: "purchase.make_money_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "发货时间",
      "prop": "send_out_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择发货时间"
    },
    model: {
      value: (_vm.purchase.send_out_time),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "send_out_time", $$v)
      },
      expression: "purchase.send_out_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "入库时间",
      "prop": "storage_time"
    }
  }, [_c('el-date-picker', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "type": "date",
      "placeholder": "请选择入库时间"
    },
    model: {
      value: (_vm.purchase.storage_time),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "storage_time", $$v)
      },
      expression: "purchase.storage_time"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "税票号",
      "prop": "ticket_number"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    model: {
      value: (_vm.purchase.ticket_number),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "ticket_number", $$v)
      },
      expression: "purchase.ticket_number"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "备注",
      "prop": "remark"
    }
  }, [_c('el-autocomplete', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "popper-class": "my-autocomplete",
      "fetch-suggestions": _vm.querySearch,
      "placeholder": "备注"
    },
    on: {
      "select": _vm.handleSelect
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(ref) {
        var item = ref.item;

        return [_c('div', {
          staticClass: "name"
        }, [_vm._v(_vm._s(item.remark))])]
      }
    }]),
    model: {
      value: (_vm.purchase.remark),
      callback: function($$v) {
        _vm.$set(_vm.purchase, "remark", $$v)
      },
      expression: "purchase.remark"
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
        _vm.addPurchases('purchase')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-2881adc6", module.exports)
  }
}

/***/ }),

/***/ 38:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(356)

/* script */
__vue_exports__ = __webpack_require__(358)

/* template */
var __vue_template__ = __webpack_require__(359)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/purchase_recovery/purchaseRecoveryDrugs.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-e9e53390", __vue_options__)
  } else {
    hotAPI.reload("data-v-e9e53390", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] purchaseRecoveryDrugs.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 39:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(360)

/* script */
__vue_exports__ = __webpack_require__(362)

/* template */
var __vue_template__ = __webpack_require__(363)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/purchase_loss/purchaseLoss.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5748214b", __vue_options__)
  } else {
    hotAPI.reload("data-v-5748214b", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] purchaseLoss.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 40:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(364)

/* script */
__vue_exports__ = __webpack_require__(366)

/* template */
var __vue_template__ = __webpack_require__(367)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/purchase_loss/purchaseLossDrugs.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-245c8210", __vue_options__)
  } else {
    hotAPI.reload("data-v-245c8210", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] purchaseLossDrugs.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 41:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(368)

/* script */
__vue_exports__ = __webpack_require__(370)

/* template */
var __vue_template__ = __webpack_require__(371)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/purchase/purchase.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1e9f97f4", __vue_options__)
  } else {
    hotAPI.reload("data-v-1e9f97f4", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] purchase.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 42:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(372)

/* script */
__vue_exports__ = __webpack_require__(374)

/* template */
var __vue_template__ = __webpack_require__(375)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/purchase/purchaseDrugs.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-2881adc6"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2881adc6", __vue_options__)
  } else {
    hotAPI.reload("data-v-2881adc6", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] purchaseDrugs.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ })

});