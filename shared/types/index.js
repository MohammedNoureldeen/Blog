const userTypes = require('./user.types');
const postTypes = require('./post.types');
const apiTypes = require('./api.types');

module.exports = {
  ...userTypes,
  ...postTypes,
  ...apiTypes,
};
