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