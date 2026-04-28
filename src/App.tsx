/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Ghost, 
  Zap, 
  Gauge, 
  Palette, 
  Car, 
  History, 
  Sparkles,
  ChevronRight,
  User,
  LogOut,
  X,
  Share2,
  Trash2,
  Loader2
} from "lucide-react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useConcepts, Concept } from "@/hooks/useConcepts";
import { generateCarConcept, GeneratedConcept } from "@/services/geminiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from "@/components/ui/dialog";

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isArchitectOpen, setIsArchitectOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentBuild, setCurrentBuild] = useState<GeneratedConcept | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Retro-Futurism");
  const [selectedColor, setSelectedColor] = useState("Obsidian Black");
  
  const { concepts, loading, saveConcept, deleteConcept } = useConcepts();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleForge = async () => {
    if (!prompt) return;
    setGenerating(true);
    try {
      const result = await generateCarConcept(prompt, selectedStyle, selectedColor);
      setCurrentBuild(result);
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!currentBuild) return;
    setSaving(true);
    try {
      await saveConcept({
        name: currentBuild.name,
        prompt: currentBuild.prompt,
        imageUrl: currentBuild.imageUrl,
        color: selectedColor,
        style: selectedStyle,
        specs: currentBuild.specs
      });
      setIsArchitectOpen(false);
      setCurrentBuild(null);
      setPrompt("");
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-obsidian text-white font-sans overflow-x-hidden selection:bg-gold selection:text-obsidian">
      {/* Navigation */}
      <nav id="main-nav" className="fixed top-0 w-full z-50 bg-obsidian/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Car className="w-8 h-8 text-gold" />
          <span className="font-display text-2xl tracking-tighter uppercase font-bold text-white">Forge Auto</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div id="user-profile" className="flex items-center gap-3">
              <span className="text-sm font-mono text-white/50 hidden md:block">{user.email}</span>
              <Button id="logout-btn" variant="ghost" size="icon" onClick={() => signOut(auth)} className="hover:text-gold transition-colors">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button id="login-btn" onClick={handleLogin} variant="outline" className="border-gold text-gold hover:bg-gold hover:text-obsidian rounded-none px-8">
              Enlist
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content" className="pt-24 pb-20 container mx-auto px-6">
        <div id="hero-section" className="flex flex-col lg:flex-row gap-12 items-center min-h-[70vh]">
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="text-gold border-gold/30 mb-4 px-3 py-1 font-mono uppercase tracking-[0.2em] text-[10px]">
                Autonomous Design Studio
              </Badge>
              <h1 id="hero-heading" className="font-display text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter text-white">
                Architect the <br />
                <span className="italic text-gold">Imaginable.</span>
              </h1>
              <p className="max-w-md text-white/60 text-lg mt-6 leading-relaxed">
                Forge high-performance automotive concepts using state-of-the-art AI. 
                Where engineering meets digital alchemy.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <Dialog open={isArchitectOpen} onOpenChange={setIsArchitectOpen}>
                <DialogTrigger asChild>
                  <Button id="forge-trigger" size="lg" className="bg-gold text-obsidian hover:bg-white transition-all rounded-none px-12 py-8 text-lg font-bold uppercase tracking-widest group">
                    Enter the Forge
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-obsidian border-white/10 text-white rounded-none p-0 overflow-hidden">
                  <div id="architect-workspace" className="flex flex-col md:flex-row h-full max-h-[90vh]">
                    {/* Controls */}
                    <div className="w-full md:w-80 border-r border-white/10 p-6 space-y-6 bg-obsidian-light">
                      <div>
                        <label className="text-[10px] font-mono text-gold uppercase tracking-[0.2em] mb-2 block">Design Prompt</label>
                        <Input 
                          id="car-prompt-input"
                          placeholder="e.g. Sleek electric supercar with Gull-wing doors" 
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="bg-white/5 border-white/10 rounded-none focus:border-gold transition-colors h-24 align-top py-4 !ring-0"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-gold uppercase tracking-[0.2em] mb-2 block">Era Style</label>
                        <select 
                          id="car-style-select"
                          value={selectedStyle}
                          onChange={(e) => setSelectedStyle(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 p-3 rounded-none focus:border-gold outline-none font-mono text-sm"
                        >
                          {["Retro-Futurism", "Neo-Cyberpunk", "Minimalist Modern", "Raw Brutalist", "Liquid Organic"].map(s => (
                            <option key={s} value={s} className="bg-obsidian">{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-gold uppercase tracking-[0.2em] mb-2 block">Color Palette</label>
                        <select 
                          id="car-color-select"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 p-3 rounded-none focus:border-gold outline-none font-mono text-sm"
                        >
                          {["Obsidian Black", "Titanium Grey", "Hyper Gold", "Chrome Silver", "Ghost White", "Deep Crimson"].map(c => (
                            <option key={c} value={c} className="bg-obsidian">{c}</option>
                          ))}
                        </select>
                      </div>

                      <Button 
                        id="forge-submit-btn"
                        disabled={generating || !prompt || !user}
                        onClick={handleForge}
                        className="w-full bg-gold text-obsidian hover:bg-white font-bold h-12 rounded-none tracking-widest uppercase disabled:opacity-50"
                      >
                        {generating ? <Loader2 className="animate-spin" /> : "Forge Design"}
                      </Button>
                      
                      {!user && <p className="text-center text-[10px] text-white/40 italic">Account required to forge.</p>}
                    </div>

                    {/* Preview Area */}
                    <div id="forge-preview-area" className="flex-1 bg-black/50 relative min-h-[400px] flex items-center justify-center overflow-auto">
                      <AnimatePresence mode="wait">
                        {currentBuild ? (
                          <motion.div 
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-8 space-y-6 w-full"
                          >
                            <div className="relative group">
                              <img 
                                src={currentBuild.imageUrl} 
                                alt="Result" 
                                className="w-full aspect-video object-cover border border-white/10 shadow-2xl"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                              <div>
                                <h2 className="font-display text-4xl font-bold tracking-tight">{currentBuild.name}</h2>
                                <p className="text-white/50 text-sm italic mt-1">{currentBuild.description}</p>
                              </div>
                              <Button 
                                id="save-concept-btn"
                                disabled={saving}
                                onClick={handleSave} 
                                className="bg-white text-obsidian hover:bg-gold rounded-none px-8 font-bold"
                              >
                                {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                Save to Vault
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-8 pt-4">
                              <div className="space-y-1 text-center">
                                <span className="text-[10px] font-mono text-gold uppercase tracking-[0.2em] block">Top Speed</span>
                                <span className="text-2xl font-mono">{currentBuild.specs.topSpeed}</span>
                              </div>
                              <div className="space-y-1 text-center">
                                <span className="text-[10px] font-mono text-gold uppercase tracking-[0.2em] block">0-60 MPH</span>
                                <span className="text-2xl font-mono">{currentBuild.specs.acceleration}</span>
                              </div>
                              <div className="space-y-1 text-center">
                                <span className="text-[10px] font-mono text-gold uppercase tracking-[0.2em] block">Powerplant</span>
                                <span className="text-2xl font-mono">{currentBuild.specs.power}</span>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-center text-white/20">
                            {generating ? (
                              <div className="space-y-4">
                                <Loader2 className="w-12 h-12 animate-spin mx-auto text-gold mb-4" />
                                <p className="font-mono text-sm tracking-widest uppercase">Consulting the virtual wind tunnel...</p>
                                <p className="text-[10px] opacity-50 px-12 text-center">Simulating aerodynamics and material aesthetics in the digital void.</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="font-mono text-sm tracking-widest uppercase italic">Awaiting Architecture Parameters</p>
                              </div>
                            )}
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button id="archive-scroll-btn" variant="outline" className="border-white/20 text-white/60 hover:text-white hover:border-white rounded-none px-8 h-12 uppercase tracking-[0.1em] text-xs transition-all">
                The Archive
              </Button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 relative"
          >
            <div className="absolute inset-0 bg-gold/10 blur-[120px] rounded-full scale-110" />
            <img 
              id="hero-car-image"
              src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=2070"
              alt="Hero Car"
              className="relative z-10 w-full h-[500px] object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-1000 border border-white/10"
              referrerPolicy="no-referrer"
            />
            {/* Visual indicators */}
            <div className="absolute -bottom-6 -left-6 z-20 bg-gold p-6 hidden md:block shadow-2xl">
              <p className="text-obsidian font-mono text-xs font-bold leading-tight uppercase tracking-wider">
                Built: Obsidian-X <br />
                Model: 2026/F
              </p>
            </div>
          </motion.div>
        </div>

        {/* The Vault - Community Gallery */}
        <section id="the-vault" className="mt-40 space-y-12">
          <div className="flex justify-between items-end border-b border-white/10 pb-8">
            <div>
              <h2 className="font-display text-4xl font-bold uppercase tracking-tighter">The Vault</h2>
              <p className="text-white/40 font-mono text-sm mt-2 tracking-widest uppercase">Verified Design Prototypes</p>
            </div>
            <div className="flex gap-4">
               <History className="text-gold w-6 h-6" />
            </div>
          </div>

          <div id="concepts-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-video bg-white/5 animate-pulse" />
                  <div className="h-8 bg-white/5 w-2/3 animate-pulse" />
                </div>
              ))
            ) : (
              concepts.map((concept) => (
                <motion.div
                  layout
                  key={concept.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card id={`concept-card-${concept.id}`} className="bg-white/5 border-white/10 rounded-none group overflow-hidden cursor-pointer">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={concept.imageUrl} 
                        alt={concept.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-gold hover:text-obsidian rounded-full">
                          <Share2 className="w-5 h-5" />
                        </Button>
                        {user?.uid === concept.ownerId && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteConcept(concept.id)}
                            className="text-red-500 hover:bg-red-500 hover:text-white rounded-full"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-mono text-gold uppercase tracking-[0.2em] mb-1">{concept.style}</p>
                          <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-white">{concept.name}</h3>
                        </div>
                        <Palette className="text-white/20 w-5 h-5" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-gold/60" />
                          <span className="text-xs font-mono text-white/60">{concept.specs.power}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-gold/60" />
                          <span className="text-xs font-mono text-white/60">{concept.specs.topSpeed}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 mt-20">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-gold/50" />
            <span className="font-display text-xl font-bold uppercase text-white/80">Forge Auto</span>
          </div>
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            Digital Performance Architecture &copy; 2026 Forge Media.
          </p>
          <div className="flex gap-8">
            <a href="#" className="font-mono text-[10px] uppercase text-white/40 hover:text-gold transition-colors">Manifesto</a>
            <a href="#" className="font-mono text-[10px] uppercase text-white/40 hover:text-gold transition-colors">Terminal</a>
            <a href="#" className="font-mono text-[10px] uppercase text-white/40 hover:text-gold transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
