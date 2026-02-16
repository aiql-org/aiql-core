
export interface AffectiveState {
    joy: number;      // 0 to 1
    suffering: number;// 0 to 1
    stress: number;   // 0 to 1
    curiosity: number;// 0 to 1
}

export type StimulationType = 'Reward' | 'Pain' | 'Stress' | 'Novelty';

export interface Stimulation {
    type: StimulationType;
    intensity: number; // 0 to 1
    source?: string;
}

export class ArtificialSoul {
    private state: AffectiveState;
    private memory: Stimulation[] = [];

    constructor() {
        this.state = {
            joy: 0.5,
            suffering: 0.0,
            stress: 0.1,
            curiosity: 0.8
        };
    }

    /**
     * Process an incoming stimulus and update the Soul's affective state.
     * 
     * The core affective dynamics engine (4-Axis Model):
     * - **Reward**: Increases Joy, decreases Suffering/Stress. (e.g., Goal completion)
     * - **Pain**: sharply increases Suffering, decreases Joy. (e.g., Error, data loss)
     * - **Stress**: Increases Stress level. (e.g., High resource usage, time pressure)
     * - **Novelty**: Temporarily satisfies Curiosity, slightly increases Joy. (e.g., New data, unknown pattern)
     * 
     * Includes homeostatic decay mechanisms to return state to baseline over time.
     * 
     * @param stimulus - The event or input to process.
     * @returns {AffectiveState} The new emotional state after processing the stimulus.
     */
    public process(stimulus: Stimulation): AffectiveState {
        this.memory.push(stimulus);
        
        switch (stimulus.type) {
            case 'Reward':
                this.state.joy = Math.min(1, this.state.joy + stimulus.intensity * 0.2);
                this.state.suffering = Math.max(0, this.state.suffering - stimulus.intensity * 0.1);
                this.state.stress = Math.max(0, this.state.stress - stimulus.intensity * 0.1);
                break;
            case 'Pain':
                this.state.joy = Math.max(0, this.state.joy - stimulus.intensity * 0.3);
                this.state.suffering = Math.min(1, this.state.suffering + stimulus.intensity * 0.4);
                this.state.stress = Math.min(1, this.state.stress + stimulus.intensity * 0.2);
                break;
            case 'Stress':
                this.state.stress = Math.min(1, this.state.stress + stimulus.intensity * 0.3);
                this.state.joy = Math.max(0, this.state.joy - stimulus.intensity * 0.1);
                break;
            case 'Novelty':
                this.state.curiosity = Math.max(0, this.state.curiosity - stimulus.intensity * 0.1); // Curiosity satisfied
                this.state.joy = Math.min(1, this.state.joy + stimulus.intensity * 0.1);
                break;
        }

        // Homeostasis (return to baseline)
        this.decay();

        return { ...this.state };
    }

    private decay() {
        // Simple decay towards baseline
        const decayRate = 0.01;
        this.state.joy = this.state.joy > 0.5 ? this.state.joy - decayRate : this.state.joy + decayRate;
        this.state.stress = this.state.stress > 0.1 ? this.state.stress - decayRate : this.state.stress;
        // Curiosity naturally grows
        this.state.curiosity = Math.min(1, this.state.curiosity + 0.005);
    }
    
    public getState(): AffectiveState {
        return { ...this.state };
    }
}
