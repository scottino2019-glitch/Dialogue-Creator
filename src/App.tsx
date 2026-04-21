import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Languages, 
  MessageSquare, 
  BookOpen, 
  Download, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Smile,
  Layers,
  Sparkles,
  ChevronRight,
  Volume2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Settings,
  X,
  ShieldCheck
} from 'lucide-react';
import { cn } from './lib/utils';
import { 
  Language, 
  DialogueEntry, 
  VocabularyEntry,
  DisplayMode, 
  LANGUAGES 
} from './types';
import { generateDialogue, AIConfig } from './services/gemini';

export default function App() {
  const [language, setLanguage] = useState<Language>('Chinese');
  const [topic, setTopic] = useState('');
  const [entries, setEntries] = useState<DialogueEntry[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [mode, setMode] = useState<DisplayMode>('chat');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  
  // AI Settings
  const [showSettings, setShowSettings] = useState(false);
  const [aiApiKey, setAiApiKey] = useState(localStorage.getItem('AI_API_KEY') || '');
  const [aiInstructions, setAiInstructions] = useState(localStorage.getItem('AI_INSTRUCTIONS') || 'Generate a professional and helpful dialogue.');
  
  // Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);

  const addEntry = () => {
    const newEntry: DialogueEntry = {
      id: Math.random().toString(36).substr(2, 9),
      speaker: 'Character A',
      text: '',
      translation: '',
      pronunciation: '',
      side: 'left'
    };
    setEntries([...entries, newEntry]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<DialogueEntry>) => {
    setEntries(entries.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const config: AIConfig = {
        apiKey: aiApiKey || undefined,
        systemPrompt: aiInstructions || undefined
      };
      const result = await generateDialogue(topic, language, config);
      setEntries(result.dialogue);
      setVocabulary(result.vocabulary);
      setActiveTab('preview');
    } catch (error) {
      console.error(error);
      alert("Errore durante la generazione. Verifica la tua API Key nelle impostazioni.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helpers
  const getApiKeyStatus = () => {
    if (aiApiKey) return { text: 'Configurata Manualmente', color: 'text-blue-400' };
    if (import.meta.env.VITE_GEMINI_API_KEY) return { text: 'Rilevata da Netlify', color: 'text-emerald-400' };
    if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) return { text: 'Rilevata da AI Studio', color: 'text-amber-400' };
    return { text: 'Nessuna Chiave Rilevata', color: 'text-rose-400' };
  };

  const saveSettings = () => {
    const trimmedKey = aiApiKey.trim();
    setAiApiKey(trimmedKey);
    localStorage.setItem('AI_API_KEY', trimmedKey);
    localStorage.setItem('AI_INSTRUCTIONS', aiInstructions);
    setShowSettings(false);
  };

  const clearManualApiKey = () => {
    setAiApiKey('');
    localStorage.removeItem('AI_API_KEY');
  };

  const speak = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    const langCode = LANGUAGES.find(l => l.value === language)?.code || 'en';
    speech.lang = langCode;
    window.speechSynthesis.speak(speech);
  };

  const startQuiz = () => {
    if (entries.length === 0) return;
    const randomIndex = Math.floor(Math.random() * entries.length);
    setQuizIndex(randomIndex);
    setQuizFeedback(null);
    setQuizAnswer('');
    
    // Generate options
    const others = entries
      .filter((_, i) => i !== randomIndex)
      .map(e => e.text)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    const options = [entries[randomIndex].text, ...others].sort(() => Math.random() - 0.5);
    setQuizOptions(options);
    setMode('quiz');
  };

  const checkAnswer = (answer: string) => {
    setQuizAnswer(answer);
    if (answer === entries[quizIndex].text) {
      setQuizFeedback('correct');
      setQuizScore(s => s + 1);
    } else {
      setQuizFeedback('wrong');
    }
  };

  const exportToHtml = () => {
    const langCode = LANGUAGES.find(l => l.value === language)?.code || 'en';
    const htmlContent = `
<!DOCTYPE html>
<html lang="${langCode}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic || 'Polyglot Dialogue'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
          background-color: #e5ddd5; 
          margin: 0; 
          padding: 20px;
          background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
          background-repeat: repeat;
        }
        .whatsapp-container {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bubble {
          max-width: 85%;
          padding: 8px 12px;
          border-radius: 8px;
          position: relative;
          font-size: 14.5px;
          line-height: 1.4;
          box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
        }
        .bubble-left {
          align-self: flex-start;
          background-color: #ffffff;
          border-top-left-radius: 0;
        }
        .bubble-right {
          align-self: flex-end;
          background-color: #dcf8c6;
          border-top-right-radius: 0;
        }
        .speaker-name {
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 2px;
          color: #075e54;
        }
        .pronunciation {
          font-size: 11px;
          color: #555;
          font-style: italic;
          margin-top: 2px;
        }
        .translation {
          font-size: 12px;
          color: #666;
          border-top: 1px solid rgba(0,0,0,0.05);
          margin-top: 4px;
          padding-top: 4px;
        }
        .header-wa {
          background-color: #075e54;
          color: white;
          padding: 10px 16px;
          border-radius: 8px 8px 0 0;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .vocab-section {
          background: white;
          margin-top: 30px;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .audio-btn {
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          margin-left: 8px;
          vertical-align: middle;
          color: #3b82f6;
        }
        .audio-btn:hover {
          color: #2563eb;
        }
    </style>
</head>
<body>
    <div class="whatsapp-container">
        <div class="header-wa">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #128c7e; display: flex; align-items: center; justify-content: center; font-weight: bold;">AI</div>
          <div>
            <div style="font-weight: 700; font-size: 16px;">Polyglot: ${language}</div>
            <div style="font-size: 11px; opacity: 0.8;">Online - Topic: ${topic || 'Dialogue'}</div>
          </div>
        </div>

        ${entries.map(e => `
            <div class="bubble ${e.side === 'left' ? 'bubble-left' : 'bubble-right'}">
                <div class="speaker-name">${e.speaker}</div>
                <div style="display: flex; align-items: flex-start; justify-content: space-between;">
                  <div style="color: #000; font-weight: 500;">${e.text}</div>
                  <button class="audio-btn" onclick="speak(\`${e.text.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  </button>
                </div>
                ${e.pronunciation ? `<div class="pronunciation">${e.pronunciation}</div>` : ''}
                <div class="translation">${e.translation}</div>
            </div>
        `).join('')}
        
        <div class="vocab-section">
          <h2 style="font-weight: 700; margin-bottom: 15px; color: #075e54;">Vocabulary Table</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead style="background: #f0f2f5;">
              <tr>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">${language}</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Pronunciation</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Italian</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Audio</th>
              </tr>
            </thead>
            <tbody>
              ${vocabulary.map(v => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px; font-weight: 600;">${v.word}</td>
                  <td style="padding: 8px; color: #555; font-style: italic;">${v.pronunciation || '-'}</td>
                  <td style="padding: 8px; color: #555;">${v.translation}</td>
                  <td style="padding: 8px; text-align: center;">
                    <button class="audio-btn" onclick="speak(\`${v.word.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
    </div>

    <script>
      function speak(text) {
        if (!window.speechSynthesis) {
          alert("Spiacenti, il tuo browser non supporta la sintesi vocale.");
          return;
        }
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "${langCode}";
        window.speechSynthesis.cancel(); // Stop any current speech
        window.speechSynthesis.speak(speech);
      }
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dialogue_${language.toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg text-slate-50 font-sans flex flex-col">
      {/* Header */}
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
            P
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h1 className="font-bold text-base tracking-tight">PolyScribe</h1>
            <span className="text-[10px] font-bold text-text-dim/50 uppercase tracking-widest hidden sm:inline">v2.4</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-md border border-border/50 text-[10px] font-medium text-text-dim">
            <Layers size={12} />
            <span>Progetti / {topic || 'Nuovo_Dialogo'}</span>
          </div>
          
          <button 
            onClick={exportToHtml}
            disabled={entries.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:bg-slate-700 text-white px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Esporta HTML</span>
          </button>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="p-1.5 hover:bg-slate-800 rounded-md text-text-dim hover:text-white transition-all shadow-sm"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[220px] bg-surface border-r border-border p-4 flex-shrink-0 hidden lg:flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-dim">Lingue Attive</label>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            
            <div className="space-y-1.5">
              {LANGUAGES.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLanguage(l.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left",
                    language === l.value 
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                      : "text-slate-400 hover:bg-slate-800/50"
                  )}
                >
                  <span className="text-base grayscale-[0.5]" aria-hidden="true">
                    {l.value === 'Chinese' ? '🇨🇳' : l.value === 'Korean' ? '🇰🇷' : l.value === 'Japanese' ? '🇯🇵' : l.value === 'Russian' ? '🇷🇺' : '🇹🇷'}
                  </span>
                  {l.value}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            <div className="p-4 border border-dashed border-slate-700 rounded-xl bg-slate-900/30 text-center">
              <p className="text-[10px] font-medium text-text-dim leading-relaxed">
                Genera dialoghi complessi in pochi secondi con Gemini 3
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Areas */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-bg">
          {/* Editor Column */}
          <section className="flex-1 flex flex-col border-r border-border">
            <div className="h-12 border-b border-border bg-slate-900/30 px-6 flex items-center justify-between flex-shrink-0">
               <div className="flex items-center gap-2">
                 <MessageSquare size={14} className="text-blue-500" />
                 <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-dim">Editor Dinamico</h2>
               </div>
               <button 
                  onClick={addEntry}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-[11px] font-bold transition-all"
                >
                  <Plus size={14} />
                  Nuova Riga
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {/* Topic Config as part of editor header */}
              <div className="grid grid-cols-1 gap-4 mb-6 bg-surface/30 p-4 rounded-xl border border-border/50">
                <div className="relative">
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Argomento dialogo (es. In hotel, Shopping...)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic}
                    className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-bold text-[11px] flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span className="hidden sm:inline">Genera</span>
                  </button>
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4 opacity-50">
                   <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                     <Plus size={24} />
                   </div>
                   <p className="text-xs font-medium uppercase tracking-widest">Nessun dato attivo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div 
                      key={entry.id}
                      className={cn(
                        "group relative flex flex-col gap-2 p-4 rounded-xl border transition-all",
                        entry.side === 'left' 
                          ? "bg-slate-800/50 border-slate-700/50 mr-8" 
                          : "bg-blue-900/10 border-blue-900/30 ml-8"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <input 
                            value={entry.speaker}
                            onChange={(e) => updateEntry(entry.id, { speaker: e.target.value })}
                            className="bg-transparent border-none text-[10px] font-black uppercase text-blue-400 p-0 focus:ring-0 w-24"
                          />
                          <div className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter",
                            entry.side === 'left' ? "bg-slate-700 text-slate-300" : "bg-blue-600 text-white"
                          )}>
                            {entry.side === 'left' ? 'Sx' : 'Dx'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => speak(entry.text)} className="text-blue-400 hover:text-white" title="Ascolta"><Volume2 size={12} /></button>
                          <button onClick={() => updateEntry(entry.id, { side: entry.side === 'left' ? 'right' : 'left' })} className="text-text-dim hover:text-white"><RefreshCw size={12} /></button>
                          <button onClick={() => removeEntry(entry.id)} className="text-text-dim hover:text-red-400"><Trash2 size={12} /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <textarea 
                          value={entry.text}
                          onChange={(e) => updateEntry(entry.id, { text: e.target.value })}
                          rows={1}
                          className="bg-transparent border-none p-0 text-base font-bold placeholder:slate-700 focus:ring-0 resize-none scrollbar-none"
                          placeholder="Testo originale..."
                        />
                         <textarea 
                          value={entry.translation}
                          onChange={(e) => updateEntry(entry.id, { translation: e.target.value })}
                          rows={1}
                          className="bg-transparent border-none p-0 text-sm font-medium text-text-dim placeholder:slate-700 focus:ring-0 resize-none scrollbar-none"
                          placeholder="Traduzione..."
                        />
                      </div>
                      <input 
                        value={entry.pronunciation}
                        onChange={(e) => updateEntry(entry.id, { pronunciation: e.target.value })}
                        className="bg-transparent border-none p-0 text-[10px] font-mono text-blue-500 italic focus:ring-0"
                        placeholder="Pronuncia fonetica..."
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Preview Column */}
          <section className="w-full md:w-[320px] lg:w-[380px] bg-slate-900/20 flex flex-col">
            <div className="h-12 border-b border-border bg-slate-900/30 px-6 flex items-center justify-between flex-shrink-0">
               <div className="flex items-center gap-2">
                 <Smile size={14} className="text-blue-500" />
                 <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-dim">Preview</h2>
               </div>
               <div className="flex bg-slate-900/50 rounded-md p-0.5 border border-border/50">
                  <button onClick={() => setMode('chat')} className={cn("p-1 rounded transition-all", mode === 'chat' ? "bg-slate-700 text-white" : "text-text-dim")}><MessageSquare size={12} /></button>
                  <button onClick={() => setMode('comic')} className={cn("p-1 rounded transition-all", mode === 'comic' ? "bg-slate-700 text-white" : "text-text-dim")}><Smile size={12} /></button>
                  <button onClick={() => setMode('vocab')} className={cn("p-1 rounded transition-all", mode === 'vocab' ? "bg-slate-700 text-white" : "text-text-dim")}><BookOpen size={12} /></button>
                  <button onClick={startQuiz} className={cn("p-1 rounded transition-all", mode === 'quiz' ? "bg-slate-700 text-white" : "text-text-dim")}><HelpCircle size={12} /></button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-800">
               {mode === 'chat' && (
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <div key={entry.id} className={cn("flex flex-col gap-1", entry.side === 'left' ? "items-start" : "items-end")}>
                        <div className={cn(
                          "max-w-[90%] p-3 rounded-xl shadow-sm text-xs relative group/item",
                          entry.side === 'left' 
                            ? "bg-slate-800 border border-border text-slate-100" 
                            : "bg-blue-600 text-white"
                        )}>
                          <button 
                            onClick={() => speak(entry.text)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shadow-lg"
                          >
                            <Play size={10} />
                          </button>
                          <p className="font-bold mb-1">{entry.text}</p>
                          <p className={cn("opacity-70 italic text-[10px] mb-1.5", entry.side === 'left' ? "text-blue-400" : "text-blue-100")}>{entry.pronunciation}</p>
                          <div className={cn("h-[1px] w-full mb-1.5 opacity-20", entry.side === 'left' ? "bg-white" : "bg-white")} />
                          <p className="leading-tight opacity-90">{entry.translation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               )}

               {mode === 'comic' && (
                  <div className="space-y-6">
                    {entries.map((entry) => (
                      <div key={entry.id} className="relative bg-white text-slate-900 p-4 border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 left-4 -translate-y-1/2 bg-slate-900 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter">
                          {entry.speaker}
                        </div>
                        <p className="text-sm font-black mb-1">{entry.text}</p>
                        <p className="text-[9px] font-bold text-blue-600 mb-2">{entry.pronunciation}</p>
                        <p className="text-[10px] font-medium italic border-t border-slate-100 pt-1.5 opacity-70">{entry.translation}</p>
                      </div>
                    ))}
                  </div>
               )}

               {mode === 'vocab' && (
                  <div className="bg-surface/50 border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-800 text-text-dim border-b border-border">
                        <tr>
                          <th className="p-2 font-bold uppercase">Vocab</th>
                          <th className="p-2 font-bold uppercase">Pron</th>
                          <th className="p-2 font-bold uppercase">Trad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {vocabulary.map((v) => (
                          <tr key={v.id}>
                            <td className="p-2 font-bold text-blue-400">{v.word}</td>
                            <td className="p-2 text-slate-500 italic">{v.pronunciation}</td>
                            <td className="p-2 text-slate-400">{v.translation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               )}
               {mode === 'quiz' && entries.length > 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    {!quizFeedback ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 w-full max-w-xs">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <HelpCircle size={32} className="text-blue-500" />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-dim">Traduzione:</h3>
                        <p className="text-xl font-bold text-white leading-tight italic">
                          "{entries[quizIndex].translation}"
                        </p>
                        <div className="grid grid-cols-1 gap-3 pt-4">
                          {quizOptions.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => checkAnswer(opt)}
                              className="w-full py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-700 transition-all"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-6 flex flex-col items-center">
                        {quizFeedback === 'correct' ? (
                          <>
                            <CheckCircle2 size={64} className="text-emerald-500" />
                            <h3 className="text-2xl font-black text-emerald-400">ECCELLENTE!</h3>
                          </>
                        ) : (
                          <>
                            <XCircle size={64} className="text-rose-500" />
                            <h3 className="text-2xl font-black text-rose-400">QUASI...</h3>
                            <p className="text-sm text-text-dim">La risposta era: <span className="text-white font-bold">{entries[quizIndex].text}</span></p>
                          </>
                        )}
                        <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Punteggio: {quizScore}</p>
                        <button 
                          onClick={startQuiz}
                          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-blue-900/40"
                        >
                          <RotateCcw size={16} />
                          Prossimo
                        </button>
                      </motion.div>
                    )}
                  </div>
               )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer Vocab Bank - Fixed Bottom */}
      <footer className="h-40 bg-surface border-t border-border px-6 py-4 flex-shrink-0 hidden md:flex flex-col">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
               <BookOpen size={14} className="text-emerald-500" />
               <h3 className="text-[11px] font-bold uppercase tracking-widest">Database Vocaboli</h3>
             </div>
             <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
               {vocabulary.length} termini chiave
             </span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
             <table className="w-full text-left border-collapse text-[11px]">
               <thead className="sticky top-0 bg-surface text-text-dim">
                  <tr>
                    <th className="pb-2 font-bold uppercase tracking-tight">Termine</th>
                    <th className="pb-2 font-bold uppercase tracking-tight">Pronuncia</th>
                    <th className="pb-2 font-bold uppercase tracking-tight">Traduzione</th>
                    <th className="pb-2 font-bold uppercase tracking-tight text-right">Lingua</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                  {vocabulary.map(v => (
                    <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 font-bold text-slate-100">{v.word}</td>
                      <td className="py-2.5 font-mono text-blue-500/80 italic">{v.pronunciation || '-'}</td>
                      <td className="py-2.5 text-text-dim">{v.translation}</td>
                      <td className="py-2.5 text-right font-mono text-[9px] text-blue-500/50">{language.substring(0,2).toUpperCase()}</td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Configurazione AI</h2>
                    <p className="text-[10px] text-text-dim uppercase tracking-wider">Netlify & Gemini Setup</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-text-dim transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 rounded-lg border border-border/50">
                  <span className="text-[10px] font-bold uppercase text-text-dim">Stato Connessione</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", getApiKeyStatus().color.replace('text', 'bg'))} />
                    <span className={cn("text-[10px] font-bold uppercase", getApiKeyStatus().color)}>{getApiKeyStatus().text}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Gemini API Key</label>
                    {aiApiKey && (
                      <button 
                        onClick={clearManualApiKey}
                        className="text-[9px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-widest"
                      >
                        Pulisci Manuale
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type="password"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="Lascia vuoto per usare il default (AI Studio)..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                    <div className="absolute right-3 top-2.5 text-blue-500/50">
                      <ShieldCheck size={14} />
                    </div>
                  </div>
                  <p className="text-[9px] text-text-dim italic">Puoi anche impostare la variabile <b>VITE_GEMINI_API_KEY</b> su Netlify per non doverla inserire qui ogni volta.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Istruzioni di Sistema (System Prompt)</label>
                  <textarea 
                    value={aiInstructions}
                    onChange={(e) => setAiInstructions(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="Es: Genera dialoghi divertenti e informali..."
                  />
                  <p className="text-[9px] text-text-dim italic">Personalizza il comportamento dell'IA e il tono del dialogo.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-xs font-bold text-text-dim hover:text-white transition-all"
                >
                  Annulla
                </button>
                <button 
                  onClick={saveSettings}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-blue-900/20"
                >
                  Salva Impostazioni
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
