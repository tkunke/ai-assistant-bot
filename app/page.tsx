"use client";
import { useState } from 'react';
import Image from 'next/image';
import styles from './styles/homepage.module.css';

const HomePage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (response.ok) {
        setStatusMessage('Thank you for signing up!');
        setEmail(''); // Clear input
      } else {
        setStatusMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      setStatusMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>CineTech AI</h1>
          <p className={styles.description}>AI for film production</p>
          <div className={styles.headerButtons}>
          </div>
        </header>

        <section className={styles.section}>
          <div className={styles.imageTextContainer}>
            <Image
              src="/bw_logo.png"
              alt="Cinetech Logo"
              width={700}
              height={700}
              className={styles.sectionImage}
            />
            <div className={styles.textContent}>
              <h2>Your Creative Partner</h2>
              <p>
                We provide AI-driven solutions for filmmakers and creatives in the entertainment industry. Whether you&apos;re a seasoned professional or a passionate enthusiast, CineTech AI is here to help.
              </p>
              <p>
                We&apos;ll be live soon! If you&apos;re interested in being notified when we launch, please sign up below:
              </p>
              <form className={styles.emailForm} onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.emailInput}
                  required
                />
                <button type="submit" className={styles.submitButton}>
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
