import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { Copy, Bot, Laugh, CloudMoon, Newspaper, Coins, Image, UserCheck, MapPin, Languages, Link2, Youtube, Music, Speech } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import Header from '@/components/Header';
import AudioPlayer from '@/components/AudioPlayer';
import StarryBackground from '@/components/StarryBackground';
import Moon from '@/components/Moon';
import ApiCard, { ApiCardProps } from '@/components/ApiCard';
import CodeBlock from '@/components/CodeBlock';

const Home: FC = () => {
  const baseUrl = window.location.origin;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
      duration: 2000,
    });
  };

  const apiCategories: ApiCardProps[] = [
    {
      icon: <Bot />,
      title: "AI Integration",
      description: "Integrate powerful AI capabilities into your applications.",
      endpoints: [
        { 
          path: "/api/gemini", 
          fullUrl: `${baseUrl}/api/gemini?message=your_message_here` 
        }
      ],
      exampleResponse: JSON.stringify({
        success: true,
        message: "Hello! How can I help you today?",
        model: "gemini-2.0-flash"
      })
    },
    {
      icon: <Laugh />,
      title: "Entertainment",
      description: "Add fun elements to your applications with jokes and quotes.",
      endpoints: [
        { 
          path: "/api/jokes/random", 
          fullUrl: `${baseUrl}/api/jokes/random` 
        },
        { 
          path: "/api/quotes/random", 
          fullUrl: `${baseUrl}/api/quotes/random` 
        }
      ],
      exampleResponse: JSON.stringify({
        id: "j123",
        joke: "Why don't scientists trust atoms? Because they make up everything!",
        category: "science"
      })
    },
    {
      icon: <CloudMoon />,
      title: "Weather",
      description: "Access current weather data and forecasts for any location.",
      endpoints: [
        { 
          path: "/api/weather/current", 
          fullUrl: `${baseUrl}/api/weather/current?location=london` 
        },
        { 
          path: "/api/weather/forecast", 
          fullUrl: `${baseUrl}/api/weather/forecast?location=tokyo&days=5` 
        }
      ],
      exampleResponse: JSON.stringify({
        location: "London",
        temperature: 12.5,
        condition: "Clear sky",
        humidity: 65,
        wind_speed: 8.3,
        timestamp: "2023-06-15T20:30:00Z"
      })
    },
    {
      icon: <Newspaper />,
      title: "News",
      description: "Get the latest news articles from various sources and categories.",
      endpoints: [
        { 
          path: "/api/news/latest", 
          fullUrl: `${baseUrl}/api/news/latest?category=technology` 
        },
        { 
          path: "/api/news/search", 
          fullUrl: `${baseUrl}/api/news/search?query=space` 
        }
      ],
      exampleResponse: JSON.stringify({
        articles: [
          {
            title: "New Technology Breakthrough",
            source: "Tech Daily",
            url: "https://example.com/article1",
            published_at: "2023-06-15T18:30:00Z"
          }
        ]
      })
    },
    {
      icon: <Coins />,
      title: "Currency",
      description: "Convert currencies and get current exchange rates.",
      endpoints: [
        { 
          path: "/api/currency/rates", 
          fullUrl: `${baseUrl}/api/currency/rates?base=USD` 
        },
        { 
          path: "/api/currency/convert", 
          fullUrl: `${baseUrl}/api/currency/convert?from=USD&to=EUR&amount=100` 
        }
      ],
      exampleResponse: JSON.stringify({
        from: "USD",
        to: "EUR",
        amount: 100,
        result: 91.25,
        rate: 0.9125,
        timestamp: "2023-06-15T14:30:00Z"
      })
    },
    {
      icon: <Image />,
      title: "Image Processing",
      description: "Generate and manipulate images for your applications.",
      endpoints: [
        { 
          path: "/api/image/generate", 
          fullUrl: `${baseUrl}/api/image/generate?prompt=night+sky` 
        },
        { 
          path: "/api/image/resize", 
          fullUrl: `${baseUrl}/api/image/resize?url=https://example.com/image.jpg&width=300&height=200` 
        }
      ],
      exampleResponse: JSON.stringify({
        success: true,
        image_url: `${baseUrl}/generated/img123.jpg`,
        format: "jpg",
        width: 800,
        height: 600
      })
    },
    {
      icon: <UserCheck />,
      title: "Authentication",
      description: "Secure authentication services for your applications.",
      endpoints: [
        { 
          path: "/api/auth/register", 
          fullUrl: `${baseUrl}/api/auth/register` 
        },
        { 
          path: "/api/auth/login", 
          fullUrl: `${baseUrl}/api/auth/login` 
        },
        { 
          path: "/api/auth/validate", 
          fullUrl: `${baseUrl}/api/auth/validate` 
        }
      ],
      exampleResponse: JSON.stringify({
        success: true,
        user_id: "u12345",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        expires_in: 3600
      })
    },
    {
      icon: <MapPin />,
      title: "Location",
      description: "Access location-based services and geocoding features.",
      endpoints: [
        { 
          path: "/api/location/geocode", 
          fullUrl: `${baseUrl}/api/location/geocode?address=New+York+City` 
        },
        { 
          path: "/api/location/reverse", 
          fullUrl: `${baseUrl}/api/location/reverse?lat=40.7128&lon=-74.0060` 
        }
      ],
      exampleResponse: JSON.stringify({
        location: "New York City, NY, USA",
        coordinates: {
          lat: 40.7128,
          lon: -74.0060
        },
        bounds: {
          ne: {lat: 40.9176, lon: -73.7004},
          sw: {lat: 40.4774, lon: -74.2591}
        }
      })
    },
    {
      icon: <Languages />,
      title: "Translation",
      description: "Translate text between multiple languages.",
      endpoints: [
        { 
          path: "/api/translate", 
          fullUrl: `${baseUrl}/api/translate?text=Hello+world&from=en&to=es` 
        },
        { 
          path: "/api/languages", 
          fullUrl: `${baseUrl}/api/languages` 
        }
      ],
      exampleResponse: JSON.stringify({
        original_text: "Hello world",
        translated_text: "Hola mundo",
        from: "en",
        to: "es",
        detected_language: "en"
      })
    },
    {
      icon: <Link2 />,
      title: "URL Shortener",
      description: "Create and manage shortened URLs for your links.",
      endpoints: [
        { 
          path: "/api/url/shorten", 
          fullUrl: `${baseUrl}/api/url/shorten?url=https://example.com/very/long/url/path` 
        },
        { 
          path: "/api/url/info", 
          fullUrl: `${baseUrl}/api/url/info?code=abc123` 
        }
      ],
      exampleResponse: JSON.stringify({
        original_url: "https://example.com/very/long/url/path",
        short_url: `${baseUrl}/s/abc123`,
        code: "abc123",
        created_at: "2023-06-15T12:30:00Z",
        clicks: 0
      })
    },
    {
      icon: <Youtube />,
      title: "YouTube Downloader",
      description: "Download audio and video from YouTube videos.",
      endpoints: [
        { 
          path: "/api/ytaudio", 
          fullUrl: `${baseUrl}/api/ytaudio?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=mp3` 
        },
        { 
          path: "/api/ytvideo", 
          fullUrl: `${baseUrl}/api/ytvideo?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=mp4&quality=720p` 
        }
      ],
      exampleResponse: JSON.stringify({
        success: true,
        format: "mp3",
        title: "Never Gonna Give You Up",
        author: "Rick Astley",
        duration: "3:32",
        file_size: "3.5 MB"
      })
    },
    {
      icon: <Speech />,
      title: "Text-to-Speech",
      description: "Convert text to spoken audio in multiple languages.",
      endpoints: [
        { 
          path: "/api/tts", 
          fullUrl: `${baseUrl}/api/tts?text=Hola+mundo&lang=es` 
        }
      ],
      exampleResponse: JSON.stringify({
        success: true,
        text: "Hola mundo",
        language: "es",
        audio_format: "mp3",
        duration_seconds: 1.2
      })
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StarryBackground />
      <Moon />
      <AudioPlayer />
      
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 pb-20 flex-grow">
        {/* Introduction */}
        <section className="mb-16 max-w-3xl mx-auto">
          <Card className="bg-card/70 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6 p-6">
              <h2 className="text-2xl font-heading font-semibold mb-4">Welcome to the Night</h2>
              <p className="mb-4">NightAPI provides a collection of powerful, easy-to-use APIs for developers. All endpoints return JSON responses that are simple to integrate into any application.</p>
              <p className="mb-4">Our APIs range from AI integration with Gemini to random jokes, weather data, and more - all accessible through straightforward RESTful endpoints.</p>
              <div className="bg-background rounded-lg p-4 font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Base URL</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(`${baseUrl}/api`)}
                    className="text-muted-foreground hover:text-cyan-500"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <code className="text-cyan-500">{baseUrl}/api</code>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* API Categories */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold">API Categories</h2>
            <p className="text-muted-foreground mt-2">Explore our collection of powerful APIs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiCategories.map((category, index) => (
              <ApiCard
                key={index}
                icon={category.icon}
                title={category.title}
                description={category.description}
                endpoints={category.endpoints}
                exampleResponse={category.exampleResponse}
              />
            ))}
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-16">
          <Card className="max-w-3xl mx-auto bg-card/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-heading font-semibold mb-4">Getting Started</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                <p className="mb-4">Most endpoints require an API key. Register for free to get your API key.</p>
                <div className="bg-background rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">API Key Header</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard("x-api-key: your_api_key_here")}
                      className="text-muted-foreground hover:text-cyan-500"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                  <code className="text-purple-600">x-api-key: your_api_key_here</code>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Rate Limits</h3>
                <p>Free tier: 100 requests/day<br />
                  Standard tier: 10,000 requests/day<br />
                  Premium tier: 100,000 requests/day
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Example Request</h3>
                <div className="bg-background rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">cURL</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(`curl -X GET '${baseUrl}/api/jokes/random' -H 'x-api-key: your_api_key_here'`)}
                      className="text-muted-foreground hover:text-cyan-500"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                  <code className="whitespace-pre text-foreground">
                    {`curl -X GET '${baseUrl}/api/jokes/random' \\
     -H 'x-api-key: your_api_key_here'`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SDKs and Libraries */}
        <section className="mb-16">
          <Card className="max-w-3xl mx-auto bg-card/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-heading font-semibold mb-4">SDKs & Libraries</h2>
              <p className="mb-6">We provide client libraries for popular programming languages to make integration even easier.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-lg border border-border">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-purple-600 text-2xl mr-3">
                      <i className="fab fa-js"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">JavaScript</h3>
                      <p className="text-muted-foreground text-sm mb-2">For Node.js and browser applications</p>
                      <div className="font-mono text-xs bg-card p-2 rounded">
                        <code>npm install nightapi-js</code>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background p-4 rounded-lg border border-border">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-purple-600 text-2xl mr-3">
                      <i className="fab fa-python"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Python</h3>
                      <p className="text-muted-foreground text-sm mb-2">For Python applications</p>
                      <div className="font-mono text-xs bg-card p-2 rounded">
                        <code>pip install nightapi-python</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-background/90 backdrop-blur-sm border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-heading font-bold">
                <span className="text-cyan-500">Night</span>API
              </h2>
              <p className="text-muted-foreground mt-1">Powerful APIs under the night sky</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-cyan-500 transition-colors">
                <i className="fab fa-github text-xl"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-cyan-500 transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-cyan-500 transition-colors">
                <i className="fas fa-envelope text-xl"></i>
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <div className="text-muted-foreground text-sm mb-4 md:mb-0">
              &copy; 2023 NightAPI. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-cyan-500 transition-colors text-sm">Documentation</a>
              <a href="#" className="text-muted-foreground hover:text-cyan-500 transition-colors text-sm">Pricing</a>
              <a href="#" className="text-muted-foreground hover:text-cyan-500 transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-cyan-500 transition-colors text-sm">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
