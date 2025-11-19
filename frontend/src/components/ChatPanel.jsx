import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { toast } from './ui/sonner';
import { useChatContext } from '../context/ChatContext';
import { sendMessage, saveLead } from '../services/chatApi';

const ChatPanel = () => {
  const { isOpen, messages, sessionId, closeChat, addMessage } = useChatContext();
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) =>
          prev.trim() ? `${prev} ${transcript}` : transcript
        );
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed') {
          toast.error(
            'Microphone access denied. Please enable microphone permissions in your browser settings.'
          );
        } else if (event.error === 'no-speech') {
          toast.info('No speech detected. Please try speaking again.');
        } else if (event.error === 'audio-capture') {
          toast.error(
            'No microphone found. Please connect a microphone and try again.'
          );
        } else if (event.error === 'network') {
          toast.error(
            'Network error. Voice recognition requires an internet connection.'
          );
        } else {
          toast.error(
            `Voice recognition error: ${event.error}. Please try typing instead.`
          );
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      toast.error(
        'Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.info('Speak now... Click microphone again to stop.');
      } catch (error) {
        console.error('Error starting recognition:', error);
        if (error.name === 'InvalidStateError') {
          recognitionRef.current?.stop();
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
              setIsListening(true);
            } catch (e) {
              toast.error(
                'Could not start voice recognition. Please refresh the page.'
              );
            }
          }, 100);
        } else {
          toast.error(
            'Could not start voice recognition. Please check microphone permissions.'
          );
        }
      }
    }
  };

  const speak = (text) => {
    if (!voiceEnabled) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startNewConversation = () => {
    localStorage.removeItem('photography_chat_session_id');
    toast.success('Starting new conversation...');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    addMessage(userMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage(sessionId, inputMessage);

      let assistantMessage = response.response;

      // Handle lead capture
      if (assistantMessage.includes('<LEAD_INFO>')) {
        try {
          const leadMatch = assistantMessage.match(
            /<LEAD_INFO>(.*?)<\/LEAD_INFO>/s
          );
          if (leadMatch) {
            const leadData = JSON.parse(leadMatch[1]);

            // Save lead to backend
            await saveLead({
              session_id: sessionId,
              ...leadData,
              captured_at: new Date().toISOString(),
            });

            // Remove lead info tags from display
            assistantMessage = assistantMessage
              .replace(/<LEAD_INFO>.*?<\/LEAD_INFO>/s, '')
              .trim();

            toast.success(
              'Thank you! We have received your information and will get back to you soon.'
            );
          }
        } catch (error) {
          console.error('Error processing lead capture:', error);
        }
      }

      const botMessage = { role: 'assistant', content: assistantMessage };
      addMessage(botMessage);

      // Speak the response if voice is enabled
      speak(assistantMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(
        'Failed to send message. Please check your connection and try again.'
      );
      addMessage({
        role: 'assistant',
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 right-6 z-50 flex flex-col w-[350px] h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 md:w-[350px] md:h-[500px] max-md:w-full max-md:h-full max-md:bottom-0 max-md:right-0 max-md:rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#1a1a1a] text-white rounded-t-lg max-md:rounded-none">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <h3 className="font-semibold text-sm ">Photography Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              className="text-white hover:bg-white/10 text-xs h-8 px-2"
              title="Start a new conversation"
            >
              New Chat
            </Button>
            {voiceSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (!voiceEnabled) {
                    toast.success('Voice responses enabled');
                  } else {
                    stopSpeaking();
                    toast.info('Voice responses disabled');
                  }
                }}
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                {voiceEnabled && !isSpeaking ? (
                  <Volume2 className="h-4 w-4" />
                ) : voiceEnabled && isSpeaking ? (
                  <Volume2 className="h-4 w-4 animate-pulse" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChat}
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-[#1a1a1a] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg max-md:rounded-none">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            {voiceSupported && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoiceRecognition}
                disabled={isLoading}
                className={isListening ? 'bg-red-50 border-red-300' : ''}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-red-600" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="bg-[#1a1a1a] hover:bg-[#111827]"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatPanel;
