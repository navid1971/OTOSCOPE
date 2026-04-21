"use client";

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  UserPlus, 
  LogIn, 
  Wifi, 
  WifiOff, 
  Download, 
  Share2, 
  X, 
  ChevronLeft,
  CircleCheck,
  AlertCircle,
  Stethoscope
} from 'lucide-react';

// --- Types ---
type Screen = 'Home' | 'SignUp' | 'SignIn' | 'Welcome' | 'Camera';

interface UserData {
  username: string;
}

// --- App Component ---
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Home');
  const [user, setUser] = useState<UserData | null>(null);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [statusText, setStatusText] = useState('Checking hardware connection...');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [localPath, setLocalPath] = useState<string | null>(null);

  // Transitions
  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // --- Handlers ---
  const handleSignUp = (username: string, pass: string) => {
    localStorage.setItem('otoscope_user', JSON.stringify({ username, password: pass }));
    alert('Account Created Successfully!');
    setCurrentScreen('Home');
  };

  const handleSignIn = (username: string, pass: string) => {
    const stored = localStorage.getItem('otoscope_user');
    if (!stored) {
      alert('Account Not Found. Please Sign Up First.');
      return;
    }
    const { username: u, password: p } = JSON.parse(stored);
    if (u === username && p === pass) {
      setUser({ username: u });
      setCurrentScreen('Welcome');
    } else if (u !== username) {
      alert('Account Not Found. Please Sign Up First.');
    } else {
      alert('Wrong Password.');
    }
  };

  const checkConnection = async () => {
    setStatusText('Pinging device at 192.168.4.1...');
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      
      await fetch('http://192.168.4.1', { 
        mode: 'no-cors',
        signal: controller.signal 
      });
      
      clearTimeout(id);
      setDeviceConnected(true);
      setStatusText('Device is ready for capture and live video');
    } catch (e) {
      console.warn('Connection failed:', e);
      setDeviceConnected(false);
      setStatusText('Connection failed. Please connect to the ESP Wi-Fi network.');
    }
  };

  const captureImage = () => {
    const random = Math.floor(Math.random() * 1000000);
    const url = `http://192.168.4.1/capture?x=${random}`;
    setCapturedImage(url);
  };

  const downloadSnapshot = async () => {
    if (!capturedImage) return;
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `otoscope_capture_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLocalPath(url); 
      alert('Snapshot Saved Successfully');
    } catch (e) {
      alert('Download failed. Make sure you are connected to the device hardware.');
    }
  };

  const shareImage = async () => {
    if (!localPath) {
      alert('Please save a snapshot first.');
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'OTOSCOPE Capture',
          text: 'ENT snapshot for doctor review',
          url: localPath,
        });
      } catch (e) {
        console.error('Share failed', e);
      }
    } else {
      alert('Sharing is not supported in this browser. Image is available in your downloads.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex overflow-hidden">
      {(currentScreen === 'Welcome' || currentScreen === 'Camera') && (
        <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col p-6 shadow-sm z-50">
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tighter text-blue-600">OTOSCOPE</h1>
            <div className="h-1 w-12 bg-blue-600 mt-2 rounded-full"></div>
          </div>

          <div className="flex-1 flex flex-col gap-8">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Authenticated User</p>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {user?.username?.[0] || 'A'}
                </div>
                <div>
                  <p className="font-bold text-slate-800 truncate max-w-[140px]">{user?.username || 'Azraful Khan'}</p>
                  <p className="text-xs text-slate-500 italic">ENT Specialist</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hardware Status</p>
              <div className={`p-4 rounded-xl border transition-colors ${deviceConnected ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${deviceConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <span className={`text-sm font-bold uppercase ${deviceConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {deviceConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
                <p className={`text-xs leading-tight ${deviceConnected ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {statusText}
                </p>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">IP: 192.168.4.1</p>
              </div>
            </div>

            <nav className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
              <button 
                onClick={() => setCurrentScreen('Welcome')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentScreen === 'Welcome' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => deviceConnected && setCurrentScreen('Camera')}
                disabled={!deviceConnected}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentScreen === 'Camera' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
              >
                Live Capture
              </button>
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-3 tracking-widest">Project Credits</p>
            <div className="space-y-1">
              <p className="text-[11px] text-slate-600 leading-tight font-medium">1. Md. Azraful Islam Khan</p>
              <p className="text-[11px] text-slate-600 leading-tight font-medium">2. Jasim Uddin</p>
              <p className="text-[10px] text-slate-400 mt-2 italic">Dept. of Biomedical Engineering</p>
            </div>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col h-screen relative">
        <AnimatePresence mode="wait">
          {currentScreen === 'Home' && (
            <motion.div
              key="home"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-100"
            >
              <div className="mb-6 p-5 bg-white rounded-3xl shadow-sm border border-slate-200">
                <Stethoscope size={48} className="text-blue-600" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter mb-2 text-slate-900">OTOSCOPE</h1>
              <div className="h-1.5 w-16 bg-blue-600 mb-8 rounded-full"></div>
              
              <div className="max-w-xs mb-12">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Development Program</p>
                <div className="space-y-1 p-4 bg-white/50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-700">Md. Azraful Islam Khan</p>
                  <p className="text-xs font-bold text-slate-700">Jasim Uddin</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">BME DEPARTMENT</p>
                </div>
              </div>

              <div className="flex flex-col w-full max-w-xs gap-3">
                <button
                  onClick={() => setCurrentScreen('SignUp')}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus size={20} /> Sign Up
                </button>
                <button
                  onClick={() => setCurrentScreen('SignIn')}
                  className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg shadow-sm hover:border-blue-600 hover:text-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={20} /> Sign In
                </button>
              </div>
            </motion.div>
          )}

          {currentScreen === 'SignUp' && (
            <AuthScreen 
              mode="SignUp" 
              onBack={() => setCurrentScreen('Home')} 
              onAction={handleSignUp} 
            />
          )}

          {currentScreen === 'SignIn' && (
            <AuthScreen 
              mode="SignIn" 
              onBack={() => setCurrentScreen('Home')} 
              onAction={handleSignIn} 
            />
          )}

          {currentScreen === 'Welcome' && (
            <motion.div
              key="welcome"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex-1 flex flex-col p-6 lg:p-12 overflow-y-auto"
            >
              <header className="flex flex-col mb-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">Dashboard</h2>
                    <p className="text-slate-500 font-medium">Hello, {user?.username}. Device status ready.</p>
                  </div>
                  <button 
                    onClick={() => { setUser(null); setCurrentScreen('Home'); }}
                    className="p-3 bg-white text-red-500 hover:bg-red-50 border border-slate-200 rounded-xl transition-all shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className={`p-8 rounded-3xl flex flex-col items-center gap-4 transition-all border ${deviceConnected ? 'bg-white border-emerald-100 shadow-sm' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className={`p-4 rounded-2xl ${deviceConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {deviceConnected ? <Wifi size={40} /> : <WifiOff size={40} />}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs uppercase font-black tracking-widest mb-1 ${deviceConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {deviceConnected ? 'READY TO CAPTURE' : 'SYSTEM OFFLINE'}
                    </p>
                    <p className="text-slate-700 font-bold max-w-[200px]">
                      {statusText}
                    </p>
                  </div>
                  {!deviceConnected && (
                    <button
                      onClick={checkConnection}
                      className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-all"
                    >
                      Retry Connection
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-slate-800 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between h-[200px]">
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                    <div>
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Inspection Mode</p>
                      <h3 className="text-xl font-bold leading-tight">Primary Tympanic Membrane Inspection</h3>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-medium">ESP32-CAM WEB SERVER v2.4</p>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={checkConnection}
                    className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
                  >
                    Ping Device
                  </button>
                  
                  {deviceConnected && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setCurrentScreen('Camera')}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Camera size={20} /> Open Camera Interface
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentScreen === 'Camera' && (
            <motion.div
              key="camera"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              {/* Header Bar */}
              <header className="h-20 bg-white border-b border-slate-200 px-6 lg:px-12 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm font-black text-slate-700 uppercase tracking-tight">LIVE FEED: CH-01</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline-flex px-3 py-1 bg-slate-100 rounded-full text-[10px] font-mono text-slate-500 uppercase font-bold">720p / 30fps</span>
                  <button
                    onClick={() => setCurrentScreen('Welcome')}
                    className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Close Interface
                  </button>
                </div>
              </header>

              {/* Main Interface Area */}
              <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
                {/* Live Stream Viewport */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden h-full">
                  <div className="flex-1 bg-black rounded-[32px] relative overflow-hidden shadow-2xl border-[6px] border-white flex items-center justify-center group">
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img 
                      src="http://192.168.4.1:81/stream" 
                      alt="Live Stream"
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/otoscope_err/800/600?blur=10';
                      }}
                    />
                    <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
                      <p className="text-white font-black text-2xl tracking-tighter">Real-time Stream</p>
                      <p className="text-blue-300 text-[10px] font-black tracking-[0.2em] uppercase">Active Diagnostic Mode</p>
                    </div>
                  </div>

                  <div className="h-12 flex items-center justify-between px-8 text-[10px] text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
                    <div className="font-bold flex gap-4">
                      <span>FIRMWARE v2.4.1</span>
                      <span>STRENGTH: <span className="text-emerald-500 font-mono">92%</span></span>
                    </div>
                    <div className="font-bold uppercase tracking-widest text-blue-500">
                      Active Session: 192.168.4.1
                    </div>
                  </div>
                </div>

                {/* Right Panel: Snapshot & Diagnostics */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
                  <div className="flex-1 bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Last Snapshot</p>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">
                        {capturedImage ? 'CAPTURED' : 'PENDING'}
                      </span>
                    </div>

                    <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden relative">
                      {capturedImage ? (
                        <img 
                          src={capturedImage} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="text-center px-6">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3">
                            <Camera size={24} />
                          </div>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Waiting for capture...</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 space-y-3">
                      <button
                        onClick={captureImage}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all text-sm tracking-wide"
                      >
                        CAPTURE IMAGE
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={downloadSnapshot}
                          className="py-3 px-4 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
                        >
                          DOWNLOAD
                        </button>
                        <button
                          onClick={shareImage}
                          className="py-3 px-4 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
                        >
                          SHARE SNAP
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-36 bg-slate-800 rounded-[32px] p-6 text-white flex flex-col justify-between overflow-hidden relative shrink-0">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-2">Diagnosis Note</p>
                      <p className="text-sm leading-snug text-slate-300 font-medium italic">"Standard tympanic membrane inspection. Verify visual landmarks before download."</p>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Sub-components ---

function AuthScreen({ mode, onBack, onAction }: { mode: 'SignUp' | 'SignIn', onBack: () => void, onAction: (u: string, p: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Please fill in all fields.');
      return;
    }
    onAction(username, password);
  };

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex-1 flex flex-col p-6 items-center justify-center bg-slate-100"
    >
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="mb-8 flex items-center text-slate-400 font-bold gap-2 hover:text-blue-600 transition-colors uppercase text-[10px] tracking-widest">
          <ChevronLeft size={16} /> Back to Home
        </button>

        <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-200">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-1">{mode === 'SignUp' ? 'Sign Up' : 'Welcome Back'}</h2>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">OTOSCOPE INTERFACE</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Credential: Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl p-4 text-sm font-semibold transition-all outline-none"
                placeholder="Name or ID..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Credential: Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl p-4 text-sm font-semibold transition-all outline-none"
                placeholder="Secret key..."
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm tracking-widest uppercase"
            >
              {mode === 'SignUp' ? 'Create Account' : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
