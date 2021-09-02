const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
let uniqueURL = "";
// const cookieSession = require('cookie-session');

app.set("view engine", "ejs");

// app.use(cookieSession({
//   name: 'session',
//   keys: ['key1', 'key2']
// }));

function generateRandomString() {
  uniqueURL = Math.random().toString(36).substr(2, 6);
  return uniqueURL;
}

const emailLookup = (email) => {
  for (let key in users) {
    if (email === users[key]["email"]) {
      return key;
    }
  }
  return undefined;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
  

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies["user_id"],
    users: users    };
  res.render("urls_index", templateVars);
});


//main - lists all shortURL with corresponding long ones
app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send("log in first");
  };

  const randomURL = generateRandomString();
  urlDatabase[randomURL] = {
    "longURL": req.body.longURL,
    "userID": req.cookies.user_id
  };

  console.log("under post urls", req.cookies.user_id);
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies["user_id"],
    users: users   };
  res.render("urls_index", templateVars);
  console.log(urlDatabase);
});

//register page
app.get("/register", (req, res) => {
  const templateVars = { 
  user: req.cookies["user_id"],
  users: users   };
  res.render("urls_register", templateVars)
})

//putting new users in the user database
app.post("/register", (req, res) => {
  const templateVars = { 
    user: req.cookies["user_id"],
    users: users   };
    
    const email = req.body.email;
    const password = req.body.password;
    const id = generateRandomString();
    const keyId = id;
    
  if (email === "" || password === "") {
    return res.send("404: Please enter in an email/password.")
    // res.statusCode = 404;
  } 
  
  if (!emailLookup(email)) {
    users[keyId] = {
      id,
      email, 
      password
    }
    
  } else if (emailLookup(email) !== undefined) {
    return res.send("404: This email already exists.");
    // res.statusCode = 404;
  };
  
  console.log(req.body)
  console.log(users);
  res.cookie("user_id", keyId)
  .redirect("/"); //res is a promise, res is async
  // res.render("urls_register", templateVars);
});

//get login route
app.get("/login", (req, res) => {
  const templateVars = { 
    user: req.cookies["user_id"],
    users: users   };
  res.render("urls_login", templateVars)
})

//post login route
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userKey = emailLookup(email);
  console.log("emailexists-userkey", userKey)

  if (!emailLookup(email)) {
    return res.status(403).send("Cannot find email.")
  } else if (users[userKey]["password"] === password && users[userKey]["email"] === email) {
    res.cookie("user_id", userKey)
    res.redirect("/urls")
  } else {
    return res.status(403).send("The username or password do not match.")
  }
});


//link to a page to create a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: req.cookies["user_id"],
    users: users    };
  
  console.log("cookie found")
  console.log("reqcookieuserid", req.cookies.user_id)
  if (!req.cookies.user_id) {
    console.log("cookie not found")
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

//display one single shortURL
app.get("/urls/:shortURL", (req, res) => {
  // console.log("reqbody", req.body)
  // console.log("reqparamsshortURL", req.params.shortURL)
  const shortURL = req.params.shortURL;
  // console.log("shortURL", shortURL)
  // console.log("longURL", urlDatabase[shortURL]['longURL'])
  const longURL = urlDatabase[shortURL]["longURL"];
  const templateVars = { 
    shortURL,
    longURL,
    user: req.cookies["user_id"], 
    users: users    };
    
  res.render("urls_show", templateVars);
});

//redirecting to longURL upon clicking on the shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  console.log("longURL to redirect", longURL)
  res.redirect(longURL);
});

//link to edit the shortURL
app.post("/urls/:shortURL", (req, res) => {
  // console.log("after changing the linnk")
  // console.log(longURL)
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL
  urlDatabase[shortURL]["longURL"] = longURL;
  console.log("urlDatabase after", urlDatabase)
  res.redirect("/urls");
});

//deletes a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log("after Delete:", urlDatabase);
  res.redirect("/urls")
});

//logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
    