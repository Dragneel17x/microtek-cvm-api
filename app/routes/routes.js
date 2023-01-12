module.exports = app => {
    //Middleware Function
    const commonAuth = require("../middleware/auth.common");

    // Controller Functions
    const product_model = require("../controllers/controller.product.model");
    const form_data = require("../controllers/controller.form.data")

    // Router Define
    
    var cvm = require("express").Router();
    //var nextSIM = require("express").Router();
    var multer = require('multer');
    var storage = multer.diskStorage({
        destination: (req, file, callBack) => {
            callBack(null, 'uploads')     // './public/images/' directory name where save the file
        },
        filename: (req, file, callBack) => {
            callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        }
    })

     
    var upload = multer({
        storage: storage
    });
  
    const path = require('path');

    /* sim.get('/get-product', commonAuth, product_model.getProduct);
    sim.post('/get-model', commonAuth, product_model.getModel);
     */

//Get

    cvm.get('/get-country-codes',form_data.getCountryCodes)
    cvm.get('/get-tz-zone', form_data.gettransportationZone)
    cvm.get('/get-company-code',form_data.getCompanyCode)
    cvm.get('/get-recon-acc', form_data.getReconAcc)
    cvm.get('/get-pay-term', form_data.getPayTerm)
    cvm.get('/get-sales-org',form_data.getSalesOrg)
    cvm.get('/get-dist-channel', form_data.getDistChannel)
    cvm.get('/get-division', form_data.getDivision)
    cvm.get('/get-sales-office-district', form_data.getSalesOfficeDistrict)
    cvm.get('/get-customer-acc-grp', form_data.getCustomerAccountGroup)
    cvm.get('/get-customer-grp', form_data.getCustomerGroup)
    //cvm.get('/get-sales-office-district', form_data.getSalesDistrict)
    cvm.get('/get-sales-district', form_data.getSalesDistrict)
    cvm.get('/get-sbu-type', form_data.getSbuType)
    cvm.get('/get-pincode-mapping', form_data.getPincodeMapping)
    cvm.post('/get-pincode-data', form_data.getPincodeData)

// Post 

    cvm.post('/get-state-list', form_data.getStateList)
    cvm.post('/approve-form', form_data.approveForm)
    cvm.post('/get-approval-forms', form_data.customerFormApplrovals)
    cvm.post('/post-form-data',upload.fields([{name:"blank_cheque",maxCount:1},{name:"GST_Image",maxCount:1},{name:"PAN_Image",maxCount:1},{name:"declaration",maxCount:1},{name:"DAPF",maxCount:1}]), form_data.postFormData)
    


    
   // app.use('v1/api/sim/next-sim', nextSIM)
    app.use('/v1/api/cvm', cvm);
};
