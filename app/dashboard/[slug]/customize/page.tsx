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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Palette, Plus, Upload, Trash2, ChevronUp, ChevronDown, Image, ExternalLink, Type, Edit, Phone, MessageSquare, Settings } from 'lucide-react'
import { useParams } from 'next/navigation'
import type { Hotel, HotelAsset, AccordionSection, AccordionBlock } from '@/lib/types/database'

// Google Fonts list
const GOOGLE_FONTS = [
  'Raleway',
  'Open Sans',
  'Roboto',
  'Lato',
  'Montserrat',
  'Oswald',
  'Source Sans Pro',
  'Slabo 27px',
  'Roboto Condensed',
  'Libre Baskerville',
  'Playfair Display',
  'Merriweather',
  'PT Sans',
  'Ubuntu',
  'Nunito',
  'Poppins',
  'Inter',
  'Work Sans',
  'Crimson Text',
  'Libre Caslon Text'
]

const SUPPORTED_LANGUAGES = {
  en: 'English',
  hr: 'Hrvatski',
  de: 'Deutsch'
}

export default function CustomizePage() {
  const params = useParams()
  const slug = params.slug as string
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [sections, setSections] = useState<AccordionSection[]>([])
  const [blocks, setBlocks] = useState<AccordionBlock[]>([])
  const [assets, setAssets] = useState<HotelAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedLang, setSelectedLang] = useState<'en' | 'hr' | 'de'>('en')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [showNewSectionDialog, setShowNewSectionDialog] = useState(false)
  const [showNewBlockDialog, setShowNewBlockDialog] = useState(false)
  const [showEditBlockDialog, setShowEditBlockDialog] = useState(false)
  const [editingBlock, setEditingBlock] = useState<AccordionBlock | null>(null)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newBlockData, setNewBlockData] = useState({
    title: '',
    description: '',
    image_asset_id: null as string | null,
    external_url: ''
  })
  const [uploadingToBlock, setUploadingToBlock] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [slug, selectedLang])

  // Load Google Font dynamically
  useEffect(() => {
    if (hotel?.custom_font_family && hotel.custom_font_family !== 'Raleway') {
      const fontName = hotel.custom_font_family.replace(/\s+/g, '+')
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
  }, [hotel?.custom_font_family])

  const loadData = async () => {
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

      // Load accordion sections
      const { data: sectionsData } = await supabase
        .from('accordion_sections')
        .select('*')
        .eq('hotel_id', hotelData.id)
        .eq('language', selectedLang)
        .order('order_index')

      setSections(sectionsData || [])

      // Load accordion blocks
      if (sectionsData && sectionsData.length > 0) {
        const { data: blocksData } = await supabase
          .from('accordion_blocks')
          .select('*')
          .in('section_id', sectionsData.map(s => s.id))
          .order('order_index')

        setBlocks(blocksData || [])
      }

      // Load assets
      const { data: assetsData } = await supabase
        .from('hotel_assets')
        .select('*')
        .eq('hotel_id', hotelData.id)
        .order('created_at', { ascending: false })

      setAssets(assetsData || [])
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const updateHotelStyle = async (field: string, value: string) => {
    if (!hotel) return

    try {
      const { error } = await supabase
        .from('hotels')
        .update({ [field]: value })
        .eq('id', hotel.id)

      if (error) throw error

      setHotel(prev => prev ? { ...prev, [field]: value } : null)
      setSuccess('Updated successfully!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(`Failed to update: ${err.message}`)
    }
  }

  const updateSupportedLanguages = async (languages: string[]) => {
    if (!hotel) return

    try {
      const { error } = await supabase
        .from('hotels')
        .update({ supported_languages: languages })
        .eq('id', hotel.id)

      if (error) throw error

      setHotel(prev => prev ? { ...prev, supported_languages: languages } : null)
      setSuccess('Languages updated!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(`Failed to update languages: ${err.message}`)
    }
  }

  const uploadLogo = async (file: File) => {
    if (!hotel) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `${hotel.slug}/${fileName}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('hotel-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Create asset record
      const { data: assetData, error: assetError } = await supabase
        .from('hotel_assets')
        .insert({
          hotel_id: hotel.id,
          file_name: file.name,
          file_path: filePath,
          file_type: 'image',
          file_size: file.size,
          section_type: 'general'
        })
        .select()
        .single()

      if (assetError) throw assetError

      // Update hotel logo
      await updateHotelStyle('logo_asset_id', assetData.id)
      await loadData()
    } catch (err: any) {
      setError(`Failed to upload logo: ${err.message}`)
    }
  }

  const uploadBlockAsset = async (file: File, blockId: string) => {
    if (!hotel) return

    setUploadingToBlock(blockId)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `block-${blockId}-${Date.now()}.${fileExt}`
      const filePath = `${hotel.slug}/${fileName}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('hotel-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Create asset record
      const { data: assetData, error: assetError } = await supabase
        .from('hotel_assets')
        .insert({
          hotel_id: hotel.id,
          file_name: file.name,
          file_path: filePath,
          file_type: 'image',
          file_size: file.size,
          section_type: 'general'
        })
        .select()
        .single()

      if (assetError) throw assetError

      // Update block with new asset
      const { error: blockError } = await supabase
        .from('accordion_blocks')
        .update({ image_asset_id: assetData.id })
        .eq('id', blockId)

      if (blockError) throw blockError

      await loadData()
      setSuccess('Image uploaded successfully!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(`Failed to upload image: ${err.message}`)
    } finally {
      setUploadingToBlock(null)
    }
  }

  const createSection = async () => {
    if (!hotel || !newSectionTitle.trim()) return

    try {
      const sectionKey = newSectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const { error } = await supabase
        .from('accordion_sections')
        .insert({
          hotel_id: hotel.id,
          language: selectedLang,
          title: newSectionTitle,
          section_key: sectionKey,
          order_index: sections.length
        })

      if (error) throw error

      setNewSectionTitle('')
      setShowNewSectionDialog(false)
      await loadData()
    } catch (err: any) {
      setError(`Failed to create section: ${err.message}`)
    }
  }

  const createBlock = async () => {
    if (!selectedSection || !newBlockData.title.trim()) return

    try {
      const { error } = await supabase
        .from('accordion_blocks')
        .insert({
          section_id: selectedSection,
          title: newBlockData.title,
          description: newBlockData.description || null,
          image_asset_id: newBlockData.image_asset_id,
          external_url: newBlockData.external_url || null,
          order_index: blocks.filter(b => b.section_id === selectedSection).length
        })

      if (error) throw error

      setNewBlockData({
        title: '',
        description: '',
        image_asset_id: null,
        external_url: ''
      })
      setShowNewBlockDialog(false)
      await loadData()
    } catch (err: any) {
      setError(`Failed to create block: ${err.message}`)
    }
  }

  const updateBlock = async () => {
    if (!editingBlock) return

    try {
      const { error } = await supabase
        .from('accordion_blocks')
        .update({
          title: editingBlock.title,
          description: editingBlock.description,
          external_url: editingBlock.external_url
        })
        .eq('id', editingBlock.id)

      if (error) throw error

      setShowEditBlockDialog(false)
      setEditingBlock(null)
      await loadData()
      setSuccess('Block updated!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(`Failed to update block: ${err.message}`)
    }
  }

  const moveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    try {
      const updates = [
        { id: sections[currentIndex].id, order_index: newIndex },
        { id: sections[newIndex].id, order_index: currentIndex }
      ]

      for (const update of updates) {
        const { error } = await supabase
          .from('accordion_sections')
          .update({ order_index: update.order_index })
          .eq('id', update.id)

        if (error) throw error
      }

      await loadData()
    } catch (err: any) {
      setError(`Failed to reorder: ${err.message}`)
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure? This will delete all blocks in this section.')) return

    try {
      const { error } = await supabase
        .from('accordion_sections')
        .delete()
        .eq('id', sectionId)

      if (error) throw error
      await loadData()
    } catch (err: any) {
      setError(`Failed to delete: ${err.message}`)
    }
  }

  const deleteBlock = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this block?')) return

    try {
      const { error } = await supabase
        .from('accordion_blocks')
        .delete()
        .eq('id', blockId)

      if (error) throw error
      await loadData()
    } catch (err: any) {
      setError(`Failed to delete: ${err.message}`)
    }
  }

  const getAssetUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('hotel-assets')
      .getPublicUrl(filePath)
    return data.publicUrl
  }

  const getAssetById = (assetId: string | null) => {
    if (!assetId) return null
    return assets.find(a => a.id === assetId)
  }

  const getBlocksBySection = (sectionId: string) => {
    return blocks.filter(b => b.section_id === sectionId)
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

  const supportedLanguages = hotel.supported_languages || ['en', 'hr']

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
                <p className="text-gray-600">Customize your landing page</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/${slug}?lang=${selectedLang}`} target="_blank">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="hotel" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="hotel">Hotel Info</TabsTrigger>
              <TabsTrigger value="style">Style & Branding</TabsTrigger>
              <TabsTrigger value="texts">Welcome Texts</TabsTrigger>
              <TabsTrigger value="content">Content Structure</TabsTrigger>
              <TabsTrigger value="blocks">Manage Blocks</TabsTrigger>
            </TabsList>

            {/* Hotel Info Tab */}
            <TabsContent value="hotel" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Hotel Information
                  </CardTitle>
                  <CardDescription>
                    Manage basic hotel information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hotel Name</Label>
                      <Input
                        value={hotel.name}
                        onChange={(e) => updateHotelStyle('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={hotel.phone || ''}
                        onChange={(e) => updateHotelStyle('phone', e.target.value)}
                        placeholder="+385 1 234 5678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={hotel.address || ''}
                      onChange={(e) => updateHotelStyle('address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={hotel.email || ''}
                        onChange={(e) => updateHotelStyle('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        type="url"
                        value={hotel.website || ''}
                        onChange={(e) => updateHotelStyle('website', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Supported Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                        <label key={code} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={supportedLanguages.includes(code)}
                            onChange={(e) => {
                              const newLanguages = e.target.checked
                                ? [...supportedLanguages, code]
                                : supportedLanguages.filter(l => l !== code)
                              updateSupportedLanguages(newLanguages)
                            }}
                          />
                          <span className="text-sm">{name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Select which languages your hotel page should support
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Style & Branding Tab */}
            <TabsContent value="style" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Visual Customization
                  </CardTitle>
                  <CardDescription>
                    Customize colors, fonts and branding for your landing page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label>Hotel Logo</Label>
                    <div className="flex items-center space-x-4">
                      {hotel.logo_asset_id && (
                        <img 
                          src={getAssetUrl(assets.find(a => a.id === hotel.logo_asset_id)?.file_path || '')}
                          alt="Current logo"
                          className="h-12 w-auto"
                        />
                      )}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) uploadLogo(file)
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Font Selection */}
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Type className="w-4 h-4 mr-2" />
                      Font Family
                    </Label>
                    <Select
                      value={hotel.custom_font_family || 'Raleway'}
                      onValueChange={(value) => updateHotelStyle('custom_font_family', value)}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOOGLE_FONTS.map((font) => (
                          <SelectItem key={font} value={font}>
                            <span style={{ fontFamily: font }}>{font}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Preview text with selected font: 
                      <span 
                        className="ml-2 font-medium"
                        style={{ fontFamily: hotel.custom_font_family || 'Raleway' }}
                      >
                        Welcome to {hotel.name}
                      </span>
                    </p>
                  </div>

                  {/* Background Color */}
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={hotel.custom_background_color}
                        onChange={(e) => updateHotelStyle('custom_background_color', e.target.value)}
                        className="w-12 h-12 rounded border"
                      />
                      <Input
                        value={hotel.custom_background_color}
                        onChange={(e) => updateHotelStyle('custom_background_color', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-500">Current background color</span>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-2">
                    <Label>Accent Color (Icons & Highlights)</Label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={hotel.custom_accent_color}
                        onChange={(e) => updateHotelStyle('custom_accent_color', e.target.value)}
                        className="w-12 h-12 rounded border"
                      />
                      <Input
                        value={hotel.custom_accent_color}
                        onChange={(e) => updateHotelStyle('custom_accent_color', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-500">Color for phone icon, arrows and highlights</span>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={hotel.custom_text_color || '#ffffff'}
                        onChange={(e) => updateHotelStyle('custom_text_color', e.target.value)}
                        className="w-12 h-12 rounded border"
                      />
                      <Input
                        value={hotel.custom_text_color || '#ffffff'}
                        onChange={(e) => updateHotelStyle('custom_text_color', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-500">Main text color</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Welcome Texts Tab */}
            <TabsContent value="texts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Welcome Page Texts
                  </CardTitle>
                  <CardDescription>
                    Customize the welcome message and instructions on your landing page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Welcome Title</Label>
                    <Input
                      value={hotel.custom_welcome_title || 'WELCOME TO'}
                      onChange={(e) => updateHotelStyle('custom_welcome_title', e.target.value)}
                      placeholder="WELCOME TO"
                    />
                    <p className="text-sm text-gray-500">
                      This appears above your hotel name in the accent color
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Welcome Subtitle</Label>
                    <Textarea
                      value={hotel.custom_welcome_subtitle || 'Discover exclusive offers, bespoke services and key hotel information.'}
                      onChange={(e) => updateHotelStyle('custom_welcome_subtitle', e.target.value)}
                      placeholder="Discover exclusive offers, bespoke services and key hotel information."
                      rows={3}
                    />
                    <p className="text-sm text-gray-500">
                      Brief description that appears below the hotel name
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Instructions</Label>
                    <Textarea
                      value={hotel.custom_phone_instructions || 'For orders and information please use your in-room phone:\n- dial 1 for room service\n- dial 9 for reception desk\n- dial 9 for spa'}
                      onChange={(e) => updateHotelStyle('custom_phone_instructions', e.target.value)}
                      placeholder="For orders and information please use your in-room phone:&#10;- dial 1 for room service&#10;- dial 9 for reception desk&#10;- dial 9 for spa"
                      rows={5}
                    />
                    <p className="text-sm text-gray-500">
                      Instructions for guests on how to use in-room phone (only shown if phone number is set)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Structure Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Accordion Sections</CardTitle>
                  <CardDescription>
                    Manage the main sections of your accordion menu
                  </CardDescription>
                  <div className="flex items-center space-x-4">
                    <Select value={selectedLang} onValueChange={(value: 'en' | 'hr' | 'de') => setSelectedLang(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={showNewSectionDialog} onOpenChange={setShowNewSectionDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Section
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Section</DialogTitle>
                          <DialogDescription>
                            Create a new accordion section for {SUPPORTED_LANGUAGES[selectedLang as keyof typeof SUPPORTED_LANGUAGES]}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Section Title</Label>
                            <Input
                              value={newSectionTitle}
                              onChange={(e) => setNewSectionTitle(e.target.value)}
                              placeholder="e.g., RESTAURANT & BAR"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowNewSectionDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={createSection}>Create Section</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sections.map((section, index) => (
                      <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">{index + 1}</Badge>
                          <div>
                            <h3 className="font-medium">{section.title}</h3>
                            <p className="text-sm text-gray-500">
                              {getBlocksBySection(section.id).length} blocks
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(section.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(section.id, 'down')}
                            disabled={index === sections.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSection(section.id)
                              setShowNewBlockDialog(true)
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSection(section.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manage Blocks Tab */}
            <TabsContent value="blocks" className="space-y-6">
              {sections.map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>
                      Manage blocks within this section
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getBlocksBySection(section.id).map((block) => {
                        const imageAsset = getAssetById(block.image_asset_id)
                        
                        return (
                          <div key={block.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium">{block.title}</h4>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingBlock(block)
                                    setShowEditBlockDialog(true)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteBlock(block.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {block.description && (
                              <p className="text-sm text-gray-600">{block.description}</p>
                            )}
                            
                            {/* Image Preview */}
                            {imageAsset && (
                              <div className="space-y-2">
                                <img 
                                  src={getAssetUrl(imageAsset.file_path) || "/placeholder.svg"}
                                  alt={block.title}
                                  className="w-full h-24 object-cover rounded"
                                />
                                <p className="text-xs text-gray-500">Current image</p>
                              </div>
                            )}
                            
                            {/* Upload button */}
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) uploadBlockAsset(file, block.id)
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                disabled={uploadingToBlock === block.id}
                              >
                                <Image className="w-4 h-4 mr-2" />
                                {uploadingToBlock === block.id ? 'Uploading...' : 'Upload Image'}
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Fixed size: 160×120px</span>
                              <div className="flex items-center space-x-1">
                                {block.image_asset_id && <Image className="w-3 h-3" />}
                                {block.external_url && <ExternalLink className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <Button
                        variant="outline"
                        className="h-32 border-dashed"
                        onClick={() => {
                          setSelectedSection(section.id)
                          setShowNewBlockDialog(true)
                        }}
                      >
                        <Plus className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* New Block Dialog */}
          <Dialog open={showNewBlockDialog} onOpenChange={setShowNewBlockDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Block</DialogTitle>
                <DialogDescription>
                  Create a new content block for the selected section
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Block Title</Label>
                  <Input
                    value={newBlockData.title}
                    onChange={(e) => setNewBlockData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., LUNCH MENU"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={newBlockData.description}
                    onChange={(e) => setNewBlockData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this item"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image Asset</Label>
                  <Select
                    value={newBlockData.image_asset_id || 'none'}
                    onValueChange={(value) => setNewBlockData(prev => ({ 
                      ...prev, 
                      image_asset_id: value === 'none' ? null : value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select image" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No image</SelectItem>
                      {assets.filter(a => a.file_type === 'image').map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.file_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>External Link (Optional)</Label>
                  <Input
                    value={newBlockData.external_url}
                    onChange={(e) => setNewBlockData(prev => ({ ...prev, external_url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewBlockDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createBlock}>Create Block</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Block Dialog */}
          <Dialog open={showEditBlockDialog} onOpenChange={setShowEditBlockDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Block</DialogTitle>
                <DialogDescription>
                  Update the block details
                </DialogDescription>
              </DialogHeader>
              {editingBlock && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Block Title</Label>
                    <Input
                      value={editingBlock.title}
                      onChange={(e) => setEditingBlock(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={editingBlock.description || ''}
                      onChange={(e) => setEditingBlock(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>External Link (Optional)</Label>
                    <Input
                      value={editingBlock.external_url || ''}
                      onChange={(e) => setEditingBlock(prev => prev ? ({ ...prev, external_url: e.target.value }) : null)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowEditBlockDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={updateBlock}>Update Block</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}
