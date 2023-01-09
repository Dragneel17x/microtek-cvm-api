const db = require("../models");
const logging = require("./controller.logging");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
const { QueryTypes } = require('sequelize');
const axios = require("axios");
const flag = require("../Flag");

/* exports.getProduct = async (req, res) => {
    const product_data = await sequelize.query(`select id, product_name, product_code from product_master where active_flag = true and obsolete_flag = false;`, { type: QueryTypes.SELECT });
    console.log(product_data);
    const send_data = {
        status: 200,
        data: product_data,
        message: "data fetched sucessfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-product", req.body, send_data);
}
 */