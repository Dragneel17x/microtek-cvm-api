const db = require("../models");
const logging = require("./controller.logging");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const flag = require("../Flag");


exports.getFormReport = async (req,res) =>{
    const customer_form_count = await  sequelize.query(`select count(*) as count from customer_form_data where Date(Created_at) = Date(now())`, { type: QueryTypes.SELECT });
    const customer_form_avg = await  sequelize.query(`select avg(count) avg from ( select count(1) as count, date(created_at) from customer_form_data group by date(created_at)) tt;`, { type: QueryTypes.SELECT });
    const material_form_count = await  sequelize.query(`select count(*) as count from material_creation_form_data where Date(Created_at) = Date(now())`, { type: QueryTypes.SELECT });
    const material_form_avg = await  sequelize.query(`select avg(count) avg from ( select count(1) as count, date(created_at) from material_creation_form_data group by date(created_at)) tt;`, { type: QueryTypes.SELECT });
    const vendor_form_count = await  sequelize.query(`select count(*) as count from vendor_form_data where Date(Created_at) = Date(now())`, { type: QueryTypes.SELECT });
    const vendor_form_avg = await  sequelize.query(`select avg(count) avg from ( select count(1) as count, date(created_at) from vendor_form_data group by date(created_at)) tt;`, { type: QueryTypes.SELECT });

    const send_data={
        status:200,
        data:[
            {name:"Customer Form Submitted",count:customer_form_count[0]?.count, avg_count:customer_form_avg[0].avg },
            {name:"Material Form Submitted",count:material_form_count[0]?.count, avg_count:material_form_avg[0].avg },
            {name:"Vendor Form Submitted",count:vendor_form_count[0]?.count, avg_count:vendor_form_avg[0].avg },
        ],
        message:'Data Fetched Successfully'
    }

    res.status(200).send(send_data);
}