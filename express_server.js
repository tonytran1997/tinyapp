const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require('cookie-parser')
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookie());
//console.log("testing")
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW",
  },
};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlsForUser = (userId, database) => {
  const userURLS = {};
  
  for (const key in database) {
    if (database[key].userId === userId) {
      userURLS[key] = database[key];
    }
  }
  return userURLS;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};


const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

const addUser = newUser => {
  const newuserId = generateRandomString();
  newUser.id = newuserId
  users[newuserId] = newUser;
  return newUser;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//URLs
app.get("/urls", (req, res) => {
  const userId = req.cookies['userId'];
  const userURLS = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: userURLS, userId: userId };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { userId: req.cookies['userId']}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL: shortURL, longURL: longURL, userId: req.cookies['userId'] };
  console.log(templateVars);
  console.log(req.params)
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log("This is req.body -->", req.body); // Log the POST request body to the console
  const longURL = req.body.longURL;
  const userId = req.cookies['userId'];
  const shortURL = generateRandomString()

  urlDatabase[shortURL] = {longURL, userId}
  res.redirect('/urls'); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  const deleteURL = req.params.id;
  delete urlDatabase[deleteURL];
  res.redirect('/urls')
});

app.post("/urls/:id/edit", (req, res) => {
  const editURL = req.params.id;
  urlDatabase[editURL] = req.body.longURL;
  res.redirect('/urls')
});

//User ID
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

//Register
app.get("/register", (req, res) => {
  templateVars = { userId:req.cookies['userId']}
  res.render("user_registration", templateVars);
  res.redirect('/urls')
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === '') {
    return res.status(400).send('Please enter an email')
  } else if (password === '') {
     return res.status(400).send('Please enter your password')
  } else if (getUserByEmail(email, users)) {
     return res.status(400).send('The email you have entered is already registered')
  }
  let newUsers = addUser(req.body)
  res.cookie('userId', newUsers.id)
  res.redirect('/urls')
});

//Login & Logout
app.get("/login", (req, res) => {
  const userId = req.cookies['userId']
  if (userId) {
    return res.redirect('/urls')
  }
  const templateVars = {userId}
  res.render("user_login", templateVars);
});

app.post("/login", (req, res) => {
  console.log(req.body)
  const useremail = req.body.email;
  const password = req.body.password;
  if (useremail === '') {
    return res.send('Please enter email')
  }
  if (password === '') {
    return res.send('Please enter password')
  }
  let userObject = getUserByEmail(useremail, users)
  if (userObject === null) {
    return res.send('The user does not exist')
  }
  if (!bcrypt.compareSync(password, userObject.password)) {
    return res.send('Please enter the correct password')
  }
  res.cookie('userId', userObject.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls')
});