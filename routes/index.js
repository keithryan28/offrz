
var ObjectId = require('mongodb').ObjectID;
/* GET home page. */
exports.welcome = function(req, res){
  console.log("welcome page is requested");

  res.render('welcome');
};
exports.login = function(req, res){
  console.log("login page is requested");

  res.render('login');
};

exports.register = function(req, res){
  console.log("registration page is requested");
  res.render('register');
};

exports.registerUser = function(req, res){
  console.log("user registration page is requested");
  res.render('registerUser');
};
exports.registerBus = function(req, res){
  console.log("Business registration page is requested");
  res.render('registerBus');
};


//registering a new bus function. The image path had to be cleaned as it was picking up the public folder in the path. Once cleaned I called another function and passed in the path which would be required insertion to the db along with the other fields. once registered send the user back to login
exports.processRegBus = function(req, res) {
  console.log("processRegBus called")
  var db = req.app.settings.db;
  var path = req.files.theFile.path;
  console.log("path: "+path);
  var fixPath = path.replace('public', '');
  console.log("path: "+fixPath);
  regNewBus(fixPath);

  function regNewBus(param1){

  //grab input field data
  var businessName = req.param('businessName');
  var strBusinessName = businessName.toLowerCase();
  var url = req.param('url');
  var address = req.param('address');
  var gpsLong = req.param('gpsLong');
  var gpsLat = req.param('gpsLat');
  var email = req.param('email');
  var pwd = req.param('password');
  //role is hardcoded to help define different users
  var role = "business";
  //insert id of users who follow the business
  var followers = [];
  var clickcount = [];
  var viewcount = [];


  if (businessName && url && address && gpsLong && gpsLat && pwd && email)
  {
    //var users = db.get('users');
    db.collection('business', function(err, collection) {

      var userDoc = {
        imgpath:param1,
        businessName: strBusinessName,
        homeDomain: url,
        address: address,
        gpsLong: gpsLong,
        gpsLat: gpsLat, 
        email: email,
        password: pwd,
        role: role,
        followers: followers
      };

      collection.insert(userDoc, {w:1}, function (err, result) {
        if (err) throw err;

        console.log("Result of insert: ", result);
        res.redirect('/login');
      });

    });

  }
}
};



// register a standard user function. I've hardcoded the subscriber role here to differentiate between the admin and standard users. This function also uses sendgrid email which once registered sends a confirmation email to the user containing their login details for future reference
exports.processRegUser = function(req, res) {
  var db = req.app.settings.db;

  //grab input field data
  var uname = req.param('username');
  var pwd = req.param('password');
  var email = req.param('email');
  var role = "subscriber";
  var following = [];
  var favourites = [];



  if (uname && pwd)
  {
    //var users = db.get('users');
    db.collection('users', function(err, collection) {

      var aUserDoc = {
        username: uname,
        password: pwd,
        email: email,
        role: role,
        following: following,
        favourites: favourites
      };

  var msg = "your log in details are - email: "+email+" password: "+pwd;

  var html_body = "<table style=\"border: solid 1px #808080; background-color: #4A797B; font-family: verdana, tahoma, sans-serif; color: #fff; font-size:14px;\"> <tr> <td> <h2>Hello,</h2> <p>Welcome To Offrz, search for and follow your favourite businesses to get their hot Offrz first.    Below are your log in details.</p>"+msg+"<p><a href=\"#\" target=\"_blank\">Offrz.com</a> </p> <p>Thank you for joining Offrz.</p> Regards,<br/> Your friends at Offrz</p> <p> <img src=\"http://i1134.photobucket.com/albums/m615/tsoparno/logo.png\" alt=\"OFFRZ!\" /> </td> </tr></table>";


   var sendgrid = require('sendgrid')(process.env.user_api, process.env.user_key);
    sendgrid.send({

    to: email,
    from: 'noreply@offrz.com',
    subject: 'Thank you for registering with Offrz',
    text: 'Hello world',
    html:  html_body

  }, function(err, json){
      if (err){return console.error(err); }
      console.log(json);
  });
      collection.insert(aUserDoc, {w:1}, function (err, result) {
        if (err) throw err;

        console.log("Result of insert: ", result);
        res.redirect('/login');
      });

    });

  }
};

//the login function goes through the user collection to check for a match with the email inputed, if found it compares with the inputted password and logins in the user. If an email doesn't match it will call a function which goes through the business collection to see if there's a business email that matches, and then carries out the same checks on password as with the previous collection. I'm saving the userId on the session as this is used throughout the app for checking against collections.
exports.processLogin = function(req, res){
  var db = req.app.settings.db;

  var email = req.param('email');
  var pwd = req.param('password');


  if (email || pwd){

      db.collection('users', function (err, collection){
          if (err) throw err;

          collection.find({email:email}).toArray( function (err, arrayOfDocs){

              if(arrayOfDocs.length == 0){
                  //call login function for business
                  busLogin();

              }
              else{
               if (arrayOfDocs[0].password == pwd && arrayOfDocs[0].role == "subscriber") {
                  req.session.email =  email;
                  sessionEmail = req.session.email;
                  req.session.role = arrayOfDocs[0].role;
                  req.session.userId = arrayOfDocs[0]._id;
                  res.redirect('/homeUser');
                }
                else if (arrayOfDocs[0].password == pwd && arrayOfDocs[0].role == "admin") {
                  req.session.email = email;
                  req.session.role = arrayOfDocs[0].role;
                  //console.log("User role is: " +req.session.role);
                  //console.log("User email is: " +req.session.email);
                  res.redirect('/adminHome');
                }
                else {
                    //req.session.loginMsg = "Sorry. Wrong password.";

                    res.redirect('/login');
                  }
                          
              }
          });

      });
// function for going through the business collection during login, only called if the email on the get request isn't contained in the users collection.
function busLogin (){
      if (email || pwd){
        db.collection('business', function (err, collection){
            collection.find({email:email}).toArray( function (err, arrayOfBus){
                  if(arrayOfBus[0].password == pwd && arrayOfBus[0].role == "business") {
                  req.session.email =  email;
                  sessionEmail = req.session.email;
                  req.session.userId = arrayOfBus[0]._id;
                  req.session.businessName = arrayOfBus[0].businessName;
                  //console.log("UserId is: " + req.session.userId);  
                  //console.log("User email is: " +sessionEmail);
                  res.redirect('/homeBusUser');
                  }
                else{
                  res.redirect('/login');
                }
            });
        });
      }
    }


  }
};


exports.logout = function (req, res) {
  if (req.session.email){
    delete req.session.userId;
   
  }
    
  res.redirect('/login');
};

//the subscriber homepage generates a list of posts from only the businesses the the user follows. this required me to go through the user collection and find the array of businesses that they follow. Using this data I can then go through the posts collection as there's a reference in that collection called 'post_created_by_id'. Because of the asynchronous nature of nodejs this required using arrays outside of the for loop and pushing the result of the loop into these arrays(can be seen on line 266). Without this pattern the for loop is in danger of only hitting the first element in the array. Once I have something in this postsArray, I then use the postsArray & followingIds array, check the lengths of them and once they match I know I have all the posts of all the businesses that they user follows(contained in the postsArray). This array was rendered out on the front end but gave issues as it was actually a collection of arrays which gave problems extracting data from them. To fix this I flattened the array on the back-end and rendered this flattened array instead. Also added to the render is a list of the top deals and top businesses which only appears on the desktop version.   
exports.homeUser = function(req, res){
  //console.log("homeUser page is requested");

  var db = req.app.settings.db;
  var loggedUser = req.session.userId;
  //console.log("logged user id: " + loggedUser);
  
  var loggedUserID = new ObjectId(loggedUser);
  var id = req.session.userId;

 if(id){

  var postsArray = [];

  db.collection('users', function(err, allUsers){

    allUsers.find({_id: loggedUserID}).toArray(function (err, user){

        db.collection('posts', function(err, allPostsColl){

              var followingIds = user[0].following;
              var uname = user[0].username;
              //console.log(followingIds);
              if(followingIds.length == 0){
                //console.log("followingIds length = 0");
                res.render('welcomeUser', {name:uname});
              }
              else{
                //console.log("followingIds length is " + followingIds.length);
              }
              for(var i = 0; i < followingIds.length; i++){
                    //followingIds[i];

                    allPostsColl.find({post_created_by_id:followingIds[i]}).toArray(function (err, foll){
                   
                      //console.log(foll);
                      postsArray.push(foll);
                     

                      if(followingIds.length == postsArray.length){
                           //flatten array to make it easier on the front end with a single loop to extract every post
                           var flat_arr = [].concat.apply([],postsArray).sort({_id: 'desc'});
                           
                           allPostsColl.find().limit(5).sort({percent: -1}).toArray( function (err, topPosts){

                            db.collection('business', function (err, allBus){

                              allBus.find().limit(5).sort({followers: -1}).toArray(function (err, topBus){

                                      res.render('homeUser', {posts:flat_arr, allPosts:topPosts, allBus:topBus});

                              });
                              
                            });
                                 
                           });
                         
                      }
                  });

              };
        });
    });
  });
}
  else{
    res.redirect('/login');
  }
};
// this function is a similar pattern to the function above, but repeated, as the page loads with data from three different collections by utilising pagination on the front-end. In it's current state it's not perfect and it had bugs when either collection was empty, to get around this I put a comparison in place to check if either array of userFollowing or userFavs was empty render out a message page giving user feedback instructing them they'll need to both follow and save deals in order to see this page.
exports.profileUser = function(req, res){
  console.log("profile page is requested");
  var db = req.app.settings.db;
  var loggedUser = req.session.userId;
  
  var loggedUserID = new ObjectId(loggedUser);

 db.collection('users', function(err, allUsers){
    allUsers.find({_id: loggedUserID}).toArray(function (err, usera){

      var userFollowing = usera[0].following;
      var userFavs = usera[0].favourites;
      // console.log("userFollowing.length: "+userFollowing.length);
      // console.log("userFavs.length: "+userFavs.length);

      if(userFollowing.length == 0 || userFavs.length == 0){
        res.render('empty');
      }
      
        db.collection('posts', function(err, allPostsColl){
         
              var favsArray = [];
               
              var favPostsIds = usera[0].favourites;
    
              for(var i = 0; i < favPostsIds.length; i++){
                  favPostsIds[i];

                    allPostsColl.findOne({_id:favPostsIds[i]}, function (err, folla) {

                      favsArray.push(folla);

                      if(favPostsIds.length == favsArray.length){

                              console.log(favsArray.length);
                             //res.render('profileUser', { name: name, following:following, favourites:favourites, busfollowing:businessArray});
                      
                          db.collection('users', function(err, allUsers){
                            allUsers.find({_id: loggedUserID}).toArray(function (err, user){
                                 
                                //variables needed for outside of the loop
                                var name = user[0].username;
                                var favourites = user[0].favourites.length;
                                var following = user[0].following.length;

                                db.collection('business', function(err, allBusColl){
                                 
                                      var businessArray = [];
                                       
                                      var followingIds = user[0].following;
                            
                                      for(var i = 0; i < followingIds.length; i++){
                                          followingIds[i];

                                            allBusColl.findOne({_id:followingIds[i]}, function (err, foll) {

                                              businessArray.push(foll);

                                              if(followingIds.length == businessArray.length){
                                                  //console.log(favsArray.length);
                                                  res.render('profileUser', { name: name, following:following, favourites:favourites, busfollowing:businessArray, favs:favsArray});
                                              }

                                          });

                                      };

                                });
                            });
                          });

                      }

                  });

              };

        });
    });
  });



};
exports.singlePost = function(req, res){
  console.log()
  var db = req.app.settings.db;
  var postId = req.param('id');
  //console.log("postid value pre object transform: " + postId);
  var postObjectId = new ObjectId(postId);
  //console.log("postId value is" + postObjectId);

  db.collection('posts', function(err, singlePost){
    if (err) throw err;
      singlePost.find({ _id: postObjectId }).toArray(function(err, post){
         if (err) throw err;
         // console.log("result of post:" + post.length);
          res.render('singlePost', {items:post});
      });
  });

}

exports.busProfileFromUser = function(req, res){
  console.log("busProfileFromUser page is requested");
  var db = req.app.settings.db;
  var loggedUser = req.session.userId;
  var loggedUserID = new ObjectId(loggedUser);
  //need business id for homelink logo
  var busId = req.param('busId');
  console.log("busId = "+busId);
  var busIdObject = new ObjectId(busId);
  console.log("busIdObject = "+busIdObject);

  db.collection('business', function(err, allBus){
      allBus.find({_id: busIdObject}).toArray(function(err, singleBusData){
            console.log(singleBusData.length);

            db.collection('posts', function(err, allPosts){
                allPosts.find({post_created_by_id:busIdObject}).toArray(function(err, busPostsData){
                    //console.log("posts by business data: " + busPostsData);

                     res.render('busProfileFromUser', {busData:singleBusData, posts:busPostsData, userId:loggedUserID});
                });
            });
           
      });
  });


        

};
exports.homeBusUser = function(req, res){
  console.log("homeBusUser page is requested");
  var db = req.app.settings.db;
  var loggedUserId = req.session.userId;
  var loggedUserID = new ObjectId(loggedUserId);
  console.log("loggedUserID " + loggedUserID);
  var id = req.session.userId;

 if(id){

    db.collection('posts', function(err, collection){
      collection.find({post_created_by_id: loggedUserID}).sort({_id:-1}).toArray(function(err, allPosts){
               console.log("result of allPosts find is " + allPosts.length);
               if(allPosts.length == 0){
                    res.render('noPosts');
               }else{
                    res.render('homeBusUser', {businessPosts: allPosts});
               }
      });
    });
  }
  else{
    res.redirect('/login');
  }
};

// render main post page, upload, process and edit post.

exports.uploadtest = function(req, res){
  console.log("uploadtest page is requested");
    var id = req.session.userId;

     if(id){
      res.render('uploadtest');
    }
    else{
      res.redirect('/login');
    }
};

//this function creates a new post for the business. Again it uses the same pattern as the register new business process. First cleaning the image path and calling a function passing the clean path as a parameter. This function also takes care of sorting out the percentage saving parameter before inserting all data to the db. Once processed it redirects the user back to their homepage
exports.uploadImageTest = function(req, res){
  console.log("uploadImageTest page is requested");
  var db = req.app.settings.db;
  var loggedUserId = req.session.userId;
  var loggedUserID = new ObjectId(loggedUserId);

  var path = req.files.theFile.path;
  var fixPath = path.replace('public', '');
  //res.send('hello');
  test(fixPath);

    function test(param1){
      
      var postTitle = req.body.postTitle;
      var strPostTitle = postTitle.toLowerCase();
      var postDesc = req.body.postDesc;
      var postLink = req.body.postLink;
      var beforePrice = req.body.postBeforePrice;
      var afterPrice = req.body.postAfterPrice;
      
   // creating calculations for getting percentage saving before storing in db
      var beforeConverted = Number(beforePrice);
      var afterConverted = Number(afterPrice);
   //fix to two decimal points
      var bFixed = beforeConverted.toFixed(2);
      var aFixed = afterConverted.toFixed(2);   

      var percent =  bFixed - aFixed;
      var percent2 = percent / beforeConverted;
      var percent3 = percent2 *  100;
      //round of percentage to two decimal points
      var totalPercent = percent3.toFixed(2);
      var favourited_by = [];
      // saving a reference to the name of the business name because it's needed on the homepage of all users and this method will save me making another db query to find the name.
      var busName = req.session.businessName;
      console.log("totalPercent: "+totalPercent);

      var clickcount = [];
      var viewcount =[];


     db.collection('posts', function(err, collection){

            var aUserPost = {
          // post insert variables
             imgpath: param1,
             post_created_by: busName,
             post_created_by_id: loggedUserID,
             title: strPostTitle,
             desc: postDesc,
             link: postLink,
             before: bFixed,
             after: aFixed,
             percent: totalPercent,
             favourited_by: favourited_by,
             clickcount: clickcount,
             viewcount: viewcount
            };

              collection.insert(aUserPost, {w:1}, function (err, result) {
              if (err) throw err;

              console.log("Result of insert: ", result);
            
              res.redirect('/homeBusUser');
             
            });
          });

      
  }
};

exports.editProfile = function(req, res){
  console.log("editProfile page is requested");
  var db = req.app.settings.db;
  var loggedUserId = req.session.userId;
  var loggedUserID = new ObjectId(loggedUserId);

      var id = req.session.userId;

     if(id){

    db.collection('users', function(err, collection){
      collection.find({_id: loggedUserID}).toArray(function(err, singleUser){
               res.render('editProfile', {items: singleUser});
      });
    });
  }
  else{
    res.redirect('/login');
  }
};

//this allows the subscriber to update their own profile by updating the collection 
exports.processEditProfile = function(req, res) {
    console.log("processEditProfile page is requested");
  var db = req.app.settings.db;
  //console.log("yo");
  var loggedUserId = req.session.userId;
  var loggedUserID = new ObjectId(loggedUserId);
  console.log("loggedUserID: "+ loggedUserId);


  var username = req.param('username');
  console.log("username:" + username);
  var email = req.param('email');
  var password = req.param('password');

 
   db.collection('users', function (err, usersColl){
      console.log(usersColl);

      usersColl.update({_id:loggedUserID}, {$set: 
        {
          username: username, 
          email : email,
          password: password 
           }}, function (err, result){

          
      });

    res.redirect('/editProfile');
    });
   
};


exports.editBusPost = function(req, res){
  console.log("editBusPost page is requested");
  var db = req.app.settings.db;
  var postId = req.param('id');
  var postObjectId = new ObjectId(postId);
  var id = req.session.userId;

     if(id){

    db.collection('posts', function(err, collection){
      collection.find({_id: postObjectId}).toArray(function(err, singlePost){
               console.log("result of allPosts find is " + singlePost.length);
                 res.render('editBusPost', {items: singlePost});
      });
    });
  }
  else{
    res.redirect('/login');
  }
};

//this process is for alllowing the business to update their post if they've made an error. I had issues getting the image to work in this function and ended up omitting it in order to get the rest of the function to work. 
exports.processUpdatedPost = function(req, res){
  console.log("processUpdatedPost page called");
    var db = req.app.settings.db;
    var postId = req.param('postId');
    var postObjectId = new ObjectId(postId);
    //var path = req.files.theFile.path;
    //console.log("path: "+ path);
    //var fixPath = path.replace('public', '');
  

    var postTitle = req.param('postTitle');
    var postDesc = req.param('postDesc');
    var postLink = req.param('postLink');
    var postBefore = req.param('postBefore');
    var postAfter = req.param('postAfter');

   // creating calculations for getting percentage saving before storing in db
    var beforeConverted = Number(postBefore);
    var afterConverted = Number(postAfter);
    var percent =  beforeConverted - afterConverted;
    var percent2 = percent / beforeConverted;
    var percent3 = percent2 *  100;
    //round of percentage to two decimal points
    var totalPercent = percent3.toFixed(2);

    console.log("postTitle: "+postTitle);
    console.log("postObjectId: "+postObjectId);

    db.collection('posts', function (err, coll){
      console.log(coll);

      coll.update({_id:postObjectId}, {$set: 
        {
          title: postTitle, 
          desc: postDesc,
          link: postLink,
          before: postBefore,
          after: postAfter,
          percent: totalPercent 
           }}, function (err, result){

          res.redirect('homeBusUser');
      });

    
    });
};
//delete business post by grabbing the postID from the hidden field 
exports.deletePost = function (req, res){
    var db = req.app.settings.db;
    var postId = req.param('postId');
    var postObjectId = new ObjectId(postId);
    console.log(" delete post postObjectId: "+postObjectId);

    db.collection('posts', function (err, posts){
      
      if (err) throw err;

        posts.remove({_id:postObjectId}, {w:1}, function  (err, result){

             res.redirect('homeBusUser');
        });

     
    });

};

exports.busPost = function(req, res){
  console.log("Business post page is requested");
  res.render('busPost');
};

//this function serves out the view of a business to a subscriber. It requires data from two collections, both the business and posts collection associated with the given business
exports.busProfile = function(req, res){
  console.log("busProfile page is requested");
  var db = req.app.settings.db;
  var loggedUserId = req.session.userId;
  var loggedUserID = new ObjectId(loggedUserId);

  var id = req.session.userId;

 if(id){
  //get followers number && logo path
  var follTotal; 
  var logoPath;
  var domain;

  db.collection('business', function (err, allBus){
    allBus.find({_id:loggedUserID}).toArray (function (err, bus){
      
      logoPath = bus[0].imgpath;
      domain = bus[0].homeDomain;
      //console.log("logo path: "+ logoPath);

      if(bus[0].followers == 0){
          follTotal = 0;
      }
      else{
          follTotal = bus[0].followers.length; 
      }

    });
  });

  //get posts data
  db.collection('posts', function (err, posts){
    posts.find({post_created_by_id:loggedUserID}).toArray(function (err, allPosts){
        if(allPosts.length == 0 || follTotal == 0){
            res.render('emptyBusProfile');
        }
        else{
          res.render('busProfile', {items:allPosts, totalFollowers:follTotal, logo:logoPath, homeLink:domain});
        }
    });
  });
  }
  else{
    res.redirect('/login');
  }
};

exports.search = function(req, res){
  console.log("search page is requested");
  var test = req.session.lat;
  console.log("test: "+test);
  res.render('search');
};

exports.editBusProfileFromBus = function(req, res){
  console.log("editBusProfileFromBus page is requested");

  var db = req.app.settings.db;
  var loggedUserId = req.session.userId;
  var loggedUserID = new ObjectId(loggedUserId);
  console.log("loggedUserId: "+ loggedUserId);
  //var id = req.session.userId;

  

    db.collection('business', function (err, allBus){
      allBus.find({_id:loggedUserID}).toArray(function (err, singleBus){
        console.log("singleBus: "+singleBus);
            res.render('editBusProfileFromBus', {business:singleBus});
      });
    });
};



//allow a business to update their profile, again I had to ommit the change of logo here as I couldn't get the logic right
exports.processEditBusProfileFromBus = function(req, res){
  console.log("processEditBusProfile requested");
  var db = req.app.settings.db;
  var loggedUserId = req.session.userId;
  var loggedUserID = new ObjectId(loggedUserId);
  //get image file path
  /*var path = req.files.theFile.path;
  console.log("path: "+path);
  var fixPath = path.replace('public', '');
  console.log("fixPath: "+fixPath);*/

        var newBusName = req.param('businessName');
        var strNewBusName = newBusName.toLowerCase();
        var newUrl = req.param('url');
        var newAddress = req.param('address');
        var newGpsLong = req.param('gpsLong');
        var newGpsLat = req.param('gpsLat');
        var newEmail = req.param('email');
        var newPass = req.param('password');

        db.collection('business', function (err, coll){

            coll.update({_id:loggedUserID}, {$set:
                {
                  businessName: strNewBusName,
                  homeDomain: newUrl,
                  address: newAddress,
                  gpsLong: newGpsLong,
                  gpsLat: newGpsLat,
                  email: newEmail,
                  password: newPass
                }}, function (err, result){

                res.redirect('editBusProfileFromBus');


            });
        });
  
  
}



//////////////////////////////////////////////////////////////////////////////////

exports.adminHome = function(req, res){
  console.log("adminHome page is requested");
  var db = req.app.settings.db;
  var role = req.session.role;
  console.log("user role: " + role);

  if(role == "admin"){

    db.collection('posts', function ( err, posts){
      posts.find().sort({_id:-1}).toArray ( function (err, allPostsColl ){

        res.render('adminHome', {items:allPostsColl});

      });

    });
  }
  else{
    res.redirect('/login');
  }
};

exports.adminAccounts = function(req, res){
  console.log("adminAccounts page is requested");
  var db = req.app.settings.db;

  db.collection('business', function (err, allBus){
      allBus.find().sort({_id:-1}).toArray (function (err, busColl){
           res.render('adminAccounts', {items:busColl});
      });
  });

 
};

exports.adminUsers = function(req, res){
  console.log("adminUsers page is requested");
 var db = req.app.settings.db;

  db.collection('users', function (err, users){
      users.find().sort({_id:-1}).toArray( function ( err, allUsers){
            res.render('adminUsers', {items:allUsers});
      });
  });
};

exports.postFromAdmin = function(req, res){
  console.log("postFromAdmin page is requested");
  var db = req.app.settings.db;
  var postId = req.param('postId');
  var postID = new ObjectId(postId);
  db.collection('posts', function(err, postData){
    postData.find({_id:postID}).toArray( function (err, data){
         res.render('postFromAdmin',{items:data});
    });

  });
};

exports.processPostFromAmin = function (req, res){
   console.log("processPostFromAmin page is requested");
  var db = req.app.settings.db;
  var postId = req.param('postId');
  console.log(postId);
  var postID = new ObjectId(postId);

  var title = req.param('title');
  var description = req.param('description');
  var link = req.param('link');
  var before = req.param('before');
  var after = req.param('after');


  db.collection('posts', function (err, postData){


   postData.update({_id:postID}, {$set: 
        {
          title: title, 
          desc: description,
          link:link,
          before:before,
          after: after

           }}, function (err, result){

          res.redirect('adminHome');
      });
     });

}
exports.deletePostFromAdmin = function(req, res){
  var db = req.app.settings.db;

  var postId = req.param('postId');
  var postID = new ObjectId(postId);

  db.collection('posts', function (err, postColl){
    postColl.remove({_id:postID}, {w:1}, function  (err, result){

         res.redirect('adminHome');
      });
  });

}

exports.accFromAdmin = function(req, res){
  console.log("accFromAdmin page is requested");
  var db = req.app.settings.db;
  var businessId = req.param('busId');
  var busID = new ObjectId(businessId);

  db.collection('business', function (err, busData){
    busData.find({_id:busID}).toArray(function (err, allBus){
      res.render('accFromAdmin', {items:allBus});
    });
  });

  
};

exports.editAccFromAdmin = function(req, res){
    console.log("editAccFromAdmin page is requested");
  var db = req.app.settings.db;
  var businessId = req.param('busId');
  console.log(businessId);
  var busID = new ObjectId(businessId);

  var businessName = req.param('businessName');
  var email = req.param('email');
  var address = req.param('address');
  var gpsLat = req.param('gpsLat');
  var gpsLong = req.param('gpsLong');
  var password = req.param('password');

  db.collection('business', function (err, busData){


   busData.update({_id:busID}, {$set: 
        {
          businessName: businessName, 
          email: email,
          address:address,
          gpsLat:gpsLat,
          gpsLong: gpsLong,
          password: password

           }}, function (err, result){

          res.redirect('adminAccounts');
      });
     });


}

exports.deleteAccFromAdmin = function(req, res){
  var db = req.app.settings.db;

  var busId = req.param('busId');
  var busID = new ObjectId(busId);

  db.collection('business', function (err, busColl){
    busColl.remove({_id:busID}, {w:1}, function  (err, result){

         res.redirect('adminAccounts');
      });
  });
}

exports.userFromAdmin = function(req, res){
  console.log("userFromAdmin page is requested");
  var db = req.app.settings.db;
  var user = req.param('userId');
  var userID = new ObjectId(user);
  console.log("userID: "+userID);

  db.collection('users', function (err, users){
      users.find({_id:userID}).sort({_id:-1}).toArray( function ( err, singleUser){
            res.render('userFromAdmin', {items:singleUser});
      });
  });

  
};

exports.updateUserProfileFromAdmin = function(req, res){
  console.log("process user profile reached");
  var db = req.app.settings.db;

  var username = req.param('username');
  var email = req.param('email');
  var password = req.param('password');
  var role = req.param('role');
  console.log("role: " + role); 
  var user = req.param('userId');
  var userID = new ObjectId(user);

  db.collection('users', function (err, userColl){
  
   userColl.update({_id:userID}, {$set: 
        {
          username: username, 
          email: email,
          password: password,
          role:role 
           }}, function (err, result){

          res.redirect('adminUsers');
      });
     });
}
exports.deleteUserFromAdmin = function (req, res){
  var db = req.app.settings.db;

  var user = req.param('userId');
  var userID = new ObjectId(user);

  db.collection('users', function (err, userColl){
    userColl.remove({_id:userID}, {w:1}, function  (err, result){

         res.redirect('adminUsers');
      });
  });

}
//end of admin ///////////////////////////////////////////////////////////////////////////


// this function is for the search feature for the offrz. It checks for an input in the search field and if it exists use it , if not just return all offrz. I used the '$regex' feature of mongodb in order to allow users search for offrz without having to use the exact word used in the title property of the post, they can search using only one character. 
exports.listOfOffers = function(req, res){
  var db = req.app.settings.db;

  var keyword = req.param('offrzKeyword');
  var strKeyword = keyword.toLowerCase();
  console.log("keyword = "+ keyword);

  if(keyword == ""){
  //bring back all the postings   
    db.collection('posts', function(err, allPosts){
        allPosts.find().sort({_id:-1}).toArray(function(err, posts){
            //var jsonListOfBus = JSON.stringify(listOfBus);
            console.log("no keyword array length = " + posts.length);
            //console.log(jsonlistOfBus);
            res.render('listOfOffers', { lists:posts });
        });
    });
  }
  else{
  // bring back all postings where the search term in the title  
    db.collection('posts', function(err, allPosts){

        allPosts.find({title:{$regex: strKeyword}}).sort({_id:-1}).toArray(function (err, keywordPosts){
          console.log("keyword: "+keyword);
      
            console.log("length of the posts array is: " + keywordPosts.length);
                if(keywordPosts.length == 0){
                    
                    res.render('noOffrz3', {term:keyword});
                }
                else{
            res.render('listOfOffers', {lists:keywordPosts});
          }
        });
    });
  }


};

// this function is for searching for businesses. It required more logic as it has more permutations due to being allowed to search by county or storename. Again it uses the $regex feature so someone could find tesco by just searching using 't'. The data from the search terms had the .tolowercase() called on it as the structure of the db converts all string to lowercase, this was used in order to get a match from a search term and to avoid the user having no offrz returned because of a capital letter. For aesthetics I simply used the css property 'capitalise' if I wanted to start a word with a capital letter eg. the title of a post.  
exports.listOfBusinesses = function(req, res){
  var db = req.app.settings.db;
  var loggedUserId = req.session.userId;
  var loggedUserID = new ObjectId(loggedUserId);

  //console.log("loggedUserID " + typeof(loggedUserID));
  //console.log("loggedUserID " + loggedUserID);

  var storeKeyword = req.param('nameKeyword');
  var strStoreKeyword = storeKeyword.toLowerCase();
  //console.log("storeKeyword is "+storeKeyword);
  var storeCountySelection = req.param('select1');


  //if no storename entered and counties is all WORKS OK!!!!!!!!!!!!!!
  if(strStoreKeyword == "" && storeCountySelection == "all"){
    
    db.collection('business', function(err, allBus){
        allBus.find().toArray(function(err, business){
    
              if(business.length == 0){
                  res.send({msg:"there are no stores yet"});
                  //console.log("first if");
              }
            //console.log(business);
            else{
            
            res.render('listOfBusinesses', { lists:business, userId:loggedUserID });
          }
        });
    });
  }
  // Search for specfic store name in all counties WORKS NOW!!!!!!!!!!!!
  else if(strStoreKeyword && storeCountySelection == "all"){
            db.collection('business', function(err, allBus){
                  allBus.find({businessName:{$regex: strStoreKeyword}}).toArray(function(err, business){
                    //console.log("here are the businesses with "+ storeKeyword +" in them");
                      if(business.length == 0){
                           res.render('noOffrz', {keyword:strStoreKeyword, county:storeCountySelection});
                      }
                      else{

                      res.render('listOfBusinesses', {lists:business, userId:loggedUserID});
                    }
                  });
            });
  }//endof else if for storeKeyword && storeCountySelection search

  else if(strStoreKeyword && storeCountySelection){
    console.log("storeCountySelection: "+storeCountySelection);
            db.collection('business', function(err, allBus){
                  allBus.find({ $and:[{businessName:{$regex:strStoreKeyword}}, {address:storeCountySelection}]}).toArray(function(err, business){
                    //console.log("here are the businesses with "+ storeKeyword +" from the county of "+ storeCountySelection);
                      if(business.length == 0){
                          res.render('noOffrz', {keyword:strStoreKeyword, county:storeCountySelection});
                      }
                      else{

                      res.render('listOfBusinesses', {lists:business, userId:loggedUserID});
                    }
                  });
            });
  }//endof else if for storeKeyword && storeCountySelection search

  // search for businesses in counties only without storename
  else if(storeCountySelection != "all" && strStoreKeyword == "" || strStoreKeyword == null){
    console.log("storeCountySelection !=")
            db.collection('business', function(err, allBus){
                  allBus.find({address:storeCountySelection}).toArray(function(err, business){
                    //console.log("here are the businesses with "+ storeKeyword +" from the county of "+ storeCountySelection);
                      if(business.length == 0){
                          res.render('noOffrz2', {county:storeCountySelection});
                      }
                      else{

                      res.render('listOfBusinesses', {lists:business, userId:loggedUserID});
                    }
                  });
            });
  }//endof else if for storeKeyword == "" && storeCountySelection search


};//endof listOfBusinesses func


//this gathers the users gps location and saves it on the session for use in the gps function below.
//the .save() method was needed for any session data utilised through ajax
exports.processGps = function(req, res){

  console.log("processGps");
  var lt = req.param('lat');
  var lg = req.param('lon');
  req.session.lat = lt;
  req.session.lon = lg;
  //save() required when setting session variables through ajax
  req.session.save();
  console.log("processGps function req.session.lat: "+req.session.lat);
  console.log("processGps function req.session.lon: "+req.session.lon);
};

// this is the function for finding deals near the users current location. It uses a function found online(ref in thesis) which measures the distance between two points by taking in the four params required when the function is called. I had to pass in a fifth parameter('allBusColl[i]._id' line 1235) in order to get the ids of the business when they are within the set range.  My thinking here was two loop through the business collection, pull out the gps data, and compare it to the users current location, and if it's within a certain range populate an array with the ids of the business. This array is then used in another loop to extract the posts of the businesses going through the posts collection(line 1241).  
exports.gps = function(req,res){
  var id = req.session.userId;

  if(id){
        var la = req.session.lat;
        var lo = req.session.lon;
        
        var db = req.app.settings.db;
        
        var userLat = la;
        var userLon = lo;
        
        var busIds = [];
        var postsLocally = [];

        function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2, bId) {

         
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        //return d;
        console.log("d: "+ d);
        var loopedId = bId;
         //set range for distance from store
         if(d < 74){
            busIds.push(bId);
            console.log("bId gone into the array");
            console.log("busIds: "+busIds.length);
                
         }
         else{
            console.log("not close enough to the user to include in the array");
         }
         //console.log("busIds = "+busIds);
        //return d;
       }

        function deg2rad(deg) {
          return deg * (Math.PI/180)
        }

         

        //console.log("busIds outside of loop = "+busIds.length);

        db.collection('business', function (err, allBus){
            allBus.find().toArray( function (err, allBusColl){
                for(var i = 0; i < allBusColl.length; i++){
                   //this function will populate the busIds array with the id's of the businesses with the range set
                   //allowing me to search through the posts collection to find only posts created by those ids 
                  getDistanceFromLatLonInKm(allBusColl[i].gpsLat, allBusColl[i].gpsLong, userLat, userLon, allBusColl[i]._id);
                   
                //console.log("busIds length: "+busIds.length);
              }
              //console.log("busIds length: "+busIds.length);
              for (var i = 0; i<busIds.length; i++){
                  db.collection('posts', function (err, postsNearby){
                    postsNearby.find({post_created_by_id: busIds[i]}).toArray(function (err, posts){
                      //console.log(posts.length);
                      postsLocally.push(posts);
                      //console.log("postsLocally.length: "+postsLocally);

                       if(busIds.length == postsLocally.length){
                                 //flatten array to make it easier on the front end with a single loop to extract every post
                                 var flat_arr = [].concat.apply([],postsLocally);
                                 //console.log(flat_arr);
                                 console.log("after flat_arr is called");

                                 if(postsLocally.length == 0){
                                  res.send("cuurently there are no deals in your locaton");
                                 }
                                res.render('location', {items:flat_arr});

                      }
                    });
                  });
              }
            });
           

        });

  }
  else{
    res.redirect('login');
}


}





