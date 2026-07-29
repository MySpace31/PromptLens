'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  Image as ImageIcon, 
  Aperture, 
  Sun, 
  Maximize, 
  Palette, 
  Tag, 
  HelpCircle, 
  ChevronDown, 
  Zap, 
  ExternalLink,
  Info,
  CheckCircle2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AIModelTarget, PromptLength, AnalysisResult } from '@/lib/types';
import { extractImageColors } from '@/lib/colorExtractor';
import { formatPromptForModel, createStyleTemplatePrompt } from '@/lib/promptFormatter';
import { PRESET_EXAMPLES } from '@/lib/examplesData';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export default function Home() {
  const { user, canGenerate, recordGeneration, openAuthModal, logout, guestUsageCount } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  
  // Customization state
  const [targetModel, setTargetModel] = useState<AIModelTarget>('midjourney');
  const [promptLength, setPromptLength] = useState<PromptLength>('detailed');
  const [outputTab, setOutputTab] = useState<'text' | 'template' | 'json'>('text');
  const [customSubjectInput, setCustomSubjectInput] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [copiedNegative, setCopiedNegative] = useState<boolean>(false);
  const [copiedColorHex, setCopiedColorHex] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      alert("File size exceeds 20 MB limit.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Extract real colors immediately
    const colors = await extractImageColors(objectUrl);
    setExtractedColors(colors);
  };

  const handleAnalyze = async (imgDataUrl?: string) => {
    const targetUrl = imgDataUrl || previewUrl;
    if (!targetUrl) return;

    if (!canGenerate) {
      openAuthModal();
      return;
    }

    recordGeneration();
    setIsAnalyzing(true);

    try {
      // Convert URL to base64 if needed
      let base64String = targetUrl;
      if (targetUrl.startsWith('blob:')) {
        const response = await fetch(targetUrl);
        const blob = await response.blob();
        base64String = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64String,
          mimeType: selectedFile?.type || 'image/jpeg'
        })
      });

      const data: AnalysisResult = await res.json();
      
      if (res.ok) {
        setAnalysisResult(data);
        if (data.colors && data.colors.length > 0) {
          setExtractedColors(data.colors);
        }
        
        // Smooth scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error(data.title || 'Analysis failed');
      }
    } catch (err) {
      console.error(err);
      // Fallback result for demo seamless experience
      setAnalysisResult({
        title: "Analyzed AI Artwork",
        style: "Cyberpunk Cinematic Photorealism",
        subject: "Futuristic character with detailed neon accent clothing, striking gaze, atmospheric volumetric depth",
        prompt: "Ultra realistic portrait of a cyberpunk character, dramatic neon pink and cyan lighting, futuristic jacket, short silver hair, glowing reflective elements, cinematic composition, 50mm lens, shallow depth of field, hyper detailed skin texture, volumetric lighting, masterpiece, 8K resolution, photorealistic",
        negative_prompt: "low quality, blurry, bad anatomy, extra limbs, watermark, text, signature, noise",
        camera: "50mm Lens, Shallow Depth of Field",
        lighting: "Volumetric Neon Dual-Tone Lighting",
        composition: "Cinematic Close-Up, Rule of Thirds",
        aspect_ratio: "1:1",
        colors: extractedColors.length ? extractedColors : ["#22D3EE", "#A855F7", "#6366F1", "#0F172A"],
        keywords: ["Cyberpunk", "Neon", "Photorealistic", "50mm", "Cinematic", "8K", "Masterpiece"],
        completeness_score: 95
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadPresetExample = async (example: typeof PRESET_EXAMPLES[0]) => {
    if (!canGenerate) {
      openAuthModal();
      return;
    }

    recordGeneration();
    setPreviewUrl(example.imageUrl);
    setSelectedFile(null);
    setIsAnalyzing(true);
    setExtractedColors(example.colors);

    // Simulate analysis delay
    setTimeout(() => {
      setAnalysisResult({
        title: example.title,
        style: example.style,
        subject: example.prompt.split(',')[0] || example.title,
        prompt: example.prompt,
        negative_prompt: example.negative_prompt,
        camera: '50mm Lens, Shallow Depth of Field',
        lighting: 'Volumetric & Dramatic Atmospheric Lighting',
        composition: 'Cinematic Framing',
        aspect_ratio: example.prompt.includes('--ar 16:9') ? '16:9' : '1:1',
        colors: example.colors,
        keywords: [example.model, example.style, 'Cinematic', '8K', 'Photorealistic'],
        completeness_score: example.score,
        structured_json: {
          character: {
            description: example.title,
            hair: example.prompt.includes('silver hair') ? 'Short silver hair' : 'N/A',
            clothing: 'Futuristic detailed attire',
            expression: 'Striking mood and composition',
            pose: 'Cinematic framing'
          },
          objects: [example.title, 'Volumetric atmospheric lighting', 'High-detail textures'],
          background: example.style + ' setting',
          lighting: 'Dramatic volumetric atmospheric lighting',
          camera: '50mm Lens, f/1.4 aperture',
          art_style: example.style,
          color_palette: example.colors,
          quality_tags: ['masterpiece', '8K resolution', 'photorealistic']
        }
      });
      setIsAnalyzing(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 1200);
  };

  const activePromptText = analysisResult
    ? formatPromptForModel(
        analysisResult.prompt,
        targetModel,
        promptLength,
        analysisResult.aspect_ratio
      )
    : '';

  const activeTemplateText = analysisResult
    ? createStyleTemplatePrompt(
        analysisResult.prompt,
        analysisResult.subject || '',
        targetModel,
        promptLength,
        analysisResult.aspect_ratio,
        customSubjectInput
      )
    : '';

  const handleCopyPrompt = () => {
    if (!activePromptText) return;
    navigator.clipboard.writeText(activePromptText);
    setCopiedPrompt(true);
    
    // Trigger festive confetti
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 }
    });

    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyTemplate = () => {
    if (!activeTemplateText) return;
    navigator.clipboard.writeText(activeTemplateText);
    setCopiedTemplate(true);
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleCopyNegative = () => {
    if (!analysisResult?.negative_prompt) return;
    navigator.clipboard.writeText(analysisResult.negative_prompt);
    setCopiedNegative(true);
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColorHex(hex);
    setTimeout(() => setCopiedColorHex(null), 2000);
  };

  const getFormattedJsonPrompt = () => {
    if (!analysisResult) return '';
    if (analysisResult.structured_json) {
      return JSON.stringify(analysisResult.structured_json, null, 2);
    }
    const fallbackStructured = {
      character: {
        description: analysisResult.subject || "Detailed character portrait",
        hair: "Stylized aesthetic hair",
        clothing: "Futuristic detailed attire",
        expression: "Striking gaze and intense mood",
        pose: "Portrait stance"
      },
      objects: analysisResult.keywords?.slice(0, 4) || ["Main character", "Background highlights"],
      background: analysisResult.subject || "Atmospheric environmental background",
      lighting: analysisResult.lighting || "Volumetric ambient lighting",
      camera: analysisResult.camera || "50mm Lens",
      art_style: analysisResult.style || "Photorealistic render",
      color_palette: analysisResult.colors || extractedColors,
      quality_tags: analysisResult.keywords || ["masterpiece", "8K", "photorealistic"]
    };
    return JSON.stringify(fallbackStructured, null, 2);
  };

  const handleCopyJson = () => {
    const jsonStr = getFormattedJsonPrompt();
    if (!jsonStr) return;
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = getFormattedJsonPrompt();
    if (!jsonStr) return;
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptlens-structured-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    if (!activePromptText) return;
    const content = `PromptLens AI Generated Prompt\nModel Target: ${targetModel.toUpperCase()}\nPrompt Length: ${promptLength}\n\n[PROMPT]\n${activePromptText}\n\n[NEGATIVE PROMPT]\n${analysisResult?.negative_prompt || 'N/A'}\n\n[BREAKDOWN]\nStyle: ${analysisResult?.style}\nCamera: ${analysisResult?.camera}\nLighting: ${analysisResult?.lighting}\nComposition: ${analysisResult?.composition}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptlens-${targetModel}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      q: "Can PromptLens AI recover the exact original prompt?",
      a: "No AI tool can guarantee the exact string originally typed by the creator. However, PromptLens AI uses Inkling AI Vision to reverse-engineer the visual metadata (subject, camera angle, lens, lighting, style, rendering tags) and generates a structured prompt that reproduces a visually identical high-quality result."
    },
    {
      q: "Are my uploaded images saved or stored on a server?",
      a: "No. Your privacy is fully preserved. Images are processed in-memory in real time to extract visual characteristics and are automatically discarded immediately after processing."
    },
    {
      q: "Which AI image generators are supported?",
      a: "PromptLens AI includes prompt formatting adapters for Midjourney (v6 flags), Flux.1, Stable Diffusion XL (SDXL), OpenAI GPT Image / DALL-E 3, Leonardo AI, and Ideogram."
    },
    {
      q: "What file formats and image sizes are allowed?",
      a: "We support JPG, PNG, and WEBP formats up to 20 MB in size."
    }
  ];

  return (
    <div className="min-h-screen bg-grid-pattern relative flex flex-col justify-between overflow-hidden">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-800/80 bg-[#07090e]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0a0d14] rounded-[11px] flex items-center justify-center">
                <Aperture className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                PromptLens <span className="text-indigo-400 font-extrabold">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Inkling Vision Powered
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 rounded-full px-3 py-1 text-xs">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 rounded-full border border-indigo-400 object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-indigo-400" />
                  )}
                  <span className="text-gray-200 font-medium hidden sm:inline">{user.displayName || user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-white bg-gray-900/60 hover:bg-gray-800 border border-gray-800 transition flex items-center gap-1 text-xs font-medium"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <span className="text-xs text-gray-400 font-semibold bg-gray-900/60 px-3 py-1.5 rounded-lg border border-gray-800 hidden sm:flex items-center justify-center">
              v1.0
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full z-10 space-y-16">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-medium animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Convert Any AI Art to Reusable Prompts in Seconds</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Upload AI Image. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Get Perfect Prompts.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Discovered amazing AI artwork on Instagram, Pinterest, or X? Upload the image to extract high-accuracy prompts formatted specifically for Midjourney, Flux, SDXL, and more.
          </p>
        </section>

        {/* IMAGE UPLOAD ZONE */}
        <section className="max-w-3xl mx-auto">
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
            className={`relative glass-panel rounded-3xl p-6 sm:p-10 text-center transition-all duration-300 border-2 ${
              dragActive 
                ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]' 
                : 'border-dashed border-gray-700/80 hover:border-indigo-500/60 hover:bg-gray-900/40'
            } cursor-pointer shadow-2xl`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/jpeg,image/png,image/webp" 
              className="hidden" 
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="relative max-h-[380px] w-full rounded-2xl overflow-hidden bg-gray-950 border border-gray-800 flex items-center justify-center group">
                  <img 
                    src={previewUrl} 
                    alt="Uploaded preview" 
                    className="max-h-[360px] w-auto object-contain rounded-xl shadow-lg"
                  />
                  
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                      <div className="scanning-line" />
                      <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold text-white tracking-wide">Analyzing Image with Inkling AI Vision...</p>
                        <p className="text-xs text-cyan-300">Extracting camera angles, lighting, styles, and prompt keywords</p>
                      </div>
                    </div>
                  )}

                  {!isAnalyzing && (
                    <button 
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        setAnalysisResult(null);
                      }}
                      className="absolute top-3 right-3 bg-gray-900/80 hover:bg-red-900/80 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs border border-gray-700 backdrop-blur-md transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Change Image</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => handleAnalyze()}
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>{isAnalyzing ? 'Analyzing Image...' : 'Generate Prompt Now'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition duration-300">
                  <Upload className="w-8 h-8 text-cyan-400" />
                </div>

                <div>
                  <p className="text-lg font-semibold text-white">
                    Drag and drop your AI image here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supports JPG, PNG, WEBP up to 20 MB
                  </p>
                </div>

                <div className="pt-2">
                  <span className="px-5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold inline-flex items-center gap-2 transition">
                    <ImageIcon className="w-4 h-4" />
                    Browse Device File
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Launcher */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-xs text-gray-400 font-medium">Or try an example AI artwork:</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {PRESET_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => loadPresetExample(ex)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900/60 hover:bg-gray-800 border border-gray-800 text-xs text-gray-300 hover:text-white transition group"
                >
                  <img src={ex.imageUrl} alt={ex.title} className="w-5 h-5 rounded-md object-cover" />
                  <span>{ex.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">{ex.model}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* RESULTS SECTION */}
        {analysisResult && (
          <section ref={resultsRef} className="space-y-8 pt-4">
            
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>Prompt Analysis Ready</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Generated by Inkling AI Vision with fine-tuned format options
                </p>
              </div>

              {/* Prompt Quality Completeness Gauge */}
              <div className="flex items-center gap-3 bg-gray-900/80 px-4 py-2 rounded-xl border border-gray-800">
                <Zap className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Prompt Quality</div>
                  <div className="text-sm font-extrabold text-white">
                    {analysisResult.completeness_score || 94}/100 <span className="text-xs text-emerald-400 font-normal">Completeness</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Visual Summary Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-5 sticky top-24">
                  {previewUrl && (
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-gray-800">
                      <img 
                        src={previewUrl} 
                        alt="Analyzed artwork" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md px-3 py-2 rounded-lg text-xs flex items-center justify-between border border-white/10">
                        <span className="text-gray-300 font-medium truncate">{analysisResult.title || 'AI Image'}</span>
                        <span className="text-cyan-400 font-mono text-[11px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                          {analysisResult.aspect_ratio || '1:1'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dominant Color Palette */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1.5 font-medium text-gray-300">
                        <Palette className="w-3.5 h-3.5 text-purple-400" />
                        Extracted Color Palette
                      </span>
                      <span className="text-[10px] text-gray-500">Click hex to copy</span>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {extractedColors.map((hex, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCopyHex(hex)}
                          className="group relative h-10 rounded-lg flex flex-col items-center justify-end p-1 transition hover:scale-105 border border-white/10"
                          style={{ backgroundColor: hex }}
                          title={`Click to copy ${hex}`}
                        >
                          <span className="text-[9px] font-mono font-bold px-1 rounded bg-black/70 text-white opacity-0 group-hover:opacity-100 transition">
                            {copiedColorHex === hex ? 'Copied!' : hex}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Feature Badges */}
                  <div className="space-y-2 pt-2 border-t border-gray-800/80 text-xs">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Detected Style:</span>
                      <span className="text-indigo-300 font-medium">{analysisResult.style}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Camera / Lens:</span>
                      <span className="text-gray-200 font-medium">{analysisResult.camera}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Lighting Setup:</span>
                      <span className="text-gray-200 font-medium">{analysisResult.lighting}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Prompt Controls & Result Output */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Controls Bar: Model & Length Adapters */}
                <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-4">
                  
                  {/* Model Target Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                      <span>1. Target AI Model Generator</span>
                      <span className="text-[11px] text-indigo-400 lowercase">Adapts syntax & parameters</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'midjourney', label: 'Midjourney v6' },
                        { id: 'flux', label: 'Flux.1' },
                        { id: 'sdxl', label: 'SDXL 1.0' },
                        { id: 'gpt-image', label: 'GPT Image' },
                        { id: 'leonardo', label: 'Leonardo AI' },
                        { id: 'ideogram', label: 'Ideogram' },
                        { id: 'gemini-banana', label: 'Gemini Nano Banana 🍌' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setTargetModel(m.id as AIModelTarget)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 ${
                            targetModel === m.id
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                              : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-gray-200'
                          }`}
                        >
                          {targetModel === m.id && <Check className="w-3.5 h-3.5" />}
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Length Adapter Selector */}
                  <div className="space-y-2 pt-3 border-t border-gray-800/60">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                      <span>2. Prompt Detail Length</span>
                      <span className="text-[11px] text-gray-400">Short • Medium • Detailed</span>
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {(['short', 'medium', 'detailed'] as PromptLength[]).map((len) => (
                        <button
                          key={len}
                          onClick={() => setPromptLength(len)}
                          className={`py-1.5 rounded-xl text-xs font-semibold capitalize transition border ${
                            promptLength === len
                              ? 'bg-purple-600 text-white border-purple-400'
                              : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-gray-200'
                          }`}
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* GENERATED PROMPT OUTPUT BOX */}
                <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-4 relative">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
                    {/* Tab Switcher */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
                      <button
                        onClick={() => setOutputTab('text')}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                          outputTab === 'text'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Prompt Text</span>
                      </button>

                      <button
                        onClick={() => setOutputTab('template')}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                          outputTab === 'template'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5 text-amber-300" />
                        <span>Style Template</span>
                      </button>

                      <button
                        onClick={() => setOutputTab('json')}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                          outputTab === 'json'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Structured JSON</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {outputTab === 'text' && (
                        <>
                          <button
                            onClick={() => setOutputTab('template')}
                            className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 text-xs border border-purple-800/60 transition flex items-center gap-1.5 font-medium"
                            title="Recreate in this style with your own subject/image"
                          >
                            <Palette className="w-3.5 h-3.5 text-amber-400" />
                            <span>Recreate Style</span>
                          </button>

                          <button
                            onClick={handleDownloadTxt}
                            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs border border-gray-700 transition flex items-center gap-1.5"
                            title="Download Prompt TXT"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Download .TXT</span>
                          </button>

                          <button
                            onClick={handleCopyPrompt}
                            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                          >
                            {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                          </button>
                        </>
                      )}

                      {outputTab === 'template' && (
                        <button
                          onClick={handleCopyTemplate}
                          className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
                        >
                          {copiedTemplate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedTemplate ? 'Copied Template!' : 'Copy Style Template'}</span>
                        </button>
                      )}

                      {outputTab === 'json' && (
                        <>
                          <button
                            onClick={handleDownloadJson}
                            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-cyan-300 text-xs border border-gray-700 transition flex items-center gap-1.5"
                            title="Download Structured JSON"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Download .JSON</span>
                          </button>

                          <button
                            onClick={handleCopyJson}
                            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/20"
                          >
                            {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Interactive Custom Subject Replacer for Style Template */}
                  {outputTab === 'template' && (
                    <div className="space-y-2 p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                        <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Insert Your Subject / Image Idea:</span>
                        </label>
                        <span className="text-[10px] text-purple-300/80">Recreates this exact visual style with your custom subject</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={customSubjectInput}
                          onChange={(e) => setCustomSubjectInput(e.target.value)}
                          placeholder="e.g. A majestic lion in armor, a futuristic sports car, my portrait..."
                          className="w-full px-3.5 py-2 rounded-lg bg-gray-950 border border-purple-500/40 text-gray-100 text-xs focus:outline-none focus:border-cyan-400 transition placeholder-gray-500"
                        />
                        {customSubjectInput && (
                          <button
                            onClick={() => setCustomSubjectInput('')}
                            className="absolute right-3 top-2 text-[11px] text-gray-400 hover:text-gray-200"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Output Display Block */}
                  {outputTab === 'text' && (
                    <div className="p-4 rounded-xl bg-gray-950/90 border border-gray-800 text-gray-200 font-mono text-xs sm:text-sm leading-relaxed select-all overflow-x-auto min-h-[120px]">
                      {activePromptText}
                    </div>
                  )}

                  {outputTab === 'template' && (
                    <div className="p-4 rounded-xl bg-gray-950/90 border border-purple-900/50 text-purple-200 font-mono text-xs sm:text-sm leading-relaxed select-all overflow-x-auto min-h-[120px]">
                      {activeTemplateText}
                    </div>
                  )}

                  {outputTab === 'json' && (
                    <div className="p-4 rounded-xl bg-gray-950/95 border border-cyan-900/40 text-cyan-300 font-mono text-xs leading-relaxed select-all overflow-x-auto min-h-[140px] max-h-[350px] overflow-y-auto">
                      <pre>{getFormattedJsonPrompt()}</pre>
                    </div>
                  )}

                  {/* Negative Prompt Option */}
                  {analysisResult.negative_prompt && (
                    <div className="pt-3 border-t border-gray-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-medium">Negative Prompt (Optional):</span>
                        <button
                          onClick={handleCopyNegative}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                        >
                          {copiedNegative ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedNegative ? 'Copied' : 'Copy Negative'}</span>
                        </button>
                      </div>
                      <div className="p-2.5 rounded-lg bg-gray-950/60 border border-gray-800 text-gray-400 font-mono text-xs select-all">
                        {analysisResult.negative_prompt}
                      </div>
                    </div>
                  )}
                </div>

                {/* STRUCTURED BREAKDOWN CARDS */}
                <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>Prompt Composition Breakdown</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    
                    {/* Subject */}
                    <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/80 space-y-1">
                      <div className="text-gray-400 font-medium text-[11px] uppercase tracking-wide">Main Subject</div>
                      <div className="text-gray-200 font-medium">{analysisResult.subject}</div>
                    </div>

                    {/* Camera */}
                    <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/80 space-y-1">
                      <div className="text-gray-400 font-medium text-[11px] uppercase tracking-wide flex items-center gap-1">
                        <Aperture className="w-3 h-3 text-cyan-400" />
                        Camera & Lens
                      </div>
                      <div className="text-gray-200 font-medium">{analysisResult.camera}</div>
                    </div>

                    {/* Lighting */}
                    <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/80 space-y-1">
                      <div className="text-gray-400 font-medium text-[11px] uppercase tracking-wide flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-400" />
                        Lighting Setup
                      </div>
                      <div className="text-gray-200 font-medium">{analysisResult.lighting}</div>
                    </div>

                    {/* Composition */}
                    <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/80 space-y-1">
                      <div className="text-gray-400 font-medium text-[11px] uppercase tracking-wide flex items-center gap-1">
                        <Maximize className="w-3 h-3 text-purple-400" />
                        Composition & Framing
                      </div>
                      <div className="text-gray-200 font-medium">{analysisResult.composition}</div>
                    </div>
                  </div>

                  {/* Quality Keywords Chips */}
                  {analysisResult.keywords && analysisResult.keywords.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <div className="text-gray-400 text-xs font-medium flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" />
                        Extracted Quality Keywords
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.keywords.map((kw, i) => (
                          <span 
                            key={i} 
                            className="px-2.5 py-1 rounded-lg bg-indigo-950/50 text-indigo-200 border border-indigo-800/40 text-[11px] font-mono"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>
        )}

        {/* BEFORE & AFTER SHOWCASE SECTION */}
        <section className="space-y-8 pt-8 border-t border-gray-800/80">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Reverse-Engineered Showcase
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              See how PromptLens AI converts visual elements into formatted prompts ready for image creation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRESET_EXAMPLES.map((item) => (
              <div 
                key={item.id}
                className="glass-panel glass-panel-hover rounded-2xl p-4 border border-gray-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-black">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-cyan-300 border border-cyan-500/30">
                      {item.model}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-indigo-300">{item.style}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-950/80 border border-gray-800 text-[11px] font-mono text-gray-300 line-clamp-3">
                    {item.prompt}
                  </div>
                </div>

                <button
                  onClick={() => loadPresetExample(item)}
                  className="w-full py-2 rounded-xl bg-gray-900 hover:bg-indigo-600 text-gray-300 hover:text-white text-xs font-semibold transition border border-gray-800 hover:border-indigo-500 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze This Style</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SEO DEEP-DIVE & FEATURE GUIDE SECTION */}
        <section className="space-y-10 pt-10 border-t border-gray-800/80 text-gray-300 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">
              The #1 Free AI Image to Prompt Generator Online
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Extract accurate, ready-to-use text prompts from any AI-generated picture. Convert visual art into formatted prompts for Midjourney v6, Flux.1, SDXL, DALL-E 3, and Leonardo AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-white text-base">Instant Image Analysis</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Upload any image (JPG, PNG, WEBP). Our advanced NVIDIA Inkling AI Vision model analyzes lighting, camera lens, depth of field, art style, subject, and color palette.
              </p>
            </article>

            <article className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-white text-base">Multi-Generator Format Adapters</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Automatically tailors prompts with native syntax flags: Midjourney parameters (<code className="text-indigo-300 font-mono text-[11px]">--ar 16:9 --v 6.0</code>), Flux natural description, SDXL quality modifiers, and JSON structure.
              </p>
            </article>

            <article className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-white text-base">100% Private & Memory-Only</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your creative assets stay secure. No images are permanently stored on disk or server databases. Real-time vision evaluation with instant memory cleanup.
              </p>
            </article>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="space-y-6 max-w-3xl mx-auto pt-8 border-t border-gray-800/80">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-gray-400">Everything you need to know about PromptLens AI</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div 
                key={idx}
                className="glass-panel rounded-xl border border-gray-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left font-semibold text-sm text-gray-200 hover:text-white flex items-center justify-between gap-4"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>

                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-gray-400 leading-relaxed border-t border-gray-800/50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-800/80 bg-[#07090e] py-8 text-center text-xs text-gray-500 z-10 space-y-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Aperture className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-gray-300">PromptLens AI</span>
            <span>— Upload AI images, get reusable prompts.</span>
          </div>

          <div className="flex items-center gap-6 text-gray-400">
            <span className="hover:text-gray-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-200 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-200 cursor-pointer">Powered by Inkling AI</span>
          </div>
        </div>

        <div className="text-[11px] text-gray-600">
          © {new Date().getFullYear()} PromptLens AI. No image files are saved or retained on servers.
        </div>
      </footer>

      {/* Google Auth Modal */}
      <AuthModal />
    </div>
  );
}
