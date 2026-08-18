var express=require('express');
var router=express.Router();
const exe = require("../db");
var session = require("express-session");
const fileupload = require("express-fileupload");
const path = require("path");
const fs = require("fs");


router.use(express.urlencoded({ extended: true }));
router.use(fileupload());
router.use(express.json());

router.use(async (req, res, next) => {
    var id=req.session.did
    var sql='select * from doctor where did=?';
    var data =await exe(sql,[id]);
    console.log("SESSION DID =", id);
    console.log("DOCTOR DATA =", data);
    var user={
        name:data[0].dname,
        photo:data[0].dimage,
        department:data[0].department
    };

    res.locals.hedersData=user;
    next();
});


function login_check(req,res,next){
    if(req.session.did){
        next();
    }else{
        res.redirect('/login');
    }
}

router.get('',login_check,async(req,res)=>{
     var id=req.session.did
     var sql='select * from doctor where did=?';
     var data =await exe(sql,[id]);
     var sql2='select count(*) as record from appointment where app_dr_name=?';
     var appointment =await exe(sql2,[id]);
    //  res.send(appointment);
    res.render('doctor/dashboard.ejs',{data:data [0],appointment:appointment[0]})
})


router.get('/profile/',login_check,async(req,res)=>{
     var id=req.session.did
    // var id = 8
     var sql='select * from doctor where did=?';
     var doctor =await exe(sql,[id]);
     var sql1='select * from department';
    var department=await exe(sql1);
    res.render('doctor/profile.ejs',{doctor:doctor[0],department:department});
})


router.post('/profile_update/:id', async (req, res) => {
    var id = req.params.id;
    var { name, phone, specialty, gender, address, discription, timetableday, timetable, language} = req.body;
    // Old Image
    var doctor = await exe("select * from doctor where did=?", [id]);
    var image = doctor[0].dimage;
    // New Image Upload
    if (req.files && req.files.image) {
        var img = req.files.image;
        // Delete old image
        if (image && fs.existsSync(path.join("public/images/", image))) {
            fs.unlinkSync(path.join("public/images/", image));
        }
        image = Date.now() + "_" + img.name;
        await img.mv(path.join("public/images/", image));
    }
    var sql = `update doctor set dname=?, dphone=?, dspecialty=?, dgender=?, daddress=?, ddisc=?, dtimetableday=?, dtimetable=?, dlanguage=?, dimage=? where did=?`;
    await exe(sql, [name,phone,specialty,gender,address,discription,timetableday,timetable,language,image,id]);
    res.redirect('/doctor/profile');
});

router.get('/appointments',async(req,res)=>{
    var id=req.session.did
    var sql2='select a.*, c.* from appointment as a inner join customer as c on a.customer_id=c.p_id where a.app_dr_name=? and status="Pending"';
    var data3 = await exe(sql2,[req.session.did]);
    var sql3='select a.*, c.* from appointment as a inner join customer as c on a.customer_id=c.p_id where a.app_dr_name=? and status="Confirm"';
    var data4 = await exe(sql3,[req.session.did]);
    var sql4='select a.*, c.* from appointment as a inner join customer as c on a.customer_id=c.p_id where a.app_dr_name=? and status="Complete"';
    var data5 = await exe(sql4,[req.session.did]);
    var sql5='select a.*, c.* from appointment as a inner join customer as c on a.customer_id=c.p_id where a.app_dr_name=? and status="Reject"';
    var data6 = await exe(sql5,[req.session.did]);
    res.render('doctor/appointments.ejs',{data3:data3, data4:data4, data5:data5, data6:data6});
})

router.get('/app_Confirm/:id',async(req,res)=>{
    var id=req.params.id
    var sql = 'update appointment set status=? where app_id=?';
    var data=await exe(sql,["Confirm", id]);
    res.redirect('/doctor/appointments');
})

router.get('/app_Reject/:id',async(req,res)=>{
    var id=req.params.id
    var sql = 'update appointment set status=? where app_id=?';
    var data=await exe(sql,["Reject", id]);
    res.redirect('/doctor/appointments');
})

router.get('/app_complete/:id',async(req,res)=>{
    var id=req.params.id
    var sql = 'update appointment set status=? where app_id=?';
    var data=await exe(sql,["Complete", id]);
    res.redirect('/doctor/appointments');
})

router.get('/appointments_web', async (req, res) => {
    var did = req.session.did;
    var sql2 = ` SELECT * FROM appointment_web WHERE status = 'Pending' AND app_doctorid = ? `;
    var data3 = await exe(sql2, [did]);
    var sql3 = `  SELECT * FROM appointment_web  WHERE status = 'Confirm' AND app_doctorid = ? `;
    var data4 = await exe(sql3, [did]);
    var sql4 = `  SELECT * FROM appointment_web WHERE status = 'Complete' AND app_doctorid = ?`;
    var data5 = await exe(sql4, [did]);
    var sql5 = `  SELECT * FROM appointment_web WHERE status = 'Reject' AND app_doctorid = ? `;
    var data6 = await exe(sql5, [did]);
    res.render('doctor/appointments_web.ejs', { data3: data3,data4: data4,data5: data5,data6: data6 });
});

router.get('/app_web_Confirm/:id', async (req, res) => {
    var id = req.params.id;
    var sql = ` UPDATE appointment_web  SET status = ?  WHERE app_web_id = ? `;
    await exe(sql, ["Confirm", id]);
    res.redirect('/doctor/appointments_web');
});

router.get('/app_web_Reject/:id', async (req, res) => {
    var id = req.params.id;
    var sql = ` UPDATE appointment_web SET status = ? WHERE app_web_id = ? `;
    await exe(sql, ["Reject", id]);
    res.redirect('/doctor/appointments_web');
});


router.get('/app_web_complete/:id', async (req, res) => {
    var id = req.params.id;
    var sql = ` UPDATE appointment_web SET status = ? WHERE app_web_id = ? `;
    await exe(sql, ["Complete", id]);
    res.redirect('/doctor/appointments_web');
});

router.get('/patients', login_check, async (req, res) => { 
    var sql = 'SELECT * FROM customer'; 
    var data = await exe(sql); 
    res.render('doctor/patients.ejs', { data: data }); });

router.get('/patients_detail/:id', async(req,res)=>{
    var id=req.params.id
    var sql = 'select * from customer where p_id=?';
    var data=await exe(sql,[req.params.id]);
    var sql1 = 'select * from appointment where customer_id=? order by app_id desc';
    var data1=await exe(sql1,[req.params.id]);
    res.render('doctor/patients_detail.ejs',{data:data, data1:data1});
})

router.get('/treatment',login_check,async(req,res)=>{
    var id=req.session.did
    var sql1 = ` SELECT c.*, ct.* FROM customer AS c INNER JOIN customer_treatment AS ct ON c.p_id = ct.treatment_p_id WHERE ct.did = ? ORDER BY ct.treatment_id DESC LIMIT 5`;
    var data1=await exe(sql1,[id]);
    // res.send(data1)
    var sql = 'select * from customer';
    var data=await exe(sql);
    res.render('doctor/treatment.ejs',{data:data,data1:data1});
})
router.post('/treatment_save',login_check,async(req,res)=>{
    var id=req.session.did
    // res.send(req.body)
    var {treatment_p_id,disease, treatment_diagnosis, treatment_notes, tmedicines, treatment_nextvisit} = req.body;
    var sql = 'insert into customer_treatment(treatment_p_id,disease, treatment_diagnosis, treatment_notes, tmedicines, treatment_nextvisit,did) values(?,?,?,?,?,?,?)';
   var data=await exe(sql,[treatment_p_id,disease, treatment_diagnosis, treatment_notes, tmedicines, treatment_nextvisit,id]);
    res.redirect('/doctor/treatment');
})

router.get('/prescriptions',login_check,async(req,res)=>{
    var id=req.session.did
     var sql = 'select * from customer';
    var data=await exe(sql);
    var sql1 = 'select * from prescription where dr_id=?';
    var prescription=await exe(sql1,[id]);
    res.render('doctor/prescription.ejs',{data:data,prescription:prescription});
})
router.post('/prescriptions_save',login_check,async(req,res)=>{
    var id=req.session.did
    // res.send(req.body);
    var{p_id,pre_date,pre_diagnosis,medicine,dosage,frequency,duration,advice}=req.body;
    var sql='insert into prescription(p_id,dr_id,pre_date,pre_diagnosis,advice)values(?,?,?,?,?)';
    var data=await exe(sql,[p_id,id,pre_date,pre_diagnosis,advice]);
    var insertid1=data.insertId;
    // res.send(insertid1);
    for(var i=0;i<medicine.length;i++){
        var sql2='insert into prescription_medicine(prescription_id,medicine,dosage,frequency,duration)values(?,?,?,?,?)';
        var data2=await exe(sql2,[insertid1,medicine[i],dosage[i],frequency[i],duration[i]]);
    }
    //  res.send('done');
    res.redirect('/doctor/prescriptions');
})
router.get('/prescription_view/:id/:p_id',login_check,async(req,res)=>{
     var did=req.session.did
    var p_id=req.params.p_id
    var id=req.params.id
    var sql='select * from prescription p LEFT JOIN prescription_medicine m ON p.prescription_id=m.prescription_id where p.prescription_id=?';
    var data=await exe(sql,[id]);
    var sql1 = 'select * from doctor where did=?';
    var data1=await exe(sql1,[did]);
    var sql2 = 'select * from customer where p_id=?';
    var customer=await exe(sql2,[p_id]);
    // res.send(data);
    res.render('doctor/prescription_view.ejs',{data:data,data1:data1,customer:customer[0]});

})

router.get('/reports', login_check, async (req, res) => {
    var sql = ` SELECT  report.*, customer.p_name FROM report LEFT JOIN customer  ON customer.p_id = report.patient_name ORDER BY report.r_id DESC`;
    var data = await exe(sql);
    var sql1 = "SELECT * FROM customer ORDER BY p_id DESC";
    var data1 = await exe(sql1);
    res.render('doctor/reports.ejs', {data: data,data1: data1 });
});


router.post('/report_save', async (req, res) => {
    var { patient_name, title, reportType,date } = req.body;
        if (!req.files || !req.files.photo) {
            return res.send("Please select report file");
        }
        var img1 = req.files.photo;
        var imgname = Date.now() + "_" + img1.name;
        var imgpath = path.join(__dirname, '../public/images/',imgname );
        await img1.mv(imgpath);
        var sql = ` INSERT INTO report (patient_name, title, reportType,date, photo) VALUES (?, ?,?, ?, ?) `;
        await exe(sql, [ patient_name, title, reportType,date, imgname ]);
        res.redirect('/doctor/reports');
    
});



module.exports=router;