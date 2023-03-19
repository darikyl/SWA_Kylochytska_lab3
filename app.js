const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
   
const app = express();
const jsonParser = express.json();
 
const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/", { useUnifiedTopology: true });
 
let dbClient;
 
app.use(express.static(__dirname + "/public"));
 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("gardendb").collection("gardens");
    app.listen(3000, function(){
        console.log("Сервер очікує підключення...");
    });
});
 
app.get("/api/gardens", function(req, res){
        
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, gardens){
         
        if(err) return console.log(err);
        res.send(gardens)
    });
     
});
app.get("/api/gardens/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, garden){
               
        if(err) return console.log(err);
        res.send(garden);
    });
});
   
app.post("/api/gardens", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
       
    const gardenName = req.body.name;
    const gardenPlace = req.body.place;
    const gardenDate = req.body.date;
    const gardenPhone = req.body.phone;
    const garden = {name: gardenName, place: gardenPlace, date: gardenDate, phone: gardenPhone};
       
    const collection = req.app.locals.collection;
    collection.insertOne(garden, function(err, result){
               
        if(err) return console.log(err);
        res.send(garden);
    });
});
    
app.delete("/api/gardens/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if(err) return console.log(err);    
        let garden = result.value;
        res.send(garden);
    });
});
   
app.put("/api/gardens", jsonParser, function(req, res){
        
    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const gardenName = req.body.name;
    const gardenPlace = req.body.place;
    const gardenDate = req.body.date;
    const gardenPhone = req.body.phone;
       
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {name: gardenName, place: gardenPlace, date: gardenDate, phone: gardenPhone}},
         {returnDocument: 'after' },function(err, result){
               
        if(err) return console.log(err);     
        const garden = result.value;
        res.send(garden);
    });
});
 
// Прослуховуємо переривання роботи програми (ctrl-c)
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});


