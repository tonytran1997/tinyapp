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

module.exports = {getUserByEmail, generateRandomString, addUser, urlsForUser}