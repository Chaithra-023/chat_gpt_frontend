import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const AskAi = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Load chat history on mount
    useEffect(() => {
        const loadHistory = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE}/history`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const history = await res.json();
                    // Convert history to messages format
                    const loadedMessages = [];
                    history.forEach(item => {
                        loadedMessages.push({ role: 'user', content: item.query });
                        loadedMessages.push({ role: 'assistant', content: item.response });
                    });
                    setMessages(loadedMessages);
                }
            } catch (err) {
                console.error('Failed to load history:', err);
            }
        };

        loadHistory();
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: input,
                    system_prompt: "You are a creative and helpful assistant."
                }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "**Error:** System offline. Please check your local server at port 8000." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] text-gray-100 flex flex-col">
            {/* Header / Navigation */}
            <header className="p-4 border-b border-white/5 bg-[#0b0e14]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-gray-400 hover:text-white transition group"
                    >
                        <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Exit to Dashboard
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">AI Core Active</span>
                    </div>
                </div>
            </header>

            {/* Chat Space */}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto w-full py-8 px-4">
                    {messages.length === 0 ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-2xl shadow-indigo-500/20 mb-4">
                                🤖
                            </div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                                What's on your mind?
                            </h2>
                            <p className="text-gray-500 max-w-xs">Ask me to write code, brainstorm ideas, or just chat.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-[#1a1f26] border border-white/5 rounded-tl-none prose prose-invert'
                                    }`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-2 items-center text-gray-500 text-sm animate-pulse italic">
                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                            AI is thinking...
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </main>

            {/* Input Section - Glassmorphism */}
            <footer className="p-6 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14] to-transparent">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your prompt here..."
                        className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder-gray-600 shadow-2xl"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 top-2.5 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                        </svg>
                    </button>
                </form>
                <p className="text-[10px] text-center text-gray-600 mt-4 uppercase tracking-[0.2em]">
                    Powered by DashVite Intelligence
                </p>
            </footer>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1f26; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default AskAi;