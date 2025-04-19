const logger = require('../utils/logger'); // Импортируем логгер

const updateUserPointsAndLevel = async (userId, actionType) => {
  let pointsToAdd = 0;

  // Логируем информацию о действии
  logger.info(`Обновление баллов для пользователя ${userId}: ${actionType}`);

  switch (actionType) {
    case "eventParticipation":
      pointsToAdd = 10;
      break;
    case "donation":
      pointsToAdd = 5;
      break;
    case "createInitiative":
      pointsToAdd = 15;
      break;
    default:
      logger.warn(`Неизвестный тип действия: ${actionType}`);
      return;
  }

  const user = await User.findById(userId);
  if (!user) {
    logger.error(`Пользователь с ID ${userId} не найден`);
    return;
  }

  user.points += pointsToAdd;

  // Обновляем уровень
  if (user.points <= 30) {
    user.level = "Новичок 🐣";
  } else if (user.points <= 80) {
    user.level = "Помощник 🤝";
  } else {
    user.level = "Герой 💪";
  }

  await user.save();
  logger.info(`Баллы обновлены: ${user.points}, Уровень: ${user.level}`);
};
