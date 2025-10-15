// api/sessions.js - Pomodoro Timer and Session Tracking

/**
 * In-memory storage for sessions (replace with database in production)
 * Structure: { userId: [sessions] }
 */
const sessionStore = {};

/**
 * Session limits for free vs premium users
 */
const LIMITS = {
  FREE_MAX_DAILY_SESSIONS: 5,
  PREMIUM_MAX_DAILY_SESSIONS: Infinity,
  FREE_SESSION_DURATION: 25, // minutes
  PREMIUM_CUSTOM_DURATION: true,
};

/**
 * Start a new Pomodoro session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function startSession(req, res) {
  try {
    const { userId, isPremium } = req.user;
    const { assignmentId, duration, type } = req.body;

    // Initialize user's session list if not exists
    if (!sessionStore[userId]) {
      sessionStore[userId] = [];
    }

    // Check daily session limit for free users
    const todaySessions = getTodaySessions(userId);
    const maxDailySessions = isPremium ? LIMITS.PREMIUM_MAX_DAILY_SESSIONS : LIMITS.FREE_MAX_DAILY_SESSIONS;
    
    if (!isPremium && todaySessions.length >= maxDailySessions) {
      return res.status(403).json({ 
        error: 'Daily session limit reached',
        limit: maxDailySessions,
        requiresPremium: true,
        message: 'Upgrade to premium for unlimited sessions',
      });
    }

    // Validate custom duration (premium feature)
    let sessionDuration = LIMITS.FREE_SESSION_DURATION;
    if (duration && duration !== LIMITS.FREE_SESSION_DURATION) {
      if (!isPremium) {
        return res.status(403).json({ 
          error: 'Custom duration is a premium feature',
          requiresPremium: true,
        });
      }
      sessionDuration = duration;
    }

    const newSession = {
      id: Date.now().toString(),
      assignmentId: assignmentId || null,
      type: type || 'focus', // focus, break, long-break
      duration: sessionDuration,
      startTime: new Date(),
      endTime: null,
      completed: false,
      interrupted: false,
      actualDuration: 0,
    };

    sessionStore[userId].push(newSession);

    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
}

/**
 * End a Pomodoro session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function endSession(req, res) {
  try {
    const { userId } = req.user;
    const { sessionId } = req.params;
    const { completed, interrupted } = req.body;

    if (!sessionStore[userId]) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionStore[userId].find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.endTime) {
      return res.status(400).json({ error: 'Session already ended' });
    }

    const endTime = new Date();
    const actualDuration = (endTime - new Date(session.startTime)) / 60000; // minutes

    session.endTime = endTime;
    session.completed = completed !== undefined ? completed : true;
    session.interrupted = interrupted || false;
    session.actualDuration = Math.round(actualDuration);

    res.json(session);
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
}

/**
 * Get user's session history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getSessionHistory(req, res) {
  try {
    const { userId } = req.user;
    const { startDate, endDate, assignmentId, limit } = req.query;

    let sessions = sessionStore[userId] || [];

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      sessions = sessions.filter(s => new Date(s.startTime) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      sessions = sessions.filter(s => new Date(s.startTime) <= end);
    }

    // Filter by assignment
    if (assignmentId) {
      sessions = sessions.filter(s => s.assignmentId === assignmentId);
    }

    // Apply limit
    if (limit) {
      sessions = sessions.slice(-parseInt(limit));
    }

    res.json({
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ error: 'Failed to fetch session history' });
  }
}

/**
 * Get session statistics (Premium feature with advanced analytics)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getSessionStats(req, res) {
  try {
    const { userId, isPremium } = req.user;
    const { period } = req.query; // 'day', 'week', 'month', 'all'

    const sessions = sessionStore[userId] || [];
    const filteredSessions = filterSessionsByPeriod(sessions, period || 'week');

    // Basic stats (available to all users)
    const basicStats = {
      totalSessions: filteredSessions.length,
      completedSessions: filteredSessions.filter(s => s.completed).length,
      totalMinutes: filteredSessions.reduce((sum, s) => sum + s.actualDuration, 0),
      averageSessionLength: 0,
    };

    if (basicStats.totalSessions > 0) {
      basicStats.averageSessionLength = Math.round(
        basicStats.totalMinutes / basicStats.totalSessions
      );
    }

    // Premium analytics
    if (isPremium) {
      const premiumStats = {
        ...basicStats,
        productivityScore: calculateProductivityScore(filteredSessions),
        bestProductivityTime: findBestProductivityTime(filteredSessions),
        streakDays: calculateStreak(sessionStore[userId] || []),
        weeklyProgress: getWeeklyProgress(filteredSessions),
        focusTimeByAssignment: getFocusTimeByAssignment(filteredSessions),
      };

      return res.json(premiumStats);
    }

    // Return basic stats with upgrade prompt
    res.json({
      ...basicStats,
      message: 'Upgrade to premium for advanced analytics',
      requiresPremium: true,
    });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    res.status(500).json({ error: 'Failed to fetch session stats' });
  }
}

/**
 * Get active session for user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getActiveSession(req, res) {
  try {
    const { userId } = req.user;

    const sessions = sessionStore[userId] || [];
    const activeSession = sessions.find(s => !s.endTime);

    if (!activeSession) {
      return res.json({ activeSession: null });
    }

    // Calculate elapsed time
    const elapsed = (new Date() - new Date(activeSession.startTime)) / 60000;
    const remaining = activeSession.duration - elapsed;

    res.json({
      activeSession: {
        ...activeSession,
        elapsedMinutes: Math.round(elapsed),
        remainingMinutes: Math.max(0, Math.round(remaining)),
      },
    });
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ error: 'Failed to fetch active session' });
  }
}

// Helper Functions

/**
 * Get today's sessions for a user
 */
function getTodaySessions(userId) {
  const sessions = sessionStore[userId] || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return sessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
}

/**
 * Filter sessions by time period
 */
function filterSessionsByPeriod(sessions, period) {
  const now = new Date();
  let cutoffDate;

  switch (period) {
    case 'day':
      cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return sessions;
  }

  return sessions.filter(s => new Date(s.startTime) >= cutoffDate);
}

/**
 * Calculate productivity score (Premium feature)
 */
function calculateProductivityScore(sessions) {
  if (sessions.length === 0) return 0;

  const completedSessions = sessions.filter(s => s.completed && !s.interrupted).length;
  const totalSessions = sessions.length;
  const completionRate = completedSessions / totalSessions;

  // Score from 0-100
  return Math.round(completionRate * 100);
}

/**
 * Find best productivity time (Premium feature)
 */
function findBestProductivityTime(sessions) {
  const hourStats = Array(24).fill(0).map(() => ({ count: 0, completed: 0 }));

  sessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();
    hourStats[hour].count++;
    if (session.completed) hourStats[hour].completed++;
  });

  let bestHour = 0;
  let bestScore = 0;

  hourStats.forEach((stat, hour) => {
    if (stat.count > 0) {
      const score = (stat.completed / stat.count) * stat.count;
      if (score > bestScore) {
        bestScore = score;
        bestHour = hour;
      }
    }
  });

  return `${bestHour}:00 - ${bestHour + 1}:00`;
}

/**
 * Calculate streak days (Premium feature)
 */
function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  const dates = [...new Set(sessions.map(s => {
    const d = new Date(s.startTime);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }))].sort().reverse();

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const expectedDateStr = `${expectedDate.getFullYear()}-${expectedDate.getMonth()}-${expectedDate.getDate()}`;
    
    if (dates[i] === expectedDateStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get weekly progress (Premium feature)
 */
function getWeeklyProgress(sessions) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const progress = days.map(day => ({ day, sessions: 0, minutes: 0 }));

  sessions.forEach(session => {
    const dayIndex = new Date(session.startTime).getDay();
    progress[dayIndex].sessions++;
    progress[dayIndex].minutes += session.actualDuration;
  });

  return progress;
}

/**
 * Get focus time by assignment (Premium feature)
 */
function getFocusTimeByAssignment(sessions) {
  const assignmentMap = {};

  sessions.forEach(session => {
    if (session.assignmentId) {
      if (!assignmentMap[session.assignmentId]) {
        assignmentMap[session.assignmentId] = {
          assignmentId: session.assignmentId,
          totalMinutes: 0,
          sessionCount: 0,
        };
      }
      assignmentMap[session.assignmentId].totalMinutes += session.actualDuration;
      assignmentMap[session.assignmentId].sessionCount++;
    }
  });

  return Object.values(assignmentMap);
}

module.exports = {
  startSession,
  endSession,
  getSessionHistory,
  getSessionStats,
  getActiveSession,
  LIMITS,
};
