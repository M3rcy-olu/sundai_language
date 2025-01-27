import React from 'react'
import LLMQuery from './components/LLMQuery'
import VoiceRecorder from './components/VoiceRecorder'

const page = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Interface</h1>
      <div className="grid gap-6">
        <VoiceRecorder />
        <LLMQuery />
      </div>
    </div>
  )
}

export default page