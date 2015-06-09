
function follow() {

  var busId = $(event.target).val();

  var buttonClicked = $this = $(event.target);
  
  //alert(buttonClicked.text());
  
  $.ajax({
    type: "post",
    url: "/follow",
    data: {id:busId} 
  }).success(function( msg ) {
    console.log( "Received server response: " + msg.follow );
      //alert("success");
      //$this.html("Following");
      buttonClicked.text(msg.follow);

    }).fail(function(msg){
      console.log("Ajax fail: " + JSON.stringify(msg));
    
    });
  }

 function checkEmail(){

  var email = $('#email').val();
  //alert("email: "+ email);

  $.ajax({
    type: "post",
    url: "/checkEmail",
    data: {checkEmail:email} 
     }).success(function( msg ) {
    console.log( "Received server response: " + msg.follow );
     $('#email-validate').text("Sorry, that email is already used please choose another").css("color", "red");


    });
  }
function addClick(){
  

  var postId = $('#postId').val();

  //alert(postId);

    $.ajax({
    type: "post",
    url: "/incrementClickCount",
    data: {id:postId} 
     }).success(function( msg ) {
    console.log( "Received server response: " + msg.follow );
     //alert("dfsdfvkjabs");


    });

}

function incrementViewCount (){
    var postId = $('#postId').val();

   

    $.ajax({
    type: "post",
    url: "/incrementViewCount",
    data: {id:postId} 
     }).success(function( msg ) {
    console.log( "Received server response: " + msg.follow );
     //alert("view count incremented");
    });
}

function save() {

  var postId = $(event.target).val();

  var buttonClicked = $this = $(event.target);
  
 
  $.ajax({
    type: "post",
    url: "/like",
    data: {id:postId} 
  }).success(function( msg ) {
    console.log( "Received server response: " + msg.follow );
      //alert("success");
      //$this.html("Following");
      buttonClicked.text(msg.follow);

    }).fail(function(msg){
      console.log("Ajax fail: " + JSON.stringify(msg));

      
    });
  }



function followCheck (){
  
}  



function gpsData(lon, lat) {

console.log("gps hit front end");
     var lon = lon;
     var lat = lat;

    console.log(lat);
    console.log(lon);   

     $.ajax({
        type: 'GET',
        url: "/processGps",
        dataType: 'json',
        data: { lat: lat, lon:lon }
    }).done(function(response) {
        console.log(response);

    });
     
}


