const db = require("../models");
const logging = require("./controller.logging");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const flag = require("../Flag");

exports.getVendorGrp = async(req, res)=>{
	const getVendorGrp = await sequelize.query(`select * from vendor_grp_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getVendorGrp,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}
exports.getOrderCurrency = async(req, res)=>{
	const getOrderCurrency = await sequelize.query("select * from order_currency_master", { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getOrderCurrency,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}
exports.postFormData = async (req, res) => {
	const formData = req.body;
	console.log(req.body);
	console.log(req.files);
	const reqFile = req.files;
	console.log(reqFile);
	if (!reqFile.DAPF) {
		reqFile.DAPF = [];
	}
	if (!reqFile.PAN_Image) {
		reqFile.PAN_Image = [];
	}
	if (!reqFile.GST_Image) {
		reqFile.GST_Image = [];
	}
	if (!reqFile.declaration) {
		reqFile.declaration = [];
	}
	if (!reqFile.blank_cheque) {
		reqFile.blank_cheque = [];
	}

	if (!formData) {
		console.log("data not recieved");
		return;
	}

	if (!(formData.vendor_group && formData.vendor_name && formData.vendor_address && formData.vendor_address_op1 && formData.co_person && formData.city && formData.postal_code && formData.country && formData.company_code && formData.bank_acc_no && formData.pay_term && formData.name_on_acc && formData.ifsc_code && formData.employee_id)) {
		const send_data = {
			status: "401",
			message: "all parameters required",
		};

		res.status(401).send(send_data);
	} else {
		/* console.log(Object.keys(formdata)); */

		try {
			const approval_data = await sequelize.query(`select * from approval_matrix where approval_type = 'vendor_form' order by approval_level;`, { type: QueryTypes.SELECT });
			console.log(approval_data);

			const data = await sequelize.query(`insert into vendor_form_data (vendor_group,vendor_name, vendor_name_op, vendor_address, vendor_address_op1, vendor_address_op2,vendor_address_op3,district,state_code,city,postal_code,country,co_person,mobile_no,email_id,company_code,pay_term,gstin,pan_number, created_by, updated_by, order_currency, name_on_account, bank_acc_no, ifsc_code, purchasing_org, witholding_tax) values ('${formData.vendor_group}','${formData.vendor_name}','${formData.vendor_name_op1}','${formData.vendor_address}','${formData.vendor_address_op1}','${formData.vendor_address_op2}','${formData.vendor_address_op3}','${formData.district}','${formData.state_code}','${formData.city}','${formData.postal_code}','${formData.country}','${formData.co_person}','${formData.mobile_no}','${formData.email_id}','${formData.company_code}','${formData.pay_term}','${formData.gstin}','${formData.pan}','${formData.employee_id}', '${formData.employee_id}','${formData.order_currency}','${formData.name_on_acc}','${formData.bank_acc_no}','${formData.ifsc_code}','${formData.purchasing_org}','${formData.witholding_tax}')`, { type: QueryTypes.INSERT });
			console.log(data);

			const postData = await sequelize.query(`INSERT INTO file_path_mapping (form_data_id , form_type, blank_cheque, GST_Image, PAN_Image, declaration, DAPF) VALUES (${data[0]} , 'vendor_form','${reqFile?.blank_cheque[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}', '${reqFile?.GST_Image[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}', '${reqFile?.PAN_Image[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}','${reqFile?.declaration[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}', '${reqFile?.DAPF[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}')`, { type: QueryTypes.INSERT });
			console.log("postdata" + postData);
			approval_data.map(async (item,i) => {
				const insert_approval = await sequelize.query(`INSERT INTO approval_inbox ( request_type, request_id, approval_level, applied_by, approver_employee_id, status, created_by, updated_by) VALUES ('vendor_form',${data[0]},'${item.approval_level}','${formData.employee_id}','${item.approver_employee_id}',${i==0?"pending":'future_approval'},'${formData.employee_id}','${formData.employee_id}');`, { type: QueryTypes.INSERT });
				console.log(insert_approval);
			});
			const send_data = {
				status: 200,
				message: "data Insereted successfully",
			};
			res.status(200).send(send_data);
		} catch (error) {
			console.log(error);
			const send_data = {
				status: 500,
				message: "Unexcexpted Error Occured",
			};
			res.status(500).send(send_data);
		}
	}
};
exports.getVendorPayTerm = async(req,res)=>{

	const getVendorPayTerm = await sequelize.query(`Select * from vendor_pay_term_master`,{type: QueryTypes.SELECT});

	const send_data = {
		status: 200,
		data: getVendorPayTerm, 
		message: "Data Fetched Successfully"
	}

	res.status(200).send(send_data);
	
}