const db = require("../models");
const logging = require("./controller.logging");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const flag = require("../Flag");

exports.getPlantData = async (req,res)=>{

	const getPlantData = await sequelize.query(`select * from plant_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getPlantData,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}
/* exports.getStorageLocation = async (req,res)=>{

	const getPlantData = await sequelize.query(`select * from plant_master`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getPlantData,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
    console.log(send_data);
} */
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

	const getMatType = await sequelize.query(`select distinct material_type from material_type_master`, { type: QueryTypes.SELECT });
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

	const getValuationType = await sequelize.query(`select * from valuation_type_master where material_type = '${mat_type}'`, { type: QueryTypes.SELECT });
	const send_data = {
		status: 200,
		data: getValuationType,
		message: "data fetched successfully",
	};
	res.status(200).send(send_data);
}


exports.materialFormApplrovals = async (req, res) => {
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
