const db = require("../models");
const logging = require("./controller.logging");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const flag = require("../Flag");

exports.getCustomerGroup = async (req, res) => {
	const getCustomerGroup = await sequelize.query("select * from customer_grp_list_master", { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getCustomerGroup,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
};
exports.getCountryCodes = async (req, res) => {
	const code_data = await sequelize.query(`select distinct(country) country, country_code from county_state_master;`, {
		type: QueryTypes.SELECT,
	});

	const send_data = {
		status: 200,
		data: code_data,
		message: "data fetched successfully",
	};

	res.status(200).send(send_data);
};
exports.gettransportationZone = async (req, res) => {
	const tz_data = await sequelize.query(`select * from transportation_zone_list_master`, { type: QueryTypes.SELECT });

	const send_data = {
		status: 200,
		data: tz_data,
		message: "data fetched successfully",
	};

	res.status(200).send(send_data);
};
exports.getStateList = async (req, res) => {
	const { country } = req.body;
	if (!country) {
		const send_data = {
			status: 400,
			message: "All Parameters are required",
		};
		res.status(400).send(send_data);
		return;
	}
	const code_data = await sequelize.query(`select distinct(state) state, state_code from county_state_master where country = '${country}';`, {
		type: QueryTypes.SELECT,
	});

	const send_data = {
		status: 200,
		data: code_data,
		message: "data fetched successfully",
	};

	res.status(200).send(send_data);
};
exports.getCompanyCode = async (req, res) => {
	const company_code = await sequelize.query(`select * from company_code_master`, { type: QueryTypes.SELECT });

	const send_data = {
		status: 200,
		data: company_code,
		message: "data sent successfully",
	};

	res.status(200).send(send_data);
};
exports.getReconAcc = async (req, res) => {
	const recon_data = await sequelize.query("select * from reconciliation_account_master", { type: QueryTypes.SELECT });

	const send_data = {
		status: 200,
		data: recon_data,
		message: "Data fetches Successfully",
	};

	res.status(200).send(send_data);
};
exports.getPayTerm = async (req, res) => {
	const payterm_data = await sequelize.query("select * from pay_term_list_master", { type: QueryTypes.SELECT });

	const send_data = {
		status: 200,
		data: payterm_data,
		message: "data fetched successfully",
	};

	res.status(200).send(send_data);
};
exports.getSalesOrg = async (req, res) => {
	const getSalesOrg = await sequelize.query("select * from sales_org_master", {
		type: QueryTypes.SELECT,
	});
	const send_data = {
		status: 200,
		data: getSalesOrg,
		message: "data fetched successfully",
	};

	res.status(200).send(send_data);
};
exports.getDistChannel = async (req, res) => {
	const getDistChannel = await sequelize.query("select * from dist_channel_master", { type: QueryTypes.SELECT });

	const send_data = {
		status: 200,
		data: getDistChannel,
		message: "data fetched successfully",
	};

	res.status(200).send(send_data);
};
exports.getDivision = async (req, res) => {
	const getDivision = await sequelize.query("select * from division_list_master", { type: QueryTypes.SELECT });

	const send_data = {
		status: 200,
		data: getDivision,
		message: "data fetched successfully",
	};

	res.status(200).send(send_data);
};
exports.getSalesOfficeDistrict = async (req, res) => {
	const getSalesOfficeDistrict = await sequelize.query("select * from sales_office_list_master", { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getSalesOfficeDistrict,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
};
exports.getCustomerAccountGroup = async (req, res) => {
	const getCustomerAccountGroup = await sequelize.query("select * from customer_acc_grp_master", { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getCustomerAccountGroup,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
};
exports.getSalesDistrict = async (req, res) => {
	const getSalesDistrict = await sequelize.query("select * from district_name_list_master", { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getSalesDistrict,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
};
exports.getPincodeMapping = async (req, res) => {
	const getPincodeMapping = await sequelize.query(`select pincode, state_name state, city_name city, district_name district from  pincode_mapping_data`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getPincodeMapping,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
};
exports.getPincodeData = async (req, res) => {
	const { pincode } = req.body;
	if (!pincode) {
		const send_data = {
			status: 400,
			message: "Pincode Required",
		};
		res.status(400).send(send_data);
		return;
	}

	const getPincodeMapping = await sequelize.query(`select pincode, state_name state, IF(city_name = 'NA', district_name, city_name) city, district_name district from  pincode_mapping_data where pincode = '${pincode}'`, { type: QueryTypes.SELECT });
	console.log(getPincodeMapping);
	if (!getPincodeMapping?.length) {
		const send_data = {
			status: 200,
			message: "NO DATA FOUND",
		};
		res.status(200).send(send_data);
		return;
	}
	const send_data = {
		status: 200,
		data: getPincodeMapping[0],
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
};
exports.getSbuType = async (req, res) => {
	const getSBUType = await sequelize.query("select * from sbu_master", { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getSBUType,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
};


//post
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

	if (!(formData.cust_group && formData.cust_name && formData.cust_address && formData.co_person && formData.district && formData.city && formData.postal_code && formData.country && formData.company_code && formData.recon_acc && formData.pay_term && formData.sales_org && formData.dist_channel && formData.division && formData.sales_district && formData.sales_office && formData.employee_id && formData.sbu_type)) {
		const send_data = {
			status: "401",
			message: "all parameters required",
		};

		res.status(401).send(send_data);
	} else {
		/* console.log(Object.keys(formdata)); */

		try {
			const sku_approval_data = await sequelize.query(`select * from sbu_master where SBU_type = '${formData.sbu_type}' limit 1;`, { type: QueryTypes.SELECT });
			console.log(sku_approval_data);

			const approval_data = await sequelize.query(`select * from approval_matrix where approval_type = 'customer_form' order by approval_level;`, { type: QueryTypes.SELECT });
			console.log(approval_data);

			const data = await sequelize.query(`insert into customer_form_data (customer_group,customer_name,customer_name_op,customer_address,customer_address_op1,customer_address_op2,customer_address_op3,district,state_code,city,postal_code,country,co_person,transportation_zone,mobile_no,email_id,company_code,reconciliation_acc,pay_term,sales_org,distribution_channel,division,sales_district,customer_acc_grp,sales_office,gstin,tan_number,pan_number, sbu_type, created_by, updated_by) values ('${formData.cust_group}','${formData.cust_name}','${formData.cust_name_op1}','${formData.cust_address}','${formData.cust_address_op1}','${formData.cust_address_op2}','${formData.cust_address_op3}','${formData.district}','${formData.state_code}','${formData.city}','${formData.postal_code}','${formData.country}','${formData.co_person}','${formData.transportation_zone}','${formData.mobile_no}','${formData.email_id}','${formData.company_code}','${formData.recon_acc}','${formData.pay_term}','${formData.sales_org}','${formData.dist_channel}','${formData.division}','${formData.sales_district}','${formData.customer_acc_group}','${formData.sales_office}','${formData.gstin}','${formData.tan_number}','${formData.pan}', '${formData.sbu_type}', '${formData.employee_id}', '${formData.employee_id}')`, { type: QueryTypes.INSERT });
			console.log(data);

			const postData = await sequelize.query(`INSERT INTO file_path_mapping (form_data_id , form_type, blank_cheque, GST_Image, PAN_Image, declaration, DAPF) VALUES (${data[0]},'customer_form','${reqFile?.blank_cheque[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}', '${reqFile?.GST_Image[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}', '${reqFile?.PAN_Image[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}','${reqFile?.declaration[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}', '${reqFile?.DAPF[0]?.path.replace(/\\/g, "/").replace(/^dist\//, "")}')`, { type: QueryTypes.INSERT });
			console.log("postdata" + postData);
			approval_data.map(async (item) => {
				const insert_approval = await sequelize.query(`INSERT INTO approval_inbox ( request_type, request_id, approval_level, applied_by, approver_employee_id, status, created_by, updated_by) VALUES ('customer_form',${data[0]},'${item.approval_level}','${formData.employee_id}','${item.approver_employee_id}','future_approval','${formData.employee_id}','${formData.employee_id}');`, { type: QueryTypes.INSERT });
				console.log(insert_approval);
			});
			const insert_approval_manager = await sequelize.query(`INSERT INTO approval_inbox ( request_type, request_id, approval_level, applied_by, approver_employee_id, status, created_by, updated_by) VALUES ('customer_form',${data[0]},'0','${formData.employee_id}','${sku_approval_data[0].approver_id}','pending','${formData.employee_id}','${formData.employee_id}');`, { type: QueryTypes.INSERT });
			console.log(insert_approval_manager);
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
			const change_approval_status = await sequelize.query(`UPDATE approval_inbox SET status = 'neglect', approver_remarks = 'rejected by previous approver', updated_by = 'auto' WHERE request_id = ${form_id} and approval_id != ${approval_id} and request_type = 'customer_form';`, { type: QueryTypes.INSERT });
			console.log(change_approval_status);
			const leave_status = await sequelize.query(`UPDATE customer_form_data set status = '${status}' where id = '${form_id}'`, { type: QueryTypes.INSERT });
			console.log(leave_status);
			res.status(200).send({
				status: 200,
				message: `Leave Status Changed`,
			});
			return;
		}
		const approval_data_next = await sequelize.query(`select * from approval_inbox where request_id = ${form_id} and status = 'future_approval' order by approval_level limit 1;`, { type: QueryTypes.SELECT });
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
			const leave_status = await sequelize.query(`UPDATE customer_form_data set status = '${status}' where id = '${form_id}'`, { type: QueryTypes.INSERT });
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

exports.customerFormApplrovals = async (req, res) => {
	const { employee_id } = req.body;

	if (!employee_id) {
		const send_data = {
			status: "401",
			message: "all parameters required",
		};
		res.status(401).send(send_data);
	}
	const form_data = await sequelize.query(`select * from approval_inbox ai left outer join customer_form_data cfd on ai.request_id = cfd.id where request_type = 'customer_form' and approver_employee_id = '${employee_id}' and ai.status = 'pending';`, { type: QueryTypes.SELECT });
	console.log(form_data);

	const send_data = {
		status: "200",
		data: form_data,
		message: "Data Fetched Successfully",
	};
	res.status(200).send(send_data);
};

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
		const form_data = await sequelize.query(`select cfd.*, ai.status ai_status, ai.approval_level, ai.approver_remarks, approver_employee_id from customer_form_data cfd left join approval_inbox ai on cfd.id = ai.request_id  where cfd.created_by = '${employee_id}'`, { type: QueryTypes.SELECT });
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
