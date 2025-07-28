const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const USERS_FILE = 'users.json';
const ADMIN_PASSWORD = 'enjoy777';

let users = [];
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (users.find(u => (u.myCodes || []).includes(code)));
  return code;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/register', (req, res) => {
  const { name, email, instagram, city, birthdate, referral, captcha } = req.body;

  if (parseInt(captcha) !== 5) {
    return res.send('Zlá CAPTCHA. Skús znova.');
  }

  if (users.find(u => u.email === email)) {
    return res.send('Tento email je už registrovaný.');
  }

  const referringUser = users.find(u => (u.myCodes || []).includes(referral) || referral === 'ENJOYGUESTLIST');
  if (!referringUser && users.length >= 50) {
    return res.send('Referral kód je neplatný alebo už bol vyčerpaný.');
  }

  const myCodes = [generateCode(), generateCode()];
  users.push({ name, email, instagram, city, birthdate, referralCodeUsed: referral, myCodes });
  saveUsers();

  res.send(`<h2>Ďakujeme, ${name}!</h2>
    <p>Tu sú tvoje 2 referral kódy – pošli ich kamarátom:</p>
    <ul><li>${myCodes[0]}</li><li>${myCodes[1]}</li></ul>
    <p><a href="/">Späť</a></p>`);
});

app.get('/admin', (req, res) => {
  const password = req.query.pass;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).send('Nepovolený prístup');
  }

  let html = '<h1>Zoznam registrovaných</h1><table border="1" cellpadding="5"><tr><th>#</th><th>Meno</th><th>Email</th><th>Instagram</th><th>Mesto</th><th>Dátum narodenia</th><th>Referral použil</th><th>Jeho kódy</th></tr>';
  users.forEach((u, i) => {
    html += `<tr><td>${i + 1}</td><td>${u.name}</td><td>${u.email}</td><td>${u.instagram}</td><td>${u.city}</td><td>${u.birthdate}</td><td>${u.referralCodeUsed}</td><td>${(u.myCodes || []).join(', ')}</td></tr>`;
  });
  html += '</table>';
  res.send(html);
});

app.listen(PORT, () => console.log(`Server beží na porte ${PORT}`));