var ObjectId = require('mongodb').ObjectID
eports.findItemsByUserId = function(req, res) {
   var userID = req.session.email;

    var usersObjectID = new ObjectId(userID)

    db.collection('users', function(err, usersColl) {
        usersColl.find({'id':usersObjectID}).toArray(function (err, user) {

        for (var i = 0; i < user.length; i++) {
                var businessIDS = user[i].following;//all business id's

                db.collection('business', function(err, businessColl) {
                    businessColl.find({'id':businessIDS}).toArray(function (err, business) {

                for (var b = 0; b < business.length; b++) {
                        var postsIDS = business[i].posts;//all posts id's

                        db.collection('posts', function(err, postsColl) {
                            postsColl.find({'id':postsIDS}).toArray(function (err, followedPosts) {



   router.post('/pickClassStudents', function(req, res, next) {
    
    var db = req.app.settings.db;

     var pickYear = req.body.yr;
     var pickProg = req.body.prg;

     var studentsResponse = new Array();

    db.collection('programYear', function(err, classCollection) {
        if (err) {
            throw err;
        }

      for (var i = 0; i < pickProg.length; i++) {
                    pickProg[i]

                        classCollection.find({ $and: [ {year:pickYear}, {name:pickProg[i]} ] }).sort('_id', 'desc').toArray(function(err, studentsList) {
                        
                            if (err) {throw err};
                            studentsResponse.push(studentsList);
                             if(pickProg.length === studentsResponse.length){

                                res.json(studentsResponse);
                                console.log(studentsResponse);

                            }
                        
                        });
                    }


    });    
});