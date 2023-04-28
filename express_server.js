const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require('cookie-session')
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookie({
  name: 'session',
  keys: ['userId']
}));

const { generateRandomString, urlsForUser, getUserByEmail, addUser } = require("./helpers");

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
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user_id: req.session.user_id };
  if (!(req.session.user_id)) {
    res.send("Please log in");
  } else {
    res.render('urls_index', templateVars)
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { user_id: req.session.user_id}
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL: shortURL, longURL: longURL, user_id: req.session.user_id };
  res.render("urls_show", templateVars);
});

//User ID
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (!(req.session.user_id)) {
    return res.send("Cannot access shortened URL");
  }
  res.redirect(longURL);
});

//Register
app.get("/register", (req, res) => {
  templateVars = { user_id:req.session.user_id}
  res.render("user_registration", templateVars);
});

//Login & Logout
app.get("/login", (req, res) => {
  const user_id = req.session.user_id
  if (user_id) {
    return res.redirect('/urls')
  }
  const templateVars = {user_id}
  res.render("user_login", templateVars);
});


app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userId: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const deleteURL = req.params.id;
  delete urlDatabase[deleteURL];
  res.redirect('/urls')
});

app.post("/urls/:id/edit", (req, res) => {
  const editURL = req.params.id;
  urlDatabase[editURL].longURL = req.body.longURL;
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
  const newUserID = generateRandomString();
  users[newUserID] = {id:newUserID, email, password}
  req.session.user_id = newUserID 
  console.log(users)
  res.redirect('/urls')
});

app.post("/login", (req, res) => {
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
  req.session.user_id = userObject.id;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect('/urls')
});