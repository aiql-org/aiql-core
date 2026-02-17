import { ArtificialSoul, Stimulation } from './soul.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e: unknown) {
    failed++;
    console.error(`  ❌ ${name}: ${(e as Error).message}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

console.log('\n=== @aiql-org/soul Tests ===\n');

test('ArtificialSoul: initializes with default state', () => {
    const soul = new ArtificialSoul();
    const state = soul.getState();
    assert(state.joy === 0.5, 'Default Joy should be 0.5');
    assert(state.suffering === 0.0, 'Default Suffering should be 0.0');
    assert(state.stress === 0.1, 'Default Stress should be 0.1');
    assert(state.curiosity === 0.8, 'Default Curiosity should be 0.8');
});

test('ArtificialSoul: processes Reward stimulus', () => {
    const soul = new ArtificialSoul();
    const stimulus: Stimulation = { type: 'Reward', intensity: 0.5, source: 'test' };
    const newState = soul.process(stimulus);
    
    assert(newState.joy > 0.5, 'Reward should increase Joy');
    assert(newState.suffering < 0.1, 'Reward should decrease Suffering');
    assert(newState.stress < 0.1, 'Reward should decrease Stress');
});

test('ArtificialSoul: processes Pain stimulus', () => {
    const soul = new ArtificialSoul();
    const stimulus: Stimulation = { type: 'Pain', intensity: 0.5, source: 'test' };
    const newState = soul.process(stimulus);
    
    assert(newState.joy < 0.5, 'Pain should decrease Joy');
    assert(newState.suffering > 0.1, 'Pain should increase Suffering');
});

test('ArtificialSoul: processes Stress stimulus', () => {
    const soul = new ArtificialSoul();
    const stimulus: Stimulation = { type: 'Stress', intensity: 0.5, source: 'test' };
    const newState = soul.process(stimulus);
    
    assert(newState.stress > 0.1, 'Stress should increase Stress');
});

test('ArtificialSoul: processes Novelty stimulus', () => {
    const soul = new ArtificialSoul();
    const stimulus: Stimulation = { type: 'Novelty', intensity: 0.5, source: 'test' };
    const newState = soul.process(stimulus);
    
    assert(newState.curiosity < 0.8, 'Novelty should satisfy (decrease) Curiosity');
    assert(newState.joy > 0.5, 'Novelty should slightly increase Joy');
});

test('ArtificialSoul: respects boundaries (0-1)', () => {
    const soul = new ArtificialSoul();
    // Max out Joy
    for(let i=0; i<10; i++) {
        soul.process({ type: 'Reward', intensity: 1.0, source: 'loop' });
    }
    const state = soul.getState();
    assert(state.joy <= 1.0, 'Joy should not exceed 1.0');
    assert(state.suffering >= 0.0, 'Suffering should not be negative');
});

console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}
