import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const STEPS = [
  {
    id: 'domains',
    title: 'What do you love?',
    subtitle: 'Pick the types of content you enjoy most',
    choices: [
      { id: 'movies', label: 'Movies', icon: '🎬' },
      { id: 'music', label: 'Music', icon: '🎵' },
      { id: 'podcasts', label: 'Podcasts', icon: '🎙️' },
      { id: 'videos', label: 'Videos', icon: '📹' },
      { id: 'news', label: 'News', icon: '📰' },
    ],
  },
  {
    id: 'genres',
    title: 'Your vibe?',
    subtitle: 'Select genres and themes you enjoy across any format',
    choices: [
      { id: 'action', label: 'Action & Thriller', icon: '⚡' },
      { id: 'science', label: 'Science & Nature', icon: '🔬' },
      { id: 'technology', label: 'Technology', icon: '💻' },
      { id: 'comedy', label: 'Comedy', icon: '😂' },
      { id: 'drama', label: 'Drama & Story', icon: '🎭' },
      { id: 'health', label: 'Health & Wellness', icon: '🧘' },
      { id: 'business', label: 'Business & Finance', icon: '💼' },
      { id: 'sci-fi', label: 'Sci-Fi & Fantasy', icon: '🚀' },
      { id: 'true crime', label: 'True Crime', icon: '🔎' },
      { id: 'education', label: 'Education', icon: '📚' },
      { id: 'travel', label: 'Travel & Culture', icon: '🌍' },
      { id: 'sports', label: 'Sports', icon: '⚽' },
    ],
  },
  {
    id: 'mood',
    title: 'How do you like to feel?',
    subtitle: 'This helps us tailor your emotional recommendations',
    choices: [
      { id: 'upbeat', label: 'Upbeat & Energetic', icon: '🔥' },
      { id: 'chill', label: 'Chill & Relaxed', icon: '☁️' },
      { id: 'emotional', label: 'Emotional & Deep', icon: '💫' },
      { id: 'motivational', label: 'Motivational', icon: '💪' },
      { id: 'mysterious', label: 'Dark & Mysterious', icon: '🌑' },
      { id: 'fun', label: 'Fun & Lighthearted', icon: '🌈' },
    ],
  },
];

export default function Onboarding() {
  const { completeOnboarding } = useUser();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selections, setSelections] = useState({ domains: [], genres: [], mood: [] });

  const currentStep = STEPS[step];

  const toggle = (category, id) => {
    setSelections(prev => {
      const arr = prev[category];
      return {
        ...prev,
        [category]: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id],
      };
    });
  };

  const canNext = () => {
    if (step === 0) return selections.domains.length > 0;
    if (step === 1) return selections.genres.length >= 2;
    if (step === 2) return selections.mood.length > 0;
    return false;
  };

  const handleFinish = () => {
    const prefs = {
      likedGenres: selections.genres,
      likedDomains: selections.domains,
      likedTags: selections.mood,
      dislikedGenres: [],
    };
    completeOnboarding({ name: name || 'Explorer' }, prefs);
  };

  const isNameStep = step === -1; // We show name first if we want

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal animate-fadeUp">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '2.5rem' }}>✦</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            NexRec
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>Your unified content universe</p>
        </div>

        {/* Progress dots */}
        <div className="progress-dots" style={{ margin: '20px 0' }}>
          {STEPS.map((_, i) => (
            <div key={i} className={`progress-dot ${i <= step ? 'active' : ''}`} />
          ))}
        </div>

        {/* Name field on step 0 */}
        {step === 0 && (
          <div className="onboarding-step" style={{ marginBottom: '20px' }}>
            <p className="onboarding-step-title">Your name</p>
            <input
              id="onboarding-name"
              type="text"
              placeholder="What should we call you?"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontFamily: 'var(--font-primary)',
                outline: 'none',
              }}
            />
          </div>
        )}

        <div className="onboarding-step">
          <div style={{ marginBottom: '12px' }}>
            <h2 className="onboarding-title gradient-text" style={{ fontSize: '1.6rem' }}>
              {currentStep.title}
            </h2>
            <p className="onboarding-subtitle">{currentStep.subtitle}</p>
          </div>
          <div className="onboarding-chips">
            {currentStep.choices.map(choice => (
              <button
                key={choice.id}
                id={`chip-${choice.id}`}
                className={`onboarding-chip ${selections[currentStep.id]?.includes(choice.id) ? 'selected' : ''}`}
                onClick={() => toggle(currentStep.id, choice.id)}
                aria-pressed={selections[currentStep.id]?.includes(choice.id)}
              >
                <span>{choice.icon}</span>
                {choice.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
          <button
            className="btn btn-secondary"
            id="onboarding-back"
            onClick={() => step > 0 && setStep(s => s - 1)}
            disabled={step === 0}
            style={{ opacity: step === 0 ? 0.3 : 1 }}
          >
            ← Back
          </button>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {step + 1} / {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <button
              className="btn btn-primary"
              id="onboarding-next"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              style={{ opacity: canNext() ? 1 : 0.4, cursor: canNext() ? 'pointer' : 'not-allowed' }}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              id="onboarding-finish"
              onClick={handleFinish}
              disabled={!canNext()}
              style={{ opacity: canNext() ? 1 : 0.4, cursor: canNext() ? 'pointer' : 'not-allowed' }}
            >
              🚀 Let's Go!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
