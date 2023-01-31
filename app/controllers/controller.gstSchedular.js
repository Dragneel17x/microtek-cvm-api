const db = require("../models");
const logging = require("./controller.logging");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const flag = require("../Flag");
const { default: axios } = require("axios");
var CronJob = require('cron').CronJob;


var verify_gst_Job = new CronJob(
    '*/30 * * * *',
    function () {
        //gst_verification();
    },
    null,
    true
);

async function gst_verification() {
    try {
        const options = {
            method: 'POST',
            url: `https://internal.microtek.tech:8443/v1/api/verification/auth`,
            headers: {
                Accept: 'application/json',
            },
            data: { username: "test", password: "test@123" }
        };
        axios
            .request(options)
            .then(async (token_response) => {
                const token = token_response.data.data.token
                console.log(token_response.data.data.token);
                const form_for_verification = await sequelize.query(`select * from customer_form_data where gst_verification_status = 'pending'`, { type: QueryTypes.SELECT });
                console.log(form_for_verification);
                form_for_verification.map(item => {
                    console.log(item.gstin);
                    const gst_options = {
                        method: 'POST',
                        url: `https://internal.microtek.tech:8443/v1/api/verification/gst`,
                        headers: {
                            Accept: 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        data: { gst_number: item.gstin }
                    };
                    //console.log(gst_options);
                    axios
                        .request(gst_options)
                        .then(async (gst_response) => {
                            console.log(gst_response.data.data.valid);
                            if(gst_response.data.data.valid){
                                const form_for_verification = await sequelize.query(`update customer_form_data set gst_verification_status = 'approved' where id = ${item.id};`, { type: QueryTypes.UPDATE });
                                console.log(form_for_verification);
                            }
                        })
                        .catch(error => {
                            console.log(error.response.data);
                        })
                })
            })
    } catch (error) {
        console.log(error);
    }
}