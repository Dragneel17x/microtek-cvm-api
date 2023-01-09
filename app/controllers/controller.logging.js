const db = require("../models");
const logging = require("./controller.logging");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const jwt = require("jsonwebtoken");
const fs = require("fs");
const nodemailer = require("nodemailer")
const { QueryTypes } = require('sequelize');
const axios = require("axios");
const flag = require("../Flag");


exports.printLogtable = (unique_id, thread_id, api_path, req, res)  => {
    console.log("-------------------------");
    console.log(new Date);
    console.log("unique ID: ", unique_id)
    console.log("Thread ID: ", thread_id);
    console.log("API PATH: ", api_path);
    console.log("Request from Client: ", req);
    console.log("Response from Server: ", res);
    console.log("-------------------------");
}


exports.loginLogs= async (req, res) =>{
    const{employee_id, module_name} = req.body;
    if (!(employee_id && module_name)) {
        const send_data = {
            status: 403,
            message: "all parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/get-roster", req.body, send_data);
        return;
    }
    const date = new Date();
    var ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
    var offset= ISToffSet*60*1000;
    const dateTime = new Date(date.getTime()+offset).toISOString().slice(0, 19).replace('T', ' ');
    const insert_loging = await sequelize.query(`insert into login_logs (module_name, employee_id, log_date) values ('${module_name}','${employee_id}', '${dateTime}');`, { type: QueryTypes.INSERT });
    console.log(insert_loging);
    const send_data = {
        status: 200,
        data: `Login Logged`,
        message: "data saved sucessfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/log-login", req.body, send_data);
}

exports.qrCodeLoging = async (req, res) =>{
    const{employee_id} = req.body;
    const file = req.file;
    if (!file) {
        const send_data = {
            status: 403,
            message: "Unable to Store Image"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/log-qr-file", req.body, send_data);
        return
    }
    if (!employee_id) {
        const send_data = {
            status: 403,
            message: "all parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/log-qr-file", req.body, send_data);
        fs.unlinkSync(file.path);
        return
    }
    const date = new Date();
    var ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
    var offset= ISToffSet*60*1000;
    const dateTime = new Date(date.getTime()+offset).toISOString().slice(0, 19).replace('T', ' ');
    const insert_loging_file = await sequelize.query(`insert into qrcode_file_logs (employee_id, file_path, log_date) values ('${employee_id}', '${file.path}', '${dateTime}')`, { type: QueryTypes.INSERT });
    console.log(insert_loging_file);
    const send_data = {
        status: 200,
        data: `QR Code File Logged`,
        message: "data saved sucessfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/log-qr-file", req.body, send_data);
}