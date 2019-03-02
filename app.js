//Requring necessary modules
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var firebase = require("firebase");
const FieldValue = require('firebase-admin').firestore.FieldValue;

//Declaring Variable

var email=""; //Logged in email will be stored
var userId;//user id will be stored here
var todos=[];//The todolist will be stored here

//Setting view engine
app.set("view engine", "ejs");
//Setting static dir spot
app.use(express.static(__dirname + "/public"));

//Initializing FireBase
var config = {
  apiKey: "AIzaSyBugLOE6Wn2Tgbyod1vMQ3o2fr7_02Dfrc",
  authDomain: "fir-project-74bf5.firebaseapp.com",
  databaseURL: "https://fir-project-74bf5.firebaseio.com",
  projectId: "fir-project-74bf5",
  storageBucket: "fir-project-74bf5.appspot.com",
  messagingSenderId: "844782657750"
};
firebase.initializeApp(config);

// Reference to the database service
var db = firebase.firestore();

// Enableing body parser
app.use(bodyParser.urlencoded({ extended: true }));


//Authentication

//Routing starts here

//Get routes
app.get("/",function(req,res){
//Render Login page
  res.render("index");
});

app.get("/todo",isLoggedIn,function(req,res){
  var user = firebase.auth().currentUser;
  userId=user.uid;
  //check if user already has todo list or not 
  db.collection("todo").doc(userId).get().then(function(doc) {
    if(doc.exists){
  //they have it load their data
  db.collection("todo").doc(userId)
  .onSnapshot(function(doc) {
  console.log("Called Objects"+doc.data().todos)
  todos=doc.data().todos;
    
  
  
  })
}
else{
  //They do not have any todos
  todos=[];
}
    
  setTimeout(() => {

    res.render("todo",{email:email,todos:todos});
    
  }, 3000); 
  });

 
});

app.get("/register",function(req,res){
  //Get register page
  res.render("register");
});

app.get("/logout",isLoggedIn,function(req, res) {
  //Logging out
  firebase.auth().signOut().then(function() {
    console.log('Signed Out');
    email="";
    res.render("index");
  }
  )
  .catch(function(error) {
    console.error('Sign Out Error', error);res.redirect("back");})
});

//Delete route
app.get("/todo/delete/:index",isLoggedIn,function(req,res){

  //Getting the necessary info
 var arrayIndex = req.params.index;
 console.log(arrayIndex);
 console.log(todos.id);
 
  //Deleting todo
  db.collection("todo")
  .doc(userId)
  .update({
    todos: todos.filter(todo => todo.todo !== arrayIndex)
    

}).catch(function(error) {
  console.error("Error writing document: ", error);
});
console.log("todos")
res.redirect("/todo");

})

//Status update route
app.get("/todo/status/:index/:status",isLoggedIn,function(req,res){

  //Getting the necessary info
 var arrayIndex = req.params.index;
 var status = req.params.status;
 console.log(arrayIndex);
 console.log(status);
 
  //Deleting todo
  db.collection("todo")
  .doc(userId)
  .update({
    todos: todos.filter(todo => todo.todo !== arrayIndex)
    

}).catch(function(error) {
  console.error("Error writing document: ", error);
});

//Adding Todo
if(status=="true"){
  db.collection("todo")
  .doc(userId)
  .update({
    email:email,
    todos: firebase.firestore.FieldValue.arrayUnion({status:false,todo:arrayIndex})
  })
  .then(function(){ res.redirect("/todo");})
  .catch(function(error) {
    console.error("Error writing document: ", error);
  });
}
else{
  db.collection("todo")
  .doc(userId)
  .update({
    email:email,
    todos: firebase.firestore.FieldValue.arrayUnion({status:true,todo:arrayIndex})
  })
  .then(function(){ res.redirect("/todo");})
  .catch(function(error) {
    console.error("Error writing document: ", error);
  });
}


})
//Remove all checked route
app.get("/todo/removeall",isLoggedIn,function(req,res){

   

  //Deleting todos with status false/checked
  db.collection("todo")
  .doc(userId)
  .update({
    todos: todos.filter(todo => todo.status !== false)
    

}).catch(function(error) {
  console.error("Error writing document: ", error);
});

res.redirect("/todo");

})
//Get's edit Page
app.get("/todo/edit/:todo",isLoggedIn,function(req,res){
var todo = req.params.todo;

res.render("edit",{todo:todo})

})



//POST routes

app.post("/register",function(req,res){
  //Getting the data from input field
  var mail = req.body.email;
  var pass = req.body.password;
  //Creating the account
  firebase.auth().createUserWithEmailAndPassword(mail, pass).then(function(){res.redirect("/");}).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // Redirecting
    console.log(errorCode+"=>"+errorMessage);
    res.redirect("back");
  });
  
});

app.post("/",function(req,res){
 //Getting the data from input field
  var mail = req.body.email;
  var pass = req.body.password;

 
//Logging in users
 firebase.auth().signInWithEmailAndPassword(mail, pass).then(function(user) { email=mail; res.redirect("/todo"); })
 .catch(function(error){console.log(error); res.redirect("back");});

  

 
});

app.post("/todo",isLoggedIn,function(req,res){
  //Getting the necessary info
  var user = firebase.auth().currentUser;
  var todo = req.body.todoin;
  userId=user.uid;
  db.collection("todo").doc(userId).get().then(function(doc) {
    if(doc.exists)
    {
      //If other todos exsist add new todo
      db.collection("todo")
      .doc(userId)
      .update({
        email:email,
        todos: firebase.firestore.FieldValue.arrayUnion({status:true,todo:todo})
      })
      .then(function(){ res.redirect("/todo");})
      .catch(function(error) {
        console.error("Error writing document: ", error);
      });

    }
    else{
      //If no todos exsist make the format then add todos
      db.collection("todo")
      .doc(userId)
      .set({
        email: email,
        todos: [{ status: true, todo: todo }]
      })
      .then(function() {
        console.log("Document successfully written!");
        res.redirect("/todo");
      })
      .catch(function(error) {
        console.error("Error writing document: ", error);
      });
  

    }



});
});

//Editing route

app.post("/todo/edit/:todo",isLoggedIn,function(req,res){

   //Getting the necessary info
   var arrayIndex = req.params.todo;
  var newtodo = req.body.todoin;
  
  //Delete the object that is to be edited
 
 
  //Deleting todo
  db.collection("todo")
  .doc(userId)
  .update({
    todos: todos.filter(todo => todo.todo !== arrayIndex)
    

}).catch(function(error) {
  console.error("Error writing document: ", error);
});
//Adding edited todo
db.collection("todo")
.doc(userId)
.update({
  email:email,
  todos: firebase.firestore.FieldValue.arrayUnion({status:true,todo:newtodo})
})
.then(function(){ res.redirect("/todo");})
.catch(function(error) {
  console.error("Error writing document: ", error);
});

})



//Error route
app.get("*",function(req,res){

  //No page is found rendering default error
  res.render("404");
});


//Creating connection here
  app.listen(3000, function(req, res) {
    console.log("Server Up");
  });


  //Middleware

  function isLoggedIn(req,res,next){
    //Checking if user is logged it
    var user = firebase.auth().currentUser;
    if (user !== null) {
      req.user = user;
      next();
    } else {
      res.redirect('/');
    }
  }