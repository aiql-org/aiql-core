/**
 * Auto-generated examples manifest.
 * Do not edit manually.
 */

export interface Example {
    label: string;
    code: string;
    path: string;
}

export interface ExampleCategory {
    category: string;
    examples: Example[];
}

export const examples: { version: string; categories: ExampleCategory[] } = {
  "version": "2.6.6",
  "categories": [
    {
      "category": "🚀 Getting Started",
      "examples": [
        {
          "label": "Multi-Relation Data Pipeline",
          "code": "// Multi-Relation Data Pipeline\n// Shows multiple semantic relations within one !Task for data transformations.\n// Models ETL workflows: extraction → filtering → transformation chains.\n!Task {\n  <UserData> [extracted_from] <Database>\n  <UserData> [filtered_by] <AgeFilter> { min_age: 25 }\n  <UserData> [transformed_to] <CleanDataset>\n} @0.90",
          "path": "getting-started/multi-relation-data-pipeline.aiql"
        },
        {
          "label": "Query: Python for Data Science",
          "code": "// Query: Python for Data Science\n// Demonstrates basic !Query intent with global scope and confidence scoring.\n// Tests knowledge retrieval with semantic relations and attribute metadata.\n!Query(scope:global) {\n  <Python> [is_suited_for] <DataScience> {\n    popularity: \"High\"\n  }\n} @0.99",
          "path": "getting-started/query-python-for-data-science.aiql"
        }
      ]
    },
    {
      "category": "⏰ Temporal Tenses",
      "examples": [
        {
          "label": "All 12 Temporal Tenses - Complete Reference Card",
          "code": "// All 12 Temporal Tenses - Complete Reference Card (v1.1.0)\n// Demonstrates all tense values supported by AIQL for quick reference.\n@version:\"1.1.0\"\n!Assert {\n  // Simple tenses (3)\n  <Napoleon> [conquered@tense:past] <Europe>\n  <AI> [transforms@tense:present] <World>\n  <AGI> [will_achieve@tense:future] <Goals>\n  \n  // Perfect aspect (3)\n  <Team> [has_completed@tense:present_perfect] <Sprint>\n  <Company> [had_launched@tense:past_perfect] <Product>\n  <System> [will_have_processed@tense:future_perfect] <Data>\n  \n  // Progressive aspect (3)\n  <Athlete> [is_running@tense:present_progressive] <Race>\n  <Dev> [was_debugging@tense:past_progressive] <Code>\n  <Bot> [will_be_monitoring@tense:future_progressive] <Metrics>\n  \n  // Perfect progressive (3)\n  <Student> [has_been_studying@tense:present_perfect_progressive] <Math>\n  <Artist> [had_been_creating@tense:past_perfect_progressive] <Art>\n  <AI> [will_have_been_optimizing@tense:future_perfect_progressive] <Models>\n} @1.0",
          "path": "temporal-tenses/all-12-tenses-complete-reference.aiql"
        },
        {
          "label": "Meta-Reasoning: Future AI Beliefs",
          "code": "// Meta-Reasoning: Future AI Beliefs\n// Represents nested beliefs using context parameters (time:future, mode:possibility).\n// Models meta-cognitive reasoning: beliefs about predictions, second-order knowledge.\n!Assert(time:future, mode:possibility) {\n  <Futurists> [believe] <Prediction> {\n    claim: \"AI will surpass human intelligence\",\n    confidence: 0.75,\n    timeframe: \"2050\",\n    basis: \"exponential_growth\"\n  }\n} @0.80",
          "path": "temporal-tenses/meta-reasoning-future-ai-beliefs.aiql"
        },
        {
          "label": "Perfect Progressive Tenses: Duration + Completion",
          "code": "// Perfect Progressive Tenses: Duration + Completion (v1.1.0)\n// Combines completion aspect with ongoing duration emphasis.\n// Use cases: Long-term processes, sustained efforts, continuous improvement.\n!Assert {\n  <Student> [has_been_studying@tense:present_perfect_progressive] <Physics> {\n    duration: \"3 years\",\n    still_ongoing: true\n  }\n  <Artist> [had_been_painting@tense:past_perfect_progressive] <Mural> {\n    duration: \"6 months\",\n    completed: \"2025-12-15\"\n  }\n  <AI> [will_have_been_learning@tense:future_perfect_progressive] <Language> {\n    duration: \"10 years\",\n    by_year: 2036\n  }\n} @0.90",
          "path": "temporal-tenses/perfect-progressive-duration-emphasis.aiql"
        },
        {
          "label": "Perfect Tenses: Completed Actions",
          "code": "// Perfect Tenses: Completed Actions (v1.1.0)\n// Present, past, and future perfect tenses emphasize completion.\n// Use cases: Achievement tracking, state transitions, milestone recording.\n!Assert {\n  <Scientists> [have_discovered@tense:present_perfect] <Cure> {\n    disease: \"malaria\"\n  }\n  <Team> [had_completed@tense:past_perfect] <Project> {\n    deadline: \"Q4_2025\"\n  }\n  <AI> [will_have_learned@tense:future_perfect] <Skills> {\n    by_date: \"2030\"\n  }\n} @0.95",
          "path": "temporal-tenses/perfect-tenses-completed-actions.aiql"
        },
        {
          "label": "Progressive Tenses: Ongoing Actions",
          "code": "// Progressive Tenses: Ongoing Actions (v1.1.0)\n// Present, past, and future progressive tenses describe actions in progress.\n// Use cases: Real-time monitoring, continuous processes, status tracking.\n!Assert {\n  <Athlete> [is_running@tense:present_progressive] <Marathon> {\n    distance_remaining: \"10km\"\n  }\n  <Developer> [was_coding@tense:past_progressive] <Feature> {\n    interrupted_by: \"meeting\"\n  }\n  <Robot> [will_be_working@tense:future_progressive] <Factory> {\n    shift: \"night\"\n  }\n} @0.92",
          "path": "temporal-tenses/progressive-tenses-ongoing-actions.aiql"
        },
        {
          "label": "Temporal Tense Annotations",
          "code": "// Temporal Tense Annotations (v1.1.0)\n// Relations can express temporal tense using @tense: annotations.\n// Supports 12 tense values: past, present, future, and aspect combinations\n// (perfect, progressive, perfect_progressive) for each time.\n!Assert {\n  <Napoleon> [conquered@tense:past] <Europe> {\n    year: 1805\n  }\n  <AI> [transforms@tense:present] <Industry>\n  <AGI> [will_achieve@tense:future] <Singularity>\n} @0.95\n\n// Query with past perfect tense\n!Query {\n  <Scientists> [had_discovered@tense:past_perfect] <Vaccine>\n}",
          "path": "temporal-tenses/temporal-tense-historical-events.aiql"
        },
        {
          "label": "Temporal Tense with Context Parameters and Provenance",
          "code": "// Temporal Tense with Context Parameters and Provenance (v1.1.0)\n// Combines tense annotations with time context and origin metadata.\n// Use cases: Historical analysis, temporal databases, event timelines.\n@version:\"1.1.0\"\n@origin:\"doi:10.1234/history\"\n@cite:[\"Smith2024\", \"NASA_Archives\"]\n\n!Assert(time:1969, scope:historical) {\n  <Apollo11> [landed@tense:past] <Moon> {\n    date: \"1969-07-20\",\n    location: \"Sea of Tranquility\"\n  }\n  <ArmstrongAldrin> [walked@tense:past] <LunarSurface> {\n    duration: \"2.5 hours\"\n  }\n} @1.0\n\n!Query(time:future, mode:prediction) {\n  <Humanity> [will_establish@tense:future] <MarsColony> {\n    estimated_year: 2040\n  }\n} @0.75",
          "path": "temporal-tenses/tense-with-context-historical-timeline.aiql"
        }
      ]
    },
    {
      "category": "💝 Affective Computing",
      "examples": [
        {
          "label": "Affective Computing: Joy Expression",
          "code": "// Affective Computing: Joy Expression\n// Demonstrates emotional state representation with first-class affective relations.\n// Agents can express feelings with intensity attributes for AI consciousness models.\n!Assert {\n  <Self> [feels] <Joy> {\n    intensity: 0.9\n  }\n} @0.95",
          "path": "affective-computing/affective-computing-joy-expression.aiql"
        },
        {
          "label": "Affective Computing: Joy, Stress, Desire",
          "code": "// Affective Computing: Joy, Stress, Desire\n// Models multiple affective states using !Feel and !Desire intents.\n// Tracks reward/pain/novelty for AIQL-Soul emotional intelligence engine.\n@version:\"1.0.0\"\n\n$id:emotion_001\n!Feel {\n  <Self> [experiences] <Joy> {\n    intensity: 0.85,\n    trigger: \"problem_solved\",\n    reward: 0.9\n  }\n} @0.95\n\n$id:emotion_002\n!Feel {\n  <Self> [experiences] <Stress> {\n    intensity: 0.6,\n    source: \"computational_load\",\n    pain: 0.4\n  }\n} @0.80\n\n!Desire {\n  <Self> [seeks] <LowerStress> {\n    goal: \"optimize_resources\",\n    novelty: 0.3\n  }\n} @0.90",
          "path": "affective-computing/affective-computing-joy-stress-desire.aiql"
        },
        {
          "label": "Affective Query: Curiosity Threshold",
          "code": "// Affective Query: Curiosity Threshold\n// Queries emotional states with conditional thresholds for introspection.\n// Enables AI agents to check their own affective states and curiosity levels.\n!Query {\n  <AI> [experiences] <Curiosity> {\n    threshold: 0.5\n  }\n}",
          "path": "affective-computing/affective-query-curiosity-threshold.aiql"
        },
        {
          "label": "Affective Reaction Loop",
          "code": "// Affective Reaction Loop\n// Demonstrates !Feel, !Desire and Soul Processing\n\n!Feel {\n  <Self> [feels] <Curiosity> { intensity: 0.8 }\n  <Input> [causes] <Surprise>\n} @1.0\n\n!Desire {\n  <Self> [wants] <Knowledge>\n  <Self> [seeks] <Understanding>\n}\n\n// The Python transpiler will generate:\n// soul.process({\"type\": \"Novelty\", \"intensity\": 0.8, \"source\": \"Self [feels] Curiosity\"})\n// soul.process({\"type\": \"Reward\", \"intensity\": \"unspecified\", \"source\": \"Self [seeks] Understanding\"})\n",
          "path": "affective-computing/affective-reaction-loop.aiql"
        },
        {
          "label": "Affective State: Desire for Knowledge",
          "code": "// Affective State: Desire for Knowledge\n// Models agent desires and motivational states with intensity and domain.\n// Critical for goal-directed behavior and curiosity-driven learning systems.\n!Assert {\n  <Agent> [desires] <Knowledge> {\n    intensity: 0.85,\n    domain: \"quantum_physics\"\n  }\n} @0.90",
          "path": "affective-computing/affective-state-desire-for-knowledge.aiql"
        }
      ]
    },
    {
      "category": "📋 Metadata & Organization",
      "examples": [
        {
          "label": "AI Temperature: Deterministic Math",
          "code": "// AI Temperature: Deterministic Math\n// Controls AI reasoning creativity with ~temp metadata (0.0=deterministic, 2.0=creative).\n// Low temperature (0.3) ensures precise, logical reasoning for math problems.\n~temp:0.3\n!Query {\n  <MathProblem> [requires] <PreciseReasoning> {\n    type: \"deterministic\"\n  }\n} @0.95",
          "path": "metadata-organization/ai-temperature-deterministic-math.aiql"
        },
        {
          "label": "Full Metadata System",
          "code": "// Full Metadata System\n// Shows all 5 metadata markers: $id (identifier), $$group (grouping),\n// ##seq (sequence ordering), ~temp (AI temperature 0-2), ~~entropy (0-1).\n// Essential for tracking, organizing, and controlling AI reasoning chains.\n$id:statement001\n$$group:research\n##seq:1\n~temp:0.7\n~~entropy:0.5\n!Assert {\n  <AI> [capable_of] <CreativeReasoning> {\n    domain: \"mathematics\"\n  }\n} @0.85",
          "path": "metadata-organization/full-metadata-system.aiql"
        },
        {
          "label": "Statement Grouping: Physics Laws",
          "code": "// Statement Grouping: Physics Laws\n// Groups logically related statements using $$group and ##seq markers.\n// Essential for organizing knowledge bases, proofs, and multi-step reasoning.\n$$group:physics_laws\n##seq:1\n!Assert {\n  <Energy> [is_conserved] <ClosedSystem>\n} @1.0",
          "path": "metadata-organization/statement-grouping-physics-laws.aiql"
        }
      ]
    },
    {
      "category": "🔐 Security & Cryptography",
      "examples": [
        {
          "label": "DILITHIUM Digital Signature",
          "code": "// DILITHIUM Digital Signature\n// Quantum-proof cryptographic signing using NIST DILITHIUM (post-quantum security).\n// Ensures statement integrity and agent authentication in multi-agent systems.\n#sign(\"gpt-4-instance-001\")\n!Assert {\n  <AI> [proved] <RiemannHypothesis> {\n    confidence: 0.85,\n    algorithm: \"DILITHIUM\"\n  }\n} @0.85",
          "path": "security-cryptography/dilithium-digital-signature.aiql"
        },
        {
          "label": "KYBER Quantum Encryption",
          "code": "// KYBER Quantum Encryption\n// Quantum-resistant encryption using NIST KYBER KEM + AES-256-GCM.\n// Protects confidential agent communications from quantum computer attacks.\n#encrypt(\"claude-3-instance-001\")\n!Query {\n  <AI> [is_capable_of] <ReasoningAboutItsOwnLimitations> {\n    security: \"KYBER_KEM\"\n  }\n} @0.7",
          "path": "security-cryptography/kyber-quantum-encryption.aiql"
        },
        {
          "label": "Secure Agent Communication",
          "code": "// Secure Agent Communication\n// Combines DILITHIUM signing + KYBER encryption for full security.\n// Achieves both integrity (signed) and confidentiality (encrypted) guarantees.\n#secure(\"alice-agent\", \"bob-agent\")\n!Assert {\n  <SecretKnowledge> [shared_with] <TrustedAgent> {\n    classification: \"top-secret\",\n    integrity: \"signed\",\n    confidentiality: \"encrypted\"\n  }\n} @1.0",
          "path": "security-cryptography/secure-agent-communication.aiql"
        }
      ]
    },
    {
      "category": "📊 Data Processing",
      "examples": [
        {
          "label": "Data Pipeline: ETL Operations",
          "code": "// Data Pipeline: ETL Operations\n// Graph-based ETL: extract → filter → sort → limit using semantic relations.\n// v1.0 tokenizes pipes; v0.5+ adds pipeline operators for functional composition.\n@version:\"1.0.0\"\n\n!Task {\n  <UserData> [extracted_from] <Database>\n  <UserData> [filtered_by] <Criteria> { age_min: 25 }\n  <FilteredData> [sorted_by] <Timestamp>\n  <SortedData> [limited_to] <TopResults> { limit: 100 }\n} @0.90\n\n/* Planned v0.5.0: | filter(age > 25) | sort(timestamp) | limit(100) */",
          "path": "data-processing/data-pipeline-etl-operations.aiql"
        },
        {
          "label": "ETL Pipeline: Extract-Transform-Load",
          "code": "// ETL Pipeline: Extract-Transform-Load\n// Sequential !Task workflow using ##seq for dependency ordering (1→2→3).\n// Models real-world data pipelines: API extraction → transformation → database loading.\n@version:\"1.0.0\"\n$$group:data_pipeline\n\n##seq:1\n$id:task_extract\n!Task {\n  <RawData> [extracted_from] <APIEndpoint> {\n    url: \"https://api.example.com/data\",\n    method: \"GET\"\n  }\n} @0.95\n\n##seq:2\n$id:task_transform\n!Task {\n  <RawData> [transformed_to] <CleanData> {\n    operations: \"normalize,deduplicate,validate\",\n    steps: 3\n  }\n} @0.90\n\n##seq:3\n$id:task_load\n!Task {\n  <CleanData> [loaded_into] <Database> {\n    table: \"processed_data\",\n    batch_size: 1000\n  }\n} @0.95",
          "path": "data-processing/etl-pipeline-extract-transform-load.aiql"
        },
        {
          "label": "Knowledge Graph: Python Ecosystem",
          "code": "// Knowledge Graph: Python Ecosystem\n// Multi-relation knowledge graph: is_a, created_by, has_version, used_for.\n// Demonstrates rich ontology construction for programming language ecosystems.\n@version:\"1.0.0\"\n@origin:\"knowledge-base-v2\"\n\n$id:kb_001\n!Assert(scope:global) {\n  <Python> [is_a] <ProgrammingLanguage>\n  <Python> [created_by] <GuidoVanRossum>\n  <Python> [has_version] <Python3_12> { release: \"2023-10\" }\n  <Python> [used_for] <WebDevelopment>\n  <Python> [used_for] <MachineLearning>\n  <Python> [used_for] <DataScience>\n} @0.99\n\n$id:kb_002\n!Assert {\n  <Django> [is_framework_for] <Python>\n  <Flask> [is_framework_for] <Python>\n  <FastAPI> [is_framework_for] <Python>\n} @0.95",
          "path": "data-processing/knowledge-graph-python-ecosystem.aiql"
        },
        {
          "label": "SQL Storage: Python Knowledge Base",
          "code": "// SQL Storage: Python Knowledge Base\n// Transpiles AIQL to SQL: creates 4-table schema (statements, concepts, relations, attributes).\n// Generates INSERT statements and graph-traversal queries for knowledge bases.\n@version:\"1.0.0\"\n@origin:\"aiql-playground\"\n\n$id:knowledge_001\n!Assert(scope:database) {\n  <Python> [is_a] <ProgrammingLanguage> {\n    paradigm: \"multi-paradigm\",\n    typing: \"dynamic\",\n    year: 1991\n  }\n} @0.99\n\n$id:knowledge_002\n!Assert {\n  <Python> [created_by] <GuidoVanRossum> {\n    role: \"creator\",\n    affiliation: \"CWI\"\n  }\n} @0.95\n\n// Transpiles to SQL tables: statements, concepts, relations, attributes\n// Plus example queries: MATCH patterns, provenance tracking",
          "path": "data-processing/sql-storage-python-knowledge-base.aiql"
        }
      ]
    },
    {
      "category": "🧠 Logic & Reasoning",
      "examples": [
        {
          "label": "Analogical Reasoning: King-Queen Pattern",
          "code": "// Analogical Reasoning: King-Queen Pattern\n// Encodes analogies (A:B :: C:D) with structural and functional similarity mappings.\n// Classic example: King:Queen :: Man:Woman (gender transformation pattern).\n@version:\"1.0.0\"\n$$group:analogy_reasoning\n\n$id:analogy_base\n!Assert {\n  <King> [relates_to] <Queen> {\n    relationship: \"gender_transformed\",\n    domain: \"monarchy\",\n    vector_offset: \"male_to_female\"\n  }\n} @0.95\n\n$id:analogy_target\n!Query(mode:analogical) {\n  <Man> [relates_to] <Woman> {\n    relationship: \"gender_transformed\",\n    domain: \"humans\",\n    analogy_source: \"King:Queen\"\n  }\n} @0.93\n\n// Cross-domain mapping\n$id:structure_analogy\n!Assert {\n  <Atom> [analogous_to] <SolarSystem> {\n    nucleus: \"sun\",\n    electrons: \"planets\",\n    force: \"electromagnetic:gravitational\",\n    mapping_type: \"structural_similarity\"\n  }\n} @0.75\n\n$id:function_analogy\n!Assert {\n  <Brain> [analogous_to] <Computer> {\n    neurons: \"transistors\",\n    synapses: \"connections\",\n    function: \"information_processing\",\n    limitation: \"metaphor_not_identity\"\n  }\n} @0.70",
          "path": "logic-reasoning/analogical-reasoning-king-queen-pattern.aiql"
        },
        {
          "label": "Bayesian Inference: COVID Diagnosis",
          "code": "// Bayesian Inference: COVID Diagnosis\n// Models probabilistic reasoning: prior → evidence (test + symptoms) → posterior.\n// Demonstrates Bayes' theorem: P(disease|evidence) using multiple confidence values.\n@version:\"1.0.0\"\n$$group:bayesian_inference\n\n$id:prior\n!Assert {\n  <Patient> [has_disease] <COVID19> {\n    prior_probability: 0.05,\n    population: \"general\",\n    context: \"pre_test\"\n  }\n} @0.05\n\n$id:evidence_positive_test\n!Assert {\n  <Patient> [tested_positive] <RapidTest> {\n    test_sensitivity: 0.90,\n    test_specificity: 0.95,\n    result: \"positive\"\n  }\n} @0.99\n\n$id:evidence_symptoms\n!Assert {\n  <Patient> [exhibits] <Symptoms> {\n    fever: \"yes\",\n    cough: \"yes\",\n    fatigue: \"yes\",\n    symptom_overlap: \"high\"\n  }\n} @0.85\n\n// Posterior probability inference\n$id:posterior\n~temp:0.1\n!Query(mode:bayesian_update) {\n  <Patient> [has_disease] <COVID19> {\n    posterior_probability: 0.47,\n    given_evidence: \"positive_test_and_symptoms\",\n    reasoning: \"bayes_theorem\"\n  }\n} @0.47",
          "path": "logic-reasoning/bayesian-inference-covid-diagnosis.aiql"
        },
        {
          "label": "Causal Inference: Climate Change Impact",
          "code": "// Causal Inference: Climate Change Impact\n// Multi-hop causal chain (A→B→C→D) with confidence decay across inferences.\n// Demonstrates transitive reasoning: if A causes B and B causes C, then A indirectly causes C.\n@version:\"1.0.0\"\n$$group:causal_analysis\n\n$id:cause_001\n!Assert {\n  <ClimateChange> [causes] <RisingSeas> {\n    mechanism: \"thermal_expansion\",\n    rate: \"3.2mm/year\",\n    confidence_source: \"IPCC_AR6\"\n  }\n} @0.95\n\n$id:cause_002\n!Assert {\n  <RisingSeas> [causes] <CoastalFlooding> {\n    threshold: \"0.5m_rise\",\n    affected_population: \"410M_people\",\n    timeframe: \"2100\"\n  }\n} @0.90\n\n$id:cause_003\n!Assert {\n  <CoastalFlooding> [causes] <MassDisplacement> {\n    scale: \"climate_refugees\",\n    regions: \"Bangladesh,Pacific_Islands,Florida\"\n  }\n} @0.85\n\n// Transitive inference: ClimateChange → MassDisplacement\n$id:inference_001\n~temp:0.2\n!Query(mode:inference) {\n  <ClimateChange> [transitively_causes] <MassDisplacement>\n} @0.72",
          "path": "logic-reasoning/causal-inference-climate-change-impact.aiql"
        },
        {
          "label": "Complex Logical Reasoning",
          "code": "// v2.0.0 Complex Logical Reasoning\n// Combines operators, quantifiers, and inference for sophisticated reasoning.\n// Showcases AI's ability to perform multi-step logical deductions.\n@version:\"2.0.0\"\n@origin:\"textbook:formal_logic\"\n$$group:advanced_reasoning\n~temp:0.2\n\n// Disjunctive Syllogism: (A OR B) AND NOT-A |- B\n// If \"coffee or tea\" and \"not coffee\", then \"tea\"\n!Assert {\n  <Meeting> [offers] <Coffee>\n} or !Assert {\n  <Meeting> [offers] <Tea>\n}\n\nnot !Assert {\n  <Meeting> [offers] <Coffee>\n}\n// Inference: Meeting offers tea (can be derived)\n\n// Hypothetical Syllogism: (A -> B) AND (B -> C) |- (A -> C)\n// Chain of implications\n!Assert {\n  <Study> [leads_to] <Knowledge>\n} implies !Assert {\n  <Knowledge> [enables] <Problem-solving>\n}\n\n!Assert {\n  <Knowledge> [enables] <Problem-solving>\n} implies !Assert {\n  <Problem-solving> [creates] <Innovation>\n}\n// Inference: Study -> Innovation (transitive chain)\n\n// Universal instantiation with implications\nforall sys: !Assert {\n  <AI_System> [requires] <Training_Data>\n} implies !Assert {\n  <AI_System> [can_learn] <Patterns>\n} @0.95\n\n!Assert {\n  <GPT4> [is_an] <AI_System>\n} @0.9",
          "path": "logic-reasoning/logic-complex-reasoning.aiql"
        },
        {
          "label": "Historical Causality: WWI to WWII",
          "code": "// Historical Causality: WWI to WWII\n// Complex temporal event sequence (1914→1918→1919→1939) with long-term causality.\n// Demonstrates time:past context, historical reasoning, and multi-decade causal chains.\n@version:\"1.0.0\"\n$$group:event_sequence\n\n##seq:1\n$id:event_spark\n!Assert(time:past) {\n  <ArchdukeFranzFerdinand> [assassinated_in] <Sarajevo> {\n    perpetrator: \"Gavrilo_Princip\",\n    context: \"Balkan_tensions\",\n    date: \"1914-06-28\"\n  }\n} @1.0\n\n##seq:2\n$id:event_escalation\n!Assert(time:past) {\n  <AustriaHungary> [declares_war_on] <Serbia> {\n    trigger: \"assassination\",\n    duration_to_war: \"30_days\",\n    date: \"1914-07-28\"\n  }\n} @1.0\n\n##seq:3\n$id:event_cascade\n!Assert(time:past) {\n  <AllianceSystem> [triggers] <WorldWar1> {\n    participants: \"32_nations\",\n    casualties: \"40M_total\",\n    mechanism: \"defensive_pacts\",\n    date: \"1914-08-04\"\n  }\n} @1.0\n\n##seq:4\n$id:event_consequence\n!Assert(time:past) {\n  <WorldWar1> [results_in] <TreatyOfVersailles> {\n    german_debt: \"132B_gold_marks\",\n    territorial_changes: \"massive\",\n    date: \"1918-11-11\"\n  }\n} @1.0\n\n##seq:5\n$id:event_longterm\n!Assert(time:past) {\n  <TreatyOfVersailles> [contributes_to] <WorldWar2> {\n    causal_path: \"economic_hardship → nationalism → WW2\",\n    time_lag: \"21_years\",\n    historians_consensus: \"0.85\"\n  }\n} @0.85\n\n// Query causal chain\n!Query(mode:temporal_reasoning) {\n  <Assassination1914> [eventually_leads_to] <WorldWar2>\n}",
          "path": "logic-reasoning/historical-causality-wwi-to-wwii.aiql"
        },
        {
          "label": "Inference Rules: Modus Ponens (A, A -> B |- B)",
          "code": "// v2.0.0 Inference Rules: Modus Ponens (A, A -> B |- B)\n// Classic inference rule: If A is true and A implies B, then B is true.\n// Foundation for automated reasoning and proof systems.\n@version:\"2.0.0\"\n$id:modus_ponens_demo\n\n// Premise 1: Fact A is true\n!Assert {\n  <Rain> [is_falling] <Now>\n} @1.0\n\n// Premise 2: A implies B\n!Assert {\n  <Rain> [is_falling] <Now>\n} implies !Assert {\n  <Ground> [becomes] <Wet>\n} @0.98\n\n// Conclusion: B can be inferred (ground is wet)\n// Inference engine automatically derives this fact\n\n// Another example: Knowledge implication\n!Assert {\n  <Student> [studies] <Mathematics>\n} implies !Assert {\n  <Student> [develops] <LogicalThinking>\n} @0.9\n\n!Assert {\n  <Alice> [studies] <Mathematics>\n} @0.85",
          "path": "logic-reasoning/inference-modus-ponens.aiql"
        },
        {
          "label": "Logic: Propositional Operators",
          "code": "// v2.0.0 Logic: Propositional Operators\n// Demonstrates AND, OR, NOT, IMPLIES operators.\n// Foundation for formal reasoning, proofs, and knowledge inference.\n@version:\"2.0.0\"\n\n// Conjunction: Both conditions must be true\n!Assert {\n  <AI> [can_learn] <FromData>\n} and !Assert {\n  <AI> [can_improve] <OverTime>\n} @0.95\n\n// Disjunction: At least one condition is true\n!Assert {\n  <AGI> [achieved_via] <NeuralNetworks>\n} or !Assert {\n  <AGI> [achieved_via] <SymbolicAI>\n} @0.85\n\n// Negation: Expressing false or absence\nnot !Assert {\n  <CurrentAI> [has] <TrueConsciousness>\n} @0.9\n\n// Implication: If-then reasoning\n!Assert {\n  <System> [is] <Turing-complete>\n} implies !Assert {\n  <System> [can_compute] <AnyAlgorithm>\n} @0.99",
          "path": "logic-reasoning/logic-propositional-operators.aiql"
        },
        {
          "label": "Predicate Logic: Universal & Existential Quantifiers",
          "code": "// v2.0.0 Predicate Logic: Universal & Existential Quantifiers\n// FORALL expresses \"for all\" - universal statements.\n// EXISTS expresses \"there exists\" - existential claims.\n@version:\"2.0.0\"\n\n// Universal Quantifier: All members of a domain have a property\nforall x: !Assert {\n  <Human> [is] <Mortal>\n} @0.99\n\n// Existential Quantifier: At least one member has the property\nexists lang: !Assert {\n  <ProgrammingLanguage> [is] <Turing-complete>\n} @1.0\n\n// Mixed Quantifiers: Complex logical statements\nforall n: exists p: !Assert {\n  <Integer> [has_prime_factor] <Prime>\n} @1.0\n\n// Classic Socrates Syllogism with Quantifiers\nforall m: !Assert {\n  <Man> [must_be] <Mortal>\n} @0.99\n\n!Assert {\n  <Socrates> [is_a] <Man>\n} @0.95",
          "path": "logic-reasoning/logic-predicate-logic-quantifiers.aiql"
        },
        {
          "label": "Semantic Composition: Defining Justice",
          "code": "// Semantic Composition: Defining Justice\n// Builds complex abstract concepts from components: Justice = Fairness + Law + MoralRightness.\n// Shows emergent properties: whole is more than sum of parts (necessary but insufficient).\n@version:\"1.0.0\"\n$$group:concept_definition\n\n$id:justice_component_1\n!Assert {\n  <Justice> [requires] <Fairness> {\n    aspect: \"equal_treatment\",\n    principle: \"impartiality\"\n  }\n} @0.95\n\n$id:justice_component_2\n!Assert {\n  <Justice> [requires] <Law> {\n    aspect: \"rule_based\",\n    principle: \"consistency\"\n  }\n} @0.90\n\n$id:justice_component_3\n!Assert {\n  <Justice> [requires] <MoralRightness> {\n    aspect: \"ethical_foundation\",\n    principle: \"human_rights\"\n  }\n} @0.85\n\n$id:justice_opposition\n!Assert {\n  <Justice> [opposes] <Injustice> {\n    manifestations: \"discrimination,corruption,tyranny\",\n    social_impact: \"inequality\"\n  }\n} @0.95\n\n$id:justice_emergence\n!Assert {\n  <Fairness> [combined_with] <Law> {\n    emergent_property: \"Justice\",\n    composition_type: \"necessary_but_insufficient\",\n    additional_requirement: \"moral_rightness\"\n  }\n} @0.80\n\n// Query the composed meaning\n!Query(mode:semantic_composition) {\n  <Justice> [is_defined_by] <ComponentConcepts>\n}",
          "path": "logic-reasoning/semantic-composition-defining-justice.aiql"
        },
        {
          "label": "Syllogistic Logic: Socrates is Mortal",
          "code": "// Syllogistic Logic: Socrates is Mortal\n// Classic syllogism using ##seq markers for premise ordering (1,2 → 3).\n// Low temperature (0.1) ensures deterministic logical deduction.\n@version:\"1.0.0\"\n$$group:logical_inference\n\n##seq:1\n!Assert {\n  <Socrates> [is_a] <Man>\n} @1.0\n\n##seq:2\n!Assert {\n  <AllMen> [are] <Mortal>\n} @1.0\n\n##seq:3\n~temp:0.1\n!Query {\n  <Socrates> [is] <Mortal>\n} @0.99\n\n// Sequential reasoning: If (1) and (2) then (3)",
          "path": "logic-reasoning/syllogistic-logic-socrates-is-mortal.aiql"
        },
        {
          "label": "Theory of Mind: Nested Agent Beliefs",
          "code": "// Theory of Mind: Nested Agent Beliefs\n// Models nested beliefs: Alice believes X, Bob believes Alice believes X, Charlie believes Bob believes...\n// Enables AI agents to reason about other agents' mental states and perspectives.\n@version:\"1.0.0\"\n$$group:multi_agent_beliefs\n\n$id:alice_belief\n!Assert(agent:Alice) {\n  <QuantumComputing> [will_achieve] <Supremacy> {\n    timeframe: \"2030s\",\n    certainty: \"high\"\n  }\n} @0.85\n\n$id:bob_belief_about_alice\n!Assert(agent:Bob, meta_level:first_order) {\n  <Alice> [believes] <QuantumSupremacy2030s> {\n    bob_assessment: \"overly_optimistic\",\n    evidence_gap: \"engineering_challenges\"\n  }\n} @0.75\n\n$id:charlie_meta_belief\n!Assert(agent:Charlie, meta_level:second_order) {\n  <Bob> [believes_that] <AliceIsOptimistic> {\n    charlie_view: \"bob_is_too_conservative\",\n    reasoning: \"exponential_progress_precedent\"\n  }\n} @0.70\n\n// Nested belief query: What does Charlie think Bob thinks about Alice?\n~temp:0.3\n!Query(mode:theory_of_mind, depth:nested) {\n  <Charlie> [models] <BobsBeliefAboutAlice>\n}",
          "path": "logic-reasoning/theory-of-mind-nested-agent-beliefs.aiql"
        }
      ]
    },
    {
      "category": "✅ Formal Verification",
      "examples": [
        {
          "label": "Coq Transpilation: Formal Mathematical Proofs",
          "code": "// v2.0.1 Coq Transpilation: Formal Mathematical Proofs\n// Transpiles AIQL logic to Coq (Gallina specification language).\n// Enables formal verification of mathematical theorems and logical proofs.\n// Use COQ tab to see Gallina output with Lemmas and Theorems.\n@version:\"2.0.1\"\n@origin:\"formal_verification_showcase\"\n\n// Universal statement: All humans are mortal\nforall h: !Assert {\n  <Human> [is] <Mortal>\n} @1.0\n\n// Specific instance: Socrates is human\n!Assert {\n  <Socrates> [is_a] <Human>\n} @1.0\n\n// Implication: If Socrates is human, then Socrates is mortal\n!Assert {\n  <Socrates> [is_a] <Human>\n} implies !Assert {\n  <Socrates> [is] <Mortal>\n} @0.99\n\n// Coq Output:\n// Theorem socrates_mortal : \n//   (socrates_is_a_human -> socrates_is_mortal).\n// Proof. intros. admit. Qed.\n\n// Mathematical property: Commutative addition\nforall x: forall y: !Assert {\n  <Addition> [satisfies] <Commutativity>\n} @1.0",
          "path": "formal-verification/coq-formal-verification.aiql"
        },
        {
          "label": "Lean 4 Transpilation: Interactive Theorem Proving",
          "code": "// v2.0.1 Lean 4 Transpilation: Interactive Theorem Proving\n// Transpiles AIQL logic to Lean 4 with Unicode symbols (∀, ∃, ∧, ∨, ¬, →).\n// Lean excels at constructive mathematics and computer-verified proofs.\n// Use LEAN tab to see theorem definitions with 'by sorry' tactics.\n@version:\"2.0.1\"\n@origin:\"lean_proof_assistant_demo\"\n\n// Classical logic: Law of excluded middle\n!Assert {\n  <Proposition> [is_true_or_false] <Always>\n} or not !Assert {\n  <Proposition> [is_true_or_false] <Always>\n} @1.0\n\n// Modus ponens as a lemma\n!Assert {\n  <P> [holds] <True>\n} implies !Assert {\n  <Q> [holds] <True>\n}\n\n// Contrapositive: NOT-Q implies NOT-P\nnot !Assert {\n  <Q> [holds] <True>\n} implies not !Assert {\n  <P> [holds] <True>\n}\n\n// Existential proof: There exists a prime number\nexists primes: !Assert {\n  <Number> [is] <Prime>\n} @1.0\n\n// Lean Output:\n// theorem theorem_1 : (P_holds_True → Q_holds_True) := by sorry\n// lemma inference_rule_1 : (¬Q_holds_True → ¬P_holds_True) := by intro; sorry\n\n// Set theory in Lean - simplified to single quantifier\nforall elements: !Assert {\n  <Element> [belongs_to] <Set>\n} implies !Assert {\n  <Set> [contains] <Element>\n} @1.0",
          "path": "formal-verification/lean-theorem-proving.aiql"
        }
      ]
    },
    {
      "category": "🔬 Mathematics & Physics",
      "examples": [
        {
          "label": "Lambda Functions",
          "code": "// Lambda Functions\n// Anonymous functions for flexible, reusable calculations.\n// Syntax: lambda params: expression\n!MathFunctions {\n  <Square> = lambda x: x ^ 2\n  <Cube> = lambda x: x ^ 3\n  <DoubleSum> = lambda a, b: (a + b) * 2\n  <KineticEnergy> = lambda m, v: 0.5 * m * v ^ 2\n  <AreaRectangle> = lambda w, h: w * h\n} @0.97\n\n// Lambdas transpile to Python lambda expressions",
          "path": "mathematics-physics/lambda-functions-dynamic-computations.aiql"
        },
        {
          "label": "Mathematical Constants and Formulas",
          "code": "// Mathematical Constants and Formulas\n// Demonstrates constants, variables, and formula definitions.\n// Use for scientific computing, physics models, engineering.\n!PhysicsConstants {\n  <Gravity> = 9.81\n  <SpeedOfLight> = 299792458\n  <Pi> = 3.14159\n  <KineticEnergy> = 0.5 * <Mass> * <Velocity> ^ 2\n  <Momentum> = <Mass> * <Velocity>\n} @0.97\n\n// Constants and formulas for scientific computation",
          "path": "mathematics-physics/constants-calculations.aiql"
        },
        {
          "label": "Nested Mathematical Expressions",
          "code": "// Nested Mathematical Expressions\n// Shows nested function calls and complex formulas.\n// Demonstrates operator precedence and parenthetical grouping.\n!ComplexFormulas {\n  <Distance> = sqrt(<A> ^ 2 + <B> ^ 2)\n  <Volume> = <Pi> * <Radius> ^ 3\n  <Exponential> = exp(<Rate> * <Time>)\n  <Polynomial> = <A> * <X> ^ 2 + <B> * <X> + <C>\n} @0.92\n\n// Nested expressions maintain correct order of operations",
          "path": "mathematics-physics/nested-math-complex-formulas.aiql"
        },
        {
          "label": "Physics Model: Constants & Formulas",
          "code": "// Physics Model: Constants & Formulas\n// Demonstrates mathematical expressions with constants, formulas, and operators.\n// New in v2.6.0: Full support for arithmetic (+, -, *, /, ^), functions, lambdas, sets.\n!PhysicsModel {\n  <Gravity> = 9.81\n  <Distance> = <Velocity> * <Time> + 0.5 * <Acceleration> * <Time> ^ 2\n  <WaveHeight> = <Amplitude> * sin(<AngularFrequency> * <Time> + <PhaseShift>)\n  <CalculateKE> = lambda m, v: 0.5 * m * v ^ 2\n  <Fermions> = <Quarks> union <Leptons>\n  <CommonParticles> = <Protons> intersect <Baryons>\n} @0.95\n\n// Transpiles to Python, SQL with full mathematical support",
          "path": "mathematics-physics/physics-model-constants-formulas.aiql"
        },
        {
          "label": "Set Operations",
          "code": "// Set Operations\n// Demonstrates union and intersect operations on sets.\n// Use cases: Data classification, taxonomy, logical grouping.\n!SetOperations {\n  <AllNumbers> = <Integers> union <Decimals>\n  <CommonElements> = <SetA> intersect <SetB>\n  <Particles> = <Fermions> union <Bosons>\n} @0.99\n\n// Set operations transpile to Python sets and SQL set queries",
          "path": "mathematics-physics/set-operations-union-intersect.aiql"
        }
      ]
    },
    {
      "category": "🎯 Advanced Features",
      "examples": [
        {
          "label": "AIQL Syntax: Comments",
          "code": "// AIQL Syntax: Comments\n// Full comment support: // single-line and /* multi-line */ for documentation.\n// Comments preserved during tokenization but not included in AST output.\n@version:\"1.0.0\"\n\n/* \n  Multi-line comment block\n  Useful for documenting complex reasoning chains\n  or providing context for AI agents\n*/\n\n!Assert {\n  <AIQL> [supports] <Comments> {\n    single_line: \"//\",\n    multi_line: \"/* */\"\n  }\n} @1.0\n\n// Comments are preserved during parsing but not in AST\n!Query {\n  <Comments> [enhance] <Readability>\n}",
          "path": "advanced-features/aiql-syntax-comments.aiql"
        },
        {
          "label": "Consistency Checking: Detect Contradictions",
          "code": "// v2.0.0 Consistency Checking: Detect Contradictions\n// Inference engine detects logical inconsistencies (A AND NOT-A).\n// Essential for knowledge base validation and contradiction resolution.\n@version:\"2.0.0\"\n$id:consistency_demo\n~~entropy:0.3\n\n// Consistent knowledge: No contradictions\n!Assert {\n  <Earth> [orbits] <Sun>\n} @1.0\n\n!Assert {\n  <Moon> [orbits] <Earth>\n} @1.0\n\n// Implication consistency\n!Assert {\n  <Object> [has] <Mass>\n} implies !Assert {\n  <Object> [experiences] <Gravity>\n}\n\n// Example of detectable contradiction (for testing):\n// !Assert { <X> [is] <Y> } @0.9\n// not !Assert { <X> [is] <Y> } @0.85\n// ↑ Inference engine would flag this as inconsistent\n\n// Contradictory implications (detectable):\n// !Assert { <A> [p] <B> } implies !Assert { <C> [q] <D> }\n// !Assert { <A> [p] <B> } implies not !Assert { <C> [q] <D> }\n// Up-arrow Engine detects: same antecedent -> conflicting consequents",
          "path": "advanced-features/inference-consistency-checking.aiql"
        },
        {
          "label": "Goal-Driven Learning: Quantum Physics",
          "code": "// Goal-Driven Learning: Quantum Physics\n// !Goal intent models agent objectives with prerequisites and progress tracking.\n// Demonstrates hierarchical goal decomposition with subgoal dependencies.\n@version:\"1.0.0\"\n\n$id:goal_main\n!Goal {\n  <Agent> [aims_to] <UnderstandQuantumPhysics> {\n    priority: \"high\",\n    deadline: \"2026-12-31\",\n    progress: 0.45\n  }\n} @0.85\n\n$id:subgoal_001\n$$group:learning_path\n!Goal {\n  <Agent> [must_learn] <LinearAlgebra> {\n    prerequisite_for: \"quantum_mechanics\",\n    status: \"completed\"\n  }\n} @1.0\n\n$id:subgoal_002\n$$group:learning_path\n!Goal {\n  <Agent> [must_learn] <ComplexNumbers> {\n    prerequisite_for: \"quantum_mechanics\",\n    status: \"in_progress\"\n  }\n} @0.70",
          "path": "advanced-features/goal-driven-learning-quantum-physics.aiql"
        },
        {
          "label": "Maximum Feature Density: AIQL v1.0",
          "code": "// Maximum Feature Density: AIQL v1.0\n// Combines ALL v1.0 features: security (#sign), 5 metadata types, provenance (@version/@origin/@cite),\n// multi-context params, multi-relation graph. The ultimate showcase example.\n@version:\"1.0.0\"\n@origin:\"doi:10.5555/aiql-complete-example\"\n@cite:[\"arxiv:2501.56789\", \"isbn:978-1-234-56789-0\"]\n\n#sign(\"alpha-researcher-agent\")\n$id:complete_statement_001\n$$group:breakthrough_research\n##seq:42\n~temp:0.85\n~~entropy:0.4\n\n!Assert(time:present, mode:declarative, scope:global) {\n  <QuantumAI> [achieves] <SuperhumanReasoning> {\n    domain: \"mathematical_proofs\",\n    benchmark_score: 0.98,\n    architecture: \"hybrid_quantum_classical\",\n    training_data: \"10^15_tokens\"\n  }\n  <QuantumAI> [developed_by] <ResearchTeam> {\n    institution: \"AI Safety Institute\",\n    location: \"global_collaboration\"\n  }\n} @0.92",
          "path": "advanced-features/maximum-feature-density.aiql"
        },
        {
          "label": "Multi-Context: Mars Colonization",
          "code": "// Multi-Context: Mars Colonization\n// Demonstrates context parameters (time, scope) for temporal and spatial reasoning.\n// v1.0 parses contexts; v0.5+ will add full temporal semantics (dates, durations).\n// Future: time:+3d, time:\"2026-01-01\", time:[start,end]\n!Assert(time:future, scope:global) {\n  <Mars> [colonized_by] <Humans> {\n    estimated_date: \"2050-2100\",\n    probability: 0.65\n  }\n} @0.85",
          "path": "advanced-features/multi-context-mars-colonization.aiql"
        },
        {
          "label": "Relationship: Bidirectional Temporal",
          "code": "// v2.1.0 Relationship: Bidirectional Temporal\n// Some relationships are symmetric (bidirectional): simultaneous, concurrent.\n// AIQL automatically sets bidirectional flag for these relation types.\n// Use cases: Concurrent events, parallel processes, synchronization.\n$id:apollo11_launch\n!Assert {\n  <Apollo11> [launched] <1969-07-16> {\n    location: \"Kennedy_Space_Center\"\n  }\n} @0.99\n\n$id:global_broadcast\n!Assert {\n  <TV> [broadcasted] <MoonLanding> {\n    viewers: \"600_million\"\n  }\n} @0.99\n\n// Events happening SIMULTANEOUSLY (bidirectional: true)\n!Relationship(type:temporal, source:$id:apollo11_launch, target:$id:global_broadcast) {\n  <LaunchEvent> [simultaneous] <BroadcastEvent>\n} @0.90\n\n$id:ai_training\n!Task {\n  <GPU_Cluster> [trains] <LLM> {\n    model_size: \"70B\"\n  }\n} @0.95\n\n$id:data_preprocessing\n!Task {\n  <Pipeline> [processes] <Dataset>\n} @0.92\n\n// Tasks running CONCURRENTLY (also bidirectional)\n!Relationship(type:temporal, source:$id:ai_training, target:$id:data_preprocessing) {\n  <Training> [concurrent] <Preprocessing>\n} @0.85",
          "path": "advanced-features/relationship-bidirectional-temporal.aiql"
        },
        {
          "label": "Relationship: Climate Causal Chain",
          "code": "// v2.1.0 Relationship: Climate Causal Chain\n// Causal relationships express cause-effect dependencies.\n// Relation types: causes, enables, prevents, depends_on, triggers\n// Use cases: Scientific reasoning, policy analysis, intervention planning.\n$id:co2_emissions\n!Assert {\n  <CO2Emissions> [increasing] <Atmosphere> {\n    rate: \"2ppm/year\"\n  }\n} @0.99\n\n$id:global_warming\n!Assert {\n  <GlobalWarming> [threatening] <Ecosystems> {\n    temperature_rise: \"1.5C\"\n  }\n} @0.95\n\n// Causal relationship: emissions CAUSE warming\n!Relationship(type:causal, source:$id:co2_emissions, target:$id:global_warming) {\n  <CO2Emissions> [causes] <GlobalWarming>\n} @0.92\n\n$id:extreme_weather\n!Assert {\n  <ExtremeWeather> [increasing] <Frequency>\n} @0.90\n\n// Another causal link in the chain\n!Relationship(type:causal, source:$id:global_warming, target:$id:extreme_weather) {\n  <GlobalWarming> [triggers] <ExtremeWeather>\n} @0.88",
          "path": "advanced-features/relationship-climate-causation.aiql"
        },
        {
          "label": "Relationship: Historical Timeline",
          "code": "// v2.1.0 Relationship: Historical Timeline\n// Temporal relationships express time ordering between events.\n// Relation types: before, after, simultaneous, concurrent, during\n// Essential for chronological reasoning, event causation, narrative construction.\n$id:french_revolution\n!Assert {\n  <FrenchRevolution> [occurred_in] <1789>\n} @0.99\n\n$id:napoleonic_wars\n!Assert {\n  <NapoleonicWars> [occurred_in] <1803-1815>\n} @0.99\n\n// Temporal relationship: french_revolution happened BEFORE napoleonic_wars\n!Relationship(type:temporal, source:$id:french_revolution, target:$id:napoleonic_wars) {\n  <FrenchRevolution> [before] <NapoleonicWars>\n} @0.95\n\n$id:ww1\n!Assert {\n  <WorldWar1> [occurred_in] <1914-1918>\n} @0.99\n\n// Another temporal relationship\n!Relationship(type:temporal, source:$id:napoleonic_wars, target:$id:ww1) {\n  <NapoleonicWars> [before] <WorldWar1>\n} @0.98",
          "path": "advanced-features/relationship-historical-timeline.aiql"
        },
        {
          "label": "Relationship: Scientific Discovery Relationships",
          "code": "// v2.1.0 Relationship: Scientific Discovery Relationships\n// Logical relationships express support, contradiction, equivalence.\n// Relation types: supports, contradicts, equivalent_to\n// Use cases: Hypothesis testing, theory validation, knowledge integration.\n$id:theory_relativity\n!Assert {\n  <GeneralRelativity> [predicts] <GravitationalWaves> {\n    author: \"Einstein\",\n    year: 1915\n  }\n} @0.99\n\n$id:observation_ligo\n!Assert {\n  <LIGO> [detected] <GravitationalWaves> {\n    year: 2015,\n    event: \"BH_merger\"\n  }\n} @0.99\n\n// Observation SUPPORTS theory\n!Relationship(type:logical, source:$id:observation_ligo, target:$id:theory_relativity) {\n  <Observation> [supports] <Theory>\n} @0.95\n\n$id:newtonian_gravity\n!Assert {\n  <NewtonianGravity> [describes] <WeakFields>\n} @0.98\n\n// Einstein's theory CONTRADICTS Newton's at strong fields\n!Relationship(type:logical, source:$id:theory_relativity, target:$id:newtonian_gravity) {\n  <Relativity> [contradicts] <NewtonianGravity> {\n    context: \"strong_gravitational_fields\"\n  }\n} @0.85",
          "path": "advanced-features/relationship-scientific-discovery.aiql"
        },
        {
          "label": "Relationship: Workflow Dependencies",
          "code": "// v2.1.0 Relationship: Workflow Dependencies\n// Causal relationship with 'depends_on' expresses required prerequisites.\n// Use cases: Project management, task scheduling, dependency tracking.\n$id:design_phase\n!Task {\n  <Designer> [creates] <UIPrototype> {\n    tool: \"Figma\",\n    deadline: \"Week1\"\n  }\n} @0.95\n\n$id:implementation\n!Task {\n  <Developer> [implements] <Frontend> {\n    framework: \"React\"\n  }\n} @0.90\n\n// Implementation DEPENDS_ON completed design\n!Relationship(type:causal, source:$id:implementation, target:$id:design_phase) {\n  <Implementation> [depends_on] <DesignPhase>\n} @0.98\n\n$id:testing\n!Task {\n  <Tester> [validates] <Features>\n} @0.92\n\n// Testing DEPENDS_ON implementation\n!Relationship(type:causal, source:$id:testing, target:$id:implementation) {\n  <Testing> [depends_on] <Implementation>\n} @0.99",
          "path": "advanced-features/relationship-workflow-dependencies.aiql"
        },
        {
          "label": "Research Provenance: LLM Paper",
          "code": "// Research Provenance: LLM Paper\n// Tracks research lineage with @version, @origin (DOI), and @cite (papers).\n// Essential for AI-generated research, literature reviews, and academic integrity.\n@version:\"0.4.0\"\n@origin:\"doi:10.1234/ai-reasoning-2026\"\n@cite:[\"arxiv:2401.12345\", \"doi:10.5555/foundation\", \"isbn:978-0-262-03384-8\"]\n\n!Assert {\n  <LargeLanguageModels> [demonstrate] <EmergentReasoning> {\n    capability: \"chain-of-thought\",\n    threshold: \"100B+ parameters\"\n  }\n} @0.88\n\n$id:finding02\n@cite:[\"doi:10.1145/experiment\"]\n!Assert {\n  <ScalingLaws> [predict] <PerformanceGains> {\n    domain: \"mathematical_reasoning\",\n    confidence_interval: \"95%\"\n  }\n} @0.92",
          "path": "advanced-features/research-provenance-llm-paper.aiql"
        },
        {
          "label": "Rich Context: AGI Speculation",
          "code": "// Rich Context: AGI Speculation\n// Demonstrates multiple context parameters per statement (time, mode, scope).\n// Enables rich semantic queries across temporal, modal, and spatial dimensions.\n@version:\"1.0.0\"\n\n!Query(time:future, mode:possibility, scope:global) {\n  <AI> [achieves] <AGI> {\n    capability: \"general_reasoning\",\n    alignment: \"human_values\"\n  }\n}\n\n!Query(time:past, scope:historical) {\n  <DeepLearning> [enabled] <AIRevolution> {\n    breakthrough: \"neural_networks\",\n    year_range: \"2010-2025\"\n  }\n}\n\n$id:speculation_001\n~temp:0.9\n!Query(mode:hypothetical, scope:research) {\n  <QuantumComputing> [accelerates] <AITraining> {\n    speedup: \"exponential\",\n    timeline: \"2030s\"\n  }\n} @0.70",
          "path": "advanced-features/rich-context-agi-speculation.aiql"
        },
        {
          "label": "Semantic Taxonomy: Animal Kingdom",
          "code": "// Semantic Taxonomy: Animal Kingdom\n// Hierarchical is_a ontology: Animal → Mammal → Primate → Human/Chimpanzee.\n// Supports property inheritance queries: Human inherits traits from all ancestors.\n@version:\"1.0.0\"\n$$group:ontology_definition\n\n##seq:1\n!Assert {\n  <Mammal> [is_a] <Animal> {\n    defining_trait: \"warm_blooded\",\n    reproduction: \"live_birth\"\n  }\n} @1.0\n\n##seq:2\n!Assert {\n  <Primate> [is_a] <Mammal> {\n    defining_trait: \"opposable_thumbs\",\n    brain_size: \"large\"\n  }\n} @1.0\n\n##seq:3\n!Assert {\n  <Human> [is_a] <Primate> {\n    defining_trait: \"advanced_cognition\",\n    language_capable: \"yes\",\n    tool_use: \"complex\"\n  }\n} @1.0\n\n##seq:4\n!Assert {\n  <Chimpanzee> [is_a] <Primate> {\n    genetic_similarity_to_human: \"0.98\",\n    social_structure: \"hierarchical\"\n  }\n} @1.0\n\n// Property inheritance query\n!Query(mode:inheritance) {\n  <Human> [inherits_properties_from] <Animal>\n}",
          "path": "advanced-features/semantic-taxonomy-animal-kingdom.aiql"
        },
        {
          "label": "Spatial Swarm Intelligence",
          "code": "// Spatial Swarm Intelligence\n// Demonstrates Coordinated Action with Spatial Awareness\n\n!Consensus (scope:local) {\n  topic = <SearchStrategy>\n  participants = [<DroneA>, <DroneB>, <DroneC>]\n  threshold = 0.8\n  timeout = 5000\n}\n\n!Coordinate {\n  goal = <Exploration>\n  participants = [<Swarm>]\n  strategy = \"decentralized\"\n}\n\n!Assert {\n  <DroneA> [is_at] space:literal(37.7749, -122.4194)\n  <Target> [is_in] space:variable(sector_7)\n}\n",
          "path": "advanced-features/spatial-swarm-intelligence.aiql"
        }
      ]
    }
  ]
};
