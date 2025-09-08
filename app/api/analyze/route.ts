import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  console.log('=== API ROUTE STARTED ===')
  
  try {
    const { url } = await request.json()
    console.log('URL received:', url)
    
    if (!url) {
      console.log('No URL provided')
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const openaiKey = process.env.OPENAI_API_KEY
    console.log('OpenAI key exists:', !!openaiKey)

    if (!openaiKey || !openaiKey.startsWith('sk-')) {
      console.log('❌ No valid OpenAI key found, using mock data')
      return NextResponse.json(generateMockAnalysis(url))
    }

    console.log('✅ Valid OpenAI key found, fetching real page content...')

    // Fetch the actual Trustpilot page content
    let companyName = ''
    let reviews: string[] = []
    let totalReviews = 0
    let averageRating = 0
    
    try {
      console.log('🔍 Fetching page content from:', url)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status}`)
      }
      
      const html = await response.text()
      const $ = cheerio.load(html)
      
      // Extract company name
      companyName = $('h1').first().text().trim() || 
                   $('title').text().split('|')[0].trim() ||
                   extractCompanyName(url)
      
      // Extract reviews
      const reviewElements = $('[data-service-review-text-typography="true"], .review-content, .review-text, [data-testid="review-text"]')
      reviewElements.each((i, el) => {
        const reviewText = $(el).text().trim()
        if (reviewText && reviewText.length > 10) {
          reviews.push(reviewText)
        }
      })
      
      // Extract total reviews count
      const reviewCountText = $('[data-reviews-count-typography="true"], .review-count, [data-testid="review-count"]').first().text()
      const reviewCountMatch = reviewCountText.match(/(\d+(?:,\d+)*)/g)
      if (reviewCountMatch) {
        totalReviews = parseInt(reviewCountMatch[0].replace(/,/g, ''))
      }
      
      // Extract average rating
      const ratingText = $('[data-rating-typography="true"], .average-rating, [data-testid="rating"]').first().text()
      const ratingMatch = ratingText.match(/(\d+\.?\d*)/g)
      if (ratingMatch) {
        averageRating = parseFloat(ratingMatch[0])
      }
      
      console.log('✅ Successfully extracted page content:')
      console.log('- Company:', companyName)
      console.log('- Reviews found:', reviews.length)
      console.log('- Total reviews:', totalReviews)
      console.log('- Average rating:', averageRating)
      
      // Limit reviews for API call (first 20 reviews)
      reviews = reviews.slice(0, 20)
      
    } catch (fetchError) {
      console.error('❌ Failed to fetch page content:', fetchError)
      console.log('⚠️ Using URL-based analysis instead')
      companyName = extractCompanyName(url)
    }

    // Create detailed prompt with real data
    const prompt = `You are an expert at analyzing Trustpilot reviews for authenticity. 

COMPANY: ${companyName}
URL: ${url}
TOTAL REVIEWS: ${totalReviews || 'Unknown'}
AVERAGE RATING: ${averageRating || 'Unknown'}

ACTUAL REVIEWS TO ANALYZE:
${reviews.length > 0 ? reviews.map((review, i) => `${i + 1}. "${review}"`).join('\n') : 'No reviews extracted - analyze based on URL pattern'}

Please analyze these REAL reviews for patterns of fake reviews such as:
- Too many 5-star reviews in a short time period
- Very short and simple written reviews
- Copy-paste reviews with similar wording
- Reviewers with only 1 review on their profile
- Sudden spikes of 5 star reviews activity
- Generic promotional language like "Great service, highly recommended"
- Reviews that look suspiciously similar
- Reviewer profiles that seem fake or newly created

Based on your analysis of the ACTUAL CONTENT above, assign a trust score between 0 and 100 where:
- 70-100: Reviews appear mostly genuine (green risk level)
- 40-69: Mixed signals, some suspicious activity (yellow risk level)  
- 0-39: High risk of fake reviews (red risk level)

Return results in this exact JSON format (no additional text):
{
  "company": "${companyName}",
  "trust_score": 75,
  "risk_level": "green",
  "red_flags": ["Specific red flag based on actual analysis", "Another specific red flag"],
  "company_profile": "Brief description of ${companyName} and their business based on the reviews",
  "number_of_fake_reviews": 25,
  "Total_reviews": ${totalReviews || 150},
  "5-Star Reviews": 90,
  "Single Reviewers": 15,
  "Generic Reviews": 10,
  "Short Reviews": 20,
  "Rating Distribution": "5★: 60%, 4★: 20%, 3★: 10%, 2★: 5%, 1★: 5%",
  "Sample Reviews": ["${reviews[0] || 'Sample review 1'}", "${reviews[1] || 'Sample review 2'}", "${reviews[2] || 'Sample review 3'}", "${reviews[3] || 'Sample review 4'}"],
  "Average Rating": ${averageRating || 4.3}
}`

    try {
      console.log('🤖 Making OpenAI API request with real data...')
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.3
        })
      })

      console.log('OpenAI response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ OpenAI API error details:', errorText)
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ OpenAI response received successfully')
      
      const content = data.choices[0].message.content
      console.log('AI response preview:', content.substring(0, 200) + '...')
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0])
        console.log('✅ Successfully parsed AI response, trust score:', analysisResult.trust_score)
        
        // Ensure risk_level matches trust_score
        if (analysisResult.trust_score >= 70) {
          analysisResult.risk_level = 'green'
        } else if (analysisResult.trust_score >= 40) {
          analysisResult.risk_level = 'yellow'
        } else {
          analysisResult.risk_level = 'red'
        }
        
        console.log('✅ Returning REAL AI analysis result based on actual page content')
        return NextResponse.json(analysisResult)
      } else {
        console.error('❌ Could not find JSON in AI response')
        throw new Error('Could not parse JSON from AI response')
      }

    } catch (apiError) {
      console.error('❌ OpenAI API call failed:', apiError)
      console.log('⚠️ Falling back to mock data due to API error')
      return NextResponse.json(generateMockAnalysis(url))
    }
    
  } catch (error) {
    console.error('❌ General error in API route:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

function generateMockAnalysis(url: string) {
  const trustScore = Math.floor(Math.random() * 100)
  console.log('🎭 Generating mock analysis with trust score:', trustScore)
  
  return {
    company: extractCompanyName(url),
    trust_score: trustScore,
    risk_level: trustScore >= 70 ? 'green' : trustScore >= 40 ? 'yellow' : 'red',
    red_flags: [
      "Unable to fetch real data - using mock analysis",
      "API error occurred during analysis"
    ],
    company_profile: `Mock analysis for ${extractCompanyName(url)} due to technical issues.`,
    number_of_fake_reviews: Math.floor(Math.random() * 50),
    Total_reviews: Math.floor(Math.random() * 500) + 100,
    "5-Star Reviews": Math.floor(Math.random() * 200),
    "Single Reviewers": Math.floor(Math.random() * 100),
    "Generic Reviews": Math.floor(Math.random() * 80),
    "Short Reviews": Math.floor(Math.random() * 90),
    "Rating Distribution": "5★: 64%, 4★: 12%, 3★: 8%, 2★: 6%, 1★: 10%",
    "Sample Reviews": [
      "Mock review - real data unavailable",
      "Mock review - real data unavailable",
      "Mock review - real data unavailable",
      "Mock review - real data unavailable"
    ],
    "Average Rating": parseFloat((Math.random() * 2 + 3).toFixed(1))
  }
}

function extractCompanyName(url: string): string {
  try {
    // Extract company name from Trustpilot URL
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('trustpilot.com')) {
      const pathParts = urlObj.pathname.split('/')
      const reviewIndex = pathParts.indexOf('review')
      if (reviewIndex !== -1 && pathParts[reviewIndex + 1]) {
        const domain = pathParts[reviewIndex + 1]
        return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
      }
    }
    
    const domain = urlObj.hostname.replace('www.', '')
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
  } catch {
    return "Unknown Company"
  }
}
