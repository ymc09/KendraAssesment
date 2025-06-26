/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Chat from './components/Chat';


 export const queryClient= new QueryClient({defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },})

  
function App() {

  return (
     <QueryClientProvider client={queryClient}>
     <BrowserRouter>
      <Routes>
          <Route path="/" element={<Chat/>} />
        <Route path="/chat/:chatId" element={<Chat/>} />
      </Routes>
    </BrowserRouter>
          </QueryClientProvider>
  );
}

export default App;
