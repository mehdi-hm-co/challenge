
const InstagramClient = require('./core/client')
const User = require('./models/user')
const { ArgumentParser } = require('argparse');

const parser = new ArgumentParser({
  description: 'Instagram Login: node index.js -u test -p test'
});

async function main() {
  parser.add_argument('-u', '--username')
  parser.add_argument('-p', '--password')
  const { username, password } = parser.parse_args();
  if (username && password) {
    const user = new InstagramClient(new User(
      username, password // 'mohammad_rey110', 'mohammadrey110'
    ));
    await user.login()
    await user.getProfile();
  }
}

main();

