const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require('cookie-parser')
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);
const { getUserByEmail, generateRandomString, addUser, urlsForUser } = require('./helpers');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookie());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
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
  const templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  if (!(req.cookies['user_id'])) {
    res.send("Please log in");
  } else {
    res.render('urls_index', templateVars)
  }
});

app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id']) {
    let templateVars = { user_id: req.cookies['user_id']}
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL: shortURL, longURL: longURL, user_id: req.cookies['user_id'] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session.userID) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const deleteURL = req.params.shortURL;
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
  const longURL = urlDatabase[id].longURL;
  if (!(req.cookies['user_id'])) {
    return res.send("Cannot access shortened URL");
  }
  res.redirect(longURL);
});

//Register
app.get("/register", (req, res) => {
  templateVars = { user_id:req.cookies['user_id']}
  res.render("user_registration", templateVars);
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
  const newUserID = generateRandomString();
  users[newUserID] = {id:newUserID, email, password}
  res.cookie('user_id', newUserID)
  res.redirect('/urls')
});

//Login & Logout
app.get("/login", (req, res) => {
  templateVars = {user_id:req.cookies['user_id']}
  res.render("user_login", templateVars);
})

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  if (!user) {
    let templateVars = {
      status: 401,
      message: 'Email cannot be found',
      user: users[req.session.user_id]
    }
    res.status(401);
    res.render("user_login", templateVars)
  } else if (!bcrypt.compareSync(password, user.password)) {
    let templateVars = {
      status: 401,
      message: 'Password incorrect',
      user: users[req.session.user_id]
    }
    res.status(401);
    res.render("urls_login", templateVars);
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls')
  }
  bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
});