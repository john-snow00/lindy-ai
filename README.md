# Trustpilot Fake Reviews Checker

A powerful AI-powered tool that analyzes Trustpilot reviews to identify potentially fake or suspicious patterns. Built with Next.js, OpenAI GPT-4o, and real-time web scraping capabilities.

## 🚀 Features

- **Real-time Web Scraping**: Fetches actual review content from Trustpilot pages
- **AI-Powered Analysis**: Uses OpenAI GPT-4o for intelligent review pattern detection
- **Trust Score System**: Provides 0-100 trust scores with risk level indicators
- **Detailed Insights**: Shows suspicious activity patterns, red flags, and statistics
- **Professional UI**: Modern design with dark/light mode support
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **AI Integration**: OpenAI GPT-4o API
- **Web Scraping**: Cheerio for HTML parsing
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/john-snow00/lindy-ai.git
cd lindy-ai
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
bun run dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How It Works

1. **Input URL**: Enter any Trustpilot review page URL
2. **Web Scraping**: The system fetches real review content from the page
3. **AI Analysis**: GPT-4o analyzes the reviews for suspicious patterns
4. **Results**: Get detailed insights including:
   - Trust score (0-100)
   - Risk level (Green/Yellow/Red)
   - Suspicious activity statistics
   - Red flags detected
   - Sample suspicious reviews

## 🔍 What It Detects

- Too many 5-star reviews in short time periods
- High number of single-review accounts
- Generic promotional language
- Copy-paste reviews with similar wording
- Suspicious review timing patterns
- Fake reviewer profiles
- Inconsistent review patterns

## 📊 Analysis Features

- **Trust Score**: 0-100 scoring system
- **Risk Levels**: 
  - 🟢 Green (70-100): Reviews appear mostly genuine
  - 🟡 Yellow (40-69): Mixed signals, some suspicious activity
  - 🔴 Red (0-39): High risk of fake reviews
- **Detailed Statistics**: Review counts, ratings distribution, suspicious patterns
- **Red Flags**: Specific issues identified in the review patterns
- **Sample Reviews**: Examples of suspicious reviews found

## 🚀 Deployment

The application can be deployed on any platform that supports Next.js:

- **Vercel** (Recommended)
- **Netlify**
- **Railway**
- **Heroku**

Make sure to set your `OPENAI_API_KEY` environment variable in your deployment platform.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This tool analyzes publicly available review patterns and provides insights for educational purposes. Always verify information independently before making business decisions.

## 🔗 Links

- [Live Demo](https://your-deployment-url.com)
- [GitHub Repository](https://github.com/john-snow00/lindy-ai)
- [OpenAI API](https://openai.com/api/)
- [Trustpilot](https://www.trustpilot.com/)

---

Built with ❤️ using Next.js and OpenAI GPT-4o
