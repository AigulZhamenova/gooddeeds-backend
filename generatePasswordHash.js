const bcrypt = require('bcrypt');

const password = 'akaya123'; // Введённый пароль, который нужно проверить

// Генерация соли и хэширование пароля
bcrypt.genSalt(10, (err, salt) => {
  if (err) console.log(err);
  bcrypt.hash(password, salt, (err, hash) => {
    if (err) console.log(err);
    console.log('Generated hash:', hash); // Это и будет твой новый хэш

    // Пример сравнения с сохранённым хэшем из базы данных
    const storedHash = '$2b$10$rG5UkE97SlvVVPSo8Vn5/eIQApNI8r69qsMQsWVQ6QK8bJb0g6dGO'; // Хэш из базы данных
    bcrypt.compare(password, storedHash, (err, result) => {
      if (err) console.log(err);
      console.log('Password match result:', result); // Это вернёт true, если пароли совпадают
    });
  });
});
