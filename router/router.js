import Vue from "vue/dist/vue.js";
import VueRouter from "vue-router";
Vue.use(VueRouter);

//一级页面，首次加载
const Login = r => require.ensure([], () => r(require('../views/login.vue')), 'group1');
const Main = r => require.ensure([], () => r(require('../views/main.vue')), 'group1');
const Home = r => require.ensure([], () => r(require('../views/home.vue')), 'group1');
const Sales = r => require.ensure([], () => r(require('../views/sales/sales.vue')), 'group1');//销售记录页面
const SalesDrugs = r => require.ensure([], () => r(require('../views/sales/salesDrugs.vue')), 'group1');//销售记录页面
const Allot = r => require.ensure([], () => r(require('../views/allot/allot.vue')), 'group1');//调货记录页面
const AllotDrugs = r => require.ensure([], () => r(require('../views/allot/allotDrugs.vue')), 'group1');//调货记录页面
const Allocation = r => require.ensure([], () => r(require('../views/allocation/allocation.vue')), 'group1');//商业调拨

//权限管理 分组
const Authority = r => require.ensure([], () => r(require('../views/authority/authority.vue')), 'group2');
const Role = r => require.ensure([], () => r(require('../views/authority/role.vue')), 'group2');
const Group = r => require.ensure([], () => r(require('../views/authority/group.vue')), 'group2');
const User = r => require.ensure([], () => r(require('../views/authority/user.vue')), 'group2');
const Password = r => require.ensure([], () => r(require('../views/password.vue')), 'group2');//修改密码
const About = r => require.ensure([], () => r(require('../views/authority/about.vue')), 'group2');//关于软件
const Log = r => require.ensure([], () => r(require('../views/log/log.vue')), 'group2');//日志管理
//采购管理 分组
const PurchaseRecovery = r => require.ensure([], () => r(require('../views/purchase_recovery/purchaseRecovery.vue')), 'group3');//采退记录
const PurchaseRecoveryDrugs = r => require.ensure([], () => r(require('../views/purchase_recovery/purchaseRecoveryDrugs.vue')), 'group3');//采退记录
const PurchaseLoss = r => require.ensure([], () => r(require('../views/purchase_loss/purchaseLoss.vue')), 'group3');//报损记录
const PurchaseLossDrugs = r => require.ensure([], () => r(require('../views/purchase_loss/purchaseLossDrugs.vue')), 'group3');//报损记录
const Purchase = r => require.ensure([], () => r(require('../views/purchase/purchase.vue')), 'group3');//进货记录页面
const PurchaseDrugs = r => require.ensure([], () => r(require('../views/purchase/purchaseDrugs.vue')), 'group3');//进货记录页面

//药品页面 分组
const Drugs = r => require.ensure([], () => r(require('../views/drugs/drugs.vue')), 'group5');
const DrugsPolicy = r => require.ensure([], () => r(require('../views/drugs_policy/drugsPolicy.vue')), 'group5');
const DrugsAllotPolicy = r => require.ensure([], () => r(require('../views/drugs_policy/drugsAllotPolicy.vue')), 'group5');
const DrugsSalesPolicy = r => require.ensure([], () => r(require('../views/drugs_policy/drugsSalesPolicy.vue')), 'group5');
const DrugsPurchasePayPolicy = r => require.ensure([], () => r(require('../views/drugs_policy/drugsPurchasePayPolicy.vue')), 'group5');
const DrugsEdit = r => require.ensure([], () => r(require('../views/drugs/drugsEdit.vue')), 'group5');
const HospitalPolicyRecord = r => require.ensure([], () => r(require('../views/drugs/hospitalPolicyRecord.vue')), 'group5');
const HospitalPolicyRecordDrugs = r => require.ensure([], () => r(require('../views/drugs/hospitalPolicyRecordDrugs.vue')), 'group5');

//预付招商记录页面 分组
const PurchasePay = r => require.ensure([], () => r(require('../views/purchase_pay/purchase.vue')), 'group6');
const PurchasePayDrugs = r => require.ensure([], () => r(require('../views/purchase_pay/purchaseDrugs.vue')), 'group6');
const PurchasePayPolicy = r => require.ensure([], () => r(require('../views/purchase_pay/purchasePayPolicy.vue')), 'group6');
const PurchasePayPolicyDrugs = r => require.ensure([], () => r(require('../views/purchase_pay/purchasePayPolicyDrugs.vue')), 'group6');
const PurchasePayReturnMoney = r => require.ensure([], () => r(require('../views/purchase_pay/purchasePayReturnMoney.vue')), 'group6');
const PurchasePayRefund = r => require.ensure([], () => r(require('../views/purchase_pay/purchasePayRefund.vue')), 'group6');

//销售渠道页面 分组
const Hospital = r => require.ensure([], () => r(require('../views/message/hospital.vue')), 'group7');//联系人页面
const Contacts = r => require.ensure([], () => r(require('../views/message/contacts.vue')), 'group7');
const Business = r => require.ensure([], () => r(require('../views/message/business.vue')), 'group7');//商业
const Tag = r => require.ensure([], () => r(require('../views/message/tag.vue')), 'group7');//标签管理
const Account = r => require.ensure([], () => r(require('../views/bank_account/account.vue')), 'group7');//银行账号管理
const AccountDetail = r => require.ensure([], () => r(require('../views/bank_account/accountDetail.vue')), 'group7');
const BusinessCommission = r => require.ensure([], () => r(require('../views/bank_account/businesscommission.vue')), 'group7');
const ReturnMoney = r => require.ensure([], () => r(require('../views/bank_account/returnmoney.vue')), 'group7');

//报表管理 分组1
const Report = r => require.ensure([], () => r(require('../views/report/report.vue')), 'group4');
const ReportSaleLine = r => require.ensure([], () => r(require('../views/report/reportSaleLine.vue')), 'group4');//销售折现图
const ReportTagBar = r => require.ensure([], () => r(require('../views/report/reportTagBar.vue')), 'group4');//标签销售柱状图
const ReportPurchaseReturnMoney = r => require.ensure([], () => r(require('../views/report/reportPurchaseReturnMoney.vue')), 'group4');//高打返款金额统计按联系人
const ReportPurchaseReturnMoneyDetail = r => require.ensure([], () => r(require('../views/report/reportPurchaseReturnMoneyDetail.vue')), 'group4');//高打返款金额统计按联系人  查看明细
const ReportSalesReturnMoney = r => require.ensure([], () => r(require('../views/report/reportSalesReturnMoney.vue')), 'group4');//佣金返款金额统计按联系人
const ReportSalesReturnMoneyDetail = r => require.ensure([], () => r(require('../views/report/reportSalesReturnMoneyDetail.vue')), 'group4');//佣金返款金额统计按联系人 查看明细
const ReportPurchasePaysReturnMoney = r => require.ensure([], () => r(require('../views/report/reportPurchasePaysReturnMoney.vue')), 'group4');//招商预付应收联系人
const ReportPurchasePaysReturnMoneyDetail = r => require.ensure([], () => r(require('../views/report/reportPurchasePaysReturnMoneyDetail.vue')), 'group4');//招商预付应收按联系人 查看明细
const ReportSalesReturnMoneyPay = r => require.ensure([], () => r(require('../views/report/reportSalesReturnMoneyPay.vue')), 'group4');//销售应付
const ReportSalesReturnMoneyPayDetail = r => require.ensure([], () => r(require('../views/report/reportSalesReturnMoneyPayDetail.vue')), 'group4');//销售应付 查看明细
const ReportAllotsReturnMoneyPay = r => require.ensure([], () => r(require('../views/report/reportAllotsReturnMoneyPay.vue')), 'group4');//调货应付
const ReportAllotsReturnMoneyPayDetail = r => require.ensure([], () => r(require('../views/report/reportAllotsReturnMoneyPayDetail.vue')), 'group4');//调货应付 查看明细
const ReportPurchasePaysReturnMoneyPay = r => require.ensure([], () => r(require('../views/report/reportPurchasePaysReturnMoneyPay.vue')), 'group4');//招商预付应付
const ReportPurchasePaysReturnMoneyPayDetail = r => require.ensure([], () => r(require('../views/report/reportPurchasePaysReturnMoneyPayDetail.vue')), 'group4');//招商预付应付 查看明细
const ReportSalesByProduct = r => require.ensure([], () => r(require('../views/report/reportSalesByProduct.vue')), 'group4');//销售按产品
const ReportSalesByHospital = r => require.ensure([], () => r(require('../views/report/reportSalesByHospital.vue')), 'group4');//销售按医院
const ReportSalesByProfitRate = r => require.ensure([], () => r(require('../views/report/reportSalesByProfitRate.vue')), 'group4');//销售按毛利率
const ReportComprehensive = r => require.ensure([], () => r(require('../views/report/reportComprehensive.vue')), 'group4');//利润/负债综合统计  详情
const ReportComprehensiveDetail = r => require.ensure([], () => r(require('../views/report/reportComprehensiveDetail.vue')), 'group4');//利润/负债综合统计  详情
const ReportComprehensive1 = r => require.ensure([], () => r(require('../views/report/reportComprehensive1.vue')), 'group4');//利润/负债综合统计
const ReportComprehensive2 = r => require.ensure([], () => r(require('../views/report/reportComprehensive2.vue')), 'group4');//利润/负债综合统计
const ReportSaleChainRatio = r => require.ensure([], () => r(require('../views/report/reportSaleChainRatio.vue')), 'group4');//销售环比
const ReportSaleChainRatioSn = r => require.ensure([], () => r(require('../views/report/reportSaleChainRatioSn.vue')), 'group4');//销售环比
const ReportSaleOnYear = r => require.ensure([], () => r(require('../views/report/reportSaleOnYear.vue')), 'group4');//销售同比
const ReportSaleOnYearSn = r => require.ensure([], () => r(require('../views/report/reportSaleOnYearSn.vue')), 'group4');//销售同比
const ReportSaleVariance = r => require.ensure([], () => r(require('../views/report/reportSaleVariance.vue')), 'group4');//稳定性分析
const Stock = r => require.ensure([], () => r(require('../views/stock/stock.vue')), 'group4');//库存
const StockMoney = r => require.ensure([], () => r(require('../views/report/stockMoney.vue')), 'group4');//库存
const ReportPurchasePay = r => require.ensure([], () => r(require('../views/report/reportPurchasePay.vue')), 'group4');
const ReportPurchasePayDetail = r => require.ensure([], () => r(require('../views/report/reportPurchasePayDetail.vue')), 'group4');


//返款管理 分组
const Refundsale = r => require.ensure([], () => r(require('../views/refunds/refundsale.vue')), 'group8');
const Refundpurchase = r => require.ensure([], () => r(require('../views/refunds/refundpurchase.vue')), 'group8');
const AllotReturnMoney = r => require.ensure([], () => r(require('../views/allot/allotReturnMoney.vue')), 'group8');
const SalesReturnMoney = r => require.ensure([], () => r(require('../views/sales/salesReturnMoney.vue')), 'group8');
//政策管理 分组
const AllotPolicy = r => require.ensure([], () => r(require('../views/allot/allotPolicy.vue')), 'group9');
const AllotPolicyDrugs = r => require.ensure([], () => r(require('../views/allot/allotPolicyDrugs.vue')), 'group9');
const SalesPolicy = r => require.ensure([], () => r(require('../views/sales/salesPolicy.vue')), 'group9');
const SalesPolicyDrugs = r => require.ensure([], () => r(require('../views/sales/salesPolicyDrugs.vue')), 'group9');

const router = new VueRouter({
	routes:[{
		path:"/",
		redirect:to => {
			return "/login";
		}
	},{
		path:"/login",
		component:Login,
	},{
		path:"/main",
		component:Main,
		children:[{path:"",redirect: 'sales'},
			{path:"home",component:Home},
			{path:"drugs",component:Drugs},
			{path:"hospitalpolicyrecord",component:HospitalPolicyRecord},
			{path:"hospitalpolicyrecorddrugs",component:HospitalPolicyRecordDrugs},
			{path:"drugsedit",component:DrugsEdit},
			{path:"authority",component:Authority},
			{path:"role",component:Role},
			{path:"user",component:User},
			{path:"group",component:Group},
			{path:"hospital",component:Hospital},//医院管理
			{path:"contacts",component:Contacts},//联系人管理
			{path:"business",component:Business},//商业管理
			{path:"tag",component:Tag},//标签管理
			{path:"account",component:Account},//银行账号管理
			{path:"accountdetail",component:AccountDetail},//流水账管理
			{path:"returnmoney",component:ReturnMoney},//医院回款管理
			{path:"businesscommission",component:BusinessCommission},//商务提成管理
			{path:"purchase",component:Purchase},
			{path:"purchasedrugs",component:PurchaseDrugs},
			{path:"purchasepay",component:PurchasePay},
			{path:"purchasepaydrugs",component:PurchasePayDrugs},
			{path:"purchasepaypolicy",component:PurchasePayPolicy},
			{path:"purchasepaypolicydrugs",component:PurchasePayPolicyDrugs},
			{path:"purchasepayreturnmoney",component:PurchasePayReturnMoney},
			{path:"purchaserecovery",component:PurchaseRecovery},
			{path:"purchaserecoverydrugs",component:PurchaseRecoveryDrugs},
			{path:"purchasepayrefund",component:PurchasePayRefund},
			{path:"purchaseloss",component:PurchaseLoss},
			{path:"purchaselossdrugs",component:PurchaseLossDrugs},
			{path:"allot",component:Allot},
			{path:"allotdrugs",component:AllotDrugs},
			{path:"sales",component:Sales},
			{path:"salesdrugs",component:SalesDrugs},
			{path:"report",component:Report},
			{path:"reportsaleline",component:ReportSaleLine},
			{path:"reporttagbar",component:ReportTagBar},
			{path:"reportpurchasereturnmoney",component:ReportPurchaseReturnMoney},
			{path:"reportpurchasereturnmoneydetail",component:ReportPurchaseReturnMoneyDetail},
			{path:"reportsalesreturnmoney",component:ReportSalesReturnMoney},
			{path:"reportsalesreturnmoneydetail",component:ReportSalesReturnMoneyDetail},
			{path:"reportsalesbyproduct",component:ReportSalesByProduct},//报表销售按品种
			{path:"reportsalesbyhospital",component:ReportSalesByHospital},//报表销售按品种
			{path:"reportsalesbyprofitrate",component:ReportSalesByProfitRate},//报表销售按品种
			{path:"reportcomprehensive",component:ReportComprehensive},//利润/负债，综合统计
			{path:"reportcomprehensivedetail",component:ReportComprehensiveDetail},//利润/负债，综合统计 详情
			{path:"reportcomprehensive1",component:ReportComprehensive1},//利润/负债，综合统计
			{path:"reportcomprehensive2",component:ReportComprehensive2},//利润/负债，综合统计
			{path:"reportsalechainratio",component:ReportSaleChainRatio},//销售环比
			{path:"reportsalechainratiosn",component:ReportSaleChainRatioSn},//销售环比
			{path:"reportsaleonyear",component:ReportSaleOnYear},//销售同比
			{path:"reportsaleonyearsn",component:ReportSaleOnYearSn},//销售同比
			{path:"reportsalevariance",component:ReportSaleVariance},//稳定性分析
			{path:"refundsale",component:Refundsale},//佣金返款
			{path:"refundpurchase",component:Refundpurchase},//高打返款
			{path:"allotreturnmoney",component:AllotReturnMoney},//调货回款
			{path:"salesreturnmoney",component:SalesReturnMoney},//销售回款
			{path:"allotpolicy",component:AllotPolicy},//调货政策
			{path:"salespolicy",component:SalesPolicy},//销售政策
			{path:"allotpolicydrugs",component:AllotPolicyDrugs},//调货政策
			{path:"salespolicydrugs",component:SalesPolicyDrugs},//销售政策
			{path:"stock",component:Stock},
			{path:"password",component:Password},
			{path:"log",component:Log},//日志管理
			{path:"allocation",component:Allocation},
			{path:"about",component:About},//关于软件
			{path:"reportPurchasePaysReturnMoney",component:ReportPurchasePaysReturnMoney},
			{path:"reportPurchasePaysReturnMoneyDetail",component:ReportPurchasePaysReturnMoneyDetail},
			{path:"reportSalesReturnMoneyPay",component:ReportSalesReturnMoneyPay},
			{path:"reportSalesReturnMoneyPayDetail",component:ReportSalesReturnMoneyPayDetail},
			{path:"reportAllotsReturnMoneyPay",component:ReportAllotsReturnMoneyPay},
			{path:"reportAllotsReturnMoneyPayDetail",component:ReportAllotsReturnMoneyPayDetail},
			{path:"reportPurchasePaysReturnMoneyPay",component:ReportPurchasePaysReturnMoneyPay},
			{path:"reportPurchasePaysReturnMoneyPayDetail",component:ReportPurchasePaysReturnMoneyPayDetail},
			{path:"stockMoney",component:StockMoney},
			{path:"drugspolicy",component:DrugsPolicy},
			{path:"drugsAllotPolicy",component:DrugsAllotPolicy},
			{path:"drugsSalesPolicy",component:DrugsSalesPolicy},
			{path:"drugsPurchasePayPolicy",component:DrugsPurchasePayPolicy},
			{path:"reportpurchasepay",component:ReportPurchasePay},
			{path:"reportpurchasepaydetail",component:ReportPurchasePayDetail}
		]
	}]
});
export default router
