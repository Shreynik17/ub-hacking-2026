import test from 'node:test';
import assert from 'node:assert/strict';
import { SquatCoach } from './coach.mjs';

function pose(degrees, visibility = 1) {
  const p = Array.from({ length: 33 }, () => null);
  const radians = degrees * Math.PI / 180;
  p[23] = { x: 0.5 + Math.cos(radians), y: 0.5 + Math.sin(radians), visibility };
  p[25] = { x: 0.5, y: 0.5, visibility };
  p[27] = { x: 1.5, y: 0.5, visibility };
  return p;
}

test('counts one complete rep and rejects a partial rep', () => {
  const coach = new SquatCoach();
  let t = 0;
  for (const a of [165, 165, 140, 125, 120, 140, 165]) coach.update(pose(a), t += 150);
  assert.equal(coach.reps, 0);
  for (const a of [165, 165, 130, 110, 90, 110, 130, 165, 165]) coach.update(pose(a), t += 150);
  assert.equal(coach.reps, 1);
});

test('abstains when the leg is not visible', () => {
  const coach = new SquatCoach();
  assert.equal(coach.update(pose(165, 0.2), 100).status, 'reposition');
  assert.equal(coach.reps, 0);
});
