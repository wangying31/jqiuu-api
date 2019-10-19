var IS_PROD = ['production', 'prod'].indexOf(process.argv.slice(2)) > -1
console.log('.......IS_PROD.........'+IS_PROD)
var config = {
  session: {
    secrets: 'salt'
  },
  // root: 'http://localhost:3000'
  root: IS_PROD ? 'http://47.106.102.59:3000' : 'http://localhost:3000'
};

module.exports = config;
