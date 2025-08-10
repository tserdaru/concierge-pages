import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, Star, Zap, Globe, Upload, Smartphone, AlertCircle } from 'lucide-react'

export default function HomePage() {
  // Check if Supabase is configured
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Configuration Alert */}
      {!isConfigured && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Setup Required:</strong> Please configure your Supabase environment variables to enable authentication and database features.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Concierge Pages</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" disabled={!isConfigured}>
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button disabled={!isConfigured}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Beautiful Landing Pages for Hotels
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create stunning, mobile-friendly landing pages for your hotel guests. 
            Share menus, services, and local information with a simple QR code scan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3" disabled={!isConfigured}>
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything Your Guests Need
            </h3>
            <p className="text-xl text-gray-600">
              Powerful features designed specifically for hotels
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Smartphone className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>QR Code Access</CardTitle>
                <CardDescription>
                  Guests simply scan a QR code to access your hotel information instantly
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Upload className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Easy File Management</CardTitle>
                <CardDescription>
                  Upload menus, maps, and documents with our simple drag-and-drop interface
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Globe className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Multi-Language Support</CardTitle>
                <CardDescription>
                  Serve international guests with content in multiple languages
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Optimized pages that load instantly on any device or connection
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Star className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Professional Design</CardTitle>
                <CardDescription>
                  Beautiful, responsive templates that match your hotel's brand
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Check className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Always Updated</CardTitle>
                <CardDescription>
                  Make changes instantly - your guests always see the latest information
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your hotel's needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Basic</CardTitle>
                <div className="text-4xl font-bold">€49<span className="text-lg font-normal">/month</span></div>
                <CardDescription>Perfect for small hotels and B&Bs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    Hosted on hotel.conciergepages.com
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    Up to 50 assets (images & PDFs)
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    2 languages supported
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    QR code generation
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    Mobile-optimized design
                  </li>
                </ul>
                <Button className="w-full mt-6" disabled={!isConfigured}>Get Started</Button>
              </CardContent>
            </Card>
            
            <Card className="relative border-blue-500 border-2">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold">€99<span className="text-lg font-normal">/month</span></div>
                <CardDescription>For larger hotels and hotel chains</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    Custom subdomain (yourhotel.com)
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    Up to 500 assets (images & PDFs)
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    2 languages supported
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    Advanced analytics
                  </li>
                </ul>
                <Button className="w-full mt-6" disabled={!isConfigured}>Get Started</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Enhance Your Guest Experience?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of hotels already using Concierge Pages
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" disabled={!isConfigured}>
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4">Concierge Pages</h4>
            <p className="text-gray-400">
              Beautiful landing pages for hotels, made simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
