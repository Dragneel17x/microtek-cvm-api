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

	/* if (!(formData.vendor_group && formData.vendor_name && formData.vendor_address && formData.vendor_address_op1 && formData.co_person && formData.city && formData.postal_code && formData.country && formData.company_code && formData.bank_acc_no && formData.pay_term && formData.name_on_acc && formData.ifsc_code && formData.employee_id)) {
		const send_data = {
			status: "401",
			message: "all parameters required",
		};

		res.status(401).send(send_data);
	} */
	if(false){}
	else {
		/* console.log(Object.keys(formdata)); */

		try {
			const approval_data = await sequelize.query(`select * from approval_matrix where approval_type = 'vendor_form' order by approval_level;`, { type: QueryTypes.SELECT });
			console.log(approval_data);

			const data = await sequelize.query(`insert into vendor_form_data (vendor_group,vendor_name, vendor_name_op1, vendor_address, vendor_address_op1, vendor_address_op2,vendor_address_op3,district,state,city,postal_code,country,co_person,mobile_no,email_id,company_code,pay_term,gstin,pan, created_by, updated_by, order_currency, name_on_acc, bank_acc_no, ifsc_code, purchasing_org, witholding_tax) values ('${formData.vendor_group}','${formData.vendor_name}','${formData.vendor_name_op1}','${formData.vendor_address}','${formData.vendor_address_op1}','${formData.vendor_address_op2}','${formData.vendor_address_op3}','${formData.district}','${formData.state_code}','${formData.city}','${formData.postal_code}','${formData.country}','${formData.co_person}','${formData.mobile_no}','${formData.email_id}','${formData.company_code}','${formData.pay_term}','${formData.gstin}','${formData.pan}','${formData.employee_id}', '${formData.employee_id}','${formData.order_currency}','${formData.name_on_acc}','${formData.bank_acc_no}','${formData.ifsc_code}','${formData.purchasing_org}','${formData.witholding_tax}')`, { type: QueryTypes.INSERT });
			console.log(data);

			const postData = await sequelize.query(`INSERT INTO file_path_mapping (form_data_id , form_type, blank_cheque, GST_Image, PAN_Image, declaration, DAPF) VALUES (${data[0]} , 'vendor_form','${reqFile?.blank_cheque[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}', '${reqFile?.GST_Image[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}', '${reqFile?.PAN_Image[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}','${reqFile?.declaration[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}', '${reqFile?.DAPF[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}')`, { type: QueryTypes.INSERT });
			console.log("postdata" + postData);
			approval_data.map(async (item,i) => {
				const insert_approval = await sequelize.query(`INSERT INTO approval_inbox ( request_type, request_id, approval_level, applied_by, approver_employee_id, status, created_by, updated_by) VALUES ('vendor_form',${data[0]},'${item.approval_level}','${formData.employee_id}','${item.approver_employee_id}','${i==0? "pending":"future_approval"}','${formData.employee_id}','${formData.employee_id}');`, { type: QueryTypes.INSERT });
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
exports.vendorFormApplrovals = async (req, res) => {
	const { employee_id } = req.body;

	if (!employee_id) {
		const send_data = {
			status: "401",
			message: "all parameters required",
		};
		res.status(401).send(send_data);
	}
	const form_data = await sequelize.query(`select * from approval_inbox ai left outer join vendor_form_data cfd on ai.request_id = cfd.id where request_type = 'vendor_form' and approver_employee_id = '${employee_id}' and ai.status = 'pending';`, { type: QueryTypes.SELECT });
	console.log(form_data);

	const send_data = {
		status: "200",
		data: form_data,
		message: "Data Fetched Successfully",
	};
	res.status(200).send(send_data);
};
exports.getSubmissionView = async (req, res) => {
	const { employee_id } = req.body;
	if (!employee_id) {
		const send_data = {
			status: "401",
			message: "all parameters required",
		};
		res.status(401).send(send_data);
	}
	try {
		const form_data = await sequelize.query(`select cfd.*, ai.status ai_status, ai.approval_level, ai.approver_remarks, approver_employee_id from vendor_form_data cfd left join approval_inbox ai on cfd.id = ai.request_id  where cfd.created_by = '${employee_id}' and ai.request_type = 'vendor_form'`, { type: QueryTypes.SELECT });
		console.log(form_data);
		const send_data = {
			status: "200",
			data: form_data,
			message: "Data Fetched Successfully",
		};
		res.status(200).send(send_data);
	} catch (error) {
		console.log(error);
		const send_data = {
			status: "500",
			message: "Some Un-Expected Error Occured",
		};
		res.status(500).send(send_data);
	}
};
exports.approveForm = async (req, res) => {
	const { status, approver_remarks, employee_id, approval_id } = req.body;
	if (!(status && employee_id && approval_id)) {
		const send_data = {
			status: "401",
			message: "all parameters required",
		};
		res.status(401).send(send_data);
	}
	const date = getDate();
	const change_approval_status = await sequelize.query(`UPDATE approval_inbox SET status = '${status}', approver_remarks = '${approver_remarks}', approval_date = current_date(), updated_by = '${employee_id}' WHERE approval_id = ${approval_id} ;`, { type: QueryTypes.UPDATE });
	console.log(change_approval_status);
	const form_data = await sequelize.query(`select * from approval_inbox where approval_id = ${approval_id};`, { type: QueryTypes.SELECT });
	console.log(form_data);

	if (form_data.length) {
		const form_id = form_data[0].request_id;
		if (status == "rejected") {
			const change_approval_status = await sequelize.query(`UPDATE approval_inbox SET status = 'neglect', approver_remarks = 'rejected by previous approver', updated_by = 'auto' WHERE request_id = ${form_id} and approval_id != ${approval_id} and request_type = 'vendor_form';`, { type: QueryTypes.INSERT });
			console.log(change_approval_status);
			const leave_status = await sequelize.query(`UPDATE vendor_form_data set status = '${status}' where id = '${form_id}'`, { type: QueryTypes.INSERT });
			console.log(leave_status);
			res.status(200).send({
				status: 200,
				message: `Leave Status Changed`,
			});
			return;
		}
		const approval_data_next = await sequelize.query(`select * from approval_inbox where request_id = ${form_id} and status = 'future_approval' and request_type = 'vendor_form' order by approval_level limit 1;`, { type: QueryTypes.SELECT });
		console.log(approval_data_next);
		if (approval_data_next.length) {
			const next_approval = approval_data_next[0].approval_id;
			const change_approval_status = await sequelize.query(`UPDATE approval_inbox SET status = 'pending', updated_by = 'auto' WHERE approval_id = ${next_approval} ;`, { type: QueryTypes.INSERT });
			console.log(change_approval_status);
			res.status(200).send({
				status: 200,
				message: `Leave Status Changed`,
			});
			return;
		} else {
			const leave_status = await sequelize.query(`UPDATE vendor_form_data set status = '${status}' where id = '${form_id}'`, { type: QueryTypes.INSERT });
			console.log(leave_status);
			res.status(200).send({
				status: 200,
				message: `Leave Status Changed`,
			});
			return;
		}
	}
	res.status(200).send({
		status: 200,
		message: `Wrong Leave`,
	});
	return;
};
exports.getAllFormsMDM = async (req, res) => {
	try {
		const form_data = await sequelize.query(`select * from vendor_form_data where status = 'approved' and added_to_sap = false;`, { type: QueryTypes.SELECT });
		console.log(form_data);
		const send_data = {
			status: "200",
			data: form_data,
			message: "Data Fetched Successfully",
		};
		res.status(200).send(send_data);
	} catch (error) {
		console.log(error);
		const send_data = {
			status: "500",
			message: "Some Un-Expected Error Occured",
		};
		res.status(500).send(send_data);
	}
}
exports.addtoSAP = async (req, res) => {
	const { employee_id, sap_code, form_id } = req.body;
	if (!(employee_id, sap_code, form_id)) {
		const send_data = {
			status: "401",
			message: "all parameters required",
		};
		res.status(401).send(send_data);
	}
	try {
		const form_data = await sequelize.query(`update vendor_form_data set added_to_sap = true, sap_vendor_code = '${sap_code}' where id = ${form_id};`, { type: QueryTypes.UPDATE });
		console.log(form_data);
		const send_data = {
			status: "200",
			message: "Data saved Successfully",
		};
		res.status(200).send(send_data);
	} catch (error) {
		console.log(error);
		const send_data = {
			status: "500",
			message: "Some Un-Expected Error Occured",
		};
		res.status(500).send(send_data);
	}
}
function getDate() {
	var date = new Date();
	var day = date.getDate();
	if (day < 10) {
		day = "0" + day;
	}
	var month = date.getMonth() + 1;
	if (month < 10) {
		month = "0" + month;
	}
	const year = date.getFullYear();
	const final_date = month + "/" + day + "/" + year;
	return final_date;
}