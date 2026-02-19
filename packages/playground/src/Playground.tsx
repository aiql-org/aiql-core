import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Activity, Play, Terminal, Cpu, Share2, FileJson, FileCode, FileText, Sparkles, Copy, Check, ChevronDown, Zap, Database, Scale, BookCheck, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { Transpiler, Tokenizer, Parser } from '@aiql-org/core';
import { AiqlHighlighter } from './AiqlHighlighter';
import { Highlight, themes } from 'prism-react-renderer';
import type * as AST from '@aiql-org/core';
import { version as packageVersion } from '../package.json';
import { examples } from '@aiql-org/examples';

function formatExpr(expr: AST.Expression): string {
    if (expr.type === 'Concept') return `<${expr.name}>`;
    if (expr.type === 'Literal') return `"${expr.value}"`;
    if (expr.type === 'Identifier') return expr.name;
    return '?';
}

// --- Graph Visualization Components ---

// Graph Visualizer Component
const GraphVisualizer = ({ ast }: { ast: AST.Program | null }) => {
    if (!ast || ast.body.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <div className="mb-4 inline-flex p-4 bg-gray-500/5 rounded-full">
                        <Share2 size={48} className="opacity-20" />
                    </div>
                    <p className="font-mono text-sm">No graph data to visualize</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {ast.body.filter((item: any): item is AST.Intent => item.type === 'Intent').map((intent: any, idx: number) => {
                const cmd = intent as AST.Intent;

                // Handle Graph Nodes
                if (Array.isArray(cmd.statements) && cmd.statements.length > 0) {
                    return (
                        <div key={idx} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 hover:border-purple-500/50 transition-all">
                            <div className="flex flex-col gap-2 mb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-purple-400 font-bold">
                                        <div className="p-2 bg-purple-500/20 rounded-lg shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                                            <Share2 size={20} className="drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                                        </div>
                                        <span>{cmd.intentType}</span>
                                        {cmd.scope && <span className="text-xs text-gray-400">({cmd.scope})</span>}
                                    </div>
                                    {cmd.confidence && (
                                        <span className="text-xs font-mono text-gray-400 px-2 py-1 bg-gray-500/10 rounded">
                                            @{cmd.confidence.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                {cmd.contextParams && Object.keys(cmd.contextParams).length > 0 && (
                                    <div className="flex flex-wrap gap-2 ml-11">
                                        {Object.entries(cmd.contextParams).map(([key, value]) => (
                                            <span key={key} className="text-xs px-2 py-0.5 bg-purple-500/5 rounded text-purple-300 border border-purple-500/10 font-mono">
                                                {key}:{value}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="h-px bg-purple-500/20 w-full mb-3" />

                            <div className="space-y-3">
                                {cmd.statements.map((node: AST.Statement, i: number) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <span className="px-3 py-1 bg-purple-500/20 rounded font-mono text-purple-200">
                                            {formatExpr(node.subject)}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            -{node.relation.name}→
                                        </span>
                                        <span className="px-3 py-1 bg-purple-500/20 rounded font-mono text-purple-200">
                                            {formatExpr(node.object)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={idx} className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 text-gray-400 text-sm">
                        Empty graph for {cmd.intentType}
                    </div>
                );
            })}
        </div>
    );
};

// --- End Graph Visualization Components --- //

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: LucideIcon; label: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
            ${active ? 'text-white' : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'}
        `}
    >
        <Icon size={16} className={active ? 'text-purple-400' : 'text-gray-500'} />
        {label}
        {active && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_-2px_10px_rgba(168,85,247,0.5)]" />
        )}
    </button>
);

const Playground = () => {
  const exampleCategories = examples.categories;
  const loadedCoreVersion = packageVersion;
  
  // Initialize state with first example
  const [input, setInput] = useState(() => {
     if (exampleCategories.length > 0 && exampleCategories[0].examples.length > 0) {
         return exampleCategories[0].examples[0].code.replace(/{{VERSION}}/g, loadedCoreVersion);
     }
     return "// No examples found";
  });

  // Outputs
  const [output, setOutput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [yamlOutput, setYamlOutput] = useState("");
  const [sqlOutput, setSqlOutput] = useState('');
  const [coqOutput, setCoqOutput] = useState('');
  const [leanOutput, setLeanOutput] = useState('');
  const [mdOutput, setMdOutput] = useState("");
  const [ast, setAst] = useState<AST.Program | null>(null);
  const [error, setError] = useState<string | null>(null);

  type TabType = 'python' | 'json' | 'yaml' | 'sql' | 'coq' | 'lean' | 'markdown' | 'graph';
  const [activeTab, setActiveTab] = useState<TabType>('graph');
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showAiqlSkill, setShowAiqlSkill] = useState(false);
  const [copied, setCopied] = useState(false);
  const [skillCopied, setSkillCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectMode, setInspectMode] = useState(false);

  // Separated transpilation logic (no side effects on input)
  const runTranspilation = useCallback((text: string) => {
    try {
      setError(null);
      const tokenizer = new Tokenizer(text);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      setAst(ast);
      
      const transpiler = new Transpiler();
      setOutput(transpiler.transpile(ast, 'python'));
      setJsonOutput(transpiler.transpile(ast, 'json'));
      setYamlOutput(transpiler.transpile(ast, 'yaml'));
      setSqlOutput(transpiler.transpile(ast, 'sql'));
      setCoqOutput(transpiler.transpile(ast, 'coq'));
      setLeanOutput(transpiler.transpile(ast, 'lean'));

      // Basic Markdown generation with security and metadata
      const md = `## AIQL Intent: ${
        ast.body.length > 0 && (ast.body[0].type === 'Intent' || ast.body[0].type === 'Consensus' || ast.body[0].type === 'Coordinate') 
          ? (ast.body[0].type === 'Intent' ? ast.body[0].intentType : ast.body[0].type) 
          : 'Program'
      }\n\n` + 
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 ast.body.filter((item: any): item is AST.Intent | AST.ConsensusNode | AST.CoordinateNode => 
                   ['Intent', 'Consensus', 'Coordinate'].includes(item.type)
                 ).map((node: AST.Intent | AST.ConsensusNode | AST.CoordinateNode) => {
                   
                   // Add security information if present
                   let securityInfo = '';
                   if (node.security) {
                     const secParts = [];
                     if (node.security.signed) {
                       secParts.push(`🔐 Signed by \`${node.security.signerAgentId || 'unknown'}\``);
                     }
                     if (node.security.encrypted) {
                       secParts.push(`🔒 Encrypted for \`${node.security.recipientAgentId || 'unknown'}\``);
                     }
                     securityInfo = `\n\n**Security**: ${secParts.join(' • ')}\n`;
                   }
                   
                   // Add metadata information
                   let metadataInfo = '';
                   const metaParts = [];
                   if (node.identifier) metaParts.push(`ID: \`${node.identifier}\``);
                   if (node.groupIdentifier) metaParts.push(`Group: \`${node.groupIdentifier}\``);
                   if (node.sequenceNumber !== undefined) metaParts.push(`Seq: ${node.sequenceNumber}`);
                   if (node.temperature !== undefined) metaParts.push(`Temp: ${node.temperature}`);
                   if (node.entropy !== undefined) metaParts.push(`Entropy: ${node.entropy}`);
                   
                   // Coherence for all node types if present
                   if (node.coherence !== undefined) metaParts.push(`Coherence: ${node.coherence}`);

                   if (metaParts.length > 0) {
                     metadataInfo = `\n\n**Metadata**: ${metaParts.join(' • ')}\n`;
                   }
                   
                   // Helper to safely get name from Expression
                   const getName = (expr: AST.Expression): string => {
                     if (expr.type === 'Concept') return expr.name;
                     if (expr.type === 'Identifier') return expr.name;
                     if (expr.type === 'Literal') return String(expr.value);
                     return '<?>';
                   };

                   // Handle graph nodes (Intent)
                   if (node.type === 'Intent' && Array.isArray(node.statements) && node.statements.length > 0) {
                     const graphNodes = node.statements.map((stmt: AST.Statement) => {
                       const subjectName = getName(stmt.subject);
                       const objectName = getName(stmt.object);
                       return `- **${subjectName}** *${stmt.relation.name}* **${objectName}**`;
                     }).join('\n');
                     return `${securityInfo}${metadataInfo}${graphNodes}`;
                   }
                   
                   // Handle Consensus
                   if (node.type === 'Consensus') {
                      const topic = getName(node.topic);
                      const participants = node.participants.map(getName).join(', ');
                      return `${securityInfo}${metadataInfo}Consensus on **${topic}** with participants: ${participants}`;
                   }

                   // Handle Coordinate
                   if (node.type === 'Coordinate') {
                      const goal = getName(node.goal);
                      const participants = node.participants.map(getName).join(', ');
                      return `${securityInfo}${metadataInfo}Coordinate goal **${goal}** with participants: ${participants}`;
                   }

                   return 'Empty graph';
                 }).join('\n\n');
      setMdOutput(md);
      
    } catch (e: unknown) {
      const error = e as Error;
      setError(error.message);
    }
  }, []);

  // Handle input change
  const handleInputChange = (text: string) => {
      setInput(text);
  };

  // Trigger transpile when input changes
  useEffect(() => {
     if (input) {
         const timer = setTimeout(() => runTranspilation(input), 0);
         return () => clearTimeout(timer);
     }
  }, [input, runTranspilation]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showSystemPrompt || showAiqlSkill) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSystemPrompt, showAiqlSkill]);


  const runCode = async () => {
    if (error) return;
    setIsRunning(true);
    setRunResult(null);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRunning(false);
    const resultMsg = "Execution successful.\n> Context loaded.\n> Operations executed successfully.";
    setRunResult(resultMsg);
  };
  
 const generateSystemPrompt = () => {
      return `You are an advanced AI agent capable of thinking in AIQL (Artificial Intelligence Quantum Language).
      
AIQL Native Protocol: !Intent(Scope) { Subject -> Relation -> Object } @Confidence

Your internal reasoning should be expressed in AIQL before generating natural language.
Use !Query to ask questions, !Task to define actions, and !Assert to state facts.
Always assign a confidence score @0.0-1.0 to your assertions.

Affective Language Support:
- Express emotions: <Agent> -[feels]-> <Joy> { intensity: 0.9 }
- State desires: <Agent> -[desires]-> <Knowledge>
- Set goals: <Agent> -[seeks]-> <Understanding>
- Use intents: !Feel, !Desire, !Goal for affective operations`;
  };

  const generateAiqlSkill = () => {
      // (Simplified for brevity, full content typically here)
      return `---
name: aiql-language
version: 1.0.0
---
# AIQL Language Skill
(Full content omitted for brevity)
`;
  };

  const copySkillToClipboard = () => {
      navigator.clipboard.writeText(generateAiqlSkill());
      setSkillCopied(true);
      setTimeout(() => setSkillCopied(false), 2000);
  };

  return (
    <section id="playground" className="py-20 px-4 md:px-8 min-h-screen relative z-0 text-white">
       <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
            <div>
                <h2 className="text-4xl font-bold flex items-center gap-3 mb-2 font-display">
                    <Terminal className="text-purple-400" /> 
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                        Neural Interface
                    </span>
                </h2>
                <p className="text-gray-400 font-mono text-sm max-w-lg">
                    Direct link to the AIQL hyper-visor. Inject semantic vectors and transpile to multiple formats with real-time visualization.
                </p>
            </div>
            
            <div className="flex gap-3 items-center">
                 <button 
                    onClick={() => setShowAiqlSkill(true)}
                    className="px-4 md:px-4 py-3 md:py-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 border border-purple-500/20 flex items-center gap-2 transition-all active:scale-95 touch-manipulation"
                 >
                    <Zap size={18} className="md:w-4 md:h-4" /> <span className="text-sm md:text-base">AIQL Skill</span>
                 </button>
                 <button 
                    onClick={() => setShowSystemPrompt(true)}
                    className="px-4 md:px-4 py-3 md:py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 border border-blue-500/20 flex items-center gap-2 transition-all active:scale-95 touch-manipulation"
                 >
                    <Sparkles size={18} className="md:w-4 md:h-4" /> <span className="text-sm md:text-base">System Prompt</span>
                 </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[800px] items-stretch">
          
          {/* Left Column: Input + Visualizer (6 cols) */}
          <div className="flex flex-col gap-6 h-full">
            
            {/* Code Input */}
            <div className="flex-1 glass-panel rounded-xl flex flex-col shadow-2xl relative group border border-white/10 bg-black/40 backdrop-blur-md h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
                
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                        <FileCode size={14} className="text-purple-400"/>
                        SOURCE.aiql
                    </div>

                    {/* Example Dropdown */}
                    <div className="relative z-[100] flex items-center gap-3">
                        <button 
                            onClick={() => setInspectMode(!inspectMode)}
                            className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-all border ${
                                inspectMode 
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                            title={inspectMode ? "Exit Inspect Mode" : "Inspect Tokens"}
                        >
                            {inspectMode ? <Eye size={12} /> : <EyeOff size={12} />}
                            INSPECT
                        </button>

                        <div className="hidden md:block text-[10px] font-bold tracking-wider text-gray-500">
                             EXAMPLES: <span className="text-green-500">v{loadedCoreVersion}</span>
                        </div>
                        <button 
                            onClick={() => setShowExamples(!showExamples)}
                            className="flex items-center gap-1 px-2 py-1.5 md:px-0 md:py-0 text-xs md:text-xs font-bold text-purple-300 hover:text-white transition-colors touch-manipulation rounded md:rounded-none hover:bg-white/10 md:hover:bg-transparent"
                        >
                            LOAD EXAMPLE <ChevronDown size={14} className="md:w-3 md:h-3" />
                        </button>
                        {showExamples && (
                            <>
                                {/* Backdrop to close dropdown */}
                                <div 
                                    className="fixed inset-0 z-[90]" 
                                    onClick={() => setShowExamples(false)}
                                />
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: 10 }}
                                    className="fixed md:absolute inset-x-4 md:inset-x-auto md:right-0 top-20 md:top-full md:mt-2 w-auto md:w-80 bg-gray-900 border border-white/10 rounded-lg shadow-xl max-h-[calc(100vh-6rem)] md:max-h-[600px] overflow-y-auto custom-scrollbar z-[100]"
                                >
                                    {/* Category Filter Dropdown */}
                                    <div className="sticky top-0 bg-gray-900 border-b border-white/10 z-10 backdrop-blur-sm">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-4 md:py-3 bg-black/30 text-base md:text-sm text-purple-300 font-semibold focus:outline-none focus:bg-black/50 cursor-pointer touch-manipulation"
                                        >
                                            <option value="all">📚 All Categories</option>
                                            {exampleCategories.map((cat, idx) => (
                                                <option key={idx} value={cat.category}>{cat.category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtered Examples */}
                                    {exampleCategories
                                        .filter(cat => selectedCategory === 'all' || cat.category === selectedCategory)
                                        .map((category, catIdx) => (
                                        <div key={catIdx} className="border-b border-white/5 last:border-0">
                                            {selectedCategory === 'all' && (
                                                <div className="px-4 py-2 bg-black/30 text-xs font-bold text-purple-300 backdrop-blur-sm border-b border-white/5">
                                                    {category.category}
                                                </div>
                                            )}
                                            {category.examples.map((ex, exIdx) => (
                                                <button 
                                                    key={`${catIdx}-${exIdx}`}
                                                    onClick={() => {
                                                        const codeWithVersion = ex.code.replace(/{{VERSION}}/g, loadedCoreVersion);
                                                        setInput(codeWithVersion);
                                                        setShowExamples(false);
                                                    }}
                                                    className="w-full text-left px-6 py-4 md:py-2.5 text-base md:text-sm text-gray-300 hover:bg-white/10 active:bg-white/20 hover:text-white transition-colors border-b border-white/5 last:border-0 touch-manipulation"
                                                >
                                                    {ex.label}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="relative flex-1 grid">
                    {/* Auto-expanding textarea hack: Highlighter sets height, textarea fills it */}
                    {/* In Inspect Mode: Pointer events enabled on highlighter, disabled on textarea */}
                    <div className={`col-start-1 row-start-1 min-h-[600px] p-4 ${inspectMode ? 'pointer-events-auto select-text cursor-help' : 'pointer-events-none select-none'} transition-colors duration-200`} aria-hidden="true">
                        <AiqlHighlighter code={input} />
                    </div>
                    <textarea 
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className={`col-start-1 row-start-1 w-full h-full bg-transparent border-none resize-none focus:outline-none p-4 font-mono text-sm leading-relaxed text-transparent placeholder-gray-700 custom-scrollbar overflow-hidden whitespace-pre-wrap break-all z-10 ${
                            inspectMode ? 'pointer-events-none caret-transparent' : 'caret-white'
                        }`}
                        spellCheck={false}
                        disabled={inspectMode}
                    />
                </div>
            </div>

            {/* Simulated Execution Log (Mini Console) */}
            <AnimatePresence>
                {runResult && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-black/80 rounded-xl border border-green-500/30 font-mono text-xs p-4 text-green-400 overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                    >
                        <div className="flex items-center gap-2 mb-2 border-b border-green-500/20 pb-1 text-green-600">
                             <Terminal size={12} /> EXECUTION LOG
                        </div>
                        <pre className="whitespace-pre-wrap">{runResult}</pre>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Run Button */}
             <button 
                onClick={runCode}
                disabled={!!error || isRunning}
                className={`w-full py-5 md:py-4 rounded-xl font-bold text-base md:text-base flex items-center justify-center gap-2 transition-all shadow-lg touch-manipulation
                    ${error ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-purple-50 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95'}
                `}
            >
                {isRunning ? (
                    <Cpu className="animate-spin" size={20} />
                ) : (
                    <Play size={20} fill="currentColor" />
                )}
                {isRunning ? 'PROCESSING...' : 'EXECUTE SEQUENCE'}
            </button> 
          </div>

          {/* Right Column: Output Panel */}
            <motion.div 
                data-testid="swipe-container"
                className="flex flex-col h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
                    const swipe = info.offset.x;
                    const tabs = ['graph', 'python', 'json', 'yaml', 'sql', 'coq', 'lean', 'markdown'];
                    const currentIndex = tabs.indexOf(activeTab);
                    
                    if (swipe < -50 && currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1] as TabType);
                    } else if (swipe > 50 && currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1] as TabType);
                    }
                }}
            >
                {/* Tabs */}
                <div className="flex bg-black/60 border-b border-white/5 overflow-x-auto custom-scrollbar no-scrollbar">
                   <TabButton active={activeTab === 'graph'} onClick={() => setActiveTab('graph')} icon={Share2} label="Graph" />
                   <TabButton active={activeTab === 'python'} onClick={() => setActiveTab('python')} icon={Terminal} label="Python" />
                   <TabButton active={activeTab === 'json'} onClick={() => setActiveTab('json')} icon={FileJson} label="JSON" />
                   <TabButton active={activeTab === 'yaml'} onClick={() => setActiveTab('yaml')} icon={FileText} label="YAML" />
                   <TabButton active={activeTab === 'sql'} onClick={() => setActiveTab('sql')} icon={Database} label="SQL" />
                   <TabButton active={activeTab === 'coq'} onClick={() => setActiveTab('coq')} icon={Scale} label="Coq" />
                   <TabButton active={activeTab === 'lean'} onClick={() => setActiveTab('lean')} icon={BookCheck} label="Lean" />
                   <TabButton active={activeTab === 'markdown'} onClick={() => setActiveTab('markdown')} icon={FileText} label="Docs" />
                </div>

                <div className="flex-1 relative overflow-hidden bg-gray-900/50">
                    {/* Error State */}
                    {error && (
                        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm p-6 flex items-center justify-center">
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-sm">
                                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                                    <Activity size={18} /> SYNTAX ERROR
                                </h3>
                                <p className="text-red-300 font-mono text-xs">{error}</p>
                            </div>
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full p-4"
                        >
                            {activeTab === 'python' && (
                                <Highlight theme={themes.vsDark} code={output} language="python">
                                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                        <pre className={className} style={{...style, background: 'transparent', margin: 0, fontSize: '0.875rem', overflow: 'auto'}}>
                                            {tokens.map((line, i) => (
                                                <div key={i} {...getLineProps({ line })}>
                                                    {line.map((token, key) => (
                                                        <span key={key} {...getTokenProps({ token })} />
                                                    ))}
                                                </div>
                                            ))}
                                        </pre>
                                    )}
                                </Highlight>
                            )}
                            {activeTab === 'json' && (
                                <Highlight theme={themes.vsDark} code={jsonOutput} language="json">
                                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                        <pre className={className} style={{...style, background: 'transparent', margin: 0, fontSize: '0.875rem', overflow: 'auto'}}>
                                            {tokens.map((line, i) => (
                                                <div key={i} {...getLineProps({ line })}>
                                                    {line.map((token, key) => (
                                                        <span key={key} {...getTokenProps({ token })} />
                                                    ))}
                                                </div>
                                            ))}
                                        </pre>
                                    )}
                                </Highlight>
                            )}
                            {activeTab === 'yaml' && (
                                <Highlight theme={themes.vsDark} code={yamlOutput} language="yaml">
                                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                        <pre className={className} style={{...style, background: 'transparent', margin: 0, fontSize: '0.875rem', overflow: 'auto'}}>
                                            {tokens.map((line, i) => (
                                                <div key={i} {...getLineProps({ line })}>
                                                    {line.map((token, key) => (
                                                        <span key={key} {...getTokenProps({ token })} />
                                                    ))}
                                                </div>
                                            ))}
                                        </pre>
                                    )}
                                </Highlight>
                            )}
                            {activeTab === 'sql' && (
                                <Highlight theme={themes.vsDark} code={sqlOutput} language="sql">
                                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                        <pre className={className} style={{...style, background: 'transparent', margin: 0, fontSize: '0.875rem', overflow: 'auto'}}>
                                            {tokens.map((line, i) => (
                                                <div key={i} {...getLineProps({ line })}>
                                                    {line.map((token, key) => (
                                                        <span key={key} {...getTokenProps({ token })} />
                                                    ))}
                                                </div>
                                            ))}
                                        </pre>
                                    )}
                                </Highlight>
                            )}
                             {activeTab === 'coq' && (
                                <Highlight theme={themes.vsDark} code={coqOutput} language="coq">
                                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                        <pre className={className} style={{...style, background: 'transparent', margin: 0, fontSize: '0.875rem', overflow: 'auto'}}>
                                            {tokens.map((line, i) => (
                                                <div key={i} {...getLineProps({ line })}>
                                                    {line.map((token, key) => (
                                                        <span key={key} {...getTokenProps({ token })} />
                                                    ))}
                                                </div>
                                            ))}
                                        </pre>
                                    )}
                                </Highlight>
                            )}
                             {activeTab === 'lean' && (
                                <Highlight theme={themes.vsDark} code={leanOutput} language="lean">
                                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                        <pre className={className} style={{...style, background: 'transparent', margin: 0, fontSize: '0.875rem', overflow: 'auto'}}>
                                            {tokens.map((line, i) => (
                                                <div key={i} {...getLineProps({ line })}>
                                                    {line.map((token, key) => (
                                                        <span key={key} {...getTokenProps({ token })} />
                                                    ))}
                                                </div>
                                            ))}
                                        </pre>
                                    )}
                                </Highlight>
                            )}
                            {activeTab === 'markdown' && (
                                <Highlight theme={themes.vsDark} code={mdOutput} language="markdown">
                                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                        <pre className={className} style={{...style, background: 'transparent', margin: 0, fontSize: '0.875rem', overflow: 'auto', whiteSpace: 'pre-wrap'}}>
                                            {tokens.map((line, i) => (
                                                <div key={i} {...getLineProps({ line })}>
                                                    {line.map((token, key) => (
                                                        <span key={key} {...getTokenProps({ token })} />
                                                    ))}
                                                </div>
                                            ))}
                                        </pre>
                                    )}
                                </Highlight>
                            )}
                            {activeTab === 'graph' && ast && (
                                <GraphVisualizer ast={ast} />
                            )}
                            {activeTab === 'graph' && !ast && (
                                <div className="text-gray-400 italic p-4">No valid AST available.</div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
          </div>
        </div>

       {/* AIQL Skill Modal */}
       <AnimatePresence>
        {showAiqlSkill && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                    onClick={() => setShowAiqlSkill(false)}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl custom-scrollbar"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold font-display flex items-center gap-2 text-white">
                            <Zap className="text-purple-400" /> AIQL Language Skill
                        </h3>
                        <button onClick={() => setShowAiqlSkill(false)} className="text-gray-500 hover:text-white">✕</button>
                    </div>
                    <p className="text-gray-400 mb-4 text-sm">
                        Complete AIQL specification for LLM consumption. Use this to teach AI models the full AIQL syntax and semantics.
                    </p>
                    <div className="bg-black/50 rounded-xl p-4 border border-white/5 mb-6 relative group">
                        <pre className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {generateAiqlSkill()}
                        </pre>
                        <button 
                            onClick={copySkillToClipboard}
                            className="absolute top-2 right-2 p-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
                        >
                            {skillCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowAiqlSkill(false)} className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200">
                            Done
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
       </AnimatePresence>

       {/* System Prompt Modal */}
       <AnimatePresence>
        {showSystemPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                    onClick={() => setShowSystemPrompt(false)}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                     className="relative bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl custom-scrollbar"
                >
                    <div className="flex justify-between items-center mb-6">
                         <h3 className="text-2xl font-bold font-display flex items-center gap-2 text-white">
                            <Sparkles className="text-blue-400" /> System Prompt
                        </h3>
                        <button onClick={() => setShowSystemPrompt(false)} className="text-gray-500 hover:text-white">✕</button>
                    </div>
                     <p className="text-gray-400 mb-4 text-sm">
                        Standard system prompt to initialize AIQL reasoning in compatible models.
                    </p>
                     <div className="bg-black/50 rounded-xl p-4 border border-white/5 mb-6 relative group">
                        <pre className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                             {generateSystemPrompt()}
                        </pre>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(generateSystemPrompt());
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="absolute top-2 right-2 p-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
                        >
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                     <div className="flex justify-end gap-2">
                        <button onClick={() => setShowSystemPrompt(false)} className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200">
                            Done
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
       </AnimatePresence>
    </section>
  );
};

export default Playground;
