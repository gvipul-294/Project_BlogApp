var bodyParser    =require("body-parser"),
  mongoose	  =require("mongoose"),
  methodOverride= require("method-override"),
  expressSanitizer= require("express-sanitizer"), 
  express		  =require("express"),
	 app			  =express();

// mongoose.createConnection('mongodb://localhost/admin', {
//   useMongoClient: true
//   // other options 
// });

//heroku_ mongo
if (typeof localStorage === "undefined" || localStorage === null) {
	var LocalStorage = require('node-localstorage').LocalStorage;
	localStorage = new LocalStorage('./scratch');
  }

const options = {
    useMongoClient: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: 100, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
  };
 mongoose.connect("mongodb://vipul1:*****@ds125871.mlab.com:25871/blog_app294", options);
 mongoose.connection.on('open', () => {
   console.log('Connected to mongodb server.');
  })



/* other */

// const MongoClient = require('mongodb').MongoClient;

// const MONGO_URL = 'mongodb://vipul1:******@ds125871.mlab.com:25871/blog_app294';

// MongoClient.connect(MONGO_URL, (err, db) => {  
//   if (err) {
// 	return console.log(err);
// }
// });



//APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
//MONGOOSE MODEL CONFIG
var blogSchema=new mongoose.Schema({
	title:{type:String, index:'text'},
	image :String,
	body: String,
	created: {
				type:Date, 
				default:Date.now
			 }

});
var Blog=mongoose.model("Blog", blogSchema);
/*Blog.create({
	title:"Test Blog",
	image:"https://upload.wikimedia.org/wikipedia/en/1/17/Batman-BenAffleck.jpg",
	body:"HELLO, welcome to the blog post"
});*/

var userSchema=new mongoose.Schema({
	email:String,
	psswrd :String,
	blogId:[]
	
});
var User=mongoose.model("User", userSchema);



	//WORKSPACE STARTED 

	app.post("/blogs/register", function(req, res){
		console.log("reached");
		req.body.regMod.body=req.sanitize(req.body.regMod.body)
		User.create(req.body.regMod, function(err, newUser){
			if(err){
				console.log(err);
				res.render("register");
			}
			else{
				console.log("in else block");
				console.log(newUser);
				localStorage.setItem("id",newUser._id);
				//then redirect to the index
			    // if(!(regMod[email]&&regMod[psswrd])){
				// 	//alert('Please fill email-id and password properly');
				// 	res.redirect("/blogs/register");
				// }
				// else{
				res.redirect("/blogs/preview");
				// }
			}
		});
	});

	
app.get('/',function(req,res){
	User.findOne({_id:localStorage.getItem("id")}).exec((err,result)=>{
		console.log(result);
	})
	if(localStorage.getItem("id")){
		//loggedin
		console.log("loggedin");
	}
	else{
	//not logged in
	console.log("notloggedin");
	}
	res.redirect("/blogs");
})

app.get('/blogs',function(req,res){
	console.log("inside else of blogs")
	Blog.find({}, function(err,blogs){
		if(err){
			console.log("ERROR!");
		}
		else{
			console.log("inside else of blogs")
			res.render("index",{blogs: blogs});
		}
	});
	
});

//After Login, Register (also made header2, index2 for this)
app.get('/blogs/preview',function(req,res){
	Blog.find({}, function(err,blogs){
		if(err){
			console.log("ERROR!");
		}
		else{
			res.render("index_two",{blogs: blogs});
		}
	});
	
});


app.get("/blogs/new", function(req, res){
	res.render("new");
});

//CREATE ROUTE FOR BLOGS
app.post("/blogs", function(req, res){
//create blog
	req.body.blog.body=req.sanitize(req.body.blog.body)
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}
		else{
			//then redirect to the index
			res.redirect("/blogs");
		}
	});
});


app.get("/blogs/login", function(req, res){
	res.render("login");
});

app.get("/blogs/register", function(req, res){
	res.render("register");
});





	//WORKSPACE STOPPED

	
//CREATE ROUTE FOR USERS___Really Wrong SEE same api call for blogs_ Also make one api for login

/*app.post("/blogs", function(req, res){
	//create blog
		req.body.regMod.body=req.sanitize(req.body.regMod.body)
		User.create(req.body.loginMod, function(err, newUser){
			if(err){
				res.render("register");
			}
			else{
				//then redirect to the index
				res.redirect("/blogs");
			}
		});
	});
*/


//SHOW ROUTE
app.get("/blogs/:id", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("show", {blog: foundBlog});
		}
	})
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
			Blog.findById(req.params.id, function(err, foundBlog){
				if(err){
					res.redirect("/blogs");
				}
				else{
					res.render("edit", {blog: foundBlog});
				}
			});
			
})

//UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
	req.body.blog.body=req.sanitize(req.body.blog.body)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, UpdatedBlog){
			if(err){
				res.redirect("/blogs");
			}else{
				res.redirect("/blogs/"+req.params.id);
			}
	});
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req,res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");	
		}
	})
});





// app.listen(3000);

var port = process.env.PORT || 8000;
port = 7007;

app.listen(port, function() {
    console.log("App is running on port " + port);
});