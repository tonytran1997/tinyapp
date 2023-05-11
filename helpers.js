const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
}

const addUser = (newUser, users) => {
  const newUserID = generateRandomString();
  newUser.userID = newUserID
  users[newUserID] = newUser;
  return newUser;
};

const urlsForUser = (id, database) => {
  const userUrls = {};
  
  for (let shortURL in database) {
    if (database[shortURL].userId === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls
};

const verifyshortURL = (URL, database) => {
  return database[URL];
}

const currentUser = (curr, database) => {
  for (let ids in database) {
    if (curr === ids) {
      return database[ids].email;
    }
  }
};

module.exports = {getUserByEmail, generateRandomString, addUser, urlsForUser, verifyshortURL,currentUser};