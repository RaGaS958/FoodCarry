import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Activity, CheckCircle, ShieldCheck, Truck, 
  ChevronDown, ChevronUp, AlertTriangle, Heart, 
  Thermometer, Wind, Clock, Navigation, Zap, Send, Bot, 
  Search, ShieldAlert, Sparkles, User, Crosshair, Radio, Play, Loader2
} from 'lucide-react';
import { 
  CLAY_CARD_STYLE, 
  CLAY_BUTTON_STYLE, 
  CLAY_ICON_STYLE, 
  CLAY_INPUT_STYLE, 
  BLOG_DATA 
} from './constants';
import { DemoStep, TelemetryData, ChatMessage } from './types';
import { getSmartAssistantResponse } from './services/geminiService';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('promise');
  const [expandedBlog, setExpandedBlog] = useState<number | null>(null);
  const [demoStep, setDemoStep] = useState<DemoStep>('idle');
  const [progress, setProgress] = useState(0);
  const [telemetry, setTelemetry] = useState<TelemetryData>({ gForce: '0.1', temp: 62, tilt: 0 });
  const [vibrationHistory, setVibrationHistory] = useState<number[]>(Array(10).fill(10));
  const [selectedFood, setSelectedFood] = useState('cake');
  
  // Video Generation State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState("");

  // AI Assistant State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (demoStep === 'searching') {
      const timer = setTimeout(() => setDemoStep('transit'), 2000);
      return () => clearTimeout(timer);
    } else if (demoStep === 'transit') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setDemoStep('delivered');
            return 100;
          }
          return prev + 1;
        });

        setTelemetry(prev => ({
          gForce: (Math.random() * 0.12 + 0.05).toFixed(2),
          temp: 60 + Math.floor(Math.random() * 2),
          tilt: Math.floor(Math.random() * 3)
        }));

        setVibrationHistory(prev => [...prev.slice(1), Math.floor(Math.random() * 10) + 5]);
      }, 150);
    }
    return () => clearInterval(interval);
  }, [demoStep]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const resetDemo = () => {
    setDemoStep('idle');
    setProgress(0);
    setTelemetry({ gForce: '0.1', temp: 62, tilt: 0 });
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const generateTechVideo = async () => {
    // Check for API key before generation
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsGeneratingVideo(true);
    setVideoStatus("Calibrating Fluid Dampeners...");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = "A high-tech floating delivery vault inside a cargo box, perfectly stabilizing a delicate 3-tier wedding cake as it glides over a bumpy street in Lucknow. Professional cinematography, slow motion, futuristic laboratory lighting.";
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setVideoStatus("Simulating Lucknow Road Impact...");
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await (ai as any).operations.getVideosOperation({operation: operation});
        setVideoStatus("Rendering Stabilization Physics...");
      }

      const downloadLink = (operation.response as any)?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
      setVideoStatus("System recalibration required. Please try again.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleAiConsult = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAiLoading(true);

    const aiResult = await getSmartAssistantResponse(userMsg.text);
    
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResult.advice,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, aiMsg]);
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#eef2f5] font-sans text-slate-700 overflow-x-hidden selection:bg-orange-200">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#eef2f5]/90 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <div className="bg-orange-500 w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform">F</div>
            <span className="text-2xl font-black tracking-tight text-slate-800">FoodCarry</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 font-bold text-slate-500 text-sm">
            <a href="#demo" onClick={(e) => scrollToSection(e, 'demo')} className="hover:text-orange-500 transition-all flex items-center gap-2 group">
              <Zap size={16} className="text-orange-400 group-hover:scale-125 transition-transform" /> 
              <span>Simulation</span>
            </a>
            <a href="#tech" onClick={(e) => scrollToSection(e, 'tech')} className="hover:text-orange-500 transition-all flex items-center gap-2 group">
              <ShieldCheck size={16} className="text-blue-400 group-hover:scale-125 transition-transform" /> 
              <span>Technology</span>
            </a>
            <a href="#lab" onClick={(e) => scrollToSection(e, 'lab')} className="hover:text-orange-500 transition-all flex items-center gap-2 group">
              <Play size={16} className="text-red-400 group-hover:scale-125 transition-transform" /> 
              <span>Logistics Lab</span>
            </a>
            <a href="#science" onClick={(e) => scrollToSection(e, 'science')} className="hover:text-orange-500 transition-all flex items-center gap-2 group">
              <Sparkles size={16} className="text-purple-400 group-hover:scale-125 transition-transform" /> 
              <span>Science</span>
            </a>
          </div>

          <button className={CLAY_BUTTON_STYLE} onClick={(e) => scrollToSection(e, 'demo')}>
            Book Pilot
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-[120px] animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] shadow-inner border border-blue-100">
              <Zap size={14} className="animate-pulse" /> Precision Logistics • Serving All of Lucknow
            </div>
            <h1 className="text-6xl lg:text-8xl font-black leading-[1] text-slate-900 tracking-tighter">
              The End of <br/>
              <div className="my-3 inline-block px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl text-white shadow-[0_20px_40px_rgba(249,115,22,0.3)] transform -rotate-1">
                Crushed Cakes
              </div> <br/>
              Is Here.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg font-medium">
              We aren't a bike taxi service. We are specialists. 
              Our <strong>Floating-Deck Vaults</strong> isolate your food from 80% of road shocks in Lucknow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center pt-4">
              <button 
                className={CLAY_BUTTON_STYLE + " !py-4 !px-10 text-lg flex items-center gap-3 shadow-[0_20px_50px_rgba(249,115,22,0.4)]"} 
                onClick={() => setChatOpen(true)}
              >
                Start AI Consult <Bot size={24} className="text-white"/>
              </button>
              <button 
                className="px-8 py-4 rounded-2xl font-bold text-slate-600 hover:bg-white hover:shadow-xl transition-all flex items-center gap-2 bg-transparent border-2 border-slate-200"
                onClick={(e) => scrollToSection(e, 'lab')}
              >
                Watch Stabilization <Play size={20} className="text-red-500 fill-current"/>
              </button>
            </div>
          </div>

          <div className="relative h-[600px] w-full flex items-center justify-center">
            {/* Main Interactive 3D Mockup */}
            <div className="relative w-80 h-96 bg-white rounded-[40px] clay-shadow flex flex-col items-center justify-between p-6 z-20 transition-all duration-1000 animate-float">
              <div className="w-full flex justify-between items-center mb-4">
                <div className="h-2 w-12 bg-slate-100 rounded-full"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active System</span>
                  <div className="h-3 w-3 bg-green-400 rounded-full shadow-[0_0_15px_#4ade80] animate-pulse"></div>
                </div>
              </div>
              
              <div className="w-full h-48 bg-[#f8fafc] rounded-[32px] clay-shadow-inset flex items-center justify-center relative overflow-hidden group border border-white">
                <div className="absolute w-28 h-28 bg-pink-100 rounded-3xl shadow-xl bottom-4 group-hover:scale-105 transition-all duration-500 flex flex-col items-center justify-end p-3 border-2 border-white/40">
                  <div className="w-20 h-14 bg-pink-200 rounded-xl mb-1.5 shadow-inner"></div>
                  <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest">Fragile Unit</span>
                </div>
                <div className="absolute top-4 right-4 text-blue-400 animate-pulse">
                  <Wind size={28} />
                </div>
              </div>

              <div className="w-full flex justify-around mt-4">
                <div className="w-12 h-16 border-4 border-orange-100 rounded-2xl flex items-center justify-center bg-orange-50 shadow-inner">
                  <div className="w-8 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
                </div>
                <div className="w-12 h-16 border-4 border-orange-100 rounded-2xl flex items-center justify-center bg-orange-50 shadow-inner">
                  <div className="w-8 h-1.5 bg-orange-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
              
              <div className="mt-2 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Isolation Level: 99.8%</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/40 backdrop-blur-md rounded-[32px] border border-white/20 clay-shadow flex items-center justify-center animate-float animation-delay-1000">
              <div className="text-center">
                <div className="text-3xl font-black text-orange-500">0.02G</div>
                <div className="text-[8px] font-black uppercase text-slate-400">Peak Shock</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logistics Lab - Video Feature */}
      <section id="lab" className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-black text-[10px] uppercase tracking-widest border border-red-500/30">
                Logistics Laboratory
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter">See The <span className="text-orange-500">Isolation</span> Deck In Action.</h2>
              <p className="text-slate-400 text-lg max-w-xl">
                We use AI to simulate stabilization tests. Request a custom recording of our dampening technology protecting a cargo unit.
              </p>
            </div>
            
            <button 
              onClick={generateTechVideo}
              disabled={isGeneratingVideo}
              className="bg-white text-slate-900 font-black py-4 px-8 rounded-2xl hover:bg-orange-500 hover:text-white transition-all flex items-center gap-3 shadow-2xl disabled:opacity-50"
            >
              {isGeneratingVideo ? <Loader2 className="animate-spin" size={20}/> : <Play size={20} fill="currentColor"/>}
              {isGeneratingVideo ? "Generating Simulation..." : "Request Live Demo Clip"}
            </button>
          </div>

          <div className="aspect-video bg-slate-800 rounded-[48px] overflow-hidden border-8 border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative group">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                muted 
                controls
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-6">
                {isGeneratingVideo ? (
                  <>
                    <div className="relative">
                      <div className="w-24 h-24 border-8 border-slate-700 border-t-orange-500 rounded-full animate-spin"></div>
                      <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={32} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-white">{videoStatus}</p>
                      <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Connecting to Veo Simulation Engine...</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Play className="text-slate-500" size={48} fill="currentColor" />
                    </div>
                    <p className="text-xl text-slate-500 font-bold">Simulator Standby • Click Button to Generate Clip</p>
                  </>
                )}
              </div>
            )}
            
            {/* UI Overlay on Video */}
            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Stress Test</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">ISOLATION: ACTIVE</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] font-black text-white uppercase tracking-widest mb-1">Impact Sensor</div>
                <div className="text-4xl font-black text-orange-500 tracking-tighter">0.00 <span className="text-xs">G</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulation Section */}
      <section id="demo" className="py-32 px-6 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20 space-y-4">
            <div className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-600 font-black text-[10px] uppercase tracking-[0.3em]">Precision Hub</div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Real-Time Transit Simulation</h2>
            <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">
              Test our specialized Lucknow grid. Observe how we isolate cargo during high-speed transit.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-stretch">
            {/* Control Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className={`${CLAY_CARD_STYLE} h-full flex flex-col justify-between !p-8`}>
                <div className="space-y-8">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Mission Config</h3>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cargo Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['cake', 'stew', 'sushi', 'flowers'].map((type) => (
                        <button 
                          key={type}
                          onClick={() => setSelectedFood(type)}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedFood === type ? 'bg-orange-50 border-orange-400 shadow-lg' : 'bg-white border-slate-100 opacity-60'}`}
                        >
                          <span className="text-3xl">{type === 'cake' ? '🍰' : type === 'stew' ? '🥘' : type === 'sushi' ? '🍣' : '💐'}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Service Route</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18}/>
                        <input type="text" readOnly value="Kitchen, Indiranagar" className={CLAY_INPUT_STYLE + " !pl-12 !py-3 !text-xs"} />
                      </div>
                      <div className="relative">
                        <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                        <input type="text" readOnly value="Client, Rajajipuram" className={CLAY_INPUT_STYLE + " !pl-12 !py-3 !text-xs"} />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setDemoStep('searching')}
                  disabled={demoStep !== 'idle'}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl hover:bg-orange-500 transition-all flex justify-center items-center gap-3 text-lg mt-8 disabled:opacity-50"
                >
                  {demoStep === 'idle' ? 'Initiate Dispatch' : 'System Busy'} <Zap size={20}/>
                </button>
              </div>
            </div>

            {/* Display Panel */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden min-h-[600px] border-8 border-slate-100 flex flex-col relative">
                <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-mono text-xs tracking-widest uppercase opacity-70">TELEMETRY_LINK_042</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Stability Lock: 100%</span>
                  </div>
                </div>

                <div className="flex-1 p-8 md:p-12 relative flex flex-col justify-center">
                  {demoStep === 'idle' && (
                    <div className="text-center space-y-6 animate-fadeIn">
                       <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-100">
                         <Truck className="text-slate-200" size={48} />
                       </div>
                       <h3 className="text-3xl font-black text-slate-300">Awaiting Dispatch Commands</h3>
                       <p className="text-slate-400 max-w-sm mx-auto font-medium">Configure your mission on the left to start the precision tracking simulation.</p>
                    </div>
                  )}

                  {demoStep === 'searching' && (
                    <div className="flex flex-col items-center justify-center animate-fadeIn space-y-8">
                       <div className="relative">
                         <div className="w-32 h-32 border-[12px] border-slate-50 border-t-orange-500 rounded-full animate-spin"></div>
                         <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-200" size={40} />
                       </div>
                       <div className="text-center">
                         <h3 className="text-3xl font-black text-slate-800 tracking-tight">Syncing Local Node</h3>
                         <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Locating nearest food pilot in Lucknow grid...</p>
                       </div>
                    </div>
                  )}

                  {demoStep === 'transit' && (
                    <div className="animate-fadeIn h-full flex flex-col gap-12">
                       <div className="space-y-6">
                          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             <span>Pickup: Indiranagar</span>
                             <span className="text-orange-500 animate-pulse">Mission Progress: {progress}%</span>
                             <span>Drop: Rajajipuram</span>
                          </div>
                          <div className="h-6 bg-slate-50 rounded-full overflow-hidden relative shadow-inner border border-slate-100">
                             <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 rounded-full" style={{width: `${progress}%`}}></div>
                          </div>
                          
                          <div className="h-56 bg-slate-50 rounded-[40px] clay-shadow-inset relative overflow-hidden group">
                             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#64748b_2px,transparent_2px)] [background-size:24px_24px]"></div>
                             
                             <div className="absolute top-6 left-8 flex items-center gap-3">
                                <Radio className="text-red-500 animate-pulse" size={14}/>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cross-City Telemetry Uplink</span>
                             </div>

                             <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 flex flex-col items-center" style={{left: `${progress}%`, marginLeft: '-24px'}}>
                                <div className="bg-orange-500 p-4 rounded-3xl shadow-2xl text-white transform hover:scale-110 cursor-pointer animate-float">
                                   <Truck size={32} />
                                </div>
                                <div className="w-2 h-16 bg-gradient-to-b from-orange-500/30 to-transparent"></div>
                                <div className="absolute -bottom-10 w-max text-[9px] font-black text-slate-900 bg-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border border-slate-100">
                                   {telemetry.gForce}G DEVIATION
                                </div>
                             </div>
                             
                             {/* Street Visualization */}
                             <div className="absolute bottom-0 left-0 w-full h-4 bg-slate-200 opacity-20"></div>
                             <div className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-200 rounded-full shadow-inner"></div>
                             <div className="absolute right-10 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-300 rounded-full shadow-inner flex items-center justify-center">
                               <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                             </div>
                          </div>
                       </div>

                       <div className="grid md:grid-cols-3 gap-8">
                          <div className={`${CLAY_CARD_STYLE} !p-6 shadow-sm border-none`}>
                             <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                <Activity size={18} className="text-orange-500" /> Vibration Delta
                             </div>
                             <div className="text-4xl font-black text-slate-800 tracking-tighter">{telemetry.gForce}G</div>
                             <div className="h-16 flex items-end gap-1.5 mt-6">
                                {vibrationHistory.map((h, i) => (
                                   <div key={i} className="flex-1 bg-orange-400/20 rounded-t-lg transition-all" style={{height: `${h * 3}%`}}>
                                     <div className="w-full h-1/2 bg-orange-500 rounded-t-lg"></div>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div className={`${CLAY_CARD_STYLE} !p-6 shadow-sm border-none`}>
                             <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                <Thermometer size={18} className="text-red-500" /> Thermal State
                             </div>
                             <div className="text-4xl font-black text-slate-800 tracking-tighter">{telemetry.temp}°C</div>
                             <div className="flex items-center gap-2 text-[10px] text-green-500 font-black mt-6 uppercase tracking-tighter">
                                <CheckCircle size={14}/> Core Insulation: Valid
                             </div>
                          </div>
                          <div className={`${CLAY_CARD_STYLE} !p-6 shadow-sm border-none`}>
                             <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                <Navigation size={18} className="text-blue-500" /> Lateral Tilt
                             </div>
                             <div className="text-4xl font-black text-slate-800 tracking-tighter">{telemetry.tilt}°</div>
                             <div className="flex items-center gap-2 text-[10px] text-blue-500 font-black mt-6 uppercase tracking-tighter">
                                <ShieldCheck size={14}/> Axis Alignment Lock
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {demoStep === 'delivered' && (
                    <div className="animate-fadeIn text-center py-16 space-y-10">
                       <div className="w-40 h-40 bg-green-50 rounded-[64px] flex items-center justify-center mx-auto shadow-2xl border-4 border-white relative group cursor-pointer overflow-hidden">
                         <div className="absolute inset-0 bg-green-400 opacity-20 animate-ping"></div>
                         <CheckCircle className="text-green-600 w-24 h-24 relative z-10 transform group-hover:scale-110 transition-transform" />
                       </div>
                       <div className="space-y-4">
                         <h3 className="text-5xl font-black text-slate-900 tracking-tighter">Verified Flawless.</h3>
                         <p className="text-slate-500 text-xl font-medium">Mission completed with zero structural compromise.</p>
                       </div>
                       
                       <div className="bg-slate-50 rounded-[40px] p-10 max-w-lg mx-auto text-left space-y-6 clay-shadow-inset border border-white">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Post-Flight Telemetry Log</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                               <span className="text-slate-600 font-bold text-lg">Max Stress Event</span>
                               <span className="text-green-600 font-black bg-green-100 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">0.18G</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                               <span className="text-slate-600 font-bold text-lg">Thermal Integrity</span>
                               <span className="text-orange-600 font-black bg-orange-100 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">99.2%</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                               <span className="text-slate-600 font-bold text-lg">Pilot Precision Score</span>
                               <div className="flex gap-1.5">
                                 {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 rounded-full bg-orange-500 shadow-lg"></div>)}
                               </div>
                            </div>
                          </div>
                       </div>

                       <button onClick={resetDemo} className="text-orange-500 font-black hover:text-orange-600 flex items-center gap-4 mx-auto text-xl transition-all hover:scale-105 group">
                          <Clock size={24} className="group-hover:rotate-180 transition-transform duration-700"/> Reset Simulator
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Details Section */}
      <section id="tech" className="py-40 px-6">
        <div className="container mx-auto max-w-6xl">
           <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10 order-2 lg:order-1">
                  <div className={`${CLAY_ICON_STYLE} w-20 h-20 flex items-center justify-center shadow-xl`}>
                    <ShieldAlert size={36} />
                  </div>
                  <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">Built for <br/><span className="text-orange-500 underline decoration-slate-200">Lucknow's Every Gali</span>.</h2>
                  <p className="text-2xl text-slate-500 leading-relaxed font-medium">
                    Generic fleets fail because they ignore the physics of the ride. We've mapped Lucknow's road profiles to calibrate our suspension in real-time.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-8 pt-6">
                    <div className={`${CLAY_CARD_STYLE} !p-6 space-y-4`}>
                       <ShieldCheck className="text-blue-500" size={32}/>
                       <h4 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">FRP Isolation</h4>
                       <p className="text-slate-500 text-sm font-medium">Medical-grade composite shells that dissipate impact energy instantly.</p>
                    </div>
                    <div className={`${CLAY_CARD_STYLE} !p-6 space-y-4`}>
                       <Thermometer className="text-red-500" size={32}/>
                       <h4 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Active Core</h4>
                       <p className="text-slate-500 text-sm font-medium">Maintaining 60°C+ across Lucknow's long-distance routes.</p>
                    </div>
                  </div>
              </div>

              <div className="order-1 lg:order-2 bg-white rounded-[80px] p-16 clay-shadow h-[700px] flex items-center justify-center relative overflow-hidden group border-8 border-slate-50">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fb923c_3px,transparent_3px)] [background-size:32px:32px]"></div>
                  <div className="scanline"></div>
                  
                  <div className="absolute top-12 left-12 space-y-3">
                    <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-900 text-white rounded-full shadow-2xl">
                      <Crosshair size={14} className="text-orange-500 animate-spin-slow"/>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Axis Locked</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-1.5 bg-white rounded-full shadow-lg border border-slate-100">
                      <Radio size={14} className="text-blue-500 animate-pulse"/>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">LKO Grid Sync</span>
                    </div>
                  </div>

                  <div className="text-center relative">
                     <div className="text-[14rem] font-black text-slate-50 select-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 tracking-tighter">
                        0.0G
                     </div>
                     <div className="relative z-10 w-96 h-96 bg-slate-50 rounded-full clay-shadow flex items-center justify-center flex-col transition-all duration-1000 group-hover:scale-105 border-4 border-white">
                        <div className="relative flex flex-col items-center justify-end mb-8 animate-float">
                            <div className="w-3 h-10 bg-red-400 rounded-full mb-3 animate-pulse shadow-xl"></div>
                            {/* Layered Cake Visual */}
                            <div className="w-28 h-16 bg-pink-300 rounded-[32px] clay-shadow z-30 flex items-center justify-center border-2 border-white/40">
                                <div className="w-16 h-1 bg-white/40 rounded-full"></div>
                            </div>
                            <div className="w-44 h-18 bg-pink-200 rounded-[32px] clay-shadow -mt-6 z-20 flex items-center justify-center border-2 border-white/40">
                                <div className="w-28 h-1.5 bg-white/40 rounded-full"></div>
                            </div>
                            <div className="w-56 h-24 bg-pink-100 rounded-[32px] clay-shadow -mt-6 z-10 flex items-center justify-center border-2 border-white/40">
                                <div className="w-40 h-2 bg-white/40 rounded-full"></div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 bg-slate-900 text-white px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-8 ring-white z-20">
                           Structural Dampening: ACTIVE
                        </div>
                     </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* Science Blog Section */}
      <section id="science" className="py-40 px-6 bg-white relative">
         <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-24 space-y-4">
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter">The Science of Fine Care</h2>
               <p className="text-slate-400 font-bold text-xl">Beyond delivery: We are the final step of your kitchen.</p>
            </div>
            
            <div className="space-y-10">
               {BLOG_DATA.map((item) => (
                  <div key={item.id} className={`${CLAY_CARD_STYLE} !p-10 cursor-pointer group hover:-translate-y-2 !rounded-[40px] shadow-sm`} onClick={() => setExpandedBlog(expandedBlog === item.id ? null : item.id)}>
                     <div className="flex justify-between items-center gap-6">
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-orange-500 transition-colors">{item.title}</h3>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${expandedBlog === item.id ? 'bg-orange-500 text-white rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                           <ChevronDown size={24}/>
                        </div>
                     </div>
                     <p className="text-slate-500 mt-6 font-bold text-xl leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">"{item.hook}"</p>
                     
                     {expandedBlog === item.id && (
                        <div className="mt-8 pt-8 border-t-2 border-slate-50 text-slate-600 text-lg leading-relaxed animate-fadeIn space-y-6">
                           <p>{item.content}</p>
                           <div className="flex gap-4">
                              <span className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200">LKO_PRECISION_LOG_0{item.id}</span>
                           </div>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* AI Assistant Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl" onClick={() => setChatOpen(false)}></div>
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[64px] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row border-[12px] border-white/50">
            <div className="hidden md:flex w-2/5 bg-[#f8fafc] p-16 flex-col justify-between border-r border-slate-100">
               <div className="space-y-12">
                  <div className="w-20 h-20 bg-orange-500 rounded-[32px] shadow-2xl flex items-center justify-center text-white">
                    <Bot size={40} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-slate-800 leading-none tracking-tighter">FoodCarry <br/><span className="text-orange-500">AI Expert</span></h2>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">I help you evaluate structural risks and thermal core stability for any Lucknow route.</p>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Pan-Lucknow Sync Active
                  </div>
                  <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div> Real-time Physics Engine
                  </div>
               </div>
            </div>
            
            <div className="flex-1 flex flex-col h-full bg-[#f1f5f9]">
               <div className="p-8 bg-white/80 backdrop-blur-md flex justify-between items-center shadow-sm border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <Radio className="text-green-500 animate-pulse" size={16}/>
                    <span className="font-black uppercase text-xs tracking-[0.3em] text-slate-400">Logistics Brain: ONLINE</span>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-900 font-black p-2 transition-colors uppercase text-[10px] tracking-widest">Exit Portal</button>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-8">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30">
                       <Sparkles size={64} className="text-slate-300"/>
                       <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting Logistics Query...</p>
                    </div>
                  )}
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                       <div className={`max-w-[80%] p-6 rounded-[36px] ${m.sender === 'user' ? 'bg-slate-900 text-white rounded-tr-none shadow-2xl' : 'bg-white text-slate-800 rounded-tl-none shadow-xl border border-white'}`}>
                          <div className="flex items-center gap-2 mb-3 opacity-50">
                             {m.sender === 'agent' ? <Bot size={14}/> : <User size={14}/>}
                             <span className="text-[10px] font-black uppercase tracking-widest">{m.sender === 'user' ? 'Mission Lead' : 'FoodCarry AI'}</span>
                          </div>
                          <p className="text-lg font-medium leading-relaxed">{m.text}</p>
                          <div className="text-[10px] mt-3 opacity-40 text-right font-mono">{m.timestamp}</div>
                       </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start animate-fadeIn">
                       <div className="bg-white p-6 rounded-[36px] rounded-tl-none shadow-xl border border-white flex items-center gap-4">
                          <div className="flex gap-1.5">
                             <div className="w-2.5 h-2.5 bg-orange-200 rounded-full animate-bounce"></div>
                             <div className="w-2.5 h-2.5 bg-orange-300 rounded-full animate-bounce delay-100"></div>
                             <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce delay-200"></div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Computing Risks...</span>
                       </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
               </div>

               <div className="p-8 bg-white border-t border-slate-100">
                  <form onSubmit={(e) => { e.preventDefault(); handleAiConsult(); }} className="flex gap-4">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ex: 'Can I deliver a 3-tier cake from Indiranagar to Rajajipuram safely?'"
                      className={`${CLAY_INPUT_STYLE} !bg-slate-50 !py-4 !px-6 !rounded-[24px] border-2 border-transparent focus:border-orange-200`}
                    />
                    <button type="submit" className={`${CLAY_BUTTON_STYLE} !p-4 !rounded-[24px] shadow-xl hover:scale-105 transition-transform`}>
                      <Send size={28} />
                    </button>
                  </form>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="py-40 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent"></div>
            <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[150px]"></div>
         </div>
         
         <div className="container mx-auto px-6 text-center relative z-10 space-y-16">
            <div className="inline-block p-8 rounded-[40px] bg-slate-800 mb-4 shadow-2xl border border-white/5 animate-float">
               <Heart className="text-red-500 fill-current animate-pulse" size={56} />
            </div>
            
            <div className="space-y-6">
              <h2 className="text-6xl lg:text-8xl font-black tracking-tighter max-w-4xl mx-auto leading-none">Ready to Transport Your Artistry?</h2>
              <p className="text-2xl text-slate-400 max-w-2xl mx-auto font-medium">
                 Serving All of Lucknow. From the finest bakeries to the most delicate curries, we ensure perfect arrival.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-8">
               <button 
                 onClick={(e) => scrollToSection(e, 'demo')}
                 className="bg-orange-500 hover:bg-orange-600 text-white font-black py-6 px-16 rounded-[40px] shadow-[0_25px_60px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-2 text-2xl ring-8 ring-orange-500/10"
               >
                  Initiate Booking
               </button>
               <button className="bg-slate-800 hover:bg-slate-700 text-white font-black py-6 px-16 rounded-[40px] shadow-2xl transition-all text-2xl border border-white/5">
                  Business API
               </button>
            </div>
            
            <div className="pt-24 flex flex-col items-center gap-8">
              <div className="flex gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                <span className="font-black uppercase tracking-widest text-lg">Indiranagar</span>
                <span className="font-black uppercase tracking-widest text-lg">Hazratganj</span>
                <span className="font-black uppercase tracking-widest text-lg">Gomti Nagar</span>
                <span className="font-black uppercase tracking-widest text-lg">Rajajipuram</span>
              </div>
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-8">
                 © 2025 FoodCarry Precision Logistics • Lucknow's Finest Fleet
              </div>
            </div>
         </div>
      </footer>

      {/* Global CSS for advanced animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

export default App;