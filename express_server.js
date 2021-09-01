const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
let uniqueURL = "";

app.set("view engine", "ejs");

function generateRandomString() {
  uniqueURL = Math.random().toString(36).substr(2, 6);
  return uniqueURL;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    username: req.cookies["username"]  };
  res.render("urls_index", templateVars);
});

//main - lists all shortURL with corresponding long ones
app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]  };
  res.render("urls_index", templateVars);
  console.log(urlDatabase);
});

//link to a page to create a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//display one single shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

//redirecting to longURL upon clicking on the shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//link to edit the shortURL
app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  console.log(longURL)
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
})

//deletes a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log("after Delete:", urlDatabase);
  res.redirect("/urls")
})

//login route
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

//logout route
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//register page
app.get("/register", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"] };
  res.render("urls_register", templateVars)
})

//putting new users in the user database
app.post("/register", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"] };

  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const keyId = id;

  if (email === "" || password === "") {
    console.log("did not have email or pass")
    return res.redirect("/register");

  } else {
    users[keyId] = {
      id,
      email, 
      password
    }
  };

  console.log(req.body)
  console.log(users);
  res.cookie("user_id", keyId);
  res.redirect("/");
  // res.render("urls_register", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
