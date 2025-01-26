import { NextRequest, NextResponse } from 'next/server'
import React from 'react'

const LLMQuery = ({ model = "text-davinci-003", initialPrompt = "", context= "", maxTokens = 50 }) => {
    
        

  return (
    NextResponse.json({ res: "" })
  )
}

export default LLMQuery