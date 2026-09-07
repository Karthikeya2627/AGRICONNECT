const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req,res)=>res.sendFile(path.join(__dirname,"..","index.html")));

let nextProduceId=9, nextOrderId=1001;
let produceList=[
 {id:1,crop:"Tomatoes",category:"Vegetables",quantity:120,price:38,quality:"A",availableDate:"2026-09-07",location:"Medchal, Telangana",farmer:"Ramesh Kumar",farmerId:"FARM001"},
 {id:2,crop:"Potatoes",category:"Vegetables",quantity:200,price:30,quality:"A",availableDate:"2026-09-07",location:"Shamirpet, Telangana",farmer:"Suresh Reddy",farmerId:"FARM002"},
 {id:3,crop:"Onions",category:"Vegetables",quantity:160,price:32,quality:"A",availableDate:"2026-09-07",location:"Vikarabad, Telangana",farmer:"Anil Kumar",farmerId:"FARM003"},
 {id:4,crop:"Carrots",category:"Vegetables",quantity:90,price:42,quality:"A",availableDate:"2026-09-07",location:"Rangareddy, Telangana",farmer:"Lakshmi Devi",farmerId:"FARM004"},
 {id:5,crop:"Bananas",category:"Fruits",quantity:100,price:48,quality:"A",availableDate:"2026-09-07",location:"Medak, Telangana",farmer:"Ravi",farmerId:"FARM005"},
 {id:6,crop:"Mangoes",category:"Fruits",quantity:80,price:75,quality:"A",availableDate:"2026-09-07",location:"Nizamabad, Telangana",farmer:"Srinivas",farmerId:"FARM006"},
 {id:7,crop:"Spinach",category:"Leafy Greens",quantity:60,price:25,quality:"A",availableDate:"2026-09-07",location:"Sangareddy, Telangana",farmer:"Geetha",farmerId:"FARM007"},
 {id:8,crop:"Cabbage",category:"Vegetables",quantity:110,price:28,quality:"A",availableDate:"2026-09-07",location:"Warangal, Telangana",farmer:"Prakash",farmerId:"FARM008"}
];
let orders=[];

const users = [
 {id:"FARM001", role:"farmer", name:"Ramesh Kumar", location:"Medchal, Telangana"},
 {id:"FARM002", role:"farmer", name:"Suresh Reddy", location:"Shamirpet, Telangana"},
 {id:"FARM003", role:"farmer", name:"Anil Kumar", location:"Vikarabad, Telangana"},
 {id:"FARM004", role:"farmer", name:"Lakshmi Devi", location:"Rangareddy, Telangana"},
 {id:"FARM005", role:"farmer", name:"Ravi", location:"Medak, Telangana"},
 {id:"FARM006", role:"farmer", name:"Srinivas", location:"Nizamabad, Telangana"},
 {id:"FARM007", role:"farmer", name:"Geetha", location:"Sangareddy, Telangana"},
 {id:"FARM008", role:"farmer", name:"Prakash", location:"Warangal, Telangana"},
 {id:"CUST001", role:"consumer", name:"Karthik", location:"Hyderabad"},
 {id:"CUST002", role:"consumer", name:"Priya", location:"Hyderabad"},
 {id:"CUST003", role:"consumer", name:"Rahul", location:"Secunderabad"},
 {id:"CUST004", role:"consumer", name:"Sneha", location:"Madhapur, Hyderabad"},
 {id:"CUST005", role:"consumer", name:"Arjun", location:"Kukatpally, Hyderabad"},
 {id:"ADMIN001", role:"admin", name:"Administrator", location:"AgriConnect HQ"}
];
app.get("/api/users",(req,res)=>res.json(users.map(u=>({id:u.id,role:u.role,name:u.name,location:u.location}))));


app.get("/api/produce",(req,res)=>res.json(produceList));
app.post("/api/produce",(req,res)=>{
 const {crop,category,quantity,price,quality,availableDate,location,farmer,farmerId}=req.body;
 const q=Number(quantity),p=Number(price);
 if(!crop||!category||!Number.isFinite(q)||q<=0||!Number.isFinite(p)||p<=0||!quality||!availableDate) return res.status(400).json({message:"Please fill all required fields correctly."});
 const item={id:nextProduceId++,crop:String(crop).trim(),category:String(category),quantity:q,price:p,quality:String(quality).toUpperCase(),availableDate,location:location||"Direct Farm",farmer:farmer||"Local Farmer",farmerId:farmerId||"FARM001"};
 produceList.push(item);res.status(201).json({message:"Produce added successfully!",data:item});
});
app.patch("/api/produce/:id",(req,res)=>{
 const p=produceList.find(x=>x.id===Number(req.params.id)); if(!p)return res.status(404).json({message:"Produce not found"});
 if(req.body.quantity!==undefined)p.quantity=Math.max(0,Number(req.body.quantity));
 if(req.body.price!==undefined)p.price=Number(req.body.price);
 if(req.body.quality!==undefined)p.quality=String(req.body.quality).toUpperCase();
 res.json({message:"Updated",data:p});
});
app.delete("/api/produce/:id",(req,res)=>{const i=produceList.findIndex(x=>x.id===Number(req.params.id));if(i<0)return res.status(404).json({message:"Not found"});res.json({message:"Removed",data:produceList.splice(i,1)[0]});});

app.get("/api/orders",(req,res)=>res.json(orders));
app.post("/api/orders",(req,res)=>{
 const {customer,customerId,phone,items,total,address,location}=req.body;
 if(!customer||!phone||!address||!Array.isArray(items)||!items.length)return res.status(400).json({message:"Name, phone, address and items are required."});
 const customerUser=users.find(u=>u.id===customerId && u.role==="consumer");
 if(!customerUser && customerId) return res.status(400).json({message:"Invalid customer account."});
 const normalized=[];
 for(const item of items){
   const pid=Number(item.serverId||item.productId);
   const p=produceList.find(x=>x.id===pid);
   if(!p) return res.status(400).json({message:`${item.name||item.crop||"Product"} is no longer available.`});
   const qty=Number(item.qty||item.quantity); if(!Number.isFinite(qty)||qty<=0||p.quantity<qty)return res.status(400).json({message:`Only ${p.quantity} kg of ${p.crop} is available.`});
   normalized.push({productId:p.id,name:p.crop,crop:p.crop,qty,quantity:qty,price:p.price,farmer:p.farmer,farmerId:p.farmerId,location:p.location});
 }
 normalized.forEach(i=>{const p=produceList.find(x=>x.id===i.productId);p.quantity-=i.qty;});
 const order={id:nextOrderId++,customer,customerId:customerId||"CUSTOMER001",phone,address,location:location||"Hyderabad",items:normalized,total:Number(total)||normalized.reduce((s,i)=>s+i.qty*i.price,0)+20,status:"Order Placed",timeline:[{status:"Order Placed",time:new Date().toISOString()}],createdAt:new Date().toISOString()};
 orders.push(order);res.status(201).json({message:"Order placed successfully!",data:order});
});
app.patch("/api/orders/:id/status",(req,res)=>{
 const o=orders.find(x=>x.id===Number(req.params.id));if(!o)return res.status(404).json({message:"Order not found"});
 const allowed=["Order Placed","Farmer Confirmed","Packed","Picked Up","Out for Delivery","Delivered"];
 if(!allowed.includes(req.body.status))return res.status(400).json({message:"Invalid status"});
 o.status=req.body.status;o.timeline.push({status:o.status,time:new Date().toISOString()});res.json({message:"Status updated",data:o});
});
app.get("/api/stats",(req,res)=>{
 const farmerSales={},farmerOrders={}; orders.forEach(o=>o.items.forEach(i=>{farmerSales[i.farmerId]=(farmerSales[i.farmerId]||0)+i.price*i.qty;farmerOrders[i.farmerId]=(farmerOrders[i.farmerId]||0)+1;}));
 res.json({totalOrders:orders.length,totalSales:orders.reduce((s,o)=>s+o.total,0),farmerSales,farmerOrders,deliveredOrders:orders.filter(o=>o.status==="Delivered").length,activeListings:produceList.length,availableStock:produceList.reduce((s,p)=>s+p.quantity,0),farmers:new Set(produceList.map(p=>p.farmerId)).size});
});
app.listen(PORT,()=>{console.log("======================================");console.log("🌱 AGRICONNECT SERVER");console.log("Website: http://localhost:3000");console.log("Produce: http://localhost:3000/api/produce");console.log("Orders:  http://localhost:3000/api/orders");console.log("Stats:   http://localhost:3000/api/stats");console.log("======================================");});
