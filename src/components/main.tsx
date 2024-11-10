import { useEffect, useRef, useState } from "react"
import { MovingGradient } from "./MovingGradient"
import { Command, ArrowUpDown, Globe, BookOpen, MousePointer, Play, Plus } from "lucide-react"

const features = [
  {
    icon: <Command className="w-8 h-8" />,
    title: "Tab Navigation",
    description: "Switch between browser tabs effortlessly",
    commands: ["next tab", "previous tab"]
  },
  {
    icon: <ArrowUpDown className="w-8 h-8" />,
    title: "Smart Scrolling",
    description: "Control page scrolling with voice",
    commands: ["scroll down", "scroll up", "go to bottom", "back to top"]
  },
  {
    icon: <Plus className="w-8 h-8" />,
    title: "Tab Management",
    description: "Create and close tabs hands-free",
    commands: ["new tab", "close tab"]
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Quick Website Access",
    description: "Open your favorite websites instantly",
    commands: ["open YouTube", "search Facebook", "go to Twitter"]
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "AI Page Reader",
    description: "Get AI-powered page summaries",
    commands: ["read screen", "summarize page", "what's on this page"]
  },
  {
    icon: <MousePointer className="w-8 h-8" />,
    title: "Smart Click",
    description: "Click elements using natural language",
    commands: ["click search", "press play", "click profile picture"]
  },
  {
    icon: <Play className="w-8 h-8" />,
    title: "Media Control",
    description: "Control video and audio playback",
    commands: ["play video", "pause", "control media play"]
  }
]

export function Main({ name }) {
  return (
    <div id="listener-tab">
      <div className="h-screen">
        <header className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center relative z-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent ">Chirkut</h1>
          <nav className="flex items-center space-x-8">
            <a className="text-white hover:text-cyan-400 transition-colors" href="#features">Features</a>
            <a className="text-white hover:text-cyan-400 transition-colors" href="#demo">demo</a>
            <button className="rounded p-2 hover:scale-105 transition">
              <span className="bg-gradient-to-r from-cyan-400 hover:from-fuchsia-400 hover:to-cyan-400 to-fuchsia-400 text-transparent bg-clip-text">Get Free Access</span>
              </button>
          </nav>
        </header>
        <MovingGradient/>
        <div className="max-w-7xl mx-auto p-8 mt-16 relative">
          <div className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 md:mb-1 bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text text-center p-2">
            Control Your Browser with Your Voice
          </div>
          <p className="sm:text-xl lg:px-48 md:px-20 text-lg text-gray-400 px-2 sm:px-12 text-center mb-8">
            Chirkut is a voice enabled browser extension that lets you navigate the web with just your voice.</p>
          <div className="flex justify-center">

            <button className="relative rounded group hover:scale-110 duration-200">
              <span className="absolute rounded opacity-30 bg-gradient-to-r from-cyan-400 to-fuchsia-400 -inset-0.5 group-hover:opacity-100 blur transition duration-300"></span>
              <div className="bg-gray-900 relative rounded p-2">
                <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text rounded p-2">Get Chirkut Now</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <section id="features" className="max-w-7xl mx-auto px-4 py-10 relative">
        <div className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text">
          Powerful Voice Commands
        </div>
        <p className="text-gray-400 text-center mb-12 text-lg max-w-2xl mx-auto">
          Control your browser with natural voice commands. Chirkut understands what you want to do and makes it happen.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              {/* gradient border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-fuchsia-400 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              
              {/* card */}
              <div className="relative bg-gray-900 p-6 rounded-lg h-full transform transition duration-300 group-hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-400/10 to-fuchsia-400/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold ml-3 bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text">
                    {feature.title}
                  </h3>
                </div>
                
                <p className="text-gray-400 mb-4">{feature.description}</p>
                
                <div className="space-y-2">
                  {feature.commands.map((command, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400"></div>
                      <p className="text-sm text-gray-300">"{command}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text">
            Ready to Experience the Future?
          </div>
          <button className="relative rounded group hover:scale-110 duration-200">
              <span className="absolute rounded opacity-30 bg-gradient-to-r from-cyan-400 to-fuchsia-400 -inset-0.5 group-hover:opacity-100 blur transition duration-300"></span>
              <div className="bg-gray-900 relative rounded p-2">
                <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text rounded p-2">Install Chirkut Now</span>
              </div>
            </button>
        </div>
      </section>

    </div>
  )
}