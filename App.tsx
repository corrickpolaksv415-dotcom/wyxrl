import React, { useState, useEffect, useRef } from 'react';
import { User, Novel, ViewState } from './types';
import { generateCoverImage, ensureApiKey } from './services/geminiService';
import { AIChat } from './components/AIChat';
import { 
  BookOpen, 
  Search, 
  Upload as UploadIcon, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  Github,
  Mail,
  FileText,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Tag
} from 'lucide-react';

// --- MOCK DATA & UTILS ---

const MOCK_NOVELS: Novel[] = [
  {
    id: '1',
    title: 'The Silent Stars',
    author: 'Elena Fisher',
    description: 'In a universe where silence is a currency, one girl dares to speak. A thrilling sci-fi adventure exploring the depths of space and human connection.',
    coverUrl: 'https://picsum.photos/300/400?random=1',
    content: "# Chapter 1\n\nThe stars were not silent. They screamed in colors unseen by human eyes...",
    tags: ['Sci-Fi', 'Adventure', 'Space'],
    createdAt: Date.now(),
    uploaderId: 'system'
  },
  {
    id: '2',
    title: 'Echoes of the Past',
    author: 'Marcus Thorne',
    description: 'A detective uncovers a mystery that spans three generations in Victorian London.',
    coverUrl: 'https://picsum.photos/300/400?random=2',
    content: "The fog rolled in thick and heavy off the Thames...",
    tags: ['Mystery', 'Historical', 'Crime'],
    createdAt: Date.now() - 100000,
    uploaderId: 'system'
  },
    {
    id: '3',
    title: 'Digital Dreams',
    author: 'AI Enthusiast',
    description: 'When the code began to dream, reality began to fracture.',
    coverUrl: 'https://picsum.photos/300/400?random=3',
    content: "01001000 01100101 01101100 01101100 01101111...",
    tags: ['Cyberpunk', 'Tech', 'Dystopian'],
    createdAt: Date.now() - 200000,
    uploaderId: 'system'
  }
];

const INITIAL_USER: User | null = null;

// --- COMPONENTS ---

// 1. NAVBAR
const Navbar: React.FC<{
  user: User | null;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}> = ({ user, onNavigate, onLogout, searchQuery, setSearchQuery }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate(ViewState.HOME)}>
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">InkFlow</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search by title, author, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate(ViewState.UPLOAD)}
                  className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-primary hover:bg-indigo-600 focus:outline-none transition shadow-sm"
                >
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload
                </button>
                <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
                    <img src={user.avatar} alt="Avatar" className="h-8 w-8 rounded-full border border-gray-200" />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    <button onClick={onLogout} className="text-gray-500 hover:text-red-500 ml-2">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => onNavigate(ViewState.LOGIN)}
                className="flex items-center text-gray-600 hover:text-primary font-medium"
              >
                <UserIcon className="h-5 w-5 mr-1" />
                Login
              </button>
            )}
          </div>

           {/* Mobile menu button */}
           <div className="md:hidden flex items-center">
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 hover:text-gray-700">
               {mobileMenuOpen ? <X /> : <Menu />}
             </button>
           </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-3">
             {user ? (
              <>
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                    <img src={user.avatar} alt="Avatar" className="h-8 w-8 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={() => { onNavigate(ViewState.UPLOAD); setMobileMenuOpen(false); }}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary"
                >
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Novel
                </button>
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                     <LogOut className="h-4 w-4 mr-2" />
                     Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => { onNavigate(ViewState.LOGIN); setMobileMenuOpen(false); }}
                className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Login
              </button>
            )}
        </div>
      )}
    </nav>
  );
};

// 2. NOVEL LIST (HOME)
const NovelList: React.FC<{ 
    novels: Novel[], 
    onSelect: (novel: Novel) => void,
    searchQuery: string 
}> = ({ novels, onSelect, searchQuery }) => {
    
    const filteredNovels = novels.filter(n => {
        const q = searchQuery.toLowerCase();
        return (
            n.title.toLowerCase().includes(q) ||
            n.author.toLowerCase().includes(q) ||
            n.tags.some(t => t.toLowerCase().includes(q))
        );
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Featured Novels</h2>
            {filteredNovels.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-xl">No novels found matching "{searchQuery}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredNovels.map(novel => (
                        <div key={novel.id} onClick={() => onSelect(novel)} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-full">
                            <div className="relative aspect-[3/4] overflow-hidden bg-gray-200">
                                <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <span className="text-white font-medium flex items-center gap-1">Read Now <BookOpen size={16}/></span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{novel.title}</h3>
                                <p className="text-sm text-primary font-medium mb-3">{novel.author}</p>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">{novel.description}</p>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {novel.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 3. NOVEL READER
const NovelReader: React.FC<{ novel: Novel, onBack: () => void }> = ({ novel, onBack }) => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen bg-white shadow-lg my-8">
            <button onClick={onBack} className="mb-6 text-gray-500 hover:text-primary flex items-center gap-1 transition">
                &larr; Back to Library
            </button>
            <div className="text-center mb-12 border-b border-gray-100 pb-8">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">{novel.title}</h1>
                <p className="text-lg text-gray-600 italic">by {novel.author}</p>
                <div className="flex justify-center gap-2 mt-4">
                     {novel.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 text-sm rounded-full border border-gray-200">{tag}</span>
                    ))}
                </div>
            </div>
            
            <div className="prose prose-lg prose-slate max-w-none font-serif leading-loose mx-auto">
                 {/* Simple render for text, in real app use markdown parser */}
                {novel.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-4">{line}</p>
                ))}
            </div>
        </div>
    );
};

// 4. UPLOAD FORM
const UploadForm: React.FC<{ onUpload: (novel: Novel) => void, onCancel: () => void, currentUser: User }> = ({ onUpload, onCancel, currentUser }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [fileName, setFileName] = useState('');
    
    // Image Gen State
    const [imagePrompt, setImagePrompt] = useState('');
    const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setContent(text);
        };
        reader.readAsText(file);
    };

    const handleGenerateImage = async () => {
        if (!imagePrompt) return;
        setIsGenerating(true);
        try {
            // Check for API Key requirement for premium image model
            await ensureApiKey(); 
            const imgData = await generateCoverImage(imagePrompt, imageSize);
            setGeneratedImage(imgData);
            setCoverUrl(imgData); // Auto select generated image
        } catch (error) {
            alert('Failed to generate image. Please try again or ensure you have selected an API key if prompted.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            alert("Title and File content are required!");
            return;
        }

        const newNovel: Novel = {
            id: Date.now().toString(),
            title,
            author: currentUser.name,
            description,
            coverUrl: coverUrl || 'https://picsum.photos/300/400',
            content,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            createdAt: Date.now(),
            uploaderId: currentUser.id
        };

        onUpload(newNovel);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                     <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UploadIcon className="text-primary" /> Publish New Novel
                    </h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                        <input type="file" accept=".txt,.md,.html" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600 font-medium">{fileName || "Click to upload novel file (.txt, .md, .html)"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Enter novel title" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="What is your story about?" />
                    </div>
                    
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                         <div className="relative">
                            <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Fantasy, Romance, Action..." />
                         </div>
                    </div>

                    {/* AI Cover Generation */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <ImageIcon size={18} className="text-purple-600"/> AI Cover Generator
                        </h3>
                        <div className="flex gap-4 flex-col md:flex-row">
                            <div className="flex-1 space-y-4">
                                <textarea 
                                    value={imagePrompt} 
                                    onChange={e => setImagePrompt(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm h-24 resize-none" 
                                    placeholder="Describe the cover scene (e.g., A futuristic city with neon lights under a purple sky)..."
                                />
                                <div className="flex gap-2 items-center">
                                    <select 
                                        value={imageSize} 
                                        onChange={(e) => setImageSize(e.target.value as any)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                    >
                                        <option value="1K">1K Resolution</option>
                                        <option value="2K">2K Resolution</option>
                                        <option value="4K">4K Resolution</option>
                                    </select>
                                    <button 
                                        type="button"
                                        onClick={handleGenerateImage}
                                        disabled={isGenerating || !imagePrompt}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin h-4 w-4"/> : "Generate Cover"}
                                    </button>
                                </div>
                            </div>
                            <div className="w-full md:w-40 h-52 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border border-gray-300 relative group">
                                {generatedImage ? (
                                    <>
                                        <img src={generatedImage} alt="Generated Cover" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">Generated</span>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-gray-400 text-xs text-center px-2">Preview</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition shadow-md">Publish Novel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// 5. LOGIN VIEW
const LoginView: React.FC<{ onLogin: (provider: string) => void }> = ({ onLogin }) => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <div className="text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-gray-600">Sign in to start writing and reading</p>
                </div>
                <div className="space-y-4">
                    <button onClick={() => onLogin('google')} className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium transition">
                        <span className="mr-2">G</span> Continue with Google
                    </button>
                     <button onClick={() => onLogin('qq')} className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium transition">
                        <span className="mr-2">QQ</span> Continue with QQ
                    </button>
                    <button onClick={() => onLogin('email')} className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-xl shadow-sm bg-primary text-white hover:bg-indigo-600 font-medium transition">
                        <Mail className="mr-2 h-5 w-5" /> Sign in with Email
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-8">By signing in, you agree to our Terms of Service.</p>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [view, setView] = useState<ViewState>(ViewState.HOME);
    const [user, setUser] = useState<User | null>(INITIAL_USER);
    const [novels, setNovels] = useState<Novel[]>(MOCK_NOVELS);
    const [currentNovel, setCurrentNovel] = useState<Novel | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogin = (provider: string) => {
        // Mock Login
        setUser({
            id: 'u_123',
            name: provider === 'qq' ? 'QQ User' : 'Demo Author',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
            provider: provider as any
        });
        setView(ViewState.HOME);
    };

    const handleLogout = () => {
        setUser(null);
        setView(ViewState.HOME);
    };

    const handleUpload = (novel: Novel) => {
        setNovels([novel, ...novels]);
        setView(ViewState.HOME);
    };

    const handleSelectNovel = (novel: Novel) => {
        setCurrentNovel(novel);
        setView(ViewState.READ);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <Navbar 
                user={user} 
                onNavigate={(v) => {
                    setView(v);
                    if(v === ViewState.HOME) setCurrentNovel(null);
                }} 
                onLogout={handleLogout}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            {/* Main Content Area */}
            <main className="flex-grow">
                {view === ViewState.HOME && (
                    <NovelList novels={novels} onSelect={handleSelectNovel} searchQuery={searchQuery} />
                )}
                
                {view === ViewState.READ && currentNovel && (
                    <NovelReader novel={currentNovel} onBack={() => setView(ViewState.HOME)} />
                )}

                {view === ViewState.UPLOAD && user && (
                    <UploadForm 
                        onUpload={handleUpload} 
                        onCancel={() => setView(ViewState.HOME)} 
                        currentUser={user} 
                    />
                )}

                {view === ViewState.LOGIN && (
                    <LoginView onLogin={handleLogin} />
                )}
            </main>

            {/* AI Chat Bot - Always available */}
            <AIChat />

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <span className="text-xl font-bold text-primary flex items-center gap-2"><BookOpen size={20}/> InkFlow</span>
                            <p className="text-sm text-gray-500 mt-2">Empowering storytellers with AI.</p>
                        </div>
                        <div className="flex flex-col md:items-end space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Contact Support:</span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                <span>QQ: 2415937997</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <a href="#" className="hover:text-primary transition"><Github size={18} /></a>
                                <a href="#" className="hover:text-primary transition"><Mail size={18} /></a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} InkFlow Novels. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;