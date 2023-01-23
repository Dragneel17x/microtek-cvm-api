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
    console.log(send_data);
}