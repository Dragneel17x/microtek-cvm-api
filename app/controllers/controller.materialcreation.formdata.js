const db = require("../models");
const logging = require("./controller.logging");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const flag = require("../Flag");

exports.getPlantData = async (req,res)=>{

	const getPlantData = await sequelize.query(`select * from plant_master`, { type: QueryTypes.SELECT });
    console.log(getPlantData);
	const send_data = {
		status: 200,
		data: getPlantData,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);

}

exports.getStorageLocation= async (req, res) => {
	const { plant_name } = req.body;
	if (!plant_name) {
		const send_data = {
			status: 400,
			message: "Plant Name Required",
		};
		res.status(400).send(send_data);
		return;
	}

    const getPlantCode = await sequelize.query(`select distinct(plant_code) code from plant_master where plant_name = '${plant_name}'`, {type:QueryTypes.SELECT});
	const getStorageLocationMapping = await sequelize.query(`select * from storage_location_master where plant_code = '${getPlantCode[0]?.code}'`, { type: QueryTypes.SELECT });
	console.log(getStorageLocationMapping);
	if (!getStorageLocationMapping?.length) {
		const send_data = {
			status: 200,
			message: "NO DATA FOUND",
		};
		res.status(200).send(send_data);
		return;
	}
	const send_data = {
		status: 200,
		data: getStorageLocationMapping,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
};

exports.getMatSalesOrg = async(req,res)=>{
     const getMatSalesOrg = await sequelize.query(`select * from mat_sales_org_master`, {type: QueryTypes.SELECT});
    
     const send_data = {
        status: 200,
        data: getMatSalesOrg,
        message: "Data Fetched Succesfully"
     }
     res.status(200).send(send_data);
}

exports.getMatDistChannel = async (req,res)=>{

	const getMatDistChannel = await sequelize.query(`select * from mat_dist_channel_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getMatDistChannel,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}

exports.getBaseUnitMeasure = async (req,res)=>{

	const getBaseUnitMeasure = await sequelize.query(`select * from base_unit_measure_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getBaseUnitMeasure,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}
exports.getMatGrp = async (req,res)=>{

	const getMatGrp = await sequelize.query(`select * from mat_grp_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getMatGrp,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}

exports.getMatDiv = async (req,res)=>{

	const getMatDiv = await sequelize.query(`select * from mat_div_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getMatDiv,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}

exports.getMatPriceGrp = async (req,res)=>{

	const getMatPriceGrp = await sequelize.query(`select * from mat_price_grp_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getMatPriceGrp,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}

exports.getMatPurchaseGrp = async (req,res)=>{

	const getMatPurchaseGrp = await sequelize.query(`select * from mat_purchase_grp_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getMatPurchaseGrp,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}

exports.getSerialNoProfile = async (req,res)=>{

	const getSerialNoProfile = await sequelize.query(`select * from serial_no_profile_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getSerialNoProfile,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}

exports.getQualityInspType = async (req,res)=>{

	const getQualityInspType = await sequelize.query(`select * from quality_insp_type_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getQualityInspType,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}

exports.getMatType = async (req,res)=>{

	const getMatType = await sequelize.query(`select distinct mat_desc from material_type_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getMatType,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}

exports.getValuationType = async (req,res)=>{

    const { mat_type } = req.body;
	if (!mat_type) {
		const send_data = {
			status: 400,
			message: "Material Name Required",
		};
		res.status(400).send(send_data);
		return;
	}
    console.log(req.body);

    const getMaterialType = await sequelize.query(`select material_type from material_type_master where mat_desc = '${mat_type}'`, {type:QueryTypes.SELECT});
	const getValuationType = await sequelize.query(`select * from valuation_type_master where material_type = '${getMaterialType[0].material_type}'`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getValuationType,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}

exports.postFormData = async (req, res) => {
	const formData = req.body;
	console.log(req.body);
	if (!formData) {
		const send_data = {
			status: "401",
			message: "all parameters required",
		};
		res.status(401).send(send_data);
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

		try {
			const approval_data = await sequelize.query(`select * from approval_matrix where approval_type = 'material_form' order by approval_level;`, { type: QueryTypes.SELECT });
			console.log(approval_data);

			const data = await sequelize.query(`insert into material_creation_form_data (mat_type, mat_logic_number, plant_name, storage_location, sales_organization, mat_short_desc, base_unit, mat_long_desc, dist_channel, mat_group, division, mat_price_grp, purchasing_grp, gr_proc_time, hsn_code, serial_no_profile, quality_inspection, valuation_type, created_by, updated_by) values ('${formData.mat_type}','${formData.mat_logic_no}','${formData.plant_name}','${formData.storage_location}','${formData.mat_sales_org}','${formData.mat_short_desc}','${formData.base_unit_measure}','${formData.mat_long_desc}','${formData.mat_dist_channel}','${formData.mat_grp}','${formData.mat_div}','${formData.mat_price_grp}', '${formData.mat_purchase_grp}','${formData.gr_proc_time}','${formData.hsn_code}','${formData.serial_no_profile}','${formData.quality_insp_type}','${formData.valuation_type}','${formData.employee_id}','${formData.employee_id}')`, { type: QueryTypes.INSERT });
			console.log(data);

			approval_data.map(async (item,i) => {
				const insert_approval = await sequelize.query(`INSERT INTO approval_inbox ( request_type, request_id, approval_level, applied_by, approver_employee_id, status, created_by, updated_by) VALUES ('material_form',${data[0]},'${item.approval_level}','${formData.employee_id}','${item.approver_employee_id}','${i==0? "pending":"future_approval"}','${formData.employee_id}','${formData.employee_id}');`, { type: QueryTypes.INSERT });
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
};

exports.materialFormApplrovals = async (req, res) => {
	const { employee_id } = req.body;

	if (!employee_id) {
		const send_data = {
			status: "401",
			message: "all parameters required",
		};
		res.status(401).send(send_data);
	}
	const form_data = await sequelize.query(`select * from approval_inbox ai left outer join material_creation_form_data cfd on ai.request_id = cfd.id where request_type = 'material_form' and approver_employee_id = '${employee_id}' and ai.status = 'pending';`, { type: QueryTypes.SELECT });
	console.log(form_data);

	const send_data = {
		status: "200",
		data: form_data,
		message: "Data Fetched Successfully",
	};
	res.status(200).send(send_data);
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
			const change_approval_status = await sequelize.query(`UPDATE approval_inbox SET status = 'neglect', approver_remarks = 'rejected by previous approver', updated_by = 'auto' WHERE request_id = ${form_id} and approval_id != ${approval_id} and request_type = 'material_form';`, { type: QueryTypes.INSERT });
			console.log(change_approval_status);
			const leave_status = await sequelize.query(`UPDATE material_creation_form_data set status = '${status}' where id = '${form_id}'`, { type: QueryTypes.INSERT });
			console.log(leave_status);
			res.status(200).send({
				status: 200,
				message: `Leave Status Changed`,
			});
			return;
		}
		const approval_data_next = await sequelize.query(`select * from approval_inbox where request_id = ${form_id} and status = 'future_approval' and request_type = 'material_form' order by approval_level limit 1;`, { type: QueryTypes.SELECT });
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
			const leave_status = await sequelize.query(`UPDATE material_creation_form_data set status = '${status}' where id = '${form_id}'`, { type: QueryTypes.INSERT });
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
		const form_data = await sequelize.query(`select cfd.*, ai.status ai_status, ai.approval_level, ai.approver_remarks, approver_employee_id from material_creation_form_data cfd left join approval_inbox ai on cfd.id = ai.request_id  where cfd.created_by = '${employee_id}' and ai.request_type = 'material_form'`, { type: QueryTypes.SELECT });
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

exports.getAllFormsMDM = async (req, res) => {
	try {
		const form_data = await sequelize.query(`select * from material_creation_form_data where status = 'approved' and added_to_sap = false;`, { type: QueryTypes.SELECT });
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
		const form_data = await sequelize.query(`update material_creation_form_data set added_to_sap = true, sap_material_code = '${sap_code}' where id = ${form_id};`, { type: QueryTypes.UPDATE });
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
