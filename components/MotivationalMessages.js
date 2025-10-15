import React, { useState, useEffect } from 'react';

const MotivationalMessages = () => {
  const messages = [
    "You're doing great! Keep going!",
    "Focus is the key to success.",
    "Every minute counts towards your goals.",
    "Stay motivated, stay focused!",
    "Break tasks into smaller steps.",
    "Believe in yourself and your abilities.",
    "Success is built one task at a time.",
    "Your hard work will pay off!",
    "Consistency is the path to excellence.",
    "Take a deep breath and keep moving forward.",
    "You've got this! Stay strong!",
    "Small progress is still progress.",
    "Focus on what you can control.",
    "Your future self will thank you.",
    "Make today count!"
  ];

  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // Set initial random message
    const randomIndex = Math.floor(Math.random() * messages.length);
    setCurrentMessage(messages[randomIndex]);

    // Change message every 30 seconds
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setCurrentMessage(messages[randomIndex]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getNewMessage = () => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    setCurrentMessage(messages[randomIndex]);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div
        style={{
          padding: '30px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '2px solid #667eea',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}
      >
        <p
          style={{
            fontSize: '20px',
            fontWeight: '500',
            color: '#667eea',
            margin: 0,
            fontStyle: 'italic'
          }}
        >
          {currentMessage || "Loading inspiration..."}
        </p>
      </div>

      <button
        onClick={getNewMessage}
        style={{
          padding: '10px 25px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        Get New Message
      </button>

      <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
        Messages refresh automatically every 30 seconds
      </p>
    </div>
  );
};

export default MotivationalMessages;
