// api/assignments.js - Assignment Storage and Planner Logic

/**
 * In-memory storage for assignments (replace with database in production)
 * Structure: { userId: [assignments] }
 */
const assignmentStore = {};

/**
 * Maximum assignments for free vs premium users
 */
const LIMITS = {
  FREE_MAX_ASSIGNMENTS: 10,
  PREMIUM_MAX_ASSIGNMENTS: Infinity,
};

/**
 * Create a new assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createAssignment(req, res) {
  try {
    const { userId, isPremium } = req.user; // Assume middleware adds user info
    const { title, description, dueDate, priority, estimatedTime, course } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ error: 'Title and due date are required' });
    }

    // Initialize user's assignment list if not exists
    if (!assignmentStore[userId]) {
      assignmentStore[userId] = [];
    }

    // Check assignment limit for free users
    const maxAssignments = isPremium ? LIMITS.PREMIUM_MAX_ASSIGNMENTS : LIMITS.FREE_MAX_ASSIGNMENTS;
    if (assignmentStore[userId].length >= maxAssignments) {
      return res.status(403).json({ 
        error: 'Assignment limit reached',
        limit: maxAssignments,
        requiresPremium: !isPremium,
      });
    }

    const newAssignment = {
      id: Date.now().toString(),
      title,
      description: description || '',
      dueDate: new Date(dueDate),
      priority: priority || 'medium', // low, medium, high
      estimatedTime: estimatedTime || 60, // minutes
      course: course || '',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assignmentStore[userId].push(newAssignment);

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
}

/**
 * Get all assignments for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAssignments(req, res) {
  try {
    const { userId } = req.user;
    const { completed, sortBy } = req.query;

    let assignments = assignmentStore[userId] || [];

    // Filter by completion status if specified
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      assignments = assignments.filter(a => a.completed === isCompleted);
    }

    // Sort assignments
    assignments = sortAssignments(assignments, sortBy);

    res.json({
      assignments,
      count: assignments.length,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}

/**
 * Update an assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateAssignment(req, res) {
  try {
    const { userId } = req.user;
    const { assignmentId } = req.params;
    const updates = req.body;

    if (!assignmentStore[userId]) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignmentIndex = assignmentStore[userId].findIndex(a => a.id === assignmentId);
    
    if (assignmentIndex === -1) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Update assignment
    assignmentStore[userId][assignmentIndex] = {
      ...assignmentStore[userId][assignmentIndex],
      ...updates,
      updatedAt: new Date(),
      id: assignmentId, // Prevent ID changes
    };

    res.json(assignmentStore[userId][assignmentIndex]);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
}

/**
 * Delete an assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteAssignment(req, res) {
  try {
    const { userId } = req.user;
    const { assignmentId } = req.params;

    if (!assignmentStore[userId]) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignmentIndex = assignmentStore[userId].findIndex(a => a.id === assignmentId);
    
    if (assignmentIndex === -1) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    assignmentStore[userId].splice(assignmentIndex, 1);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
}

/**
 * Get study plan recommendations (Premium feature)
 * Uses intelligent planning algorithm to suggest study schedule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getStudyPlan(req, res) {
  try {
    const { userId, isPremium } = req.user;

    // Premium feature check
    if (!isPremium) {
      return res.status(403).json({ 
        error: 'Study plan is a premium feature',
        requiresPremium: true,
      });
    }

    const assignments = assignmentStore[userId] || [];
    const incompleteAssignments = assignments.filter(a => !a.completed);

    if (incompleteAssignments.length === 0) {
      return res.json({ 
        message: 'No incomplete assignments',
        plan: [],
      });
    }

    // Generate study plan
    const studyPlan = generateStudyPlan(incompleteAssignments);

    res.json({
      plan: studyPlan,
      totalHours: studyPlan.reduce((sum, item) => sum + item.duration, 0) / 60,
    });
  } catch (error) {
    console.error('Error generating study plan:', error);
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
}

/**
 * Helper function to sort assignments
 */
function sortAssignments(assignments, sortBy = 'dueDate') {
  const sorted = [...assignments];

  switch (sortBy) {
    case 'dueDate':
      return sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    case 'priority':
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    
    case 'createdAt':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    default:
      return sorted;
  }
}

/**
 * Generate intelligent study plan (Premium feature)
 * Prioritizes based on due date, priority, and estimated time
 */
function generateStudyPlan(assignments) {
  const now = new Date();
  const plan = [];

  // Score each assignment
  const scoredAssignments = assignments.map(assignment => {
    const daysUntilDue = (new Date(assignment.dueDate) - now) / (1000 * 60 * 60 * 24);
    const priorityScore = { high: 3, medium: 2, low: 1 }[assignment.priority];
    
    // Urgency increases as due date approaches
    const urgencyScore = Math.max(0, 10 - daysUntilDue);
    
    // Total score (higher = more urgent)
    const score = (urgencyScore * 2) + (priorityScore * 1.5);

    return { ...assignment, score };
  });

  // Sort by score (highest first)
  scoredAssignments.sort((a, b) => b.score - a.score);

  // Create study sessions
  scoredAssignments.forEach(assignment => {
    const sessions = Math.ceil(assignment.estimatedTime / 45); // 45-minute study blocks
    
    for (let i = 0; i < sessions; i++) {
      plan.push({
        assignmentId: assignment.id,
        title: assignment.title,
        course: assignment.course,
        dueDate: assignment.dueDate,
        sessionNumber: i + 1,
        totalSessions: sessions,
        duration: Math.min(45, assignment.estimatedTime - (i * 45)),
        priority: assignment.priority,
      });
    }
  });

  return plan;
}

module.exports = {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  getStudyPlan,
  LIMITS,
};
