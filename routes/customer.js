var express=require('express');
var router=express.Router();
var session = require("express-session");
const exe = require("../db");
const fileupload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

router.use(express.urlencoded({ extended: true }));
router.use(fileupload());



function login_check(req,res,next){
    if(req.session.p_id){
        next();
    }else{
        res.redirect('/login');
    }
}


router.use(async (req, res, next) => {
    var id=req.session.p_id
    var sql='select * from customer where p_id=?';
    var data =await exe(sql,[id]);
    var user={
        name:data[0].p_name,
        photo:data[0].p_image,
        email:data[0].p_email
    };

    res.locals.hedersData=user;
    next();
});


router.get('',login_check,async (req,res)=>{
    // res.send('Welcome Customer panal');
    var id=req.session.p_id
    var sql='select * from customer where p_id=?';
    var data =await exe(sql,[id]);
    var sql1 = `SELECT COUNT(*) AS total_records FROM prescription WHERE p_id=?`;
    var prescription = await exe(sql1, [id]);
    var sql2=`select count(*) as record from appointment where status='Complete'`;
     var appointment =await exe(sql2,[id]);
     var sql3 = `
    SELECT COUNT(*) AS total_records
    FROM report
    WHERE patient_name=?
`;

var report = await exe(sql3, [id]);
    //  res.send(report);
    res.render('customer/dashboard.ejs',{data:data [0],prescription:prescription[0],appointment:appointment[0],report:report[0]});
    
})

router.get('/profile',login_check,async (req,res)=>{
    var id=req.session.p_id
    var sql='select * from customer where p_id=?';
     var customer =await exe(sql,[id]);
    res.render('customer/profile.ejs',{customer:customer[0]});
});

router.post('/profile_save', async (req, res) => {
    // res.send(req.body);
    var { p_name, p_phone, p_dob, p_email, p_gender, p_bloodGroup, p_address, p_image_old} = req.body;
    var p_image_name = p_image_old;
    if (req.files && req.files.p_image) {
        // Delete old image
        if (p_image_old) {
            var old_image_path = path.join(__dirname, "../public/images/", p_image_old);

            if (fs.existsSync(old_image_path)) {
                fs.unlinkSync(old_image_path);
            }
        }
        // Upload new image
        var p_image = req.files.p_image;
        p_image_name = Date.now() + "_" + p_image.name;

        var upload_path = path.join(__dirname, "../public/images/", p_image_name);
        await p_image.mv(upload_path);
    }
    var sql = "update customer set p_name=?,p_phone=?,p_dob=?,p_email=?,p_gender=?,p_bloodGroup=?,p_image=?,p_address=? where p_id=?";
    await exe(sql, [ p_name, p_phone, p_dob, p_email, p_gender, p_bloodGroup, p_image_name, p_address,req.session.p_id]);
    res.redirect('/customer/profile');
});

router.get('/appointments',login_check,async (req,res)=>{
    var id=req.session.p_id
    var sql='select * from doctor';
    var doctors = await exe(sql);
    var sql2='select a.*, d.* from appointment as a inner join doctor as d on a.app_dr_name=d.did  where a.customer_id=?';
    var data2 = await exe(sql2,[req.session.p_id]);
    // res.send(data2);
    res.render('customer/appointments.ejs',{doctors:doctors, data2:data2});
});
router.post('/book_appointment',login_check,async (req,res)=>{
    var id=req.session.p_id
    // res.send(req.body);
    var {app_dr_name,app_date,app_time,app_reason}=req.body;
    var sql='insert into appointment(app_dr_name,app_date,app_time,app_reason,customer_id,status,payment_status) values(?,?,?,?,?,?,?)';
    var data=await exe(sql,[app_dr_name,app_date,app_time,app_reason,id,'pending','Pedding']);
    res.redirect('/customer/appointments');
});

router.get('/treatment-history',async(req,res)=>{
     var id= req.session.p_id
     var sql=`SELECT d.*,ct.* FROM doctor d INNER JOIN customer_treatment ct ON d.did = ct.did WHERE ct.treatment_p_id=? ORDER BY ct.treatment_id DESC`;
     var data=await exe(sql,[id]);
    //  res.send(data);
    res.render('customer/treatment-history.ejs',{data:data})
})
router.get('/prescriptions',async(req,res)=>{
    var id= req.session.p_id
    var sql=`SELECT d.*,p.* FROM doctor d INNER JOIN prescription p ON d.did = p.dr_id WHERE p.p_id=? ORDER BY p.prescription_id DESC`;
    var data=await exe(sql,[id]);
    // res.send(data);
    res.render('customer/prescriptions.ejs',{data:data})
})

router.get('/prescriptions_view/:id/:did',login_check,async(req,res)=>{
     var did=req.session.did
    var did=req.params.did
    var id=req.params.id
    var sql='select * from prescription p LEFT JOIN prescription_medicine m ON p.prescription_id=m.prescription_id where p.prescription_id=?';
    var data=await exe(sql,[id]);
    var sql1 = 'select * from doctor where did=?';
    var data1=await exe(sql1,[did]);
    var sql2 = 'select * from customer where p_id=?';
     var customer = await exe(sql2, [data[0].p_id]);
    // res.send(data);
    res.render('customer/prescriptions_view.ejs',{data:data,data1:data1,customer:customer[0]});

})
router.get('/reports', login_check, async (req, res) => {
    var id = req.session.p_id;
    var sql = ` SELECT report.*, customer.p_name FROM report LEFT JOIN customer ON customer.p_id = report.patient_name WHERE report.patient_name = ? ORDER BY report.r_id DESC`;
    var data = await exe(sql, [id]);
    var sql1 = `SELECT * FROM customer WHERE p_id = ? `;
    var data1 = await exe(sql1, [id]);
    res.render('customer/reports.ejs', {data: data, data1: data1});
});

router.get('/payments',async(req,res)=>{
     var id=req.session.p_id
    var sql1=`SELECT d.*,a.* FROM doctor d INNER JOIN appointment a ON d.did = a.app_dr_name WHERE a.customer_id=? and a.status='Complete' ORDER BY a.app_id DESC`;
    var data=await exe(sql1,[id]);
    // res.send(data);
    res.render('customer/payments.ejs',{data:data})
})
router.get('/payment_paid/:id',async(req,res)=>{
    var id=req.params.id
    var sql = 'update appointment set payment_status=? where app_id=?';
    var data=await exe(sql,["paid", id]);
    res.redirect('/customer/payments');
})


module.exports=router;