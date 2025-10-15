// api/messages.js - Rotating Motivational Messages

/**
 * Message categories with different message sets
 * Premium users get access to exclusive motivational messages
 */
const MESSAGE_CATEGORIES = {
  START_SESSION: 'start_session',
  END_SESSION: 'end_session',
  BREAK_TIME: 'break_time',
  STREAK_MILESTONE: 'streak_milestone',
  DAILY_MOTIVATION: 'daily_motivation',
  PREMIUM_EXCLUSIVE: 'premium_exclusive',
};

/**
 * Free tier messages
 */
const FREE_MESSAGES = {
  start_session: [
    "Let's crush this study session! 🎯",
    "Time to focus! You've got this! 💪",
    "Ready to make progress? Let's go! 🚀",
    "Focus mode activated! 🔥",
    "Another step towards your goals! ⭐",
    "Let's make this session count! 📚",
    "Time to dive deep into learning! 🌊",
    "Your future self will thank you! 🙌",
  ],
  end_session: [
    "Great work! You stayed focused! 🎉",
    "Session complete! You're making progress! ✅",
    "Well done! Keep up the momentum! 💯",
    "Another session in the books! 📖",
    "You're on fire! 🔥",
    "Excellent focus! Time for a break! ☕",
    "Mission accomplished! 🎯",
    "You nailed it! 🌟",
  ],
  break_time: [
    "Time for a well-deserved break! 😌",
    "Stretch, hydrate, and relax! 💧",
    "Take a breather, you earned it! 🌸",
    "Rest up for the next session! ☕",
    "Quick break to recharge! ⚡",
    "Step away from the desk! 🚶",
    "Refresh your mind! 🧘",
    "Break time! Don't forget to move! 🤸",
  ],
  streak_milestone: [
    "🔥 You're on a streak! Keep it going!",
    "🎯 Consistency is key! Great job!",
    "⭐ You're building amazing habits!",
    "💪 Your dedication is inspiring!",
    "🚀 Streak milestone reached!",
  ],
  daily_motivation: [
    "Every study session brings you closer to your goals! 🎓",
    "Small steps lead to big achievements! 👣",
    "Believe in yourself! You can do this! 💫",
    "Progress over perfection! 📈",
    "Your hard work will pay off! 💰",
    "Stay focused, stay committed! 🎯",
    "Learning is a journey, not a race! 🛤️",
    "You're stronger than you think! 💪",
  ],
};

/**
 * Premium exclusive messages
 * More personalized and advanced motivational content
 */
const PREMIUM_MESSAGES = {
  premium_exclusive: [
    "Welcome, Premium Member! Let's achieve greatness together! 👑",
    "Your dedication to growth is admirable! Premium power activated! ⚡",
    "Elite focus mode engaged! Time to dominate your goals! 🏆",
    "Premium productivity unlocked! Let's make magic happen! ✨",
    "Champions like you deserve premium support! Let's go! 🥇",
    "Your commitment to excellence shows! Premium session starting! 💎",
    "Advanced learning mode activated! You're unstoppable! 🚀",
    "Premium mindset, premium results! Let's excel! 🌟",
  ],
  start_session: [
    ...FREE_MESSAGES.start_session,
    "Premium focus engaged! Time to reach new heights! 🏔️",
    "Your premium toolkit is ready! Let's maximize productivity! ⚙️",
    "Elite study session initiated! Excellence awaits! 👔",
  ],
  end_session: [
    ...FREE_MESSAGES.end_session,
    "Premium session complete! Your analytics are updated! 📊",
    "Outstanding work! Check your premium stats! 📈",
    "Another milestone! Your premium journey continues! 🎖️",
  ],
  break_time: [
    ...FREE_MESSAGES.break_time,
    "Premium break time! Recharge for optimal performance! 🔋",
    "Elite recovery mode! Your mind deserves the best rest! 🧠",
  ],
  streak_milestone: [
    ...FREE_MESSAGES.streak_milestone,
    "🏆 Premium streak legend! Your consistency is extraordinary!",
    "💎 Elite dedication! Check your premium analytics!",
  ],
  daily_motivation: [
    ...FREE_MESSAGES.daily_motivation,
    "Premium members like you inspire us! Keep leading by example! 🌟",
    "Your premium journey is transforming lives, including yours! 🦋",
    "Elite performers know: consistent effort yields exceptional results! 📊",
  ],
};

/**
 * Get a random motivational message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getMessage(req, res) {
  try {
    const { isPremium } = req.user || { isPremium: false };
    const { category } = req.query;

    // Validate category
    if (category && !Object.values(MESSAGE_CATEGORIES).includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid message category',
        validCategories: Object.values(MESSAGE_CATEGORIES),
      });
    }

    // Premium-exclusive messages require premium
    if (category === MESSAGE_CATEGORIES.PREMIUM_EXCLUSIVE && !isPremium) {
      return res.status(403).json({ 
        error: 'Premium exclusive messages require premium subscription',
        requiresPremium: true,
      });
    }

    const messageCategory = category || MESSAGE_CATEGORIES.DAILY_MOTIVATION;
    const messagePool = isPremium ? PREMIUM_MESSAGES : FREE_MESSAGES;

    // Get messages for the category
    let messages = messagePool[messageCategory];
    
    if (!messages || messages.length === 0) {
      messages = messagePool.daily_motivation;
    }

    // Select random message
    const randomIndex = Math.floor(Math.random() * messages.length);
    const message = messages[randomIndex];

    res.json({
      message,
      category: messageCategory,
      isPremium,
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
}

/**
 * Get multiple messages (Premium feature for variety)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getMessages(req, res) {
  try {
    const { isPremium } = req.user || { isPremium: false };
    const { category, count = 3 } = req.query;

    if (!isPremium) {
      return res.status(403).json({ 
        error: 'Multiple messages is a premium feature',
        requiresPremium: true,
      });
    }

    // Validate category
    if (category && !Object.values(MESSAGE_CATEGORIES).includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid message category',
        validCategories: Object.values(MESSAGE_CATEGORIES),
      });
    }

    const messageCategory = category || MESSAGE_CATEGORIES.DAILY_MOTIVATION;
    const messagePool = PREMIUM_MESSAGES[messageCategory] || PREMIUM_MESSAGES.daily_motivation;

    // Get random unique messages
    const messageCount = Math.min(parseInt(count), messagePool.length, 10);
    const selectedMessages = getRandomMessages(messagePool, messageCount);

    res.json({
      messages: selectedMessages,
      category: messageCategory,
      count: selectedMessages.length,
      isPremium: true,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

/**
 * Get message of the day
 * Changes daily based on date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getMessageOfTheDay(req, res) {
  try {
    const { isPremium } = req.user || { isPremium: false };

    const messagePool = isPremium ? PREMIUM_MESSAGES : FREE_MESSAGES;
    const allMessages = messagePool.daily_motivation;

    // Use date as seed for consistent daily message
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const messageIndex = dayOfYear % allMessages.length;

    const message = allMessages[messageIndex];

    res.json({
      message,
      date: today.toISOString().split('T')[0],
      isPremium,
    });
  } catch (error) {
    console.error('Error fetching message of the day:', error);
    res.status(500).json({ error: 'Failed to fetch message of the day' });
  }
}

/**
 * Get all available message categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getCategories(req, res) {
  try {
    const { isPremium } = req.user || { isPremium: false };

    const categories = Object.keys(FREE_MESSAGES).map(key => ({
      id: key,
      name: key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      available: true,
    }));

    // Add premium category if user is premium
    if (isPremium) {
      categories.push({
        id: MESSAGE_CATEGORIES.PREMIUM_EXCLUSIVE,
        name: 'Premium Exclusive',
        available: true,
        premium: true,
      });
    } else {
      categories.push({
        id: MESSAGE_CATEGORIES.PREMIUM_EXCLUSIVE,
        name: 'Premium Exclusive',
        available: false,
        premium: true,
        requiresPremium: true,
      });
    }

    res.json({
      categories,
      isPremium,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

// Helper Functions

/**
 * Get random unique messages from a pool
 * @param {Array} messagePool - Array of messages
 * @param {number} count - Number of messages to retrieve
 * @returns {Array} Array of random messages
 */
function getRandomMessages(messagePool, count) {
  const shuffled = [...messagePool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = {
  getMessage,
  getMessages,
  getMessageOfTheDay,
  getCategories,
  MESSAGE_CATEGORIES,
};
