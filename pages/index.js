import React, { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import PomodoroTimer from '../components/PomodoroTimer';
import AssignmentPlanner from '../components/AssignmentPlanner';
import MotivationalMessages from '../components/MotivationalMessages';
import StripeSubscription from '../components/StripeSubscription';

export default function Home() {
  const [isPremium, setIsPremium] = useState(false);

  return (
    <div className={styles.container}>
      <Head>
        <title>Focal Study - Your Study Companion</title>
        <meta name="description" content="Stay focused and organized with Focal Study" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>Focal Study</span>
        </h1>
        
        <p className={styles.description}>
          Your all-in-one study companion for productivity and focus
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>🍅 Pomodoro Timer</h2>
            <PomodoroTimer isPremium={isPremium} />
          </div>

          <div className={styles.card}>
            <h2>📚 Assignment Planner</h2>
            <AssignmentPlanner isPremium={isPremium} />
          </div>

          <div className={styles.card}>
            <h2>💪 Motivational Messages</h2>
            <MotivationalMessages isPremium={isPremium} />
          </div>

          <div className={styles.card}>
            <h2>💳 Focal Study Premium</h2>
            <StripeSubscription 
              onSubscriptionChange={setIsPremium}
              isPremium={isPremium}
            />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Focal Study - Stay Focused, Stay Productive</p>
      </footer>
    </div>
  );
}
