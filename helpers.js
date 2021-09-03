
//implementing random string function for creation of shortURL string
const generateRandomString = () => {
  let uniqueURL = "";
  uniqueURL = Math.random().toString(36).substr(2, 6);
  return uniqueURL;
};

//implementing email look up function to determine whether the email exists.
const getUserByEmail = (email, users) => {
  for (let key in users) {
    if (email === users[key]["email"]) {
      return key;
    }
  }
  return undefined;
};

//implementing filter of the url database based on specific userIDs.
const urlsForUser = (id, urlDatabase) => {
  let urlDatabaseFilter = {};

  for (let key in urlDatabase) {
    if(Object.values(urlDatabase[key]).indexOf(id) > -1) {
      urlDatabaseFilter[key] = urlDatabase[key]
    }
  }
  return urlDatabaseFilter;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};