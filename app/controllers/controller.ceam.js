const db = require("../models");
const logging = require("./controller.logging");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
const { QueryTypes } = require('sequelize');
const axios = require("axios");
const flag = require("../Flag");


exports.getPublishedRoster = async (req, res) => {
    const { manager_id } = req.body;
    if (!manager_id) {
        const send_data = {
            status: 403,
            message: "all parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/publish-roster", req.body, res);
        return;
    }
    const roster_data = await sequelize.query(``, { type: QueryTypes.SELECT });
    console.log(roster_data);
}

const getDays = (year, month) => {
    return new Date(year, month, 0).getDate();
}

exports.getRoster = async (req, res) => {
    const { month, year } = req.body
    if (!(month && year)) {
        const send_data = {
            status: 403,
            message: "all parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/get-roster", req.body, send_data);
        return;
    }
    const no_of_days = getDays(year, month);
    var day_string = '';
    for (let index = 1; index <= no_of_days; index++) {
        day_string = day_string + `, t2.${index}`
    }
    const roster_data = await sequelize.query(`select roster_id, employee_id 'Employee Code', plant, division, status ${day_string} from employee_roster t2 where month = ${month} and year = ${year};`, { type: QueryTypes.SELECT });
    console.log(roster_data);
    const send_data = {
        status: 200,
        data: roster_data,
        message: "data fetched sucessfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-roster", req.body, send_data);

}

exports.getOTRoster = async (req, res) => {
    const { month, year } = req.body
    if (!(month && year)) {
        const send_data = {
            status: 403,
            message: "all parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/get-roster", req.body, send_data);
        return;
    }
    const no_of_days = getDays(year, month);
    var day_string = '';
    for (let index = 1; index <= no_of_days; index++) {
        day_string = day_string + `, t2.${index}`
    }
    const roster_data = await sequelize.query(`select ot_id, employee_id 'Employee Code', plant, division, status ${day_string} from employee_ot_roster t2 where month = ${month} and year = ${year};`, { type: QueryTypes.SELECT });
    console.log(roster_data);
    const send_data = {
        status: 200,
        data: roster_data,
        message: "data fetched sucessfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-roster", req.body, send_data);

}

exports.uploadRoster = async (req, res) => {
    const { month, year, roster_data, employee_id, manager_id, plant, division } = req.body
    if (!(month && year && roster_data && employee_id && manager_id && plant && division)) {
        const send_data = {
            status: 403,
            message: "all parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-roster", req.body, send_data);
        return;
    }
    if (!roster_data.length) {
        const send_data = {
            status: 403,
            message: "roster data can not be empty"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-roster", req.body, send_data);
        return;
    }
    const no_of_days = getDays(year, month);
    var insert_data = '';
    let error_id = [];
    var insert_approval_data = '';
    var error = false;
    const shift_data = await sequelize.query(`select distinct(shift_character) shift from shift_master where shift_type = 'shift' and active_flag = true;`, { type: QueryTypes.SELECT });
    const final_shift_data = shift_data.map(function (obj) {
        return obj.shift;
    });
    const frt_id = await sequelize.query(`select distinct(employee_id) id from ceam_employee_master where frt_verify_flag = true;`, { type: QueryTypes.SELECT });
    const valid_ids = frt_id.map(emp_id => { return (emp_id.id) })
    console.log(valid_ids);
    roster_data.map(single_roster => {
        var daily_roster = '';
        let single_error = false
        if (!valid_ids.includes(`${single_roster.emp_id}`)) {
            error = true;
            single_error = true;
            error_id.push(single_roster.emp_id);
            console.log(typeof single_roster.emp_id);
            console.log("emp id not in frt");
            return;
        }
        for (let index = 1; index <= no_of_days; index++) {
            if (!final_shift_data.includes(single_roster[index]) || !single_roster.emp_id) {
                error_id.push(single_roster.emp_id);
                error = true;
                single_error = true
                console.log("shif do not match");
            }
            else {
                daily_roster = daily_roster + `, '${single_roster[`${index}`]}'`
            }
        }
        if (!single_error) {
            if (insert_data) {
                insert_data = insert_data + `, ('${single_roster.emp_id}', ${month}, ${year},'${plant}', '${division}' ${daily_roster})`
            }
            else {
                insert_data = insert_data + `('${single_roster.emp_id}', ${month}, ${year},'${plant}', '${division}' ${daily_roster})`
            }
        }
    })
    var day_string = '';
    if (!insert_data) {
        const send_data = {
            status: 403,
            message: `Invalid Data Entry for Employee Code(s) ${error_id}`
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-roster", req.body, send_data);
        return;
    }
    for (let index = 1; index <= no_of_days; index++) {
        day_string = day_string + ',' + '`' + `${index}` + '`'
    }
    const insert_roster = await sequelize.query(`replace into employee_roster (employee_id, month, year, plant, division ${day_string}) values ${insert_data}`, { type: QueryTypes.INSERT });
    console.log(insert_roster);
    const approver_data_level1 = await sequelize.query(`Select employee_id from roster_approval_matrix where plant = '${plant}' and division = '${division}' and level_1_approver = true and employee_id != '${employee_id}' and approval_type = 'roster' and active = true;`, { type: QueryTypes.SELECT });
    console.log(approver_data_level1);
    for (let index = 0; index < approver_data_level1.length; index++) {
        for (let approval_index = insert_roster[0]; approval_index < insert_roster[0]+insert_roster[1]; approval_index++) {
            if (insert_approval_data) {
                insert_approval_data = insert_approval_data + `, ('roster', '${approval_index}', '${employee_id}', '${approver_data_level1[index].employee_id}', 'pending', '1')`
            }
            else {
                insert_approval_data = insert_approval_data + `('roster', '${approval_index}', '${employee_id}', '${approver_data_level1[index].employee_id}', 'pending', '1')`
            }
            console.log(approval_index);
        }
    }
    const approver_data_level2 = await sequelize.query(`Select employee_id from roster_approval_matrix where plant = '${plant}' and division = '${division}' and level_2_approver = true and employee_id != '${employee_id}' and approval_type = 'roster' and active = true;`, { type: QueryTypes.SELECT });
    console.log(approver_data_level2);
    for (let index = 0; index < approver_data_level2.length; index++) {
        for (let approval_index = insert_roster[0]; approval_index < insert_roster[0]+insert_roster[1]; approval_index++) {
            if (insert_approval_data) {
                insert_approval_data = insert_approval_data + `, ('roster', '${approval_index}', '${employee_id}', '${approver_data_level2[index].employee_id}', 'pending', '2')`
            }
            else {
                insert_approval_data = insert_approval_data + `('roster', '${approval_index}', '${employee_id}', '${approver_data_level2[index].employe_id}', 'pending', '2')`
            }
            console.log(approval_index);
        }
    }
    const insert_ot_roster = await sequelize.query(`INSERT INTO roster_ot_approval ( request_type, request_id, applied_by, approver_employee_id, status, approval_level) VALUES ${insert_approval_data};`, { type: QueryTypes.INSERT });
    console.log(insert_ot_roster);
    if (error) {
        const send_data = {
            status: 403,
            message: `Invalid Data Entry for employee code(s) ${error_id.filter(onlyUnique)}`
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-roster", req.body, send_data);
        return;
    }
    const send_data = {
        status: 200,
        data: `data stored with roster_id from ${insert_roster} AND Send for approval`,
        message: "data saved sucessfully"
    }
    res.status(200).send(send_data);
    logging.printLogtable("txn id", "thread id", "/roster-format", req.body, send_data);
}

exports.uploadOTRoster = async (req, res) => {
    const { month, year, ot_roster_data, employee_id, manager_id, plant, division } = req.body
    if (!(month && year && ot_roster_data && employee_id && manager_id && plant && division)) {
        const send_data = {
            status: 403,
            message: "all parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-ot-roster", req.body, send_data);
        return;
    }
    if (!ot_roster_data.length) {
        const send_data = {
            status: 403,
            message: "roster data can not be empty"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-ot-roster", req.body, send_data);
        return;
    }
    const no_of_days = getDays(year, month);
    var insert_data = '';
    var insert_approval_data = '';
    let error_id = [];
    var error = false;
    const shift_data = await sequelize.query(`select distinct(shift_character) shift from shift_master where shift_type = 'ot' and active_flag = true;`, { type: QueryTypes.SELECT });
    const final_shift_data = shift_data.map(function (obj) {
        return obj.shift;
    });
    const roster_id = await sequelize.query(`select distinct(employee_id) id from employee_roster where month = ${month} and year = ${year};`, { type: QueryTypes.SELECT });
    const valid_ids = roster_id.map(emp_id => { return (emp_id.id) })
    console.log(roster_id);
    ot_roster_data.map(single_roster => {
        var daily_roster = '';
        let single_error = false;
        if (!valid_ids.includes(`${single_roster.emp_id}`)) {
            error_id.push(single_roster.emp_id);
            error = true;
            return;
        }
        for (let index = 1; index <= no_of_days; index++) {
            if (single_roster[index] || !single_roster.emp_id) {
                if (!final_shift_data.includes(single_roster[index]) || !single_roster.emp_id) {
                    error_id.push(single_roster.emp_id);
                    console.log(single_roster.emp_id);
                    console.log("error");
                    console.log(single_roster[`${index}`]);
                    error = true;
                    single_error = true
                }
            }
            if (!single_roster[index]) {
                daily_roster = daily_roster + `, ''`;
            }
            else {
                daily_roster = daily_roster + `, '${single_roster[`${index}`]}'`
            }
        }
        if(!single_error){
            if (insert_data) {
                insert_data = insert_data + `, ('${single_roster.emp_id}', ${month}, ${year}, '${plant}', '${division}' ${daily_roster})`
            }
            else {
                insert_data = insert_data + `('${single_roster.emp_id}', ${month}, ${year}, '${plant}', '${division}' ${daily_roster})`
            }
        }
    })
    var day_string = '';
    if (!insert_data) {
        const send_data = {
            status: 403,
            message: `Invalid Data Entry for Employee Code(s) ${error_id}`
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-ot-roster", req.body, send_data);
        return;
    }
    for (let index = 1; index <= no_of_days; index++) {
        day_string = day_string + ',' + '`' + `${index}` + '`'
    }
    const insert_roster = await sequelize.query(`replace into employee_ot_roster (employee_id, month, year, plant, division ${day_string}) values ${insert_data}`, { type: QueryTypes.INSERT });
    console.log(insert_roster);
    const approver_data_level1 = await sequelize.query(`Select employee_id from roster_approval_matrix where plant = '${plant}' and division = '${division}' and level_1_approver = true and employee_id != '${employee_id}' and approval_type = 'ot' and active = true;`, { type: QueryTypes.SELECT });
    console.log(approver_data_level1);
    for (let index = 0; index < approver_data_level1.length; index++) {
        for (let approval_index = insert_roster[0]; approval_index < insert_roster[0]+insert_roster[1]; approval_index++) {
            if (insert_approval_data) {
                insert_approval_data = insert_approval_data + `, ('ot', '${approval_index}', '${employee_id}', '${approver_data_level1[index].employee_id}', 'pending', '1')`
            }
            else {
                insert_approval_data = insert_approval_data + `('ot', '${approval_index}', '${employee_id}', '${approver_data_level1[index].employee_id}', 'pending', '1')`
            }
            console.log(approval_index);
        }
    }
    const approver_data_level2 = await sequelize.query(`Select employee_id from roster_approval_matrix where plant = '${plant}' and division = '${division}' and level_2_approver = true and employee_id != '${employee_id}' and approval_type = 'ot' and active = true;`, { type: QueryTypes.SELECT });
    console.log(approver_data_level2);
    for (let index = 0; index < approver_data_level2.length; index++) {
        for (let approval_index = insert_roster[0]; approval_index < insert_roster[0]+insert_roster[1]; approval_index++) {
            if (insert_approval_data) {
                insert_approval_data = insert_approval_data + `, ('ot', '${approval_index}', '${employee_id}', '${approver_data_level2[index].employee_id}', 'pending', '2')`
            }
            else {
                insert_approval_data = insert_approval_data + `('ot', '${approval_index}', '${employee_id}', '${approver_data_level2[index].employee_id}', 'pending', '2')`
            }
            console.log(approval_index);
        }
    }
    const insert_ot_roster = await sequelize.query(`INSERT INTO roster_ot_approval ( request_type, request_id, applied_by, approver_employee_id, status, approval_level) VALUES ${insert_approval_data};`, { type: QueryTypes.INSERT });
    console.log(insert_ot_roster);
    if (error) {
        const send_data = {
            status: 403,
            message: `Invalid Data Entry for Employee Code(s) ${error_id}`
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-ot-roster", req.body, send_data);
        return;
    }
    const send_data = {
        status: 200,
        data: `data stored with roster_id from ${insert_roster} AND Send for approval`,
        message: "data saved sucessfully"
    }
    res.status(200).send(send_data);
    logging.printLogtable("txn id", "thread id", "/upload-ot-roster", req.body, send_data);
}

async function frcAttendance() {
    const date = '2022-12-09'
    const date_array = date.split('-');
    const day = date_array[2];
    const month = date_array[1];
    const year = date_array[0];
    const roster_data = await sequelize.query(`select * from frc_data where In Time`, { type: QueryTypes.SELECT });
    console.log(roster_data);
}

async function rosterStatusChange(status, approver_remarks, employee_id, approval_id) {
    const date = new Date();
    var ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
    var offset = ISToffSet * 60 * 1000;
    const dateTime = new Date(date.getTime() + offset).toISOString().slice(0, 19).replace('T', ' ');
        const change_approval_status = await sequelize.query(`UPDATE roster_ot_approval SET status = '${status}', approver_remarks = '${approver_remarks}', approval_date = '${dateTime}' WHERE approval_id = ${approval_id} ;`, { type: QueryTypes.INSERT });
        console.log(change_approval_status);
    const employee_leave_data = await sequelize.query(`select * from roster_ot_approval where approval_id = ${approval_id};`, { type: QueryTypes.SELECT });
    console.log(employee_leave_data);
    if (employee_leave_data.length) {
        const roster_id = employee_leave_data[0].request_id
        if (status == 'rejected') {
            const change_approval_status = await sequelize.query(`UPDATE roster_ot_approval SET status = 'neglect', approver_remarks = 'rejected by previous approver' WHERE request_id = ${roster_id} and approval_id != ${approval_id};`, { type: QueryTypes.INSERT });
            console.log(change_approval_status);
            const leave_status = await sequelize.query(`UPDATE employee_roster set status = '${status}' where roster_id = '${roster_id}'`, { type: QueryTypes.INSERT });
            console.log(leave_status);
            return;
        }
        const approval_data_next = await sequelize.query(`select * from roster_ot_approval where request_id = ${roster_id} and status = 'pending' and request_type = 'roster' limit 1;`, { type: QueryTypes.SELECT });
        console.log(approval_data_next);
        const next_approval_status = await sequelize.query(`UPDATE roster_ot_approval set status = '${status}', approver_remarks = 'approved by ${employee_id}' WHERE approval_id in (select approval_id from roster_ot_approval where request_id = ${roster_id} and status = 'pending' and request_type = 'roster') and approval_level = '${employee_leave_data[0].approval_level}'`, { type: QueryTypes.INSERT });
        console.log(next_approval_status);
        if (employee_leave_data[0].approval_level == '2') {
            const leave_status = await sequelize.query(`UPDATE employee_roster set status = '${status}' where roster_id = '${roster_id}'`, { type: QueryTypes.INSERT });
            console.log(leave_status);
            const next_approval_status_level_1 = await sequelize.query(`UPDATE roster_ot_approval set status = '${status}', approver_remarks = 'approved by ${employee_id}' WHERE approval_id in (select approval_id from roster_ot_approval where request_id = ${roster_id} and status = 'pending' and request_type = 'roster') and approval_level = '1'`, { type: QueryTypes.INSERT });
            console.log(next_approval_status_level_1);
        }
        return;
    }
    return;
}

exports.changeRosterStatus = async (req, res) => {
    const { status, approver_remarks, employee_id, approval_id } = req.body;
    if (!(status && employee_id && approval_id)) {
        const send_data = {
            status: 403,
            message: "All Parameters are Required!"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-roster", req.body, send_data);
        return;
    }
    if (!approval_id.length) {
        const send_data = {
            status: 403,
            message: "roster data can not be empty"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-roster", req.body, send_data);
        return;
    }
    approval_id.map((item, index) => {
        rosterStatusChange(status, approver_remarks, employee_id, item);
    })
    const send_data = {
        status: 200,
        message: "status Changed"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/upload-roster", req.body, send_data);
}

async function rosterOTStatusChange(status, approver_remarks, employee_id, approval_id) {
    const date = new Date();
    var ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
    var offset = ISToffSet * 60 * 1000;
    const dateTime = new Date(date.getTime() + offset).toISOString().slice(0, 19).replace('T', ' ');
    const change_approval_status = await sequelize.query(`UPDATE roster_ot_approval SET status = '${status}', approver_remarks = '${approver_remarks}', approval_date = '${dateTime}' WHERE approval_id = ${approval_id} ;`, { type: QueryTypes.INSERT });
    console.log(change_approval_status);
    const employee_leave_data = await sequelize.query(`select * from roster_ot_approval where approval_id = ${approval_id};`, { type: QueryTypes.SELECT });
    console.log(employee_leave_data);
    if (employee_leave_data.length) {
        const roster_id = employee_leave_data[0].request_id
        if (status == 'rejected') {
            const change_approval_status = await sequelize.query(`UPDATE roster_ot_approval SET status = 'neglect', approver_remarks = 'rejected by previous approver' WHERE request_id = ${roster_id} and approval_id != ${approval_id};`, { type: QueryTypes.INSERT });
            console.log(change_approval_status);
            const leave_status = await sequelize.query(`UPDATE employee_ot_roster set status = '${status}' where ot_id = '${roster_id}'`, { type: QueryTypes.INSERT });
            console.log(leave_status);
            return;
        }
        const approval_data_next = await sequelize.query(`select * from roster_ot_approval where request_id = ${roster_id} and status = 'pending' and request_type = 'ot' limit 1;`, { type: QueryTypes.SELECT });
        console.log(approval_data_next);
        const next_approval_status = await sequelize.query(`UPDATE roster_ot_approval set status = '${status}', approver_remarks = 'approved by ${employee_id}' WHERE approval_id in (select approval_id from roster_ot_approval where request_id = ${roster_id} and status = 'pending' and request_type = 'ot') and approval_level = '${employee_leave_data[0].approval_level}'`, { type: QueryTypes.INSERT });
        console.log(next_approval_status);
        if (employee_leave_data[0].approval_level == '2') {
            const approval_status = await sequelize.query(`UPDATE employee_ot_roster set status = '${status}' where ot_id = '${roster_id}'`, { type: QueryTypes.INSERT });
            console.log(approval_status);
            const next_approval_status_level_1 = await sequelize.query(`UPDATE roster_ot_approval set status = '${status}', approver_remarks = 'approved by ${employee_id}' WHERE approval_id in (select approval_id from roster_ot_approval where request_id = ${roster_id} and status = 'pending' and request_type = 'ot') and approval_level = '1'`, { type: QueryTypes.INSERT });
            console.log(next_approval_status_level_1);
        }
        return;
    }
    return;
}

exports.changeOTRosterStatus = async (req, res) => {
    const { status, approver_remarks, employee_id, approval_id } = req.body;
    if (!(status && employee_id && approval_id)) {
        const send_data = {
            status: 403,
            message: "All Parameters are Required!"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-roster", req.body, send_data);
        return;
    }
    if (!approval_id.length) {
        const send_data = {
            status: 403,
            message: "roster data can not be empty"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-roster", req.body, send_data);
        return;
    }
    approval_id.map((item, index) => {
        rosterOTStatusChange(status, approver_remarks, employee_id, item);
    })
    const send_data = {
        status: 200,
        message: "status Changed"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/upload-roster", req.body, send_data);
}

exports.getRosterForApproval = async (req, res) => {
    const { employee_id, month, year } = req.body;
    if (!(employee_id && month && year)) {
        const send_data = {
            status: 403,
            message: "all parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-ot-roster", req.body, send_data);
        return;
    }
    const roster_data = await sequelize.query(`select t1.approval_id, t2.* from roster_ot_approval t1 left join employee_roster t2 on t1.request_id = t2.roster_id where t1.approver_employee_id = '${employee_id}' and t2.month = ${month} and t2.year = ${year} and t1.status = 'pending' and t1.request_type = 'roster';`, { type: QueryTypes.SELECT });
    console.log(roster_data);
    const send_data = {
        status: 200,
        data: roster_data,
        message: "data fetched sucessfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-roster", req.body, send_data);
}

exports.getOTRosterForApproval = async (req, res) => {
    const { employee_id, month, year } = req.body;
    if (!(employee_id && month && year)) {
        const send_data = {
            status: 403,
            message: "all parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-ot-roster", req.body, send_data);
        return;
    }
    const roster_data = await sequelize.query(`select t1.approval_id, t2.* from roster_ot_approval t1 left join employee_ot_roster t2 on t1.request_id = t2.ot_id where t1.approver_employee_id = '${employee_id}' and t2.month = ${month} and t2.year = ${year} and t1.status = 'pending' and t1.request_type = 'ot';`, { type: QueryTypes.SELECT });
    console.log(roster_data);
    const send_data = {
        status: 200,
        data: roster_data,
        message: "data fetched sucessfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-roster", req.body, send_data);
}

exports.updateSingleOTRoster = async (req, res) => {
    const { employee_id, month, date, year, ot_type, plant, division, updated_by, manager_id } = req.body;

    if (!(employee_id && month && date && year && plant && division && updated_by)) {
        const send_data = {
            status: 403,
            message: "All parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/update-single-ot-roster", req.body, send_data);
        return;
    }
    let insert_approval_data = '';
    const roster_data = await sequelize.query(`select * from employee_ot_roster where employee_id = '${employee_id}' and month = ${month} and year = ${year} and plant = '${plant}' and division = '${division}';`, { type: QueryTypes.SELECT });
    console.log(roster_data);
    if (roster_data.length) {
        const insert_ot_roster_data = await sequelize.query(`Update employee_ot_roster set ` + '`' + date + '`' + ` = '${ot_type}', status = 'pending' where ot_id = '${roster_data[0].ot_id}'`, { type: QueryTypes.UPDATE });
        console.log(insert_ot_roster_data);
        const insert_ot_roster_approval_data = await sequelize.query(`Update roster_ot_approval set status = 'pending', applied_by = '${updated_by}' where request_type = 'ot' and request_id = '${roster_data[0].ot_id}'`, { type: QueryTypes.UPDATE });
        console.log(insert_ot_roster_approval_data);
    }
    else {
        const insert_ot_roster_data = await sequelize.query(`insert into employee_ot_roster (employee_id, month, year, plant, division, ` + '`' + date + '`' + `) values ('${employee_id}', ${month}, ${year}, '${plant}', '${division}', '${ot_type}')`, { type: QueryTypes.INSERT });
        console.log(insert_ot_roster_data);
        const approver_data_level1 = await sequelize.query(`Select employee_id from roster_approval_matrix where plant = '${plant}' and division = '${division}' and level_1_approver = true and employee_id != '${updated_by}' and approval_type = 'ot' and active = true;`, { type: QueryTypes.SELECT });
        console.log(approver_data_level1);
        for (let index = 0; index < approver_data_level1.length; index++) {
            if (insert_approval_data) {
                insert_approval_data = insert_approval_data + `, ('ot', '${insert_ot_roster_data[0]}', '${updated_by}', '${approver_data_level1[index].employee_id}', 'pending', '1')`
            }
            else {
                insert_approval_data = insert_approval_data + `('ot', '${insert_ot_roster_data[0]}', '${updated_by}', '${approver_data_level1[index].employee_id}', 'pending', '1')`
            }
        }
        const approver_data_level2 = await sequelize.query(`Select employee_id from roster_approval_matrix where plant = '${plant}' and division = '${division}' and level_2_approver = true and employee_id != '${updated_by}' and approval_type = 'ot' and active = true;`, { type: QueryTypes.SELECT });
        console.log(approver_data_level2);
        for (let index = 0; index < approver_data_level2.length; index++) {
            if (insert_approval_data) {
                insert_approval_data = insert_approval_data + `, ('ot', '${insert_ot_roster_data[0]}', '${updated_by}', '${approver_data_level2[index].employee_id}', 'pending', '2')`
            }
            else {
                insert_approval_data = insert_approval_data + `('ot', '${insert_ot_roster_data[0]}', '${updated_by}', '${approver_data_level2[index].employee_id}', 'pending', '2')`
            }
        }
        const insert_ot_roster = await sequelize.query(`INSERT INTO roster_ot_approval ( request_type, request_id, applied_by, approver_employee_id, status, approval_level) VALUES ${insert_approval_data};`, { type: QueryTypes.INSERT });
        console.log(insert_ot_roster);
    }
    const send_data = {
        status: 200,
        message: "Data Updated and sent for approval"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/update-single-ot-roster", req.body, send_data);
}

exports.getPlant = async (req, res) => {
    const plant_data = await sequelize.query(`Select distinct plant from roster_location_master`, { type: QueryTypes.SELECT });
    console.log(plant_data);
    const send_data = {
        status: 200,
        data: plant_data,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-plant", req.body, send_data);
}

exports.getDivision = async (req, res) => {
    const { plant } = req.body;

    if (!(plant)) {
        const send_data = {
            status: 403,
            message: "All parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/get-division", req.body, send_data);
        return;
    }
    const div_data = await sequelize.query(`Select distinct division from roster_location_master where plant = '${plant}'`, { type: QueryTypes.SELECT });
    console.log(div_data);
    const send_data = {
        status: 200,
        data: div_data,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-division", req.body, send_data);
}

exports.getOTType = async (req, res) => {
    const ot_data = await sequelize.query(`Select distinct shift_character from shift_master where shift_type = 'ot'`, { type: QueryTypes.SELECT });
    console.log(ot_data);
    const send_data = {
        status: 200,
        data: ot_data,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-ot-type", req.body, send_data);
}

exports.getShiftType = async (req, res) => {
    const shift_data = await sequelize.query(`Select distinct shift_character from shift_master where shift_type = 'shift'`, { type: QueryTypes.SELECT });
    console.log(shift_data);
    const send_data = {
        status: 200,
        data: shift_data,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-shift-type", req.body, send_data);
}

exports.getRosterLocation = async (req, res) => {
    const location_data = await sequelize.query(`Select id, plant, division, active from roster_location_master where active = true;`, { type: QueryTypes.SELECT });
    console.log(location_data);
    const send_data = {
        status: 200,
        data: location_data,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-roster-location", req.body, send_data);
}

exports.updateRosterLocation = async (req, res) => {
    const { id, plant, division, employee_id } = req.body;

    if (!(id && plant && division && employee_id)) {
        const send_data = {
            status: 403,
            message: "All parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/update-roster-location", req.body, send_data);
        return;
    }
    const location_update_data = await sequelize.query(`update roster_location_master set plant ='${plant}', division = '${division}', updated_by = '${employee_id}' where id = ${id};`, { type: QueryTypes.UPDATE });
    console.log(location_update_data);
    const send_data = {
        status: 200,
        message: "Data Updated successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/update-roster-location", req.body, send_data);
}

exports.createRosterLocation = async (req, res) => {
    const { plant, division, active, employee_id } = req.body;

    if (!(plant && division && employee_id)) {
        const send_data = {
            status: 403,
            message: "All parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/create-roster-location", req.body, send_data);
        return;
    }
    const location_data = await sequelize.query(`Select id, plant, division, active from roster_location_master where plant = '${plant}' and division = '${division}';`, { type: QueryTypes.SELECT });
    console.log(location_data);
    if (location_data.length) {
        const location_update_data = await sequelize.query(`update roster_location_master set active = true, updated_by = '${employee_id}' where id = ${location_data[0].id};`, { type: QueryTypes.UPDATE });
        console.log(location_update_data);
        const send_data = {
            status: 200,
            message: "Location is updated and set active"
        }
        res.status(200).send(send_data)
        logging.printLogtable("txn id", "thread id", "/create-roster-location", req.body, send_data);
        return;
    }
    const location_create_data = await sequelize.query(`insert into roster_location_master (plant, division, created_by, updated_by) values ('${plant}','${division}','${employee_id}','${employee_id}');`, { type: QueryTypes.INSERT });
    console.log(location_create_data);
    const send_data = {
        status: 200,
        message: "Data Created successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/create-roster-location", req.body, send_data);
}

exports.deleteRosterLocation = async (req, res) => {
    const { id, employee_id } = req.body;

    if (!(id && employee_id)) {
        const send_data = {
            status: 403,
            message: "All parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/delete-roster-location", req.body, send_data);
        return;
    }
    const location_update_data = await sequelize.query(`update roster_location_master set active = false, updated_by = '${employee_id}' where id = ${id};`, { type: QueryTypes.UPDATE });
    console.log(location_update_data);
    const send_data = {
        status: 200,
        message: "Data Deleted successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/delete-roster-location", req.body, send_data);
}

exports.getRosterApproval = async (req, res) => {
    const location_data = await sequelize.query(`Select matrix_id, employee_id, plant, division, level_1_approver, level_2_approver, approval_type, active from roster_approval_matrix where active = true;`, { type: QueryTypes.SELECT });
    console.log(location_data);
    const send_data = {
        status: 200,
        data: location_data,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-roster-approval", req.body, send_data);
}

exports.updateRosterApproval = async (req, res) => {
    const { matrix_id, plant, division, employee_id, approver_employee_id, level_1_approver, level_2_approver, approval_type } = req.body;

    if (!(matrix_id && plant && division && employee_id && approver_employee_id && approval_type)) {
        const send_data = {
            status: 403,
            message: "All parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/update-roster-approval", req.body, send_data);
        return;
    }
    if (level_1_approver && level_2_approver) {
        const send_data = {
            status: 403,
            message: "Employee can not be both level approver"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/update-roster-approval", req.body, send_data);
        return;
    }
    if (!level_1_approver && !level_2_approver) {
        const send_data = {
            status: 403,
            message: "Employee has to approver of any one level"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/update-roster-approval", req.body, send_data);
        return;
    }
    const location_update_data = await sequelize.query(`update roster_approval_matrix set employee_id = '${approver_employee_id}', plant = '${plant}', level_1_approver = ${level_1_approver}, level_2_approver = ${level_2_approver}, approval_type = '${approval_type}', division='${division}', updated_by='${employee_id}' where matrix_id = ${matrix_id};`, { type: QueryTypes.UPDATE });
    console.log(location_update_data);
    const send_data = {
        status: 200,
        message: "Data Updated successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/update-roster-approval", req.body, send_data);
}

exports.createRosterApproval = async (req, res) => {
    const { plant, division, employee_id, approver_employee_id, level_1_approver, level_2_approver, approval_type } = req.body;

    if (!(plant && division && employee_id && approver_employee_id && approval_type)) {
        const send_data = {
            status: 403,
            message: "All parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/create-roster-approval", req.body, send_data);
        return;
    }
    if (level_1_approver && level_2_approver) {
        const send_data = {
            status: 403,
            message: "Employee can not be both level approver"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/create-roster-approval", req.body, send_data);
        return;
    }
    if (!level_1_approver && !level_2_approver) {
        const send_data = {
            status: 403,
            message: "Employee has to be the approver of any one level"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/create-roster-approval", req.body, send_data);
        return;
    }
    const location_data = await sequelize.query(`select * from roster_approval_matrix where employee_id = '${approver_employee_id}' and plant = '${plant}' and division = '${division}' and approval_type = '${approval_type}'`, { type: QueryTypes.SELECT });
    console.log(location_data);
    if (location_data.length) {
        const location_update_data = await sequelize.query(`update roster_approval_matrix set active = true, level_1_approver = ${level_1_approver}, level_2_approver = ${level_2_approver}, updated_by='${employee_id}' where matrix_id = ${location_data[0].matrix_id};`, { type: QueryTypes.UPDATE });
        console.log(location_update_data);
        const send_data = {
            status: 200,
            message: "Approval Matrix is updated and set active"
        }
        res.status(200).send(send_data)
        logging.printLogtable("txn id", "thread id", "/create-roster-approval", req.body, send_data);
        return;
    }
    const location_create_data = await sequelize.query(`insert into roster_approval_matrix (employee_id, plant, division, created_by, updated_by, level_1_approver, level_2_approver, approval_type) values ('${approver_employee_id}', '${plant}', '${division}', '${employee_id}', '${employee_id}', ${level_1_approver}, ${level_2_approver}, '${approval_type}');`, { type: QueryTypes.INSERT });
    console.log(location_create_data);
    const send_data = {
        status: 200,
        message: "Data Created successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/create-roster-approval", req.body, send_data);
}

exports.deleteRosterApproval = async (req, res) => {
    const { matrix_id, employee_id } = req.body;

    if (!(matrix_id && employee_id)) {
        const send_data = {
            status: 403,
            message: "All parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/delete-roster-approval", req.body, send_data);
        return;
    }
    const location_update_data = await sequelize.query(`update roster_approval_matrix set active = false, updated_by='${employee_id}' where matrix_id = ${matrix_id};`, { type: QueryTypes.UPDATE });
    console.log(location_update_data);
    const send_data = {
        status: 200,
        message: "Data Deleted successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/delete-roster-approval", req.body, send_data);
}

exports.getShiftMaster = async (req, res) => {
    const ceam_shift_master = await sequelize.query(`Select * from shift_master where active_flag = true`, { type: QueryTypes.SELECT });
    console.log(ceam_shift_master);
    const send_data = {
        status: 200,
        data: ceam_shift_master,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-ceam-shift-master", req.body, send_data);
    return;
}

exports.uploadShiftMaster = async (req, res) => {
    const { shift_character, shift_title, shift_description, shift_min_intime, shift_max_intime, shift_min_outtime, shift_max_outtime, shift_total_hours, shift_type, ot_max_hours, employee_id } = req.body;
    if (!(shift_type == 'ot' || shift_type == 'shift')) {
        const send_data = {
            status: 403,
            message: "invalid shift type"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-ceam-shift-master", req.body, send_data);
        return;
    }
    if (shift_type == 'ot') {
        if (!(shift_character && shift_title && shift_description && ot_max_hours && employee_id)) {
            const send_data = {
                status: 403,
                message: "All parameters are required"
            }
            res.status(403).send(send_data)
            logging.printLogtable("txn id", "thread id", "/upload-ceam-shift-master", req.body, send_data);
            return;
        }
    }
    if (shift_type == 'shift') {
        if (!(shift_character && shift_title && shift_description && shift_min_intime && shift_max_intime && shift_min_outtime && shift_max_outtime && shift_total_hours && employee_id)) {
            const send_data = {
                status: 403,
                message: "All parameters are required"
            }
            res.status(403).send(send_data)
            logging.printLogtable("txn id", "thread id", "/upload-ceam-shift-master", req.body, send_data);
            return;
        }
    }
    const ceam_shift_master = await sequelize.query(`Select * from shift_master where shift_character = '${shift_character}'`, { type: QueryTypes.SELECT });
    console.log(ceam_shift_master);
    if (ceam_shift_master?.length) {
        if (shift_type == 'ot') {
            const shift_update_data = await sequelize.query(`update shift_master set shift_title = '${shift_title}', shift_description = '${shift_description}', shift_type = '${shift_type}', ot_max_hours = '${ot_max_hours}', updated_by = '${employee_id}', active_flag = true where shift_character = '${shift_character}';`, { type: QueryTypes.UPDATE });
            console.log(shift_update_data);
            const send_data = {
                status: 200,
                message: "Data inserted Successfully"
            }
            res.status(200).send(send_data)
            logging.printLogtable("txn id", "thread id", "/upload-ceam-shift-master", req.body, send_data);
            return;
        }
        if (shift_type == 'shift') {
            const shift_update_data = await sequelize.query(`update shift_master set shift_title = '${shift_title}', shift_description = '${shift_description}', shift_min_intime = '${shift_min_intime}', shift_max_intime = '${shift_max_intime}', shift_min_outtime = '${shift_min_outtime}', shift_max_outtime = '${shift_max_outtime}', shift_total_hours = '${shift_total_hours}', shift_type = '${shift_type}', updated_by = '${employee_id}', active_flag = true where shift_character = '${shift_character}';`, { type: QueryTypes.UPDATE });
            console.log(shift_update_data);
            const send_data = {
                status: 200,
                message: "Data inserted Successfully"
            }
            res.status(200).send(send_data)
            logging.printLogtable("txn id", "thread id", "/upload-ceam-shift-master", req.body, send_data);
            return;
        }
    }
    if (shift_type == 'ot') {
        const shift_create_data = await sequelize.query(`replace INTO shift_master (shift_character, shift_title, shift_description, shift_type, ot_max_hours, created_by, updated_by) VALUES ('${shift_character}','${shift_title}','${shift_description}','${shift_type}','${ot_max_hours}','${employee_id}','${employee_id}');`, { type: QueryTypes.INSERT });
        console.log(shift_create_data);
        const send_data = {
            status: 200,
            message: "Data inserted Successfully"
        }
        res.status(200).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-ceam-shift-master", req.body, send_data);
        return;
    }
    if (shift_type == 'shift') {
        const shift_create_data = await sequelize.query(`replace INTO shift_master (shift_character, shift_title, shift_description, shift_min_intime, shift_max_intime, shift_min_outtime, shift_max_outtime, shift_total_hours, shift_type, created_by, updated_by) VALUES ('${shift_character}','${shift_title}','${shift_description}','${shift_min_intime}','${shift_max_intime}','${shift_min_outtime}','${shift_max_outtime}','${shift_total_hours}','${shift_type}','${employee_id}','${employee_id}');`, { type: QueryTypes.INSERT });
        console.log(shift_create_data);
        const send_data = {
            status: 200,
            message: "Data inserted Successfully"
        }
        res.status(200).send(send_data)
        logging.printLogtable("txn id", "thread id", "/upload-ceam-shift-master", req.body, send_data);
        return;
    }

}

exports.deleteShiftMaster = async (req, res) => {
    const { shift_id, employee_id } = req.body;
    if (!(shift_id, employee_id)) {
        const send_data = {
            status: 403,
            message: "All parameters are required"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/delete-ceam-shift-master", req.body, send_data);
        return;
    }
    const shift_update_data = await sequelize.query(`update shift_master set active_flag = false, updated_by = '${employee_id}' where shift_id = '${shift_id}';`, { type: QueryTypes.UPDATE });
    console.log(shift_update_data);
    const send_data = {
        status: 200,
        message: "Data deleted Successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/delete-ceam-shift-master", req.body, send_data);
    return;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

exports.getAttendanceByEmployeeId = async (req, res) => {
    const { employee_id, start_date, end_date } = req.body;
    if (!(employee_id && start_date && end_date)) {
        const send_data = {
            status: 403,
            message: "invalid shift type"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/get-attendance-by-employee-id", req.body, send_data);
        return;
    }
    const ceam_attendance_data = await sequelize.query(`select cad.employee_id, cem.employee_name, cem.vendor_code, cem.vendor_name, cem.base_location, cad.attendance_date, cad.InTime, cad.OutTime, cad.attendance, cad.considered_ot_attendance, cad.actual_ot_attendance, cad.attendance_shift, cad.attendance_ot, cad.employee_working_minutes, cad.shift_max_intime, cad.shift_min_intime, cad.shift_max_outtime, cad.shift_min_outtime, required_time, required_ot_time, employee_ot_time from ceam_attendance_data cad left join ceam_employee_master cem on cad.employee_id = cem.employee_id where cad.employee_id = '${employee_id}' and cad.attendance_date between '${start_date}' and '${end_date}';`, { type: QueryTypes.SELECT });
    console.log(ceam_attendance_data);
    const send_data = {
        status: 200,
        data: ceam_attendance_data,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-attendance-by-employee-id", req.body, send_data);
    return;
}

exports.getAttendanceByVendorId = async (req, res) => {
    const { vendor_code, start_date, end_date } = req.body;
    if (!(vendor_code && start_date && end_date)) {
        const send_data = {
            status: 403,
            message: "invalid shift type"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/get-attendance-by-vendor-id", req.body, send_data);
        return;
    }
    const ceam_attendance_data = await sequelize.query(`select cad.employee_id, cem.employee_name, cem.vendor_code, cem.vendor_name, cem.base_location, cad.attendance_date, cad.InTime, cad.OutTime, cad.attendance, cad.considered_ot_attendance, cad.actual_ot_attendance, cad.attendance_shift, cad.attendance_ot, cad.employee_working_minutes, cad.shift_max_intime, cad.shift_min_intime, cad.shift_max_outtime, cad.shift_min_outtime, required_time, required_ot_time, employee_ot_time from ceam_attendance_data cad left join ceam_employee_master cem on cad.employee_id = cem.employee_id where cem.vendor_code = '${vendor_code}' and cad.attendance_date between '${start_date}' and '${end_date}';`, { type: QueryTypes.SELECT });
    console.log(ceam_attendance_data);
    const send_data = {
        status: 200,
        data: ceam_attendance_data,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-attendance-by-vendor-id", req.body, send_data);
    return;
}

exports.getAttendanceByPlant = async (req, res) => {
    const { plant_name, start_date, end_date } = req.body;
    if (!(plant_name && start_date && end_date)) {
        const send_data = {
            status: 403,
            message: "invalid shift type"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/get-attendance-by-plant", req.body, send_data);
        return;
    }
    const ceam_attendance_data = await sequelize.query(`select cad.employee_id, cem.employee_name, cem.vendor_code, cem.vendor_name, cem.base_location, cad.attendance_date, cad.InTime, cad.OutTime, cad.attendance, cad.considered_ot_attendance, cad.actual_ot_attendance, cad.attendance_shift, cad.attendance_ot, cad.employee_working_minutes, cad.shift_max_intime, cad.shift_min_intime, cad.shift_max_outtime, cad.shift_min_outtime, required_time, required_ot_time, employee_ot_time from ceam_attendance_data cad left join ceam_employee_master cem on cad.employee_id = cem.employee_id where cem.base_location = '${plant_name}' and cad.attendance_date between '${start_date}' and '${end_date}';`, { type: QueryTypes.SELECT });
    console.log(ceam_attendance_data);
    const send_data = {
        status: 200,
        data: ceam_attendance_data,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-attendance-by-plant", req.body, send_data);
    return;
}

exports.getAttendanceVariable = async (req, res) => {
    const { start_date, end_date, employee_id, category, gender, vendor, plant, division, department } = req.body;
    if (!(start_date && end_date)) {
        const send_data = {
            status: 403,
            message: "Start Date AND End Date are must to fetch Attendance"
        }
        res.status(403).send(send_data)
        logging.printLogtable("txn id", "thread id", "/get-attendance-by-variable", req.body, send_data);
        return;
    }
    var find_string = ''
    if (category) {
        find_string = find_string + ` and cem.category = '${category}'`;
    }
    if (gender) {
        find_string = find_string + ` and cem.gender = '${gender}'`;
    }
    if (vendor) {
        find_string = find_string + ` and cem.vendor_code = '${vendor}'`;
    }
    if (plant) {
        find_string = find_string + ` and cem.base_location = '${plant}'`;
    }
    if (division) {
        find_string = find_string + ` and cem.division = '${division}'`;
    }
    if (department) {
        find_string = find_string + ` and cem.department = '${department}'`;
    }
    if (employee_id) {
        find_string = find_string + ` and cad.employee_id = '${employee_id}'`;
    }
    const ceam_attendance_data = await sequelize.query(`select cad.employee_id, cem.employee_name, cem.vendor_code, cem.vendor_name, cem.base_location, cad.attendance_date, cad.InTime, cad.OutTime, cad.attendance, cad.considered_ot_attendance, cad.actual_ot_attendance, cad.attendance_shift, cad.attendance_ot, cad.employee_working_minutes, cad.shift_max_intime, cad.shift_min_intime, cad.shift_max_outtime, cad.shift_min_outtime, required_time, required_ot_time, employee_ot_time from ceam_attendance_data cad left join ceam_employee_master cem on cad.employee_id = cem.employee_id where (cad.attendance_date between '${start_date}' and '${end_date}') ${find_string} ;`, { type: QueryTypes.SELECT });
    console.log(ceam_attendance_data);
    const send_data = {
        status: 200,
        data: ceam_attendance_data,
        message: "Data fetched successfully"
    }
    res.status(200).send(send_data)
    logging.printLogtable("txn id", "thread id", "/get-attendance-by-variable", req.body, send_data);
    return;
}


/* async function rosterOTStatusChange(status, approver_remarks, employee_id, approval_id) {
    const date = new Date();
    var ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
    var offset = ISToffSet * 60 * 1000;
    const dateTime = new Date(date.getTime() + offset).toISOString().slice(0, 19).replace('T', ' ');
    const change_approval_status = await sequelize.query(`UPDATE roster_ot_approval SET status = '${status}', approver_remarks = '${approver_remarks}', approval_date = '${dateTime}' WHERE approval_id = ${approval_id} ;`, { type: QueryTypes.INSERT });
    console.log(change_approval_status);
    const employee_leave_data = await sequelize.query(`select * from roster_ot_approval where approval_id = ${approval_id};`, { type: QueryTypes.SELECT });
    console.log(employee_leave_data);
    if (employee_leave_data.length) {
        const roster_id = employee_leave_data[0].request_id
        if (status == 'rejected') {
            const change_approval_status = await sequelize.query(`UPDATE roster_ot_approval SET status = 'neglect', approver_remarks = 'rejected by previous approver' WHERE request_id = ${roster_id} and approval_id != ${approval_id};`, { type: QueryTypes.INSERT });
            console.log(change_approval_status);
            const leave_status = await sequelize.query(`UPDATE employee_ot_roster set status = '${status}' where ot_id = '${roster_id}'`, { type: QueryTypes.INSERT });
            console.log(leave_status);
            return;
        }
        const approval_data_next = await sequelize.query(`select * from roster_ot_approval where request_id = ${roster_id} and status = 'pending' and request_type = 'ot' limit 1;`, { type: QueryTypes.SELECT });
        console.log(approval_data_next);
        if (approval_data_next.length) {
        }
        else {
            const leave_status = await sequelize.query(`UPDATE employee_ot_roster set status = '${status}' where ot_id = '${roster_id}'`, { type: QueryTypes.INSERT });
            console.log(leave_status);
            return;
        }
    }
    return;
} */