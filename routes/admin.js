var express = require("express");
var router = express.Router();  
var session = require("express-session");
var image=require('express-fileupload');
var path=require('path');
const fs = require("fs");
var exe=require('../db.js');

router.use(express.urlencoded({ extended: true }));
router.use(image());


router.use(session({
    secret: "hospital",
    resave: false,
    saveUninitialized: true
}));


function login_check(req,res,next){
    if(req.session.email && req.session.password){
        next();
    }else{
        res.redirect('/admin/login');
    }
}

router.post('/login_save',async(req,res)=>{
    var{email,password}=req.body;
    var selete = `select * from login_admin where email=? and password=?`
    var sel =  await exe(selete,[email,password]);

    if(sel[0]){
        req.session.email = email
        req.session.password = password

        res.redirect('/admin')
    }
    else{
        res.redirect('/admin/login')
    }

})

router.get("/login", (req, res) => {
    res.render("admin/login.ejs");
});

router.get('/',login_check, (req, res)=>{
    res.render("admin/dashboard.ejs");
});
//===================================================================================================================================================================
router.get('/departments',async (req, res) => {
    var sql='select * from department';
    var data=await exe(sql);
    res.render("admin/departments.ejs",{data:data});
});

router.post("/department_save",async (req, res) => {
    // res.send(req.body);
    var {name,icon,image,beds,description}=req.body;
    var sql='insert into department(name,icon,image,beds,description)values(?,?,?,?,?)';
    var data=await exe(sql,[name,icon,image,beds,description]);
    // res.send('done');
    res.redirect('/admin/departments');
});

router.get('/department_delete/:id', async (req, res) => {
    var id = req.params.id;
    await exe("DELETE FROM department WHERE did=?",[id]);
    res.redirect("/admin/departments");
});

router.get('/department_edit/:id',async(req,res)=>{
    // res.send('edit')
    var id=req.params.id;
    var sql='select * from department where did=?';
    var data=await exe(sql,[id]);
    res.render("admin/department_edit.ejs",{data:data[0]});
})

router.post('/department_update/:id', async (req, res) => {
    var id = req.params.id;
    var {name,icon,image,beds,description } = req.body;
    await exe(`UPDATE department SET name=?, icon=?, image=?, beds=?, description=? WHERE did=?`,[name, icon, image, beds, description, id]);
    res.redirect("/admin/departments");

});

//===================================================================================================================================================================
router.get('/treatments',async (req, res) => {
    var sql='select * from department';
    var dept=await exe(sql);
    var sql1='select * from treatment';
    var treatment=await exe(sql1);
    res.render("admin/treatments.ejs",{dept:dept,treatment:treatment});
});

router.post('/treatment_save',async(req,res)=>{
    // res.send(req.body);
    // res.send(req.files);
    var {tname,tdepartment,tduration,tprice,tdescription}=req.body;
    var img1=req.files.timage;
    var imgname=Date.now()+img1.name;
    var imgpath=path.join(__dirname,'../','public/images/',imgname);
    img1.mv(imgpath,(err)=>{})
    // res.send(imgpath);
    var sql='insert into treatment(tname,tdepartment,tduration,tprice,tdescription,timage)values(?,?,?,?,?,?)';
    var data=await exe(sql,[tname,tdepartment,tduration,tprice,tdescription,imgname]);
    res.redirect('/admin/treatments');
})

// =================== Treatment Edit ===================
router.get('/treatment_edit/:id', async (req, res) => {
    var id = req.params.id;
    var treatment = await exe("SELECT * FROM treatment WHERE tid=?", [id]);
    var dept = await exe("SELECT * FROM department");
    res.render("admin/treatment_edit.ejs", {treatment: treatment[0],dept: dept});
});

// =================== Treatment Update ===================
router.post('/treatment_update/:id/:img', async (req, res) => {
    var id = req.params.id;
    var oldimg = req.params.img;
    var { tname, tdepartment, tduration, tprice, tdescription} = req.body;
    var iname = oldimg;
    if (req.files && req.files.timage) {
        var img = req.files.timage;
        iname = Date.now() + img.name;
        var uploadPath = path.join(__dirname, "../", "public/images/", iname);
        await img.mv(uploadPath);
        var deletePath = path.join(__dirname, "../", "public/images/", oldimg);
        if (fs.existsSync(deletePath)) {
            fs.unlinkSync(deletePath);
        }
    }
    var sql = `UPDATE treatment SET tname=?, tdepartment=?, tduration=?, tprice=?, tdescription=?, timage=? WHERE tid=?`;
    await exe(sql, [tname,tdepartment,tduration,tprice,tdescription,iname,id]);
    res.redirect("/admin/treatments");
});

// =================== Treatment Delete ===================
router.get('/treatment_delete/:id', async (req, res) => {
    var id = req.params.id;
    var treatment = await exe("SELECT * FROM treatment WHERE tid=?", [id]);
    if (treatment.length > 0) {
        var img = treatment[0].timage;
        var deletePath = path.join(__dirname, "../", "public/images/", img);
        if (fs.existsSync(deletePath)) {
            fs.unlinkSync(deletePath);
        }
        await exe("DELETE FROM treatment WHERE tid=?", [id]);
    }
    res.redirect("/admin/treatments");
});

//===================================================================================================================================================================
router.get('/patients',async (req, res) => {
    var sql='select * from customer';
    var data=await exe(sql);
    res.render("admin/patients.ejs",{data:data});
});

router.post('/patient_save',async(req,res)=>{
    // res.send(req.body);
    // res.send(req.files);
    console.log("BODY =", req.body);
console.log("FILES =", req.files);
    var {p_name,p_email,p_phone,p_dob,p_age,p_gender,p_bloodGroup,p_address} = req.body;
    var img1=req.files.p_image;
    var imgname=Date.now()+img1.name;
    var imgpath=path.join(__dirname,'../','public/images/',imgname);
    img1.mv(imgpath,(err)=>{})
    // res.send(imgpath);
    var sql='insert into customer(p_name,p_email,p_phone,p_dob,p_age,p_gender,p_bloodGroup,p_address,p_image)values(?,?,?,?,?,?,?,?,?)';
    var data= await exe(sql,[p_name,p_email,p_phone,p_dob,p_age,p_gender,p_bloodGroup,p_address,imgname]);
    res.redirect('/admin/patients')
})

router.get('/patient_delete/:id', async (req, res) => {
    var id = req.params.id;
    var customer = await exe("SELECT * FROM customer WHERE p_id=?", [id]);
    if (customer.length > 0) {
        var img = customer[0].p_image;
        var deletePath = path.join(__dirname, "../", "public/images/", img);
        if (fs.existsSync(deletePath)) {
            fs.unlinkSync(deletePath);
        }
        await exe("DELETE FROM customer WHERE p_id=?", [id]);
    }
    res.redirect("/admin/patients");
});

router.get('/patient_edit/:id', async (req, res) => {
    var id = req.params.id;
    var data = await exe("SELECT * FROM customer WHERE p_id=?", [id]);
    res.render("admin/patient_edit.ejs", {data: data});
});

router.post('/patient_update/:id/:img', async (req, res) => {
    var id = req.params.id;
    var oldimg = req.params.img;
    var {p_name,p_email,p_phone,p_dob,p_age,p_gender,p_bloodGroup,p_address} = req.body;
    var iname = oldimg;

    if (req.files && req.files.p_image) {
        var img = req.files.p_image;
        iname = Date.now() + img.name;
        var uploadPath = path.join(__dirname, '../','public/images/', iname);
        await img.mv(uploadPath);
        var deletePath = path.join(__dirname, '../','public/images/', oldimg);
        if (fs.existsSync(deletePath)) {
            fs.unlinkSync(deletePath);
        }
    }
    var sql = `UPDATE customer SET p_name=?,p_email=?,p_phone=?,p_dob=?,p_age=?,p_gender=?,p_bloodGroup=?,p_address=?,p_image=? WHERE p_id=?`;
    await exe(sql, [p_name,p_email,p_phone,p_dob,p_age,p_gender,p_bloodGroup,p_address,iname,id ]);
    res.redirect("/admin/patients");
});

//===================================================================================================================================================================
router.get('/doctors',async (req, res) => {
    var sql='select * from department';
    var data=await exe(sql);
    var sql2='select * from doctor';
    var doctor=await exe(sql2);
    res.render("admin/doctors.ejs",{data:data,doctor:doctor});
});

router.post('/doctor_save',async(req,res)=>{
    // res.send(req.body);
    // res.send(req.files);
    var {dname,dspecialty,department,dexperience,dfees,drating,demail,dphone,dgender}=req.body;
    var img1=req.files.dimage;
    var imgname=Date.now()+img1.name;
    var imgpath=path.join(__dirname,'../','public/images/',imgname);
    img1.mv(imgpath,(err)=>{})
    // res.send(imgpath);
    var sql='insert into doctor(dname,dspecialty,department,dexperience,dfees,drating,demail,dphone,dgender,dimage)values(?,?,?,?,?,?,?,?,?,?)';
    var data=await exe(sql,[dname,dspecialty,department,dexperience,dfees,drating,demail,dphone,dgender,imgname]);
    res.redirect('/admin/doctors');
    // res.send('Done');
})

router.get('/doctor_edit/:id', async (req, res) => {
    var id = req.params.id;
    var doctor = await exe("SELECT * FROM doctor WHERE did=?", [id]);
    var department = await exe("SELECT * FROM department");
    res.render("admin/doctor_edit.ejs", { doctor: doctor[0],department: department });
});

router.post('/doctor_update/:id/:img', async (req, res) => {
    var id = req.params.id;
    var oldimg = req.params.img;
    var {dname,dspecialty,department,dexperience,dfees,drating,demail,dphone,dgender} = req.body;
    var iname = oldimg;

    if (req.files && req.files.dimage) {
        var img = req.files.dimage;
        iname = Date.now() + img.name;
        var uploadPath = path.join(__dirname, '../','public/images/', iname);
        await img.mv(uploadPath);
        var deletePath = path.join(__dirname, '../','public/images/', oldimg);
        if (fs.existsSync(deletePath)) {
            fs.unlinkSync(deletePath);
        }
    }
    var sql = `UPDATE doctor SET dname=?,dspecialty=?,department=?,dexperience=?,dfees=?,drating=?,demail=?,dphone=?,dgender=?,dimage=? WHERE did=?`;
    await exe(sql, [dname,dspecialty,department,dexperience,dfees,drating,demail,dphone,dgender,iname,id ]);
    res.redirect("/admin/doctors");
});

router.get("/doctor_delete/:id", async (req, res) => {
    var id = req.params.id;
    var doctor = await exe("SELECT * FROM doctor WHERE did=?", [id]);
    if (doctor.length > 0) {
        var img = doctor[0].dimage;
        var deletePath = path.join(__dirname, "../", "public/images/", img);
        if (fs.existsSync(deletePath)) {
            fs.unlinkSync(deletePath);
        }
        await exe("DELETE FROM doctor WHERE did=?", [id]);
    }
    res.redirect("/admin/doctors");
});
//===================================================================================================================================================================

router.get('/contacts', async (req, res) => {
    var sql = "SELECT * FROM contact WHERE cid = 2";
    var data = await exe(sql);
    res.render("admin/contacts.ejs", { data: data[0] });
});


router.post("/contacts_save",async (req, res) => {
    // res.send(req.body);
    var {email,phone,address,working_hours,map}=req.body;
    // res.send('done');
    var sql = `UPDATE contact SET cemail=?, cphone=?, caddress=?, cworking_hours=?, cmap=? WHERE cid=2`;
await exe(sql, [email, phone, address, working_hours, map]);
    res.redirect('/admin/contacts');
});

router.get('/about', async (req, res) => {
    var sql = "SELECT * FROM whate_drive";
    var data = await exe(sql);
     var sql1 = "SELECT * FROM journey";
    var data1 = await exe(sql1);
     var sql2 = "SELECT * FROM review WHERE rid = 1";
    var data2 = await exe(sql2);
    res.render("admin/about.ejs", { data: data, data1: data1, data2: data2 });
});

router.post("/about_save", async (req, res) => {
    // res.send(req.body);
    var {wname,wicon,wdescription}=req.body;
    var sql = `insert into whate_drive(wname,wicon,wdescription)values(?,?,?)`;
    await exe(sql, [wname,wicon,wdescription]);
    res.redirect('/admin/about');
})

router.get('/about_edit/:id',async(req,res)=>{
    // res.send('edit')
    var id=req.params.id;
    var sql='select * from whate_drive where wid=?';
    var data=await exe(sql,[id]);
    res.render("admin/whate_drive.ejs",{data:data[0]});
})
router.post("/about_update/:id", async (req, res) => {
    var id = req.params.id;
    var {wname,wicon,wdescription} = req.body;
    var sql = `UPDATE whate_drive SET wname=?, wicon=?, wdescription=? WHERE wid=?`;
    await exe(sql, [wname,wicon,wdescription,id]);
    res.redirect("/admin/about");
});

router.get("/about_delete/:id", async (req, res) => {
    var id = req.params.id;
    await exe("DELETE FROM whate_drive WHERE wid=?", [id]);
    res.redirect("/admin/about");
});


router.post('/journey_save', async (req, res) => {
    // res.send(req.body);
    var { jname, jyear, jdescription } = req.body;
    var sql = `INSERT INTO journey (jname, jyear, jdescription) VALUES (?, ?, ?)`;
    await exe(sql, [jname, jyear, jdescription]);
    res.redirect("/admin/about");
});

router.get('/journey_edit/:id', async (req, res) => {
    var id = req.params.id;
    var sql = 'SELECT * FROM journey WHERE jid=?';
    var data = await exe(sql, [id]);
    res.render("admin/journey_edit.ejs", { data: data[0] });
});

router.post('/journey_update/:id', async (req, res) => {
    var id = req.params.id;
    var { jname, jyear, jdescription } = req.body;
    var sql = `UPDATE journey SET jname=?, jyear=?, jdescription=? WHERE jid=?`;
    await exe(sql, [jname, jyear, jdescription, id]);
    res.redirect("/admin/about");
});

router.get("/journey_delete/:id", async (req, res) => {
    var id = req.params.id;
    await exe("DELETE FROM journey WHERE jid=?", [id]);
    res.redirect("/admin/about");
});

router.post('/review_save',  (req, res) => {
    // res.send(req.body);
    var{ edoctor,hpatient,hbeds,yexcellence}=req.body;
    var sql='update review set edoctor=?,hpatient=?,hbeds=?,yexcellence=? where rid=1';
    exe(sql,[edoctor,hpatient,hbeds,yexcellence]);
    res.redirect('/admin/about');
})

router.get("/appointments", async (req, res) => {

    var sql = `
        SELECT 
            a.*,
            c.*,
            d.*,
            dep.*
        FROM appointment a
        INNER JOIN customer c 
            ON a.customer_id = c.p_id
        INNER JOIN doctor d 
            ON a.app_dr_name = d.did
        INNER JOIN department dep 
            ON d.department = dep.did
        ORDER BY a.app_id DESC
    `;

    var data = await exe(sql);

    res.render("admin/appointments.ejs", {
        data: data
    });
});

router.get('/appointment_view/:id', login_check, async(req,res)=>{

    var id = req.params.id;

    // 1. Appointment + Patient + Doctor + Department
    var sql = `
        SELECT 
            a.*,
            c.*,
            d.*,
            dep.*
        FROM appointment a
        INNER JOIN customer c
            ON a.customer_id = c.p_id
        INNER JOIN doctor d
            ON a.app_dr_name = d.did
        LEFT JOIN department dep
            ON d.department = dep.did
        WHERE a.app_id = ?
    `;

    var appointment = await exe(sql,[id]);

    console.log("APPOINTMENT =", appointment);

    if(appointment.length == 0){
        return res.send("Appointment not found");
    }

    var p_id = appointment[0].customer_id;
    var did = appointment[0].app_dr_name;

    console.log("ID =", id);
    console.log("P_ID =", p_id);
    console.log("DID =", did);

    // 2. Prescription
    var sql1 = `
        SELECT 
            p.*,
            m.*
        FROM prescription p
        LEFT JOIN prescription_medicine m
            ON p.prescription_id = m.prescription_id
        WHERE p.p_id = ?
        ORDER BY p.prescription_id DESC
    `;

    var data = await exe(sql1,[p_id]);

    // 3. Doctor
    var sql2 = `
        SELECT 
            d.*,
            dep.*
        FROM doctor d
        LEFT JOIN department dep
            ON d.department = dep.did
        WHERE d.did = ?
    `;

    var data1 = await exe(sql2,[did]);

    // 4. Customer
    var sql3 = `
        SELECT *
        FROM customer
        WHERE p_id = ?
    `;

    var customer = await exe(sql3,[p_id]);

    console.log("PRESCRIPTION =",data);
    console.log("DOCTOR =",data1);
    console.log("CUSTOMER =",customer);

    if(data1.length == 0){
        return res.send("Doctor not found");
    }

    if(customer.length == 0){
        return res.send("Patient not found");
    }

    if(data.length == 0){
        return res.send("Prescription not found for this patient");
    }

    res.render('admin/appointment_view.ejs',{
        data:data,
        data1:data1,
        customer:customer[0],
        appointment:appointment[0]
    });

});





module.exports = router;