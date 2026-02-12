import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const Dashboard = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // History: Array of objects [{ id, title, messages }]
    const [history, setHistory] = useState([
        { id: 1, title: "Welcome Chat", messages: [{ role: 'assistant', content: "Hello! How can I help you today?" }] }
    ]);
    
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadChat = (chat) => {
        setMessages(chat.messages);
    };

    const deleteChat = (e, id) => {
        e.stopPropagation(); // Prevents loading the chat when clicking delete
        const updatedHistory = history.filter(chat => chat.id !== id);
        setHistory(updatedHistory);
        
        // If we deleted the chat we were currently viewing, clear the screen
        setMessages([]);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        const updatedMessages = [...messages, userMsg];
        
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:8000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, system_prompt: "Helpful Assistant" }),
            });
            const data = await res.json();
            const aiMsg = { role: 'assistant', content: data.response };
            const finalMessages = [...updatedMessages, aiMsg];
            
            setMessages(finalMessages);

            if (messages.length === 0) {
                // New Chat: Create new history entry with unique ID
                setHistory(prev => [{ id: Date.now(), title: input.substring(0, 20), messages: finalMessages }, ...prev]);
            } else {
                // Existing Chat: Find the most recent chat and update its messages
                setHistory(prev => {
                    const newHist = [...prev];
                    newHist[0] = { ...newHist[0], messages: finalMessages };
                    return newHist;
                });
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "**Error:** System offline." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#212121] text-gray-100 font-sans overflow-hidden">
            
            {/* SIDEBAR */}
            <aside className="w-[260px] bg-[#171717] flex flex-col p-3 border-r border-white/10">
                <button 
                    onClick={() => setMessages([])} 
                    className="flex items-center gap-3 w-full p-3 rounded-md border border-white/20 hover:bg-[#2c2c2c] transition text-sm mb-4"
                >
                    <span className="text-xl">+</span> New Chat
                </button>
                
                <div className="flex-1 overflow-y-auto">
                    <p className="text-[11px] text-gray-500 font-bold px-2 mb-2 uppercase tracking-wider">Recent History</p>
                    <div className="space-y-1">
                        {history.map((chat) => (
                            <div 
                                key={chat.id} 
                                onClick={() => loadChat(chat)}
                                className="group w-full p-2 text-sm text-gray-300 hover:bg-[#2c2c2c] rounded cursor-pointer flex items-center justify-between transition"
                            >
                                <div className="truncate flex items-center gap-2">
                                    <span>💬</span> {chat.title}
                                </div>
                                <button 
                                    onClick={(e) => deleteChat(e, chat.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition"
                                    title="Delete chat"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => navigate('/login')} className="p-3 text-sm text-red-400 hover:bg-red-900/10 rounded-md mt-auto">
                    Logout
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col relative bg-[#212121]">
                <div className="flex-1 overflow-y-auto pb-32 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-20 select-none">
                            <h1 className="text-4xl font-bold">DashVite AI</h1>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`w-full py-8 ${msg.role === 'assistant' ? 'bg-[#2f2f2f]/30' : ''}`}>
                                <div className="max-w-3xl mx-auto flex gap-6 px-4">
                                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 text-xs font-bold shadow-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-[#10a37f]'}`}>
                                        {msg.role === 'user' ? 'U' : 'AI'}
                                    </div>
                                    <div className="flex-1 min-w-0 prose prose-invert max-w-none prose-pre:bg-black prose-pre:border prose-pre:border-white/10">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* INPUT AREA */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-10">
                    <div className="max-w-3xl mx-auto px-4 pb-8">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full bg-[#2f2f2f] border border-white/10 rounded-xl py-4 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-white/30 text-white placeholder-gray-500 shadow-2xl"
                                placeholder="Message DashVite..."
                            />
                            <button type="submit" className="absolute right-2.5 bg-white text-black p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-20" disabled={!input.trim()}>
                                ➔
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;