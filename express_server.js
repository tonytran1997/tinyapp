const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require('cookie-parser')

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
  if(!templateVars) {
    res.send("Please login to see the URLs")
  } else {
    res.render('urls_index', templateVars)
  }
  //const templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  //res.render("urls_index", templateVars);
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
  //console.log(templateVars);
  //console.log(req.params)
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
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
    res.send("Cannot access shortened URL");
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
    res.status(400).send('Please enter an email')
  } else if (password === '') {
    res.status(400).send('Please enter your password')
  } else if (!getUserByEmail(email, users)) {
    res.status(400).send('The email you have entered is already registered')
  }
  newUsers = addUser(req.body)
  res.cookie('user_id', users.id)
  res.redirect('/urls')
});

//Login & Logout
app.get("/login", (req, res) => {
  templateVars = {user_id:req.cookies['user_id']}
  res.render("user_login", templateVars);
})

app.post("/login", (req, res) => {
  const user_id = req.body.user.id;
  if (users[req.body.user_id]) {
    res.cookie('user_id', users.id);
  }
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
});

//Functions
const generateRandomString = () => {
  const alphabet = 'abcdefghigklmnopqrstuvwxyz';
  const numbers = '1234567890';
  const alphaNumbric = alphabet + numbers;

  let index = Math.round(Math.random() * 100);
  if (index > 35) {
    while (index > 36) {
      index = Math.round(Math.random() * 100);
    }
  }
  return alphaNumbric[index];
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
  const newUserID = generateRandomString();
  newUser.id = newUserID
  users[newUserID] = newUser;
  return newUser;
};

const urlsForUser = (id, database) => {
  let userUrls = {};

  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls
};