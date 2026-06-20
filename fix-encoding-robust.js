const fs = require('fs');

const hexMap = [
  'e282b9', // ₹
  'e28094', // —
  'c2b7', // ·
  'e280a6', // …
  'f09f938b', // 📋
  'f09f92b0', // 💰
  'e2ad90', // ⭐
  'f09f9a80', // 🚀
  'f09f948d', // 🔍
  'f09f93a6', // 📦
  'e28fb3', // ⏳
  'f09f9381', // 📁
  'e296b2', // ▲
  'f09f92ac', // 💬
  'f09f9494', // 🔔
  'f09f91a8e2808df09f92bc', // 👨‍💼
  'f09f9484', // 🔄
  'f09f93ad', // 📫
  'f09f9ba0efb88f', // 🛠️
  'f09f8ea7', // 🎧
  'f09f93a3', // 📢
  'f09f939d', // 📝
  'f09f8e99efb88f', // 🎙️
  'f09f92bb', // 💻
  'f09f9385', // 📅
  'f09f938a', // 📊
  'f09f9793efb88f', // 🗓️
  'f09fa49d', // 🤝
  'f09f8eaa', // 🎪
  'f09f95b5', // 🕵
  'f09f8ea8', // 🎨
  'f09f96bc', // 🖼
  'e296a6', // ▦
  'f09f9497', // 🔗
  'f09f9181', // 👁
  'f09f9791efb88f', // 🗑️
  'e29c8fefb88f', // ✏️
  'e2809c', // “
  'e2809d', // ”
  'e28098', // ‘
  'e28099', // ’
  'f09f8c90', // 🌐
  'f09f8f86', // 🏆
  'f09f93a5', // 📥
  'f09f918d' // 👍
];

const cp1252ToChar = new Array(256);
for(let i=0; i<256; i++) cp1252ToChar[i] = String.fromCharCode(i);
cp1252ToChar[0x80] = '\u20AC'; cp1252ToChar[0x82] = '\u201A';
cp1252ToChar[0x83] = '\u0192'; cp1252ToChar[0x84] = '\u201E';
cp1252ToChar[0x85] = '\u2026'; cp1252ToChar[0x86] = '\u2020';
cp1252ToChar[0x87] = '\u2021'; cp1252ToChar[0x88] = '\u02C6';
cp1252ToChar[0x89] = '\u2030'; cp1252ToChar[0x8A] = '\u0160';
cp1252ToChar[0x8B] = '\u2039'; cp1252ToChar[0x8C] = '\u0152';
cp1252ToChar[0x8E] = '\u017D'; cp1252ToChar[0x91] = '\u2018';
cp1252ToChar[0x92] = '\u2019'; cp1252ToChar[0x93] = '\u201C';
cp1252ToChar[0x94] = '\u201D'; cp1252ToChar[0x95] = '\u2022';
cp1252ToChar[0x96] = '\u2013'; cp1252ToChar[0x97] = '\u2014';
cp1252ToChar[0x98] = '\u02DC'; cp1252ToChar[0x99] = '\u2122';
cp1252ToChar[0x9A] = '\u0161'; cp1252ToChar[0x9B] = '\u203A';
cp1252ToChar[0x9C] = '\u0153'; cp1252ToChar[0x9E] = '\u017E';
cp1252ToChar[0x9F] = '\u0178';

function getMojibake(hexStr) {
  let res = '';
  for(let i=0; i<hexStr.length; i+=2) {
    const byte = parseInt(hexStr.substring(i, i+2), 16);
    res += cp1252ToChar[byte];
  }
  return res;
}

const files = [
  'app/dashboard/page.tsx',
  'app/vendor/page.tsx',
  'app/admin/marketing/page.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    for (const hex of hexMap) {
      const bad = getMojibake(hex);
      const good = Buffer.from(hex, 'hex').toString('utf8');
      content = content.split(bad).join(good);
    }
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed ' + file);
    } else {
      console.log('No changes needed in ' + file);
    }
  }
}
