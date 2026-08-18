var express=require('express');
var router=express.Router();
var session = require("express-session");
var exe=require('../db.js');


router.use(express.urlencoded({ extended: true }));

router.use(session({
    secret: "hospital",
    resave: false,
    saveUninitialized: true
}));


router.get('',async(req,res)=>{
   var sql='select * from department';
    var department=await exe(sql);
    var sql1='select * from doctor';
    var doctor=await exe(sql1);
     var sql2='select * from treatment';
    var treatment=await exe(sql2);
     var sql='select * from contact where cid=2';
    var data=await exe(sql);
    var sql3='select * from review where rid=1';
    var data2=await exe(sql3);
    // res.send(department);
    res.render('index.ejs',{department:department,doctor:doctor,treatment:treatment,data:data[0],data2:data2});
})

router.get('/about', async (req,res)=>{
    var sql='select * from whate_drive';
    var data=await exe(sql);
    var sql1='select * from journey';
    var data1=await exe(sql1);
    var sql2='select * from review where rid=1';
    var data2=await exe(sql2);
res.render('about.ejs',{data:data,data1:data1,data2:data2});
})

router.get('/departments',async(req,res)=>{
    var sql='select * from department';
    var department=await exe(sql);
res.render('departments.ejs',{department:department});
})

router.get('/doctors',async(req,res)=>{
    var sql='select * from department';
    var department=await exe(sql);
    var sql1='select * from doctor';
    var doctor=await exe(sql1);
res.render('doctors.ejs',{department:department,doctor:doctor});
})

router.get('/doctors1',async(req,res)=>{
    var doctor=req.query.doctor;
    var dept_name=req.query.dept_name;
     var sql = ` SELECT * FROM doctor WHERE dname LIKE '%${doctor}%' AND department LIKE ${dept_name} `;
     var doctor1=await exe(sql);
     var sql='select * from department';
    var department=await exe(sql);
    // res.send(doctor1);
    res.render('doctors.ejs',{department:department,doctor:doctor1});
})

router.get('/doctor-details/:id',async(req,res)=>{
    var id=req.params.id;
    var sql='select * from doctor where did=?';
    var doctor=await exe(sql,[id]);
res.render('doctor-details.ejs',{doctor:doctor[0]});
})

router.get('/services',(req,res)=>{
res.render('services.ejs');
})

router.get('/blog',(req,res)=>{
res.render('blog.ejs');
})

router.get('/contact', async (req,res)=>{
    var sql='select * from contact where cid=2';
    var data=await exe(sql);
res.render('contact.ejs',{data:data[0]});
})

router.get('/login',(req,res)=>{
res.render('login.ejs');
})
router.post('/login_check',async(req,res)=>{
    // res.send(req.body);
    var{email,password}=req.body;
    var sql='select * from doctor where demail=? and dpass=?';
    var doctor=await exe(sql,[email,password]);
    var sql1='select * from customer where p_email=? and p_password=?';
    var customer=await exe(sql1,[email,password]);
    // res.send(doctor);
    if(doctor[0]){
        req.session.did=doctor[0].did;
        req.session.dname=doctor[0].dname;
        res.redirect('/doctor');
    }else if(customer[0]){
        req.session.p_id=customer[0].p_id;
        req.session.p_name=customer[0].p_name;
        res.redirect('/customer/')
    }else{
        res.redirect('/login');
    }
})

router.get('/forgot-password',(req,res)=>{
res.render('forgot-password.ejs');
})

router.get('/register',(req,res)=>{
res.render('register.ejs');
})
router.post('/register_save',async(req,res)=>{
    // res.send(req.body);
    var{p_name,p_email,p_phone,p_password,p_confirmPassword}=req.body;
    var sql='select * from customer where p_email=?';
    var customer=await exe(sql,[p_email]);
    if(customer[0]){
        res.send('Alredy Exist');
    }else{
        var sql='insert into customer(p_name,p_email,p_phone,p_password)values(?,?,?,?)';
        var data=await exe(sql,[p_name,p_email,p_phone,p_password]);
        res.redirect('/login');
    }
})


router.get('/testimonials',(req,res)=>{
res.render('testimonials.ejs');
})

router.get('/treatment',(req,res)=>{
res.render('treatment.ejs');
})

router.get('/appointment', async (req,res)=>{
    var sql1='select * from department';
    var department=await exe(sql1);
    var sql2='select * from doctor';
    var doctor=await exe(sql2);
res.render('appointment.ejs',{department:department,doctor:doctor});
})

router.post('/appointments_save',async(req,res)=>{
    //  res.send(req.body);
     var{app_patientname,app_email,app_phone,app_departmentid,app_doctorid,app_date,app_time,app_reason}=req.body;
     var sql='insert into appointment_web(app_patientname,app_email,app_phone,app_departmentid,app_doctorid,app_date,app_time,app_reason,status)values(?,?,?,?,?,?,?,?,?)';
     var data=await exe(sql,[app_patientname,app_email,app_phone,app_departmentid,app_doctorid,app_date,app_time,app_reason,'Pending']);
     res.redirect('/appointment');
})


    


module.exports=router;