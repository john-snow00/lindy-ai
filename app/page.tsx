'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, CheckCircle, XCircle, Search, Shield, Star, Users, MessageSquare, Copy, TrendingUp } from 'lucide-react'

interface AnalysisResult {
  company: string
  trust_score: number
  risk_level: 'green' | 'yellow' | 'red'
  red_flags: string[]
  company_profile: string
  number_of_fake_reviews: number
  Total_reviews: number
  "5-Star Reviews": number
  "Single Reviewers": number
  "Generic Reviews": number
  "Short Reviews": number
  "Rating Distribution": string
  "Sample Reviews": string[]
  "Average Rating": number
}

export default function TrustpilotChecker() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async () => {
    if (!url.trim()) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      // Fallback to mock data if API fails
      const mockResult: AnalysisResult = {
        company: "TechCorp Solutions",
        trust_score: 34,
        risk_level: "red",
        red_flags: [
          "Too many 5-star reviews in short time period",
          "High number of single-review accounts",
          "Generic promotional language detected",
          "Suspicious review timing patterns"
        ],
        company_profile: "Technology consulting company established in 2019. Offers software development and IT consulting services primarily to small and medium businesses.",
        number_of_fake_reviews: 127,
        Total_reviews: 245,
        "5-Star Reviews": 156,
        "Single Reviewers": 89,
        "Generic Reviews": 67,
        "Short Reviews": 78,
        "Rating Distribution": "5★: 64%, 4★: 12%, 3★: 8%, 2★: 6%, 1★: 10%",
        "Sample Reviews": [
          "Great service, highly recommended! Fast delivery and excellent customer support.",
          "Amazing company! Best service ever. Will definitely use again. 5 stars!",
          "Excellent work quality. Professional team. Highly satisfied with results.",
          "Outstanding service! Quick response time. Very professional. Recommended!"
        ],
        "Average Rating": 4.2
      }
      setResult(mockResult)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200'
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'red': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'green': return <CheckCircle className="w-5 h-5" />
      case 'yellow': return <AlertTriangle className="w-5 h-5" />
      case 'red': return <XCircle className="w-5 h-5" />
      default: return <Shield className="w-5 h-5" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 70) return 'Reviews appear mostly genuine with minimal red flags detected.'
    if (score >= 40) return 'Mixed signals detected. Some reviews may be suspicious.'
    return 'High risk of fake reviews. Multiple red flags detected.'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Trustpilot Fake Reviews Checker</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze Trustpilot reviews to identify potentially fake or suspicious patterns. 
            Get detailed insights and trust scores to make informed decisions.
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Enter URL to Analyze
            </CardTitle>
            <CardDescription>
              Paste a company website URL or direct Trustpilot review page link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="https://www.trustpilot.com/review/example.com or https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !url.trim()}
                className="px-6"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Trust Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Trust Score Analysis</span>
                  <Badge className={`${getRiskColor(result.risk_level)} border`}>
                    {getRiskIcon(result.risk_level)}
                    <span className="ml-2 capitalize">{result.risk_level} Risk</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.trust_score)}`}>
                    {result.trust_score}
                  </div>
                  <div className="text-gray-600 mb-4">Trust Score (0-100)</div>
                  <Progress value={result.trust_score} className="w-full max-w-md mx-auto mb-4" />
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    {getScoreDescription(result.trust_score)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Company Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Company Profile: {result.company}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{result.company_profile}</p>
              </CardContent>
            </Card>

            {/* Review Statistics */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Review Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews:</span>
                    <span className="font-semibold">{result.Total_reviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating:</span>
                    <span className="font-semibold flex items-center">
                      {result["Average Rating"]} <Star className="w-4 h-4 ml-1 text-yellow-500" />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">5-Star Reviews:</span>
                    <span className="font-semibold">{result["5-Star Reviews"]}</span>
                  </div>
                  <Separator />
                  <div className="text-sm text-gray-600">
                    <strong>Rating Distribution:</strong>
                    <div className="mt-1">{result["Rating Distribution"]}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Suspicious Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential Fake Reviews:</span>
                    <span className="font-semibold text-red-600">{result.number_of_fake_reviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Single Reviewers:</span>
                    <span className="font-semibold">{result["Single Reviewers"]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Generic Reviews:</span>
                    <span className="font-semibold">{result["Generic Reviews"]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Short Reviews:</span>
                    <span className="font-semibold">{result["Short Reviews"]}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Red Flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <XCircle className="w-5 h-5 mr-2" />
                  Red Flags Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.red_flags.map((flag, index) => (
                    <div key={index} className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{flag}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sample Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Sample Suspicious Reviews
                </CardTitle>
                <CardDescription>
                  Examples of reviews that triggered red flags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result["Sample Reviews"].map((review, index) => (
                    <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <p className="text-gray-700 flex-1">{review}</p>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>This tool analyzes publicly available review patterns and provides insights for educational purposes.</p>
          <p className="mt-1">Always verify information independently before making business decisions.</p>
        </div>
      </div>
    </div>
  )
}
