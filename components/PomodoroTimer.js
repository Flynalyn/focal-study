import React, { useState, useEffect } from 'react';

const PomodoroTimer = ({ isPremium }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('work'); // 'work' or 'break'

  useEffect(() => {
    let interval = null;
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Session complete
            setIsActive(false);
            alert(`${sessionType === 'work' ? 'Work' : 'Break'} session complete!`);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, sessionType]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(sessionType === 'work' ? 25 : 5);
    setSeconds(0);
  };

  const switchSession = (type) => {
    setIsActive(false);
    setSessionType(type);
    setMinutes(type === 'work' ? 25 : 5);
    setSeconds(0);
  };

  const customizeTime = (newMinutes) => {
    if (isPremium) {
      setMinutes(newMinutes);
      setSeconds(0);
      setIsActive(false);
    } else {
      alert('Custom timer durations require a premium subscription!');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => switchSession('work')}
          style={{ 
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: sessionType === 'work' ? '#667eea' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Work
        </button>
        <button 
          onClick={() => switchSession('break')}
          style={{ 
            padding: '10px 20px',
            backgroundColor: sessionType === 'break' ? '#667eea' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Break
        </button>
      </div>

      <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={toggleTimer}
          style={{ 
            padding: '10px 30px',
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          style={{ 
            padding: '10px 30px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Reset
        </button>
      </div>

      {isPremium && (
        <div>
          <p style={{ fontSize: '14px', color: '#666' }}>Premium: Custom Timers</p>
          <button onClick={() => customizeTime(45)} style={{ margin: '5px', padding: '8px', borderRadius: '5px', border: '1px solid #667eea', background: 'white', cursor: 'pointer' }}>45 min</button>
          <button onClick={() => customizeTime(60)} style={{ margin: '5px', padding: '8px', borderRadius: '5px', border: '1px solid #667eea', background: 'white', cursor: 'pointer' }}>60 min</button>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
