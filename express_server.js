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
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies['username']}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL: shortURL, longURL: longURL, username: req.cookies['username'] };
  console.log(templateVars);
  console.log(req.params)
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
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

app.post("/login", (req, res) => {
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
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