"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Mic, MicOff, Volume2, VolumeX, Moon, Sun, Send } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function CheXxChatbot() {
  const { theme, setTheme } = useTheme()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm Pulee, your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<typeof window.speechSynthesis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: { results: { transcript: any }[][] }) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }

      // Speech Synthesis
      synthRef.current = window.speechSynthesis
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const responses = [
        "That's an interesting question! Let me help you with that.",
        "I understand what you're asking. Here's my perspective on that topic.",
        "Great question! I'd be happy to assist you with this.",
        "Thanks for asking! Let me provide you with some helpful information.",
        "I see what you mean. Here's what I think about that.",
      ]

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)

      // Speak the response if voice mode is enabled
      if (voiceMode && speechEnabled && synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(aiResponse.content)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 0.8
        synthRef.current.speak(utterance)
      }
    }, 1500)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const toggleVoiceMode = () => {
    setVoiceMode(!voiceMode)
    if (!voiceMode) {
      setSpeechEnabled(true)
    } else {
      setSpeechEnabled(false)
      // Stop any ongoing speech
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header with Controls */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {/* Left Corner Logo */}
            <div className="flex items-center">
              <div className="relative">
                <Image
                  src="/images/chexx-logo.png"
                  alt="CheXx Logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full p-3 border-2 border-orange-200 dark:border-purple-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105">
              <Sun className="h-5 w-5 text-orange-500 dark:text-orange-400 transition-all duration-300 hover:rotate-180" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                className="theme-switch data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-blue-600 data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-orange-400 data-[state=unchecked]:to-yellow-400 transition-all duration-500 ease-in-out transform hover:scale-110"
              />
              <Moon className="h-5 w-5 text-purple-600 dark:text-blue-400 transition-all duration-300 hover:rotate-12" />
            </div>
          </div>

          {/* Voice Mode Controls */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/50 dark:to-blue-900/50 rounded-full p-3 border-2 border-green-200 dark:border-green-600 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                    <Label
                      htmlFor="voice-mode"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300"
                    >
                      Voice Mode
                    </Label>
                    <Switch
                      id="voice-mode"
                      checked={voiceMode}
                      onCheckedChange={toggleVoiceMode}
                      className="voice-switch data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500 data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-gray-400 data-[state=unchecked]:to-gray-500 dark:data-[state=unchecked]:from-gray-600 dark:data-[state=unchecked]:to-gray-700 transition-all duration-500 ease-in-out transform hover:scale-110"
                    />
                    {voiceMode ? (
                      <Volume2 className="h-5 w-5 text-green-500 dark:text-green-400 transition-all duration-300 animate-pulse hover:scale-125" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-all duration-300 hover:scale-110" />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {voiceMode ? "Voice responses enabled" : "Text only mode"}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${voiceMode ? "bg-green-500 dark:bg-green-400" : "bg-gray-400 dark:bg-gray-500"}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center justify-between">
              <span>Chat with Pulee</span>
              <div className="flex items-center space-x-2">
                {isTyping && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {message.role === "user" ? (
                        <AvatarFallback className="bg-blue-500 text-white">U</AvatarFallback>
                      ) : (
                        <AvatarImage src="/images/chexx-logo.png" alt="CheXx" />
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.role === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message or use voice input..."
                    className="pr-12 bg-white dark:bg-gray-700"
                    disabled={isListening}
                  />
                  {isListening && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="flex space-x-1">
                        <div className="w-1 h-4 bg-red-500 rounded animate-pulse" />
                        <div className="w-1 h-3 bg-red-500 rounded animate-pulse" style={{ animationDelay: "0.1s" }} />
                        <div className="w-1 h-5 bg-red-500 rounded animate-pulse" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={toggleListening}
                  disabled={!recognitionRef.current}
                  className={isListening ? "bg-red-500 text-white hover:bg-red-600" : ""}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                <Button type="submit" disabled={!input.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{isListening ? "Listening..." : "Press microphone to speak"}</span>
                <span>Voice: {voiceMode ? "ON" : "OFF"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
