'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Palette } from 'lucide-react'
import { useParams } from 'next/navigation'
import type { Hotel, HotelContent } from '@/lib/types/database'

export default function TemplateCustomizationPage() {
  const params = useParams()
  const slug = params.slug as string
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [content, setContent] = useState<HotelContent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedLang, setSelectedLang] = useState<'en' | 'hr'>('en')
  const supabase = createClient()

  useEffect(() => {
    loadHotelAndContent()
  }, [slug, selectedLang])

  const loadHotelAndContent = async () => {
    try {
      // Load hotel
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .select('*')
        .eq('slug', slug)
        .single()

      if (hotelError) {
        setError('Hotel not found')
        return
      }

      setHotel(hotelData)

      // Load content for selected language
      const { data: contentData, error: contentError } = await supabase
        .from('hotel_content')
        .select('*')
        .eq('hotel_id', hotelData.id)
        .eq('language', selectedLang)
        .order('order_index')

      if (contentError) {
        console.error('Error loading content:', contentError)
      } else {
        setContent(contentData || [])
      }
    } catch (err) {
      setError('Failed to load hotel data')
    } finally {
      setLoading(false)
    }
  }

  const updateContent = (sectionType: string, field: 'title' | 'content', value: string) => {
    setContent(prev => prev.map(item => 
      item.section_type === sectionType 
        ? { ...item, [field]: value }
        : item
    ))
  }

  const saveContent = async () => {
    if (!hotel) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Update existing content
      for (const item of content) {
        const { error } = await supabase
          .from('hotel_content')
          .update({
            title: item.title,
            content: item.content
          })
          .eq('id', item.id)

        if (error) {
          throw error
        }
      }

      setSuccess('Content updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(`Failed to save content: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const getContentBySection = (sectionType: string) => {
    return content.find(c => c.section_type === sectionType) || {
      section_type: sectionType,
      title: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
      content: '',
      language: selectedLang,
      hotel_id: hotel?.id || '',
      order_index: 0,
      is_active: true
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Hotel not found</div>
      </div>
    )
  }

  const sections = [
    { key: 'welcome', title: 'Welcome Section', defaultTitle: 'GENERAL INFORMATION' },
    { key: 'dining', title: 'Dining Section', defaultTitle: 'IN ROOM DINING' },
    { key: 'services', title: 'Services Section', defaultTitle: `${hotel.name.toUpperCase()} SPA` },
    { key: 'activities', title: 'Activities Section', defaultTitle: `${hotel.name.toUpperCase()} RESTAURANT & BAR` },
    { key: 'contact', title: 'Contact Section', defaultTitle: `${hotel.name.toUpperCase()} EXPERIENCES` }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
                <p className="text-gray-600">Customize your landing page template</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/${slug}/meneghetti?lang=${selectedLang}`} target="_blank">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </Link>
              <Button onClick={saveContent} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Language Selector */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Template Customization
              </CardTitle>
              <CardDescription>
                Customize the content for your Meneghetti-style landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Label>Language:</Label>
                <Select value={selectedLang} onValueChange={(value: 'en' | 'hr') => setSelectedLang(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hr">Croatian</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline">{selectedLang.toUpperCase()}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="space-y-6">
            {sections.map((section) => {
              const sectionContent = getContentBySection(section.key)
              
              return (
                <Card key={section.key}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>
                      Customize the {section.key} section content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${section.key}-title`}>Section Title</Label>
                      <Input
                        id={`${section.key}-title`}
                        value={sectionContent.title}
                        onChange={(e) => updateContent(section.key, 'title', e.target.value)}
                        placeholder={section.defaultTitle}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${section.key}-content`}>Section Content</Label>
                      <Textarea
                        id={`${section.key}-content`}
                        value={sectionContent.content || ''}
                        onChange={(e) => updateContent(section.key, 'content', e.target.value)}
                        rows={4}
                        placeholder={`Enter content for the ${section.key} section...`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}
