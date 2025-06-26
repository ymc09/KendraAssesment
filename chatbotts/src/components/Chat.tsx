import { useParams } from "react-router-dom";
import { useStreamChat } from "../hooks/chatHooks";
import { useEffect, useRef, useState } from "react";
import type { Message } from "../types";
import SideBar from "./SideBar";
import { getChatMessages } from "../api/chat";
import { useQuery } from "@tanstack/react-query";
import MessageBubble from "./MessageBubble";


export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const { streamChat, isStreaming } = useStreamChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const { isLoading, error } = useQuery<Message[], Error>({
    queryKey: ['chatMessages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const res = await getChatMessages(1, 20, chatId);
      setLocalMessages(res)
      return res;
    },
    enabled: !!chatId,
   
  });

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !chatId || isStreaming) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      user_message: inputMessage,
      bot_response: '',
      timestamp: new Date().toISOString(),
      isPending: true ,
      isFailed:false
    };
    console.log(newMessage)
    
    setLocalMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    

    try {
      await streamChat({
        message: inputMessage,
        chatId,
        onMessage: (chunk) => {
          setLocalMessages(prev => prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, bot_response: msg.bot_response + chunk, isPending: false } 
              : msg
          ));

    }})}
     catch (err) {
      console.error('Streaming error:', err);
    }
  };

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <SideBar />
      
      <div className="flex flex-col flex-1 p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4">
          {isLoading && <p className="text-gray-400 text-center">Loading messages...</p>}
          {error && <p className="text-red-400 text-center">Error loading messages: {error.message}</p>}
          
          {!isLoading && !error && localMessages.length === 0 && (
            <p className="text-gray-400 text-center">No messages yet. Start chatting!</p>
          )}

          {localMessages.map((message) => (
            <div key={message.id} className="mb-6 group">
              {message.user_message && (
                <div className="relative">
                  <MessageBubble message={message.user_message} user={true}/>
                  
                </div>
              )}
              {message.bot_response && (
                <MessageBubble message={message.bot_response} user={false}/>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-0 bg-gray-800 p-4 rounded-lg">
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-gray-700 text-white p-3 rounded-lg focus:outline-none disabled:opacity-50"
              placeholder="Ask me anything..."
              disabled={isStreaming}
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-3 rounded-lg disabled:opacity-50"
              disabled={!inputMessage.trim() || isStreaming}
            >
              {isStreaming ? 'Responding' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}