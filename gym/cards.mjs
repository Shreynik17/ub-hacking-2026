// Short optional cards. Keep sources visible in the PWA and never rotate them
// into the live rep counter, where they would distract from movement feedback.
export const gymCards = [
  {
    id: 'consistency', kind: 'motivation', context: 'after-session',
    title: 'A session completed counts',
    body: 'The best plan is one you can repeat. Save this session and choose a realistic next one.',
    source: 'https://acsm.org/resistance-training-guidelines-update-2026/'
  },
  {
    id: 'stance', kind: 'technique', context: 'before-squat',
    title: 'Find your comfortable stance',
    body: 'Squat stance varies by person. Start at a comfortable width and let your knees travel in line with your toes.',
    source: 'https://www.acefitness.org/resources/pros/expert-articles/7356/how-to-squat-properly-body-type-breakdown-anatomy-considerations/'
  },
  {
    id: 'bodyweight', kind: 'knowledge', context: 'after-squat',
    title: 'Bodyweight work is real strength work',
    body: 'Resistance training does not require a gym or heavy equipment to be useful.',
    source: 'https://acsm.org/resistance-training-guidelines-update-2026/'
  },
  {
    id: 'straps', kind: 'equipment', context: 'pulling-exercise',
    title: 'When lifting straps may help',
    body: 'For pulling exercises such as deadlifts, straps can reduce grip fatigue. They are optional and are not relevant to bodyweight squats.',
    source: 'https://pubmed.ncbi.nlm.nih.gov/33306977/'
  },
  {
    id: 'caffeine', kind: 'knowledge', context: 'before-workout',
    title: 'Caffeine can help some workouts',
    body: 'Research finds performance benefits for some resistance exercise, but responses vary. Consider your sensitivity and sleep; caffeine is not required for a good workout.',
    source: 'https://pubmed.ncbi.nlm.nih.gov/37498180/'
  }
];

export function cardsFor(context) {
  return gymCards.filter(card => card.context === context);
}
