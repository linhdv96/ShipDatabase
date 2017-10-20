const express = require("express");
const app = express();
const server = require("http").createServer(app);
const pug = require('pug');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
let index=0;//tao index danh dau moc du lieu, chia nho trang web

const mongodb = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/shipdata";

//Ket noi databaseship va tim kiem 
MongoClient.connect(url, function(err, db){
	if(err) throw err;

	//search-name
	//Tim theo ten tau
	app.post("/search_name", urlencodedParser, (req, res)=>{
		let name = req.body.name;
		//lay trc 10 document theo yc in ra web
		db.collection("ship2").find({'Name': {'$regex': name}}).limit(10).toArray((err, result)=>{
			if(err) throw err;
			res.send(result);
            res.end();
		});
		//lau cac document thoa man vao collection ship3 de giup chia trang web
		db.collection("ship2").find({'Name': {'$regex': name}}).toArray((err, result)=>{
			if(err) throw err;
			drop_ship3();
			create_ship3(result);
		});
	});

	//search-imo
	//Tim theo ma IMO
	app.post("/search_imo", urlencodedParser, function(req,res){
		let imo = req.body.imo;
		let check = req.body.check;
		//tim kiem nang cao ma IMO
		if(check=='1')
		{
			db.collection("ship2").find({'IMO': imo}).toArray((err, result)=>{
				if(err) throw err;
				res.send(result);
				res.end();
			});
		}

		else{
			//lay trc 10 document theo yc in ra web
			db.collection("ship2").find({'IMO': {'$regex': imo}}).limit(10).toArray((err, result)=>{
				if(err) throw err;
				res.send(result);
				res.end();
			});
			//lau cac document thoa man vao collection ship3 de giup chia trang web
			db.collection("ship2").find({'IMO': {'$regex': imo}}).toArray((err, result)=>{
				if(err) throw err;
				drop_ship3();
				create_ship3(result);
			});
		}
	});



	//Chia du lieu tim kiem thanh nhieu trang....
	app.post("/next_list", urlencodedParser, function(req,res){
		index=index+10;
		db.collection("ship3").find().limit(10).skip(index).toArray((err, result)=>{
			if(err) throw err;
			res.render('next_list.pug', {result});
		});
	});

	//chi tiet tau
	app.get("/detail",urlencodedParser, (req, res)=>{
		let id = req.query._id;
		let new_id = new ObjectId(id);
		db.collection("ship3").findOne({'_id': new_id}, (err, result)=>{
			if(err) throw err;	
			res.render('ship.pug', {result});
		});
	});




	//reset ship3
	function drop_ship3(){
		db.collection("ship3").drop();
	}
	//tao ship3
	function create_ship3(result){
		db.collection("ship3").insertMany(result);
	}



});


//TRANGCHU
app.get("/", (req, res)=>{
	res.render("trangchu.pug");
});

server.listen(3000);