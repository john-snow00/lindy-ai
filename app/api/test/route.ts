import { NextResponse } from 'next/server'

export async function GET() {
  const openaiKey = process.env.OPENAI_API_KEY
  
  return NextResponse.json({
    hasKey: !!openaiKey,
    keyLength: openaiKey?.length || 0,
    keyPrefix: openaiKey?.substring(0, 15) || 'none',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('API'))
  })
}
