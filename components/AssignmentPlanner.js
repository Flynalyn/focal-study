import React, { useState } from 'react';

const AssignmentPlanner = ({ isPremium }) => {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');

  const addAssignment = () => {
    if (!title || !dueDate) {
      alert('Please fill in all fields');
      return;
    }

    const freeLimit = 5;
    if (!isPremium && assignments.length >= freeLimit) {
      alert(`Free users can only add up to ${freeLimit} assignments. Upgrade to Premium for unlimited assignments!`);
      return;
    }

    const newAssignment = {
      id: Date.now(),
      title,
      dueDate,
      priority,
      completed: false
    };

    setAssignments([...assignments, newAssignment]);
    setTitle('');
    setDueDate('');
    setPriority('medium');
  };

  const toggleComplete = (id) => {
    setAssignments(
      assignments.map(assignment =>
        assignment.id === id
          ? { ...assignment, completed: !assignment.completed }
          : assignment
      )
    );
  };

  const deleteAssignment = (id) => {
    setAssignments(assignments.filter(assignment => assignment.id !== id));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Assignment title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ 
            padding: '10px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            width: '200px'
          }}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ 
            padding: '10px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ 
            padding: '10px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button
          onClick={addAssignment}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Add Assignment
        </button>
      </div>

      {!isPremium && (
        <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
          Free: {assignments.length}/5 assignments used. Upgrade to Premium for unlimited!
        </p>
      )}

      <div>
        {assignments.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center' }}>No assignments yet. Add one above!</p>
        ) : (
          assignments.map(assignment => (
            <div
              key={assignment.id}
              style={{ 
                padding: '15px',
                marginBottom: '10px',
                border: '1px solid #eee',
                borderRadius: '8px',
                borderLeft: `4px solid ${getPriorityColor(assignment.priority)}`,
                backgroundColor: assignment.completed ? '#f8f9fa' : 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  margin: '0 0 5px 0',
                  textDecoration: assignment.completed ? 'line-through' : 'none',
                  color: assignment.completed ? '#999' : '#333'
                }}>
                  {assignment.title}
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  Due: {assignment.dueDate}
                </p>
              </div>
              <div>
                <button
                  onClick={() => toggleComplete(assignment.id)}
                  style={{ 
                    padding: '8px 15px',
                    marginRight: '5px',
                    backgroundColor: assignment.completed ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {assignment.completed ? 'Undo' : 'Complete'}
                </button>
                <button
                  onClick={() => deleteAssignment(assignment.id)}
                  style={{ 
                    padding: '8px 15px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentPlanner;
