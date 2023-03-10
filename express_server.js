const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require('cookie-parser')

app.set("view engine", "ejs");
app.use(cookie());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.use(express.urlencoded({ extended: true }));

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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: req.cookies['user_id']}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL: shortURL, longURL: longURL, user_id: req.cookies['user_id'] };
  console.log(templateVars);
  console.log(req.params)
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  templateVars = { user_id:req.cookies['user_id']}
  res.render("user_registration", templateVars);
  res.redirect('/urls')
})

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

app.post("/login", (req, res) => {
  const username = req.body.username;
  if (username) {
    res.cookie('username', username);
  }
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === '') {
    console.log('Please enter an email')
  } else if (password === '') {
    console.log('Please enter your password')
  }
  users = generateRandomString(req.body)
  res.cookie('user_id', users.id)
  res.redirect('/urls')
})



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