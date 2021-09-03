const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const { generateRandomString, getUserByEmail, urlsForUser} = require("./helpers");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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
  
//main page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//main page display
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }

  let filteredURLS = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: filteredURLS,
    user: req.session.user_id,
    users: users    };

  res.render("urls_index", templateVars);
});


//main - lists all shortURL with corresponding long ones
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("log in first");
  }

  const randomURL = generateRandomString();
  urlDatabase[randomURL] = {
    "longURL": req.body.longURL,
    "userID": req.session.user_id
  };

  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: req.session.user_id,
    users: users   };
  res.render("urls_index", templateVars);
  console.log("urlDatabase:", urlDatabase);
});

//register page
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
    users: users   };
  res.render("urls_register", templateVars);
});

//putting new users in the user database
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const keyId = id;
  const hashedPassword = bcrypt.hashSync(password, 10);
    
  if (email === "" || password === "") {
    return res.send("404: Please enter in an email/password.");
  }
  if (!getUserByEmail(email, users)) {
    users[keyId] = {
      id,
      email,
      password: hashedPassword
    };
    
  } else if (getUserByEmail(email, users) !== undefined) {
    return res.send("404: This email already exists.");
    // res.statusCode = 404;
  }
  
  console.log("Users database:", users);
  req.session.user_id = keyId;
  res.redirect("/"); //res is a promise, res is async
  
});

//get login route
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
    users: users   };
  res.render("urls_login", templateVars);
});

//post login route
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userKey = getUserByEmail(email, users);
  
  if (!getUserByEmail(email, users)) {
    return res.status(403).send("Cannot find email.");

  } else if (bcrypt.compareSync(password, users[userKey]["password"]) && users[userKey]["email"] === email) {
    req.session.user_id = userKey;
    res.redirect("/urls");
    
  } else {
    return res.status(403).send("The username or password do not match.");
  }
});


//link to a page to create a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
    users: users    };
  
  if (!req.session.user_id) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

//display one single shortURL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("This tinyApp link does not exist.");
    
  } else if (!req.session.user_id) {
    return res.status(403).send("log in first before editing");
    
  } else if (req.session.user_id !== urlDatabase[shortURL]["userID"])
    return res.status(403).send("You are not the owner of this link.");
  
  const longURL = urlDatabase[shortURL]["longURL"];
  const templateVars = {
    shortURL,
    longURL,
    user: req.session.user_id,
    users: users    };

  res.render("urls_show", templateVars);
});

//redirecting to longURL upon clicking on the shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];

  res.redirect(longURL);
  
});

//link to edit the shortURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  urlDatabase[shortURL]["longURL"] = longURL;
  console.log("urlDatabase after editing", urlDatabase);
  res.redirect("/urls");
});

//deletes a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("log in first before deleting");
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log("urlDatabase after delete:", urlDatabase);
  res.redirect("/urls");
});

//logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
    