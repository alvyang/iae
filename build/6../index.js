webpackJsonp([6],{

/***/ 370:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(371);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(98)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-ed8ab4e4!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./drugs.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-ed8ab4e4!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./drugs.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 371:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.main_content .drug_list .el-dialog__wrapper .el-dialog .el-dialog__body{\n\tpadding-bottom:30px !important;\n}\n", ""]);

// exports


/***/ }),

/***/ 372:
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

exports.default = {
	data: function data() {
		return {
			drugs: [],
			contacts: [],
			business: [],
			tags: [], //标签
			pageNum: 10,
			currentPage: 1,
			count: 0,
			authCode: "",
			dialogFormVisible: false,
			params: {
				productCommonName: "",
				product_makesmakers: "",
				contactId: "",
				product_type: "",
				product_medical_type: "",
				product_code: "",
				business: "",
				tag: "",
				rate_gap: 0,
				rate_formula: "<=",
				product_distribution_flag: "0",
				tag_type: []
			},
			fileList: [], //上传文件列表
			importDrugsUrl: "",
			loading: false,
			uploadButtom: "导入药品",
			errorMessage: ""
		};
	},
	activated: function activated() {
		this.getDrugsList();
		this.getContacts();
		this.getProductBusiness();
		this.getTags();
		this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
	},
	mounted: function mounted() {
		this.importDrugsUrl = this.$bus.data.host + "/iae/drugs/importDrugs";
	},

	methods: {
		downloadTemplate: function downloadTemplate() {
			window.location.href = this.$bus.data.host + "/download/template_drugs.xlsx";
		},
		importShow: function importShow() {
			this.dialogFormVisible = true;
			this.errorMessage = "";
			this.$refs.upload.clearFiles();
		},
		beforeUpload: function beforeUpload(file) {
			this.errorMessage = "";
			this.uploadButtom = "上传成功，正在导入...";
			this.loading = true;
		},
		importDrugsSuccess: function importDrugsSuccess(response, file, fileList) {
			this.uploadButtom = "导入药品";
			this.loading = false;
			var downloadErrorMessage = "<a style='color:red;' href='" + this.$bus.data.host + "/iae/drugs/downloadErrorData'>下载错误数据</a>";
			this.errorMessage = response.message + downloadErrorMessage;
		},
		getTags: function getTags() {
			var _self = this;
			this.jquery("/iae/tag/getAllTags", null, function (res) {
				//查询商业
				_self.tags = res.message.tagAll;
			});
		},
		formatReturnExplain: function formatReturnExplain(row, column, cellValue, index) {
			if (row.product_type == "其它") {
				return "-";
			} else {
				var t = {
					1: "当月",
					2: "次月",
					3: "隔月"
				};
				var temp = row.product_return_time_type == '4' ? row.product_return_time_day_num + "天返积分" : t[row.product_return_time_type] + row.product_return_time_day + "日返积分";
				return cellValue + temp;
			}
		},
		formatPercent: function formatPercent(row, column, cellValue, index) {
			if (cellValue) {
				return cellValue + " %";
			} else {
				return "-";
			}
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
			this.jquery('/iae/contacts/getAllContacts', { group_id: 0, contact_type: ['佣金品种', '高打品种'] }, function (res) {
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
		formatterPer: function formatterPer(row, column, cellValue) {
			var per = row.product_commission / row.product_price * 100;
			return per.toFixed(2) + "%";
		},
		editRow: function editRow(scope) {
			//编辑药品信息
			sessionStorage["drugs_edit"] = JSON.stringify(this.drugs[scope.$index]);
			sessionStorage["contacts"] = JSON.stringify(this.contacts);
			sessionStorage["business"] = JSON.stringify(this.business);
			this.$router.push({ path: "/main/drugsedit" });
		},
		distributionFlagShow: function distributionFlagShow(scope, flag) {
			var _this = this;

			var message = flag == "0" ? "是否将该品种，标记为配送" : "是否将该品种，标记为不配送";
			this.$confirm(message, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(function () {
				_this.distributionFlag(scope, flag);
			});
		},
		distributionFlag: function distributionFlag(scope, flag) {
			var _self = this;
			this.jquery('/iae/drugs/distributionFlag', {
				product_id: scope.row.product_id,
				product_distribution_flag: flag
			}, function (res) {
				_self.$message({ showClose: true, message: '修改成功', type: 'success' });
				_self.getDrugsList();
				_self.dialogFormVisible = false;
			});
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
			});
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

		//跳转到编辑页面
		add: function add() {
			sessionStorage["contacts"] = JSON.stringify(this.contacts);
			sessionStorage["business"] = JSON.stringify(this.business);
			this.$router.push({ path: "/main/drugsedit" });
		},

		//搜索所有药品信息
		searchDrugsList: function searchDrugsList() {
			this.getDrugsList();
		},
		exportDrugs: function exportDrugs() {
			var url = this.$bus.data.host + "/iae/drugs/exportDrugs";
			this.download(url, this.params);
		},
		getDrugsList: function getDrugsList() {
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
			this.params.tag = this.params.tag_type[1];
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

/***/ }),

/***/ 373:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "drug_list"
  }, [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("药品管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("药品管理")])], 1), _vm._v(" "), _c('el-form', {
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
  })], 1), _vm._v(" "), _c('el-form-item', {
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
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',65,') > -1),
      expression: "authCode.indexOf(',65,') > -1"
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
      value: (_vm.authCode.indexOf(',65,') > -1),
      expression: "authCode.indexOf(',65,') > -1"
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
      value: (_vm.authCode.indexOf(',62,') > -1),
      expression: "authCode.indexOf(',62,') > -1"
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
      value: (_vm.authCode.indexOf(',122,') > -1),
      expression: "authCode.indexOf(',122,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": _vm.exportDrugs
    }
  }, [_vm._v("导出")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',100,') > -1),
      expression: "authCode.indexOf(',100,') > -1"
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
      value: (_vm.authCode.indexOf(',100,') > -1),
      expression: "authCode.indexOf(',100,') > -1"
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
      "data": _vm.drugs,
      "size": "mini",
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
      "width": "70",
      "formatter": _vm.formatPercent
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_mack_price",
      "label": "打款价",
      "width": "60"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "gross_interest_rate",
      "label": "毛利率",
      "width": "70",
      "formatter": _vm.formatPercent
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "accounting_cost",
      "label": "核算成本",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_type",
      "label": "品种类型",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_return_money",
      "label": "积分",
      "width": "70",
      "formatter": _vm.formatNull
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_return_discount",
      "label": "积分率",
      "width": "70",
      "formatter": _vm.formatPercent
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_return_explain",
      "label": "积分说明",
      "width": "200",
      "formatter": _vm.formatReturnExplain
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
      "label": "医保类型",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_purchase_mode",
      "label": "采购方式",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "product_basic_medicine",
      "label": "是否基药",
      "width": "70"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "tag_names",
      "label": "标签",
      "width": "100"
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
      "label": "操作",
      "width": "160"
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
            value: (_vm.authCode.indexOf(',64,') > -1),
            expression: "authCode.indexOf(',64,') > -1"
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
            value: (_vm.authCode.indexOf(',63,') > -1),
            expression: "authCode.indexOf(',63,') > -1"
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
        }), _vm._v(" "), _c('el-button', {
          directives: [{
            name: "dbClick",
            rawName: "v-dbClick"
          }, {
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',63,') > -1 && scope.row.product_distribution_flag == '1'),
            expression: "authCode.indexOf(',63,') > -1 && scope.row.product_distribution_flag == '1'"
          }],
          attrs: {
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.distributionFlagShow(scope, '0')
            }
          }
        }, [_vm._v("配送")]), _vm._v(" "), _c('el-button', {
          directives: [{
            name: "dbClick",
            rawName: "v-dbClick"
          }, {
            name: "show",
            rawName: "v-show",
            value: (_vm.authCode.indexOf(',63,') > -1 && scope.row.product_distribution_flag == '0'),
            expression: "authCode.indexOf(',63,') > -1 && scope.row.product_distribution_flag == '0'"
          }],
          attrs: {
            "type": "primary",
            "size": "mini"
          },
          nativeOn: {
            "click": function($event) {
              $event.preventDefault();
              _vm.distributionFlagShow(scope, '1')
            }
          }
        }, [_vm._v("不配")])]
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
      "title": "导入药品",
      "width": "600px",
      "visible": _vm.dialogFormVisible
    },
    on: {
      "update:visible": function($event) {
        _vm.dialogFormVisible = $event
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
      "loading": _vm.loading
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
     require("vue-hot-reload-api").rerender("data-v-ed8ab4e4", module.exports)
  }
}

/***/ }),

/***/ 374:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(375);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(98)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-02abf7b8!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./drugsEdit.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-02abf7b8!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./drugsEdit.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 375:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.add_div > div{\n\t\ttext-align: center;\n\t\tpadding-top: 40px;\n\t\tpadding-bottom: 20px;\n}\n.demo-ruleForm{\n\t\ttext-align: left;\n\t\tdisplay: inline-block;\n}\n.my-autocomplete  li {\n\t    line-height: normal;\n\t    padding: 7px;\n}\n.my-autocomplete li .name {\n      text-overflow: ellipsis;\n      overflow: hidden;\n}\n.my-autocomplete  li .addr {\n    font-size: 12px;\n    color: #b4b4b4;\n}\n.my-autocomplete  li .highlighted .addr {\n    color: #ddd;\n}\n", ""]);

// exports


/***/ }),

/***/ 376:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _tagInput = __webpack_require__(377);

var _tagInput2 = _interopRequireDefault(_tagInput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	data: function data() {
		var _this = this;

		var validateMoney = function validateMoney(rule, value, callback) {
			var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
			if (value && !reg.test(value)) {
				callback(new Error('请再输入正确的' + rule.labelname));
			} else {
				callback();
			}
		};
		var validateDecimal = function validateDecimal(rule, value, callback) {
			var reg = /^(([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)|([-]([1-9]\d+(.[0-9]{1,})?|\d(.[0-9]{1,})?)))$/;
			if (!reg.test(value)) {
				callback(new Error('请再输入正确的产品税率'));
			} else if (parseFloat(value) <= 0 || parseFloat(value) >= 1) {
				callback(new Error('产品税率大于0且小于1'));
			} else {
				callback();
			}
		};
		var validatePercent = function validatePercent(rule, value, callback) {
			if (value && !/^100.00$|100$|^(\d|[1-9]\d)(\.\d+)*$/.test(value)) {
				callback(new Error('请再输入正确的' + rule.labelname));
			} else {
				callback();
			}
		};
		var validateCode = function validateCode(rule, value, callback) {
			if (!value) {
				callback(new Error('请输入产品编号'));
			} else if (_this.editmessage == "修改" && _this.product_code == _this.drugs.product_code || !value) {
				callback();
			} else {
				_this.jquery("/iae/drugs/exitsCode", { product_code: _this.drugs.product_code }, function (res) {
					if (res.message.length > 0) {
						callback(new Error('该产品编号已存在'));
					} else {
						callback();
					}
				});
			}
		};
		var validateDay = function validateDay(rule, value, callback) {
			var regu = /^([1-9][0-9]*)$/;
			if (_this.drugs.product_return_time_type != '4' && value === '') {
				callback(new Error('请输入返款日'));
			} else if (_this.drugs.product_return_time_type != '4' && !regu.test(value)) {
				callback(new Error('请输入非0正整数'));
			} else if (_this.drugs.product_return_time_type != '4' && value > 31) {
				callback(new Error('返款日为1-31'));
			} else {
				callback();
			}
		};
		var validateDayNumber = function validateDayNumber(rule, value, callback) {
			var regu = /^(0|[1-9][0-9]*)$/;
			if (_this.drugs.product_return_time_type == '4' && value === '') {
				callback(new Error('请输入返款天数'));
			} else if (_this.drugs.product_return_time_type == '4' && !regu.test(value)) {
				callback(new Error('请输入正整数'));
			} else {
				callback();
			}
		};
		return {
			loading: false,
			product_return_statistics: "",
			drugs: {
				tag_ids: "",
				tag_ids_temp: "", //用于记录修改前的标签id，后台修改标签引用次数
				product_id: "",
				product_common_name: "",
				product_specifications: "",
				product_unit: "",
				product_packing: "",
				product_price: "",
				product_code: "",
				product_makesmakers: "",
				product_supplier: "",
				product_mack_price: "",
				product_discount: "",
				product_medical_type: "",
				product_type: "佣金",
				product_return_money: "",
				product_return_discount: "",
				product_floor_price: "",
				product_high_discount: "",
				contacts_id: "",
				product_return_explain: "",
				buyer: "",
				remark: "",
				product_name_pinyin: "",
				product_business: "",
				readonly: "",
				accounting_cost: "",
				gross_interest_rate: "",
				product_return_statistics: "1", //返款统计方式
				product_return_statistics_update: false, //是否更新销售记录中返款方式
				product_tax_rate: "", //产品税率
				product_purchase_mode: "", //采购方式
				product_basic_medicine: "", //是否基药
				product_return_time_type: "4", //返款时间类型
				product_return_time_day: "", //返款指定日期
				product_return_time_day_num: "45" //返款指定天数
			},
			drugsRule: {
				product_common_name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
				product_code: [{ validator: validateCode, trigger: 'blur' }],
				product_makesmakers: [{ required: true, message: '请输入生产厂家', trigger: 'blur,change' }],
				product_specifications: [{ required: true, message: '请输入产品规格', trigger: 'blur' }],
				product_price: [{ validator: validateMoney, labelname: '中标价', trigger: 'blur' }],
				product_mack_price: [{ validator: validateMoney, labelname: '成本价', trigger: 'blur' }],
				product_return_money: [{ validator: validateMoney, labelname: '返费金额', trigger: 'blur' }],
				product_floor_price: [{ validator: validateMoney, labelname: '底价', trigger: 'blur' }],
				accounting_cost: [{ validator: validateMoney, labelname: '核算成本', trigger: 'blur' }],
				product_discount: [{ validator: validateMoney, labelname: '扣率', trigger: 'blur' }],
				gross_interest_rate: [{ validator: validateMoney, labelname: '毛利率', trigger: 'blur' }],
				product_return_discount: [{ validator: validatePercent, labelname: '返费率', trigger: 'blur' }],
				product_high_discount: [{ validator: validatePercent, labelname: '底价', trigger: 'blur' }],
				product_return_time_day: [{ validator: validateDay, trigger: 'blur' }],
				product_return_time_day_num: [{ validator: validateDayNumber, trigger: 'blur' }]
			},
			editmessage: "",
			contacts: [],
			price: /\d{1,10}(\.\d{1,2})?$/,
			percent: /^100$|^(\d|[1-9]\d)(\.\d+)*$/,
			productMakesmakers: [], //生产厂家
			business: [], //商业
			product_code: "" //修改时，用于存放修改前的编码
		};
	},

	name: "drugs_edit",
	components: {
		'tag-input': _tagInput2.default
	},
	activated: function activated() {},
	beforeMount: function beforeMount() {
		// this.resetForm("drugs");
		this.drugs.product_id = "";
		this.drugs.readonly = "";
		this.contacts = JSON.parse(sessionStorage["contacts"]);
		this.business = JSON.parse(sessionStorage["business"]);
		if (sessionStorage["drugs_edit"]) {
			var sessionDrugs = JSON.parse(sessionStorage["drugs_edit"]);
			this.product_code = sessionDrugs.product_code;
			delete sessionDrugs.contacts_name;
			delete sessionDrugs.business_name;
			this.drugs = sessionDrugs;
			this.drugs.front_message = sessionStorage["drugs_edit"];
			this.drugs.tag_ids_temp = this.drugs.tag_ids;
			sessionStorage.removeItem('drugs_edit');
			/*
    * 返款统计由无返款  改为  按销售记录的返款，则更新销售记录
    */
			this.product_return_statistics = this.drugs.product_return_statistics;
			this.editmessage = "修改";
		} else {
			this.editmessage = "新增";
		}
		this.getProductMakesmakers();
	},

	methods: {
		emitTagIds: function emitTagIds(val) {
			this.drugs.tag_ids = val;
		},
		typeChange: function typeChange(label) {
			if (label == "高打" || label == "高打(底价)") {
				this.drugs.product_return_statistics = "2";
			} else if (label == "佣金") {
				this.drugs.product_return_statistics = "1";
			} else {
				this.drugs.product_return_statistics = "3";
			}
		},
		randomCode: function randomCode() {
			this.drugs.product_code = new Date().getTime();
		},
		getFirstLetter: function getFirstLetter() {
			var _self = this;
			this.jquery("/iae/drugs/getFirstLetter", { name: this.drugs.product_common_name }, function (res) {
				//查询添加过的生产厂家
				_self.drugs.product_name_pinyin = res.message;
			});
		},
		handleSelect: function handleSelect(item) {
			this.drugs.product_makesmakers = item.product_makesmakers;
			this.drugs.product_supplier = item.product_supplier;
		},
		querySearch: function querySearch(queryString, cb) {
			var productMakesmakers = this.productMakesmakers;
			var results = queryString ? productMakesmakers.filter(this.createFilter(queryString)) : productMakesmakers;
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		createFilter: function createFilter(queryString) {
			return function (productMakesmakers) {
				if (productMakesmakers.product_makesmakers) {
					return productMakesmakers.product_makesmakers.toLowerCase().indexOf(queryString.toLowerCase()) > -1;
				} else {
					return;
				}
			};
		},
		getProductMakesmakers: function getProductMakesmakers() {
			var _self = this;
			this.jquery("/iae/drugs/getProductMakesmakers", null, function (res) {
				//查询添加过的生产厂家
				_self.productMakesmakers = res.message;
			});
		},
		returnList: function returnList() {
			this.$router.push({ path: '/main/drugs' });
		},
		submitForm: function submitForm(formName) {
			var _this2 = this;

			var _self = this;
			var f1 = this.product_return_statistics != this.drugs.product_return_statistics;
			var f2 = this.product_return_statistics == 3;
			var f3 = this.drugs.product_return_statistics == 1;
			this.drugs.product_return_statistics_update = f1 && f2 && f3;
			this.$refs[formName].validate(function (valid) {
				if (valid) {
					_this2.loading = true;
					var url = _self.editmessage == '新增' ? "/iae/drugs/saveDrugs" : "/iae/drugs/editDrugs";
					_this2.jquery(url, _self.drugs, function (res) {
						_self.$confirm(_self.editmessage + '成功', '提示', {
							confirmButtonText: '继续添加',
							cancelButtonText: '返回列表',
							type: 'success'
						}).then(function () {
							_self.resetForm("drugs");
							_self.drugs.product_id = "";
							_self.loading = false;
						}).catch(function () {
							_self.loading = false;
							_self.$router.push({ path: '/main/drugs' });
						});
					});
				} else {
					_this2.loading = false;
					return false;
				}
			});
		},
		resetForm: function resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		priceBlur: function priceBlur() {
			//计算返费金额
			if (this.drugs.product_mack_price && this.drugs.product_floor_price && this.drugs.product_high_discount && this.price.test(this.drugs.product_floor_price) && this.percent.test(this.drugs.product_high_discount)) {
				this.drugs.product_return_money = (this.drugs.product_mack_price - this.drugs.product_floor_price) * (1 - this.drugs.product_high_discount / 100);
				this.drugs.product_return_money = Math.round(this.drugs.product_return_money * 100) / 100;
			}
			//计算扣率
			if (this.drugs.product_mack_price && this.drugs.product_price && this.price.test(this.drugs.product_mack_price)) {
				this.drugs.product_discount = this.drugs.product_mack_price * 100 / this.drugs.product_price;
				this.drugs.product_discount = Math.round(this.drugs.product_discount * 100) / 100;
			}
			//计算打款价
			if (this.drugs.product_mack_price && !this.drugs.accounting_cost && this.percent.test(this.drugs.product_mack_price)) {
				this.drugs.accounting_cost = this.drugs.product_mack_price;
			}
			//计算毛利率
			if (this.drugs.accounting_cost && this.drugs.product_price && this.price.test(this.drugs.accounting_cost)) {
				var temp = this.drugs.product_price - this.drugs.accounting_cost;
				this.drugs.gross_interest_rate = temp * 100 / this.drugs.product_price;
				this.drugs.gross_interest_rate = Math.round(this.drugs.gross_interest_rate * 100) / 100;
			}
			//计算返费率
			if (this.drugs.product_price && this.drugs.product_return_money && this.price.test(this.drugs.product_price) && this.price.test(this.drugs.product_return_money)) {
				this.drugs.product_return_discount = this.drugs.product_return_money / this.drugs.product_price * 100;
				this.drugs.product_return_discount = Math.round(this.drugs.product_return_discount * 100) / 100;
			}
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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

/***/ 377:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(378)

/* script */
__vue_exports__ = __webpack_require__(380)

/* template */
var __vue_template__ = __webpack_require__(381)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/drugs/tagInput.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-14776736"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-14776736", __vue_options__)
  } else {
    hotAPI.reload("data-v-14776736", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] tagInput.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 378:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(379);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(98)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-14776736&scoped=true!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./tagInput.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-14776736&scoped=true!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./tagInput.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 379:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.el-tag + .el-tag[data-v-14776736] {\n  margin-left: 10px;\n}\n.button-new-tag[data-v-14776736] {\n  margin-left: 10px;\n  height: 32px;\n  line-height: 30px;\n  padding-top: 0;\n  padding-bottom: 0;\n}\n.input-new-tag[data-v-14776736] {\n  width: 90px;\n  margin-left: 10px;\n  vertical-align: bottom;\n}\n", ""]);

// exports


/***/ }),

/***/ 380:
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

exports.default = {
  data: function data() {
    return {
      tags: [],
      dynamicTags: [],
      dynamicTagIds: [],
      inputVisible: false,
      inputValue: []
    };
  },

  props: ['tag_ids'],
  mounted: function mounted() {
    this.dynamicTags = [];
    this.dynamicTagIds = this.tag_ids ? this.tag_ids.split(",") : [];
    this.inputVisible = false;
    this.inputValue = [];
    this.getTags();
  },

  methods: {
    getTags: function getTags() {
      var _self = this;
      this.jquery("/iae/tag/getAllTags", { tag_ids: _self.tag_ids }, function (res) {
        //查询添加过的生产企业
        _self.tags = res.message.tagAll;
        _self.dynamicTags = res.message.tag;
      });
    },
    handleClose: function handleClose(tag) {
      //下拉列表设置为不可选
      for (var i = 0; i < this.tags.length; i++) {
        for (var j = 0; j < this.tags[i].children.length; j++) {
          if (this.tags[i].children[j].label == tag) {
            this.tags[i].children[j].disabled = false;
            this.dynamicTagIds.splice(this.dynamicTagIds.indexOf(this.tags[i].children[j].value + ""), 1);
            break;
          }
        }
      }
      this.$emit('emitTagIds', this.dynamicTagIds.join(","));
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },
    showInput: function showInput() {
      this.inputVisible = true;
    },
    handleInputConfirm: function handleInputConfirm(val) {
      var inputValue = this.inputValue;
      if (inputValue) {
        //下拉列表设置为不可选
        for (var i = 0; i < this.tags.length; i++) {
          for (var j = 0; j < this.tags[i].children.length; j++) {
            if (this.tags[i].children[j].value == inputValue[1]) {
              this.tags[i].children[j].disabled = true;
              this.dynamicTagIds.push(inputValue[1]);
              this.dynamicTags.push(this.tags[i].children[j].label);
              break;
            }
          }
        }
      }
      this.inputVisible = false;
      this.$emit('emitTagIds', this.dynamicTagIds.join(","));
      this.inputValue = [];
    }
  }
};

/***/ }),

/***/ 381:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_vm._l((_vm.dynamicTags), function(tag) {
    return _c('el-tag', {
      key: tag,
      attrs: {
        "closable": "",
        "disable-transitions": false
      },
      on: {
        "close": function($event) {
          _vm.handleClose(tag)
        }
      }
    }, [_vm._v("\n    " + _vm._s(tag) + "\n  ")])
  }), _vm._v(" "), (_vm.inputVisible) ? _c('el-cascader', {
    attrs: {
      "placeholder": "搜索标签",
      "size": "small",
      "options": _vm.tags,
      "filterable": ""
    },
    on: {
      "change": _vm.handleInputConfirm
    },
    model: {
      value: (_vm.inputValue),
      callback: function($$v) {
        _vm.inputValue = $$v
      },
      expression: "inputValue"
    }
  }) : _c('el-button', {
    staticClass: "button-new-tag",
    attrs: {
      "size": "small"
    },
    on: {
      "click": _vm.showInput
    }
  }, [_vm._v("选择标签")])], 2)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-14776736", module.exports)
  }
}

/***/ }),

/***/ 382:
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
  }, [_c('el-breadcrumb-item', {
    attrs: {
      "to": {
        path: '/main/drugs'
      }
    }
  }, [_vm._v("药品信息")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v(_vm._s(this.editmessage) + "药品")])], 1), _vm._v(" "), _c('div', {
    staticClass: "add_div"
  }, [_c('div', [_c('el-form', {
    ref: "drugs",
    staticClass: "demo-ruleForm",
    attrs: {
      "model": _vm.drugs,
      "status-icon": "",
      "rules": _vm.drugsRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('div', [_c('el-form-item', {
    attrs: {
      "label": "产品名称",
      "prop": "product_common_name"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "300px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 50,
      "placeholder": "产品名称"
    },
    on: {
      "blur": function($event) {
        _vm.drugs.product_name_pinyin = _vm.getFirstLetter(_vm.drugs.product_common_name)
      }
    },
    model: {
      value: (_vm.drugs.product_common_name),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_common_name", $$v)
      },
      expression: "drugs.product_common_name"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品助记码",
      "prop": "product_name_pinyin"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "250px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 20,
      "placeholder": "产品助记码"
    },
    model: {
      value: (_vm.drugs.product_name_pinyin),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_name_pinyin", $$v)
      },
      expression: "drugs.product_name_pinyin"
    }
  })], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "生产厂家",
      "prop": "product_makesmakers"
    }
  }, [_c('el-autocomplete', {
    staticStyle: {
      "width": "300px"
    },
    attrs: {
      "popper-class": "my-autocomplete",
      "fetch-suggestions": _vm.querySearch,
      "placeholder": "生产厂家"
    },
    on: {
      "select": _vm.handleSelect,
      "blur": function($event) {
        _vm.drugs.product_supplier = _vm.drugs.product_makesmakers
      }
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function(ref) {
        var item = ref.item;

        return [_c('div', {
          staticClass: "name"
        }, [_vm._v(_vm._s(item.product_makesmakers))]), _vm._v(" "), _c('span', {
          staticClass: "addr"
        }, [_vm._v(_vm._s(item.product_supplier))])]
      }
    }]),
    model: {
      value: (_vm.drugs.product_makesmakers),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_makesmakers", $$v)
      },
      expression: "drugs.product_makesmakers"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品编号",
      "prop": "product_code",
      "required": true
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "250px"
    },
    attrs: {
      "disabled": _vm.drugs.readonly ? true : false,
      "auto-complete": "off",
      "maxlength": 20,
      "placeholder": "产品编号"
    },
    model: {
      value: (_vm.drugs.product_code),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_code", $$v)
      },
      expression: "drugs.product_code"
    }
  }), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (!_vm.drugs.readonly),
      expression: "!drugs.readonly"
    }],
    attrs: {
      "type": "text"
    },
    on: {
      "click": _vm.randomCode
    }
  }, [_vm._v("随机编码")])], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "供货单位",
      "prop": "product_supplier"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "300px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 50,
      "placeholder": "供货单位"
    },
    model: {
      value: (_vm.drugs.product_supplier),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_supplier", $$v)
      },
      expression: "drugs.product_supplier"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "产品规格",
      "prop": "product_specifications"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "250px"
    },
    attrs: {
      "maxlength": 30,
      "auto-complete": "off",
      "placeholder": "产品规格"
    },
    model: {
      value: (_vm.drugs.product_specifications),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_specifications", $$v)
      },
      expression: "drugs.product_specifications"
    }
  })], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "联系人",
      "prop": "contacts_id"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "filterable": "",
      "placeholder": "请选择联系人"
    },
    model: {
      value: (_vm.drugs.contacts_id),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "contacts_id", $$v)
      },
      expression: "drugs.contacts_id"
    }
  }, _vm._l((_vm.contacts), function(item) {
    return _c('el-option', {
      key: item.contacts_id,
      attrs: {
        "label": item.contacts_name,
        "value": item.contacts_id
      }
    })
  }))], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "采购员",
      "prop": "buyer"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "采购员"
    },
    model: {
      value: (_vm.drugs.buyer),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "buyer", $$v)
      },
      expression: "drugs.buyer"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "商业",
      "prop": "product_business"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "filterable": "",
      "placeholder": "请选择商业"
    },
    model: {
      value: (_vm.drugs.product_business),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_business", $$v)
      },
      expression: "drugs.product_business"
    }
  }, _vm._l((_vm.business), function(item) {
    return _c('el-option', {
      key: item.business_id,
      attrs: {
        "label": item.business_name,
        "value": item.business_id
      }
    })
  }))], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "包装",
      "prop": "product_packing"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 20,
      "placeholder": "包装"
    },
    model: {
      value: (_vm.drugs.product_packing),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_packing", $$v)
      },
      expression: "drugs.product_packing"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "单位",
      "prop": "product_unit"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.drugs.product_unit),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_unit", $$v)
      },
      expression: "drugs.product_unit"
    }
  }, [_c('el-option', {
    key: "盒",
    attrs: {
      "label": "盒",
      "value": "盒"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "支",
    attrs: {
      "label": "支",
      "value": "支"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "瓶",
    attrs: {
      "label": "瓶",
      "value": "瓶"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "袋",
    attrs: {
      "label": "袋",
      "value": "袋"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "包",
    attrs: {
      "label": "包",
      "value": "包"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "医保类型",
      "prop": "product_medical_type"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.drugs.product_medical_type),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_medical_type", $$v)
      },
      expression: "drugs.product_medical_type"
    }
  }, [_c('el-option', {
    key: "",
    attrs: {
      "label": "",
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
  })], 1)], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "中标价",
      "prop": "product_price"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "中标价"
    },
    on: {
      "blur": _vm.priceBlur
    },
    model: {
      value: (_vm.drugs.product_price),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_price", $$v)
      },
      expression: "drugs.product_price"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "成本价",
      "prop": "product_mack_price"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "打款价"
    },
    on: {
      "blur": _vm.priceBlur
    },
    model: {
      value: (_vm.drugs.product_mack_price),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_mack_price", $$v)
      },
      expression: "drugs.product_mack_price"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "扣率",
      "prop": "product_discount"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "163px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "扣率（如：88）"
    },
    model: {
      value: (_vm.drugs.product_discount),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_discount", $$v)
      },
      expression: "drugs.product_discount"
    }
  }), _vm._v(" %\n\t\t\t\t\t")], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "产品税率",
      "prop": "product_tax_rate"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "产品税率（如：0.16）"
    },
    model: {
      value: (_vm.drugs.product_tax_rate),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_tax_rate", $$v)
      },
      expression: "drugs.product_tax_rate"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "核算成本",
      "prop": "accounting_cost"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "核算成本"
    },
    on: {
      "blur": _vm.priceBlur
    },
    model: {
      value: (_vm.drugs.accounting_cost),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "accounting_cost", $$v)
      },
      expression: "drugs.accounting_cost"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "毛利率",
      "prop": "gross_interest_rate"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "163px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "毛利率（如：12）"
    },
    model: {
      value: (_vm.drugs.gross_interest_rate),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "gross_interest_rate", $$v)
      },
      expression: "drugs.gross_interest_rate"
    }
  }), _vm._v(" %\n\t\t\t\t\t")], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "标签",
      "prop": "tag_ids"
    }
  }, [_c('tag-input', {
    attrs: {
      "tag_ids": _vm.drugs.tag_ids
    },
    on: {
      "emitTagIds": _vm.emitTagIds
    }
  })], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "采购方式",
      "prop": "product_purchase_mode"
    }
  }, [_c('el-radio-group', {
    model: {
      value: (_vm.drugs.product_purchase_mode),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_purchase_mode", $$v)
      },
      expression: "drugs.product_purchase_mode"
    }
  }, [_c('el-radio', {
    attrs: {
      "border": "",
      "label": "招标"
    }
  }), _vm._v(" "), _c('el-radio', {
    attrs: {
      "border": "",
      "label": "议价"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "是否基药",
      "prop": "product_basic_medicine"
    }
  }, [_c('el-radio-group', {
    model: {
      value: (_vm.drugs.product_basic_medicine),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_basic_medicine", $$v)
      },
      expression: "drugs.product_basic_medicine"
    }
  }, [_c('el-radio', {
    attrs: {
      "border": "",
      "label": "基药"
    }
  }), _vm._v(" "), _c('el-radio', {
    attrs: {
      "border": "",
      "label": "非基药"
    }
  })], 1)], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "品种类型",
      "prop": "product_type"
    }
  }, [_c('el-radio-group', {
    on: {
      "change": _vm.typeChange
    },
    model: {
      value: (_vm.drugs.product_type),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_type", $$v)
      },
      expression: "drugs.product_type"
    }
  }, [_c('el-radio', {
    attrs: {
      "border": "",
      "label": "佣金"
    }
  }), _vm._v(" "), _c('el-radio', {
    attrs: {
      "border": "",
      "label": "高打"
    }
  }), _vm._v(" "), _c('el-radio', {
    attrs: {
      "border": "",
      "label": "其它"
    }
  })], 1)], 1)], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.drugs.product_type != '其它'),
      expression: "drugs.product_type != '其它'"
    }]
  }, [_c('el-form-item', {
    attrs: {
      "label": "底价",
      "prop": "product_floor_price"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "底价"
    },
    on: {
      "blur": _vm.priceBlur
    },
    model: {
      value: (_vm.drugs.product_floor_price),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_floor_price", $$v)
      },
      expression: "drugs.product_floor_price"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "高开部分税率",
      "prop": "product_high_discount"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "163px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "税率（如：23）"
    },
    on: {
      "blur": _vm.priceBlur
    },
    model: {
      value: (_vm.drugs.product_high_discount),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_high_discount", $$v)
      },
      expression: "drugs.product_high_discount"
    }
  }), _vm._v(" %\n\t\t\t\t\t")], 1)], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.drugs.product_type != '其它'),
      expression: "drugs.product_type != '其它'"
    }]
  }, [_c('el-form-item', {
    attrs: {
      "label": "积分",
      "prop": "product_return_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "积分"
    },
    on: {
      "blur": _vm.priceBlur
    },
    model: {
      value: (_vm.drugs.product_return_money),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_return_money", $$v)
      },
      expression: "drugs.product_return_money"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "积分率",
      "prop": "product_return_discount"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "163px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "积分率（如：40）"
    },
    model: {
      value: (_vm.drugs.product_return_discount),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_return_discount", $$v)
      },
      expression: "drugs.product_return_discount"
    }
  }), _vm._v(" %\n\t\t\t\t\t")], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "积分说明",
      "prop": "product_return_explain"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 50,
      "placeholder": "积分说明"
    },
    model: {
      value: (_vm.drugs.product_return_explain),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_return_explain", $$v)
      },
      expression: "drugs.product_return_explain"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.drugs.product_type != '其它'),
      expression: "drugs.product_type != '其它'"
    }]
  }, [_c('el-form-item', {
    attrs: {
      "label": "返积分类型",
      "prop": "product_return_time_type"
    }
  }, [_c('el-select', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "placeholder": "请选择"
    },
    model: {
      value: (_vm.drugs.product_return_time_type),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_return_time_type", $$v)
      },
      expression: "drugs.product_return_time_type"
    }
  }, [_c('el-option', {
    key: "1",
    attrs: {
      "label": "当月返",
      "value": "1"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "2",
    attrs: {
      "label": "次月返",
      "value": "2"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "3",
    attrs: {
      "label": "隔月返",
      "value": "3"
    }
  }), _vm._v(" "), _c('el-option', {
    key: "4",
    attrs: {
      "label": "其它",
      "value": "4"
    }
  })], 1)], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.drugs.product_return_time_type != '4'),
      expression: "drugs.product_return_time_type != '4'"
    }],
    attrs: {
      "label": "返积分日",
      "prop": "product_return_time_day"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 10,
      "placeholder": "返积分日（如：1-31）"
    },
    model: {
      value: (_vm.drugs.product_return_time_day),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_return_time_day", $$v)
      },
      expression: "drugs.product_return_time_day"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.drugs.product_return_time_type == '4'),
      expression: "drugs.product_return_time_type == '4'"
    }],
    attrs: {
      "label": "返积分天数",
      "prop": "product_return_time_day_num"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "179px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 50,
      "placeholder": "返积分天数"
    },
    model: {
      value: (_vm.drugs.product_return_time_day_num),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_return_time_day_num", $$v)
      },
      expression: "drugs.product_return_time_day_num"
    }
  })], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "返积分统计",
      "prop": "product_return_statistics"
    }
  }, [_c('el-radio-group', {
    model: {
      value: (_vm.drugs.product_return_statistics),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "product_return_statistics", $$v)
      },
      expression: "drugs.product_return_statistics"
    }
  }, [_c('el-radio', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.drugs.product_type == '佣金' || _vm.drugs.product_type == '高打'),
      expression: "drugs.product_type =='佣金' || drugs.product_type =='高打'"
    }],
    attrs: {
      "border": "",
      "label": "1"
    }
  }, [_vm._v("按销售记录统计")]), _vm._v(" "), _c('el-radio', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.drugs.product_type == '高打'),
      expression: "drugs.product_type =='高打'"
    }],
    attrs: {
      "border": "",
      "label": "2"
    }
  }, [_vm._v("按备货记录统计")]), _vm._v(" "), _c('el-radio', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.drugs.product_type == '其它'),
      expression: "drugs.product_type =='其它'"
    }],
    attrs: {
      "border": "",
      "label": "3"
    }
  }, [_vm._v("无返款")])], 1)], 1)], 1), _vm._v(" "), _c('div', [_c('el-form-item', {
    attrs: {
      "label": "备注",
      "prop": "remark"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "300px"
    },
    attrs: {
      "auto-complete": "off",
      "maxlength": 50,
      "placeholder": "备注"
    },
    model: {
      value: (_vm.drugs.remark),
      callback: function($$v) {
        _vm.$set(_vm.drugs, "remark", $$v)
      },
      expression: "drugs.remark"
    }
  })], 1)], 1), _vm._v(" "), _c('div', {
    staticStyle: {
      "text-align": "center"
    }
  }, [_c('el-form-item', [_c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    attrs: {
      "type": "primary",
      "loading": _vm.loading
    },
    on: {
      "click": function($event) {
        _vm.submitForm('drugs')
      }
    }
  }, [_vm._v("提交")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    on: {
      "click": function($event) {
        _vm.resetForm('drugs')
      }
    }
  }, [_vm._v("重置")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }],
    on: {
      "click": _vm.returnList
    }
  }, [_vm._v("返回")])], 1)], 1)])], 1)])], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-02abf7b8", module.exports)
  }
}

/***/ }),

/***/ 383:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(384);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(98)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-054244dc!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./hospitalPolicyRecord.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-054244dc!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./hospitalPolicyRecord.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 384:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.copy_form .search .el-form-item__label {\n  padding-left: 0px !important;\n}\n.copy_form .el-form--inline .el-form-item{\n  margin-right: 4px !important;\n}\n.copy_form  .el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before{\n  display: none;\n}\n", ""]);

// exports


/***/ }),

/***/ 385:
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

exports.default = {
  data: function data() {
    return {
      drugPolicy: [],
      hospitals: [],
      drug: {},
      params: {
        hospitalId: "",
        productCommonName: "",
        productCode: ""
      },
      policy: {
        hospital_policy_price: "",
        hospital_policy_return_money: ""
      },
      authCode: "",
      pageNum: 10,
      currentPage: 1,
      count: 0,
      dialogFormVisible: false,
      loading: false
    };
  },
  activated: function activated() {
    this.getHospitals();
    this.getHospitalPolicy();
    this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
  },

  methods: {
    formatterPercent: function formatterPercent(row, column, cellValue, index) {
      if (row.sale_policy_money && row.product_return_money) {
        return Math.round(row.sale_policy_money * 100 / row.product_return_money) + "%";
      } else {
        return "";
      }
    },
    editRow: function editRow(scope) {
      //编辑药品信息
      this.dialogFormVisible = true;
      var temp = JSON.stringify(scope.row);
      this.policy = JSON.parse(temp);
      this.policy.front_message = temp;
    },
    getHospitalPolicy: function getHospitalPolicy() {
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
      this.jquery('/iae/hospitalpolicyrecorddrugs/getHospitalsPolicy', {
        data: _self.params,
        page: page
      }, function (res) {
        _self.drugPolicy = res.message.data;
        _self.pageNum = parseInt(res.message.limit);
        _self.count = res.message.totalCount;
      });
    },
    editHospitalPolicy: function editHospitalPolicy(formName) {
      var _this = this;

      var _self = this;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this.loading = true;
          _self.jquery('/iae/hospitalpolicyrecorddrugs/editHospitalPolicy', _self.policy, function (res) {
            _self.dialogFormVisible = false;
            _self.loading = false;
            _self.$message({ showClose: true, message: '修改成功', type: 'success' });
            _self.getHospitalPolicy();
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
    deleteRow: function deleteRow(scope) {
      var _this2 = this;

      //删除
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        _this2.deleteItem(scope);
      });
    },
    deleteItem: function deleteItem(scope) {
      var _self = this;
      this.jquery('/iae/hospitalpolicyrecorddrugs/deleteHospitalsPolicy', {
        product_id: scope.row.product_id,
        hospital_id: scope.row.hospital_policy_hospital_id
      }, function (res) {
        _self.$message({ showClose: true, message: '删除成功', type: 'success' });
        _self.getHospitalPolicy();
        _self.dialogFormVisible = false;
      });
    },
    reSearch: function reSearch(arg) {
      this.$refs["params"].resetFields();
      this.currentPage = 1;
      this.getHospitalPolicy();
    },
    handleSizeChange: function handleSizeChange(val) {
      this.pageNum = val;
      this.currentPage = 1;
      this.getHospitalPolicy();
    },
    handleCurrentChange: function handleCurrentChange(val) {
      this.currentPage = val;
      this.getHospitalPolicy();
    }
  }
};

/***/ }),

/***/ 386:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("药品管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("特殊政策备案")])], 1), _vm._v(" "), _c('el-form', {
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
        _vm.getHospitalPolicy()
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
        _vm.getHospitalPolicy()
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
      value: (_vm.authCode.indexOf(',142,') > -1),
      expression: "authCode.indexOf(',142,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.getHospitalPolicy()
      }
    }
  }, [_vm._v("查询")]), _vm._v(" "), _c('el-button', {
    directives: [{
      name: "dbClick",
      rawName: "v-dbClick"
    }, {
      name: "show",
      rawName: "v-show",
      value: (_vm.authCode.indexOf(',142,') > -1),
      expression: "authCode.indexOf(',142,') > -1"
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
      value: (_vm.authCode.indexOf(',139,') > -1),
      expression: "authCode.indexOf(',139,') > -1"
    }],
    attrs: {
      "type": "primary",
      "size": "mini"
    },
    on: {
      "click": function($event) {
        _vm.$router.push('/main/hospitalpolicyrecorddrugs');
      }
    }
  }, [_vm._v("新增")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.drugPolicy,
      "size": "mini",
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
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
      "prop": "hospital_policy_price",
      "label": "特殊销售价",
      "width": "100"
    }
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "prop": "hospital_policy_return_money",
      "label": "特殊政策积分"
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
            value: (_vm.authCode.indexOf(',141,') > -1),
            expression: "authCode.indexOf(',141,') > -1"
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
            value: (_vm.authCode.indexOf(',140,') > -1),
            expression: "authCode.indexOf(',140,') > -1"
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
  }), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "title": "修改特殊政策",
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
      "title": '药品信息（药品名：' + _vm.policy.product_common_name + '）',
      "name": "1"
    }
  }, [_c('div', [_c('span', [_vm._v("规格:")]), _vm._v(_vm._s(_vm.policy.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("积分:")]), _vm._v(_vm._s(_vm.policy.product_return_money))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.policy.product_price))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.policy.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "policy",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.policy,
      "status-icon": "",
      "rules": _vm.policyRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "特殊销售价",
      "prop": "hospital_policy_price",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "特殊销售价"
    },
    model: {
      value: (_vm.policy.hospital_policy_price),
      callback: function($$v) {
        _vm.$set(_vm.policy, "hospital_policy_price", $$v)
      },
      expression: "policy.hospital_policy_price"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "特殊积分",
      "prop": "hospital_policy_return_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "特殊积分"
    },
    model: {
      value: (_vm.policy.hospital_policy_return_money),
      callback: function($$v) {
        _vm.$set(_vm.policy, "hospital_policy_return_money", $$v)
      },
      expression: "policy.hospital_policy_return_money"
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
        _vm.editHospitalPolicy('policy')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-054244dc", module.exports)
  }
}

/***/ }),

/***/ 387:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(388);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(98)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-248ed1de!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./hospitalPolicyRecordDrugs.vue", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-248ed1de!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./hospitalPolicyRecordDrugs.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 388:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.copy_form .search .el-form-item__label {\n  padding-left: 0px !important;\n}\n.copy_form .el-form--inline .el-form-item{\n  margin-right: 4px !important;\n}\n.copy_form  .el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before{\n  display: none;\n}\n.el-collapse-item__content > div{\n  display: inline-block;\n  width: 30%;\n}\n.el-collapse-item__content > div > span{\n  display: inline-block;\n  width: 56px;\n  text-align: right;\n  padding-right: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 389:
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

exports.default = {
  data: function data() {
    return {
      drugPolicy: [],
      hospitals: [],
      drug: {},
      params: {
        hospitalId: "",
        productCommonName: "",
        productCode: ""
      },
      policy: {
        hospital_policy_price: "",
        hospital_policy_return_money: ""
      },
      authCode: "",
      pageNum: 10,
      currentPage: 1,
      count: 0,
      dialogFormVisible: false,
      loading: false
    };
  },
  activated: function activated() {
    this.getHospitals();
    var _self = this;
    setTimeout(function () {
      _self.$refs["params"].resetFields();
      _self.drugPolicy = [];
    });
    this.authCode = "," + JSON.parse(sessionStorage["user"]).authority_code;
  },

  methods: {
    editRow: function editRow(scope) {
      //编辑药品信息
      this.dialogFormVisible = true;
      var temp = JSON.stringify(scope.row);
      this.drug = JSON.parse(temp);
    },
    getHospitalsPolicyDrugs: function getHospitalsPolicyDrugs() {
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
      this.jquery('/iae/hospitalpolicyrecorddrugs/getHospitalsPolicyDrugs', {
        data: _self.params,
        page: page
      }, function (res) {
        _self.drugPolicy = res.message.data;
        _self.pageNum = parseInt(res.message.limit);
        _self.count = res.message.totalCount;
      });
    },
    editHospitalPolicy: function editHospitalPolicy(formName) {
      var _this = this;

      var _self = this;
      _self.policy.hospital_policy_hospital_id = this.params.hospitalId;
      _self.policy.hospital_policy_drug_id = this.drug.product_id;
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          _this.loading = true;
          _self.jquery('/iae/hospitalpolicyrecorddrugs/editHospitalPolicy', _self.policy, function (res) {
            _self.$confirm('新增成功', '提示', {
              confirmButtonText: '继续添加',
              cancelButtonText: '返回销售列表',
              type: 'success'
            }).then(function () {
              _self.$refs["policy"].resetFields();
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.getHospitalsPolicyDrugs();
            }).catch(function () {
              _self.$refs["policy"].resetFields();
              _self.dialogFormVisible = false;
              _self.loading = false;
              _self.$router.push({ path: "/main/hospitalpolicyrecord" });
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
        this.getHospitalsPolicyDrugs();
      }
    },
    handleSizeChange: function handleSizeChange(val) {
      this.pageNum = val;
      this.currentPage = 1;
      this.getHospitalsPolicyDrugs();
    },
    handleCurrentChange: function handleCurrentChange(val) {
      this.currentPage = val;
      this.getHospitalsPolicyDrugs();
    }
  }
};

/***/ }),

/***/ 390:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('el-breadcrumb', {
    attrs: {
      "separator-class": "el-icon-arrow-right"
    }
  }, [_c('el-breadcrumb-item', [_vm._v("药品管理")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("特殊政策备案")]), _vm._v(" "), _c('el-breadcrumb-item', [_vm._v("特殊政策备案-选择药品"), _c('a', {
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
      value: (_vm.authCode.indexOf(',139,') > -1),
      expression: "authCode.indexOf(',139,') > -1"
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
      value: (_vm.authCode.indexOf(',139,') > -1),
      expression: "authCode.indexOf(',139,') > -1"
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
        _vm.$router.push('/main/hospitalpolicyrecord');
      }
    }
  }, [_vm._v("返回列表")])], 1)], 1), _vm._v(" "), _c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.drugPolicy,
      "size": "mini",
      "stripe": true,
      "border": true
    }
  }, [_c('el-table-column', {
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
            value: (_vm.authCode.indexOf(',139,') > -1),
            expression: "authCode.indexOf(',139,') > -1"
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
      "title": "新增特殊政策",
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
  }, [_c('div', [_c('span', [_vm._v("规格:")]), _vm._v(_vm._s(_vm.drug.product_specifications))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("积分:")]), _vm._v(_vm._s(_vm.drug.product_return_money))]), _vm._v(" "), _c('div', [_c('span', [_vm._v("中标价:")]), _vm._v(_vm._s(_vm.drug.product_price))]), _vm._v(" "), _c('div', {
    staticStyle: {
      "display": "block",
      "width": "100%"
    }
  }, [_c('span', [_vm._v("生产厂家:")]), _vm._v(_vm._s(_vm.drug.product_makesmakers))])])], 1), _vm._v(" "), _c('el-form', {
    ref: "policy",
    staticClass: "demo-ruleForm",
    staticStyle: {
      "margin-top": "20px"
    },
    attrs: {
      "model": _vm.policy,
      "status-icon": "",
      "rules": _vm.policyRule,
      "inline": true,
      "label-width": "100px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "特殊销售价",
      "prop": "hospital_policy_price",
      "maxlength": 10
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "特殊销售价"
    },
    model: {
      value: (_vm.policy.hospital_policy_price),
      callback: function($$v) {
        _vm.$set(_vm.policy, "hospital_policy_price", $$v)
      },
      expression: "policy.hospital_policy_price"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "特殊积分",
      "prop": "hospital_policy_return_money"
    }
  }, [_c('el-input', {
    staticStyle: {
      "width": "194px"
    },
    attrs: {
      "placeholder": "特殊积分"
    },
    model: {
      value: (_vm.policy.hospital_policy_return_money),
      callback: function($$v) {
        _vm.$set(_vm.policy, "hospital_policy_return_money", $$v)
      },
      expression: "policy.hospital_policy_return_money"
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
        _vm.editHospitalPolicy('policy')
      }
    }
  }, [_vm._v("确 定")])], 1)], 1)], 1)], 1)
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-248ed1de", module.exports)
  }
}

/***/ }),

/***/ 45:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(370)

/* script */
__vue_exports__ = __webpack_require__(372)

/* template */
var __vue_template__ = __webpack_require__(373)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/drugs/drugs.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-ed8ab4e4", __vue_options__)
  } else {
    hotAPI.reload("data-v-ed8ab4e4", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] drugs.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 46:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(374)

/* script */
__vue_exports__ = __webpack_require__(376)

/* template */
var __vue_template__ = __webpack_require__(382)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/drugs/drugsEdit.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-02abf7b8", __vue_options__)
  } else {
    hotAPI.reload("data-v-02abf7b8", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] drugsEdit.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 47:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(383)

/* script */
__vue_exports__ = __webpack_require__(385)

/* template */
var __vue_template__ = __webpack_require__(386)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/drugs/hospitalPolicyRecord.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-054244dc", __vue_options__)
  } else {
    hotAPI.reload("data-v-054244dc", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] hospitalPolicyRecord.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 48:
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(387)

/* script */
__vue_exports__ = __webpack_require__(389)

/* template */
var __vue_template__ = __webpack_require__(390)
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
__vue_options__.__file = "/Users/lvyang/workspace/iae/views/drugs/hospitalPolicyRecordDrugs.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-248ed1de", __vue_options__)
  } else {
    hotAPI.reload("data-v-248ed1de", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] hospitalPolicyRecordDrugs.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ }),

/***/ 98:
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


/***/ })

});