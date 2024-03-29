const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require('cookie-session')
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookie({
  name: 'session',
  keys: ['userId']
}));

const { generateRandomString, urlsForUser, getUserByEmail, addUser, verifyShortURL, currentUser } = require("./helpers");

const { urlDatabase, users } = require("./database")

//Redirects users to /login or /urls depending if they are logged in
app.get("/", (req, res) => {
  const user = currentUser(req.session.user_id, users);
  if (!user) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

//Gets to the URL page and list URLs
app.get("/urls", (req, res) => {
  const user =  currentUser(req.session.user_id, users);
  if (!user) {
    res.send("Please log in");
  } else {
    const templateVars = { 
      urls: urlsForUser(user, urlDatabase), 
      user_id: req.session.user_id
    };
    res.render('urls_index', templateVars)
  }
});

//Creates new URL page
app.get("/urls/new", (req, res) => {
  const user =  currentUser(req.session.user_id, users);
  if (user) {
    let templateVars = { user_id: req.session.user_id};
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//Gets Users all of the URLs they own
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id; 
  const user =  currentUser(req.session.user_id, users);
  if(verifyShortURL(shortURL,urlDatabase)){
    if (user !== urlDatabase[shortURL].userID){
      return res.send("Does not belong to you ");
    } else {
      const longURL = urlDatabase[shortURL].longURL;
      let templateVars = { shortURL: shortURL, longURL: longURL, userID: req.session.user_id};
      res.render('urls_show', templateVars);
    }
  } else{
    return res.send("URL does not exist");
  }
  
});

//Users are able to access longURL website with shortURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  if (verifyShortURL(id, urlDatabase)) {
    const longURL = urlDatabase[id].longURL;

    if (longURL.startsWith("http://") || longURL.startsWith("https://")) {
      res.redirect(longURL);
      
    } else {
      res.redirect(`http://${longURL}`);
    }

  } else {
    return res.send("Error: URL does not exist");
  }
});

//Register
app.get("/register", (req, res) => {
  const user =  currentUser(req.session.user_id, users); 
  templateVars = { user_id:req.session.user_id}
  res.render("user_registration", templateVars);
});

//Login & Logout
app.get("/login", (req, res) => {
  const user =  currentUser(req.session.user_id, users); 
  const user_id = req.session.user_id
  const templateVars = {user_id}
  res.render("user_login", templateVars);
});

//Users are able to add longURLs with shortURLs
app.post("/urls", (req, res) => {
  const user = currentUser(req.session.user_id,users);
  if (user) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: user
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

//Users are able to delete URLs
app.post("/urls/:id/delete", (req, res) => {
  const deleteURL = req.params.id;
  const userId = req.session.user_id;

  if (!userId) {
    return res.send("Please login")
  }

  if (!urlDatabase[deleteURL]) {
    return res.send("This URL does not exist")
  }

  const user = currentUser(req.session.user_id, users);

  if (user !== urlDatabase[req.params.id].userID) {
    return res.send("You do not have the authorization to edit this URL.")
  }

  delete urlDatabase[deleteURL];
  res.redirect('/urls')
});

//Users are able to edit their URLs
app.post("/urls/:id", (req, res) => {
  const editURL = req.params.id;
  const userId = req.session.user_id;

  if (!userId) {
    return res.send("Please login")
  }

  if (!urlDatabase[editURL]) {
    return res.send("This URL does not exist")
  }

  const user = currentUser(req.session.user_id, users);

  if (user !== urlDatabase[req.params.id].userID) {
    return res.send("You do not have the authorization to edit this URL.")
  }
  
  urlDatabase[editURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

//Registers new users
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (email === '' || password === '') {
    return res.status(400).send('Please enter a valid email or password')
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send('The email you have entered is already registered')
  }

  const encrpytedUser = {
    email,
    password: bcrypt.hashSync(password, 10)
  }
  const newUsers = addUser(encrpytedUser, users);

  req.session.user_id = newUsers.userID
  res.redirect('/urls')
});

//Login user to access URLs
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  
  if (userEmail === '') {
    return res.send('Please enter email')
  }
  if (password === '') {
    return res.send('Please enter password')
  }
  let userObject = getUserByEmail(userEmail, users)
  if (userObject === null) {
    return res.send('The user does not exist')
  }
  if (!bcrypt.compareSync(password, userObject.password)) {
    return res.send('Please enter the correct password')
  }
  req.session.user_id = userObject.userID;
  res.redirect('/urls');
});

//Deletes cookies after the user logs out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});