
var ObjectId = require('mongodb').ObjectID;

exports.follow = function (req, res) {
  var db = req.app.settings.db;
  
  console.log("reached the follow call");
  //id ok to here
  console.log(req.body);
  //var obj = JSON.parse(req.body);
  //console.log("req.body parsed = " + obj);

  var businessId = req.body.id;
  console.log("this is req.body.id" + businessId);
  var loggedUserId = req.session.userId;
  
  var businessID = new ObjectId(businessId);
  var loggedUserID = new ObjectId(loggedUserId);

  //console.log("business user object id is " + businessID);
  //console.log("logged in user object id is " + loggedUserID);

     db.collection('users', function(err, collection){
      
         collection.update({_id: loggedUserID}, {$addToSet: {following: businessID}}, function (err, result) {
            if(err) throw err;
            console.log("reached " + result);
                   
                db.collection('business', function(err, collection){
      
                   collection.update({_id: businessID}, {$addToSet: {followers: loggedUserID}}, function (err, bresult) {
                      if(err) throw err;
                      console.log("reached " + bresult);
                        
                      
        });
      }); 
  });
}); 



      res.send({status: "success", follow: "FOLLOWING"});
};

exports.incrementClickCount = function(req, res){
  console.log("incrementClickCount");
  var db = req.app.settings.db;
  
  var postId = req.body.id;
  console.log(req.body)
  var postID = new ObjectId(postId);
  console.log("postId: "+postID);

  var count = 1;
  var newCount = count +Date.now();

    db.collection('posts', function(err, collection){
      
         collection.update({_id: postID}, {$addToSet: {clickcount: newCount}}, function (err, bresult) {
            if(err) throw err;
            console.log("reached " + bresult);
            
            res.send({status: "success"});       
                  
    });
  }); 

}

exports.incrementViewCount = function(req, res){
  console.log("incrementViewCount");
  var db = req.app.settings.db;
  
  var postId = req.body.id;
  //console.log("postId: "+postId)
  var postID = new ObjectId(postId);
  //console.log("postId: "+postID);

  var count = 1;
  var newCount = count +Date.now();

    db.collection('posts', function(err, collection){
      
         collection.update({_id: postID}, {$addToSet: {viewcount: newCount}}, function (err, bresult) {
            if(err) throw err;
            console.log("reached " + bresult);
            
            res.send({status: "success"});       
                  
    });
  }); 

}

exports.like = function (req, res) {
  var db = req.app.settings.db;
  
  console.log("reached the like call");
  //id ok to here
  console.log(req.body);
  //var obj = JSON.parse(req.body);
  //console.log("req.body parsed = " + obj);

  var postId = req.body.id;
  console.log(postId);
  var loggedUserId = req.session.userId;
  
  var postID = new ObjectId(postId);
  var loggedUserID = new ObjectId(loggedUserId);


     db.collection('users', function(err, collection){
      
         collection.update({_id: loggedUserID}, {$addToSet: {favourites: postID}}, function (err, result) {
            if(err) throw err;
            console.log("reached " + result);
                   
                db.collection('posts', function(err, collection){
      
                   collection.update({_id: postID}, {$addToSet: {favourited_by: loggedUserID}}, function (err, bresult) {
                      if(err) throw err;
                      console.log("reached " + bresult);
                        
                      
        });
      }); 
  });
}); 



      res.send({status: "success", follow: "SAVED"});
};

exports.saveGPSData = function(req, res) {

  var lat = req.body.lat;
  var lon = req.body.lon;
  console.log("from api file req.body.lat: "+ lat +" "+ "req.body.lon: "+ lon);


}

exports.checkEmail = function(req, res){

  //console.log("checkEmail called");
  var db = req.app.settings.db;
  var checkEmail = req.body.checkEmail;

  console.log("from api  email: "+checkEmail);

  db.collection('users', function (err, allUsers){
      allUsers.find({email:checkEmail}).toArray( function (err, filterEmail){
        console.log("filterEmail: "+filterEmail);
          if(filterEmail.length == 0){
              //do nothing
          }
          else{
              res.send({status: "success", follow: "Email is already used, please choose another."});
          }
      });
  });

}
