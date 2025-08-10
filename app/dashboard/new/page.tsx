'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewHotelPage() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    primaryLanguage: 'en' as 'en' | 'hr',
    secondaryLanguage: 'hr' as 'en' | 'hr'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to create a hotel')
        return
      }

      // Check if slug is unique
      const { data: existingHotel } = await supabase
        .from('hotels')
        .select('id')
        .eq('slug', formData.slug)
        .single()

      if (existingHotel) {
        setError('This slug is already taken. Please choose a different name.')
        return
      }

      // Create hotel
      const { data: hotel, error: hotelError } = await supabase
        .from('hotels')
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
          primary_language: formData.primaryLanguage,
          secondary_language: formData.secondaryLanguage,
          owner_id: user.id
        })
        .select()
        .single()

      if (hotelError) {
        setError(hotelError.message)
        return
      }

      // Create default content sections for both languages
      const languages = [formData.primaryLanguage, formData.secondaryLanguage]
      const sections = [
        { type: 'welcome', title: 'Welcome', content: 'Welcome to our hotel!' },
        { type: 'dining', title: 'Dining', content: 'Discover our restaurant and bar.' },
        { type: 'services', title: 'Services', content: 'Explore our hotel services.' },
        { type: 'activities', title: 'Activities', content: 'Find activities and attractions nearby.' },
        { type: 'contact', title: 'Contact', content: 'Get in touch with us.' }
      ]

      const contentInserts = []
      for (const lang of languages) {
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i]
          contentInserts.push({
            hotel_id: hotel.id,
            language: lang,
            section_type: section.type as any,
            title: section.title,
            content: section.content,
            order_index: i
          })
        }
      }

      const { error: contentError } = await supabase
        .from('hotel_content')
        .insert(contentInserts)

      if (contentError) {
        console.error('Error creating default content:', contentError)
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 ml-4">Add New Hotel</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Hotel Information</CardTitle>
            <CardDescription>
              Create a new hotel landing page. You can edit all details later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hotel Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    placeholder="hotel-name"
                  />
                  <p className="text-xs text-gray-500">
                    Your landing page will be available at: /{formData.slug}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Language</Label>
                  <Select
                    value={formData.primaryLanguage}
                    onValueChange={(value: 'en' | 'hr') => 
                      setFormData(prev => ({ ...prev, primaryLanguage: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hr">Croatian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Language</Label>
                  <Select
                    value={formData.secondaryLanguage}
                    onValueChange={(value: 'en' | 'hr') => 
                      setFormData(prev => ({ ...prev, secondaryLanguage: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hr">Croatian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Hotel'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
