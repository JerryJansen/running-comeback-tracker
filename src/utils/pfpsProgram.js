/**
 * Evidence-based PFPS (Patellofemoral Pain Syndrome) rehabilitation program.
 * Sources: JOSPT 2019 CPG, BJSM 2024 Best Practice Guide, peer-reviewed protocols.
 *
 * DISCLAIMER: This is general guidance, not a substitute for individualized
 * assessment by a physiotherapist or sports medicine physician.
 */

// ─── PAIN RULES ─────────────────────────────────────────────────
export const PAIN_RULES = {
  trafficLight: [
    { range: [0, 2], color: 'green', label: 'Green', action: 'Safe to continue. Target zone for all activity.' },
    { range: [3, 4], color: 'amber', label: 'Amber', action: 'Modify: reduce load, speed, or distance. Add walk breaks. Do not progress to next week.' },
    { range: [5, 10], color: 'red', label: 'Red', action: 'Stop the activity. Walk home or rest. Return to previous week\'s level.' },
  ],
  duringExercise: 'Pain must stay ≤ 4/10 throughout. Ideally keep below 2/10.',
  duringRunning: 'Pain must stay ≤ 2/10. If pain rises above 2, stop running and walk 5 min. If it persists >10 min, stop for the day.',
  rule24h: 'Mild soreness up to 3/10 is acceptable if it resolves within 24 hours.',
  rule48h: 'If pain remains elevated 48 hours after a session, you did too much. Drop back one week.',
  morningStiffness: 'If your knee is notably stiffer the morning after, reduce load next session.',
  swelling: 'Any new swelling means stop, ice, elevate. Do not progress until swelling resolves.',
  progressionCriteria: [
    'Completed all sessions this week without exceeding 2/10 pain during activity',
    'No increased pain or swelling 24-48 hours post-session',
    'Current exercises feel manageable (effort below 7/10)',
  ],
};

// ─── EQUIPMENT NEEDED ───────────────────────────────────────────
export const EQUIPMENT = [
  'Light resistance band (yellow/red)',
  'Medium resistance band (green/blue)',
  'Heavy resistance band (for later weeks)',
  'Foam roller',
  'A step or stair (15-20 cm height)',
  'A sturdy chair',
  'A pillow or folded towel (balance)',
];

// ─── WARM-UP PROTOCOL ───────────────────────────────────────────
export const WARMUP = [
  { name: 'Walking or stationary cycling (easy)', duration: '5 min' },
  { name: 'Foam roll: quads, IT band, hamstrings, calves', duration: '3-5 min', detail: 'Slow passes, pause 10-30 sec on tender spots' },
  { name: 'Leg swings forward/back', reps: '10 each leg' },
  { name: 'Leg swings side to side', reps: '10 each leg' },
  { name: 'Walking lunges', reps: '5 each leg' },
  { name: 'High knees', reps: '10 each leg' },
  { name: 'Bodyweight shallow squats', reps: '10' },
];

// ─── COOL-DOWN PROTOCOL ─────────────────────────────────────────
export const COOLDOWN = [
  { name: 'Easy walking', duration: '3-5 min' },
  { name: 'Foam roll: quads, IT band, hamstrings, calves, glutes', duration: '3-5 min', detail: '30 sec per area' },
  { name: 'Standing quad stretch', hold: '30-45 sec each side, ×2', detail: 'Pull heel to glute, knees together, hips slightly forward' },
  { name: 'Half-kneeling hip flexor stretch', hold: '30-45 sec each side, ×2', detail: 'Rear knee on floor, shift hips forward, squeeze rear glute' },
  { name: 'Supine hamstring stretch', hold: '30-45 sec each side, ×2', detail: 'Loop band/towel around foot, straighten leg toward ceiling' },
  { name: 'Wall calf stretch (straight knee)', hold: '30-45 sec each side, ×2', detail: 'Hands on wall, rear leg straight, heel down' },
  { name: 'Wall calf stretch (bent knee)', hold: '30-45 sec each side, ×2', detail: 'Same position but bend rear knee slightly (targets soleus)' },
  { name: 'Standing IT band stretch', hold: '30-45 sec each side, ×2', detail: 'Cross affected leg behind the other, lean hips away' },
];

// ─── EXERCISE PROGRAM BY WEEK ───────────────────────────────────
// Phase 1: Foundation (Weeks 1-2)
// Phase 2: Building (Weeks 3-4)
// Phase 3: Loading (Weeks 5-6)
// Phase 4: Performance (Weeks 7-8)

const PHASE_1_EXERCISES = [
  // Hip/Glute
  { name: 'Glute bridge (double leg)', sets: 3, reps: 15, category: 'hip', tempo: '2s up, 2s hold, 2s down', notes: 'Squeeze glutes at top. Feet hip-width.' },
  { name: 'Clamshell (no band)', sets: 3, reps: 15, category: 'hip', tempo: '2s up, 1s hold, 2s down', notes: 'Hips at 60°, knees at 90°. Keep pelvis still.' },
  { name: 'Side-lying hip abduction', sets: 3, reps: 15, category: 'hip', tempo: '2s up, 1s hold, 2s down', notes: 'Straight leg, slight hip extension, lead with heel.' },
  { name: 'Prone hip extension', sets: 3, reps: 12, category: 'hip', tempo: '2s up, 2s hold, 2s down', notes: 'Lie face down, lift straight leg, squeeze glute.' },
  // Quad (low PF load)
  { name: 'Quad sets (isometric)', sets: 3, reps: 10, category: 'quad', notes: 'Press back of knee into floor, tighten quad. Hold 10 sec each.' },
  { name: 'Straight leg raise (supine)', sets: 3, reps: 12, category: 'quad', tempo: '2s up, 2s hold, 2s down', notes: 'Lock knee, tighten quad first, lift 30 cm.' },
  { name: 'Wall sit (shallow, 20-30°)', sets: 3, reps: 1, category: 'quad', notes: 'Hold 20-30 seconds. Pain-free range only.' },
  // Hamstring/Calf
  { name: 'Supine hamstring curl (heel digs)', sets: 3, reps: 15, category: 'hamstring', notes: 'Lie on back, dig heels into floor, lift hips slightly.' },
  { name: 'Double-leg calf raise', sets: 3, reps: 15, category: 'calf', notes: 'On flat floor. Slow and controlled, full range.' },
  // Balance
  { name: 'Double-leg stance on pillow', sets: 3, reps: 1, category: 'balance', notes: 'Hold 30 seconds. Eyes open.' },
  { name: 'Single-leg stance (firm surface)', sets: 3, reps: 1, category: 'balance', notes: 'Hold 20-30 sec each leg. Near wall for safety.' },
];

const PHASE_2_EXERCISES = [
  // Hip/Glute
  { name: 'Single-leg glute bridge', sets: 3, reps: 12, category: 'hip', notes: 'Keep hips level. Progress from double-leg.' },
  { name: 'Clamshell with light band', sets: 3, reps: 15, category: 'hip', notes: 'Light resistance band above knees.' },
  { name: 'Side-lying hip abduction with band', sets: 3, reps: 12, category: 'hip', notes: 'Band around ankles.' },
  { name: 'Standing hip abduction with band', sets: 3, reps: 12, category: 'hip', notes: 'Band around ankles, stand on one leg, abduct other.' },
  { name: 'Side plank (from knees)', sets: 3, reps: 1, category: 'hip', notes: 'Hold 20-30 sec each side. Straight line hip to shoulder.' },
  // Quad
  { name: 'Wall sit (deeper, 45°)', sets: 3, reps: 1, category: 'quad', notes: 'Hold 30-45 seconds. Never deeper than 45°.' },
  { name: 'Squat to chair', sets: 3, reps: 15, category: 'quad', notes: 'Touch chair lightly, stand back up. Control the descent.' },
  { name: 'Step-up (low step, 10-15 cm)', sets: 3, reps: 10, category: 'quad', notes: 'Push through heel. Slow and controlled.' },
  // Hamstring/Calf
  { name: 'Hamstring walkouts', sets: 3, reps: 8, category: 'hamstring', notes: 'From bridge position, walk feet out and back.' },
  { name: 'Single-leg calf raise (floor)', sets: 3, reps: 12, category: 'calf', notes: 'Progress from double to single leg.' },
  // Balance
  { name: 'Single-leg stance on pillow', sets: 3, reps: 1, category: 'balance', notes: 'Hold 30 sec each side. Eyes open.' },
  { name: 'Single-leg stance, eyes closed', sets: 3, reps: 1, category: 'balance', notes: 'Firm surface. Hold 15-20 sec each side.' },
];

const PHASE_3_EXERCISES = [
  // Hip/Glute
  { name: 'Single-leg glute bridge (2s pause)', sets: 3, reps: 15, category: 'hip', notes: 'Add 2-second pause at top.' },
  { name: 'Banded lateral walks', sets: 3, reps: 12, category: 'hip', notes: 'Medium band above knees. Low athletic stance. Each direction.' },
  { name: 'Side plank (full, from feet)', sets: 3, reps: 1, category: 'hip', notes: 'Hold 30-45 sec each side. Progress from knees.' },
  { name: 'Standing hip external rotation with band', sets: 3, reps: 12, category: 'hip', notes: 'Band around ankles, rotate foot outward.' },
  // Quad
  { name: 'Split squat', sets: 3, reps: 12, category: 'quad', notes: 'Stride stance, lower back knee toward floor.' },
  { name: 'Step-up (15-20 cm)', sets: 3, reps: 12, category: 'quad', notes: 'Higher step. Add light weight if tolerated.' },
  { name: 'Lateral step-down (10-15 cm)', sets: 3, reps: 10, category: 'quad', notes: 'Stand on step, slowly lower opposite foot to floor. Key PFPS exercise.' },
  { name: 'Terminal knee extension with band', sets: 3, reps: 15, category: 'quad', notes: 'Band behind knee, extend from ~30° to full extension. Targets VMO.' },
  // Hamstring/Calf
  { name: 'Single-leg Romanian deadlift', sets: 3, reps: 10, category: 'hamstring', notes: 'Bodyweight. Hinge at hip, slight knee bend.' },
  { name: 'Eccentric calf raise (off step)', sets: 3, reps: 12, category: 'calf', notes: 'Rise on both feet, lower on one foot over 3-4 seconds.' },
  // Balance
  { name: 'Single-leg stance on pillow, eyes closed', sets: 3, reps: 1, category: 'balance', notes: 'Hold 20-30 sec each side.' },
  { name: 'Single-leg mini squat', sets: 3, reps: 8, category: 'balance', notes: 'Quarter squat depth. Track knee over 2nd toe.' },
];

const PHASE_4_EXERCISES = [
  // Hip/Glute
  { name: 'Single-leg hip thrust (shoulders on chair)', sets: 3, reps: 12, category: 'hip', notes: 'Shoulders elevated on chair, single-leg drive. Add weight if tolerated.' },
  { name: 'Banded lateral + forward/back walks', sets: 3, reps: 10, category: 'hip', notes: 'Medium-heavy band. Combine all directions.' },
  { name: 'Side plank with hip abduction', sets: 3, reps: 10, category: 'hip', notes: 'Full side plank, raise top leg, lower with control.' },
  // Quad
  { name: 'Front-foot elevated split squat', sets: 3, reps: 10, category: 'quad', notes: 'Front foot on 5-10 cm step. Drive knee forward. Add weight as tolerated.' },
  { name: 'Reverse lunge', sets: 3, reps: 10, category: 'quad', notes: 'Start reverse (less PF stress), progress to forward.' },
  { name: 'Lateral step-down (15-20 cm)', sets: 3, reps: 12, category: 'quad', notes: 'Higher step or add light weight.' },
  { name: 'Single-leg wall sit', sets: 3, reps: 1, category: 'quad', notes: 'Hold 20-30 sec each side. Single-leg isometric.' },
  // Hamstring/Calf
  { name: 'Single-leg RDL with weight', sets: 3, reps: 10, category: 'hamstring', notes: 'Add band or loaded backpack for resistance.' },
  { name: 'Weighted single-leg calf raise (off step)', sets: 3, reps: 15, category: 'calf', notes: 'Full range, slow eccentric 3-4 sec. Hold weight or wear backpack.' },
  // Balance/Plyometric
  { name: 'Single-leg squat on pillow', sets: 3, reps: 8, category: 'balance', notes: 'Quarter squat on unstable surface.' },
  { name: 'Single-leg hop in place (low)', sets: 3, reps: 8, category: 'balance', notes: 'Only if pain-free. Small, controlled hops.' },
  { name: 'Forward/lateral hops', sets: 2, reps: 6, category: 'balance', notes: 'Low, controlled. Each direction, each leg. Only if pain-free.' },
];

export const WEEKLY_EXERCISES = {
  1: PHASE_1_EXERCISES,
  2: PHASE_1_EXERCISES,
  3: PHASE_2_EXERCISES,
  4: PHASE_2_EXERCISES,
  5: PHASE_3_EXERCISES,
  6: PHASE_3_EXERCISES,
  7: PHASE_4_EXERCISES,
  8: PHASE_4_EXERCISES,
};

export const PHASE_NAMES = {
  1: 'Phase 1: Foundation',
  2: 'Phase 1: Foundation',
  3: 'Phase 2: Building',
  4: 'Phase 2: Building',
  5: 'Phase 3: Loading',
  6: 'Phase 3: Loading',
  7: 'Phase 4: Performance',
  8: 'Phase 4: Performance',
};

export const PHASE_GOALS = {
  1: 'Reduce pain, build baseline hip strength, introduce isometric quad work',
  2: 'Reduce pain, build baseline hip strength, introduce isometric quad work',
  3: 'Banded hip work, introduce closed-chain knee loading, begin single-leg transitions',
  4: 'Banded hip work, introduce closed-chain knee loading, begin single-leg transitions',
  5: 'Increase PF joint loading tolerance, heavier resistance, dynamic movements',
  6: 'Increase PF joint loading tolerance, heavier resistance, dynamic movements',
  7: 'Running load tolerance, dynamic/plyometric introduction, sport-specific prep',
  8: 'Running load tolerance, dynamic/plyometric introduction, sport-specific prep',
};

// ─── RETURN-TO-RUNNING PLAN ─────────────────────────────────────
export const RUNNING_PLAN = [
  { week: 1, runMin: 1, walkMin: 4, intervals: 5, totalMin: 25, approxKm: 0.5, sessions: 3, type: 'walk-run', notes: 'Very easy. If any pain >2/10, stop and walk.' },
  { week: 2, runMin: 2, walkMin: 3, intervals: 5, totalMin: 25, approxKm: 1.0, sessions: 3, type: 'walk-run', notes: 'Still conservative. Focus on easy pace and form.' },
  { week: 3, runMin: 3, walkMin: 2, intervals: 6, totalMin: 30, approxKm: 1.8, sessions: 3, type: 'walk-run', notes: 'Increasing run ratio. Monitor 24h post-run pain.' },
  { week: 4, runMin: 4, walkMin: 1, intervals: 6, totalMin: 30, approxKm: 2.4, sessions: 3, type: 'walk-run', notes: 'Walk breaks are now short recoveries. Check knee next morning.' },
  { week: 5, runMin: 5, walkMin: 1, intervals: 5, totalMin: 30, approxKm: 2.5, sessions: 3, type: 'walk-run', notes: 'Running most of the session now. Stay conversational pace.' },
  { week: 6, runMin: 8, walkMin: 1, intervals: 4, totalMin: 36, approxKm: 3.2, sessions: 3, type: 'walk-run', notes: 'Longer run blocks. Can reduce to 3 intervals if feeling strong.' },
  { week: 7, runMin: 12, walkMin: 1, intervals: 3, totalMin: 39, approxKm: 3.8, sessions: 3, type: 'walk-run', notes: 'Nearly continuous. Walk break is precautionary.' },
  { week: 8, runMin: 20, walkMin: 1, intervals: 2, totalMin: 42, approxKm: 4.5, sessions: 4, type: 'walk-run', notes: 'Can attempt 30 min continuous if pain-free. Add 4th session if comfortable.' },
];

// ─── WEEKLY SCHEDULE TEMPLATES ──────────────────────────────────
export const WEEKLY_SCHEDULES = {
  early: { // Weeks 1-4
    label: 'Weeks 1-4',
    days: [
      { day: 'Monday', activity: 'rehab', description: 'Full exercise session' },
      { day: 'Tuesday', activity: 'run', description: 'Run session + hip activation warm-up' },
      { day: 'Wednesday', activity: 'rehab', description: 'Full exercise session' },
      { day: 'Thursday', activity: 'run', description: 'Run session + hip activation warm-up' },
      { day: 'Friday', activity: 'rehab', description: 'Full exercise session' },
      { day: 'Saturday', activity: 'run', description: 'Run session + hip activation warm-up' },
      { day: 'Sunday', activity: 'rest', description: 'Rest day (stretching/foam rolling optional)' },
    ],
  },
  late: { // Weeks 5-8
    label: 'Weeks 5-8',
    days: [
      { day: 'Monday', activity: 'rehab', description: 'Full exercise session' },
      { day: 'Tuesday', activity: 'run', description: 'Run session + hip activation warm-up' },
      { day: 'Wednesday', activity: 'rehab', description: 'Full exercise session' },
      { day: 'Thursday', activity: 'run', description: 'Run session + hip activation warm-up' },
      { day: 'Friday', activity: 'rehab', description: 'Reduced session: hip + balance focus' },
      { day: 'Saturday', activity: 'run', description: 'Run session + hip activation warm-up' },
      { day: 'Sunday', activity: 'rest', description: 'Rest or gentle stretching/foam rolling' },
    ],
  },
};

// ─── SURFACE RECOMMENDATIONS ────────────────────────────────────
export const SURFACES = [
  { name: 'Treadmill', rating: 'Excellent', note: 'Best for early weeks. Controlled speed, consistent surface, slight cushioning.' },
  { name: 'Grass/flat trail', rating: 'Good', note: 'Softer than pavement. Avoid uneven terrain early on.' },
  { name: 'Synthetic track', rating: 'Good', note: 'Cushioned, flat, measured distances.' },
  { name: 'Asphalt road', rating: 'Acceptable', note: 'Better than concrete. Avoid camber (road crown).' },
  { name: 'Concrete/sidewalk', rating: 'Avoid', note: 'Hardest surface, highest impact forces.' },
  { name: 'Hills', rating: 'Avoid until Wk 6+', note: 'Downhill increases PF joint load. Introduce gradually.' },
];

// ─── CADENCE ADVICE ─────────────────────────────────────────────
export const CADENCE_ADVICE = {
  instruction: 'Increase cadence by 7.5-10% from your natural rate.',
  reason: 'A 10% increase in step rate reduces patellofemoral joint force by 16-19%.',
  example: 'If your natural cadence is 160 spm, aim for 172-176 spm.',
  source: 'Lenhart et al. 2014, Bramah et al. 2019',
};

// ─── PFPS EDUCATION TIPS ────────────────────────────────────────
export const EDUCATION_TIPS = [
  {
    title: 'What is Patellofemoral Pain?',
    content: 'Pain around or behind the kneecap (patella), often called "runner\'s knee." The patella doesn\'t track properly in its groove on the femur, causing irritation. It\'s the most common running injury.',
  },
  {
    title: 'Why Hip Strength Matters',
    content: 'Weak hip abductors and external rotators cause the knee to collapse inward during running. This increases patellofemoral joint stress. Hip strengthening is the #1 evidence-based treatment (JOSPT 2019).',
  },
  {
    title: 'The VMO Myth vs Reality',
    content: 'You can\'t isolate the VMO (inner quad muscle). But exercises like terminal knee extensions, step-downs, and wall sits in the 0-45° range effectively strengthen the entire quadriceps with lower PF joint stress.',
  },
  {
    title: 'Why Cadence Matters',
    content: 'Running with a higher step rate (shorter strides) reduces the load on your kneecap by 16-19%. Use a metronome app and aim for 7.5-10% above your natural cadence. This is one of the most effective changes you can make.',
  },
  {
    title: 'The 10% Rule',
    content: 'Never increase weekly running volume by more than 10%. Your bones, tendons, and cartilage adapt slower than your cardiovascular fitness. Patience prevents setbacks.',
  },
  {
    title: 'Pain is Information, Not the Enemy',
    content: 'Mild pain (0-2/10) during activity is acceptable and doesn\'t mean damage. But pain above 4/10 or pain that worsens the next morning means you\'ve done too much. Use the traffic light system: Green (0-2), Amber (3-4), Red (5+).',
  },
  {
    title: 'Downhill Running & Stairs',
    content: 'Downhill and descending stairs put 3-8× your body weight through the PF joint — much more than flat running. Avoid hills early in your program. When you encounter stairs, lead with the unaffected leg going down.',
  },
  {
    title: 'Recovery Is Training',
    content: 'Rest days are when your body rebuilds stronger. Sleep, nutrition, and hydration directly affect tissue recovery. Aim for 7-9 hours of sleep and adequate protein intake (1.6g/kg bodyweight) during rehab.',
  },
  {
    title: 'When to See a Physio',
    content: 'Seek professional help if: pain doesn\'t improve after 2-3 weeks of this program, pain is above 5/10 at rest, you have swelling that doesn\'t resolve in 48h, or your knee locks or gives way.',
  },
  {
    title: 'Shoes & Orthotics',
    content: 'Focus on increasing cadence before changing shoes. If you switch to lower-drop shoes, do so very gradually. Prefabricated foot orthoses may help short-term (JOSPT recommendation), especially if you have flat feet or high midfoot mobility.',
  },
];

// ─── HELPER: Get today's suggested activity ─────────────────────
export function getTodaySuggestion(weekNum, dayOfWeek) {
  if (!weekNum || weekNum < 1 || weekNum > 8) return null;
  const schedule = weekNum <= 4 ? WEEKLY_SCHEDULES.early : WEEKLY_SCHEDULES.late;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[dayOfWeek];
  const todaySchedule = schedule.days.find((d) => d.day === todayName);
  if (!todaySchedule) return null;

  const runPlan = RUNNING_PLAN[weekNum - 1];
  const exercises = WEEKLY_EXERCISES[weekNum];
  const phaseName = PHASE_NAMES[weekNum];
  const phaseGoal = PHASE_GOALS[weekNum];

  return {
    ...todaySchedule,
    runPlan,
    exercises,
    phaseName,
    phaseGoal,
    weekNum,
  };
}
