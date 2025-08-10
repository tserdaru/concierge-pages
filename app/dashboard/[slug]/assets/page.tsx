'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, Image, Trash2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import type { Hotel, HotelAsset } from '@/lib/types/database'

export default function HotelAssetsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [assets, setAssets] = useState<HotelAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadSection, setUploadSection] = useState<string>('general')
  const [uploadLanguage, setUploadLanguage] = useState<string>('en')
  const supabase = createClient()

  useEffect(() => {
    loadHotelAndAssets()
  }, [slug])

  const loadHotelAndAssets = async () => {
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

      // Load assets
      const { data: assetsData, error: assetsError } = await supabase
        .from('hotel_assets')
        .select('*')
        .eq('hotel_id', hotelData.id)
        .order('created_at', { ascending: false })

      if (assetsError) {
        console.error('Error loading assets:', assetsError)
      } else {
        setAssets(assetsData || [])
      }
    } catch (err) {
      setError('Failed to load hotel data')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !hotel) return

    setUploading(true)
    setError('')

    try {
      // Validate file type
      const fileType = file.type.startsWith('image/') ? 'image' : 
                      file.type === 'application/pdf' ? 'pdf' : null

      if (!fileType) {
        setError('Only images and PDF files are allowed')
        return
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to upload files')
        return
      }

      // Create simple file path without complex folder structure
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `${hotel.slug}/${fileName}`

      console.log('Uploading to path:', filePath)

      // Upload to Supabase Storage with explicit options
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hotel-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: 'half'
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        return
      }

      console.log('Upload successful:', uploadData)

      // Save asset record to database
      const { error: dbError } = await supabase
        .from('hotel_assets')
        .insert({
          hotel_id: hotel.id,
          file_name: file.name,
          file_path: filePath,
          file_type: fileType,
          file_size: file.size,
          section_type: uploadSection as any,
          language: uploadLanguage as any
        })

      if (dbError) {
        console.error('Database error:', dbError)
        setError(`Database error: ${dbError.message}`)
        return
      }

      // Reload assets
      await loadHotelAndAssets()
      setError('') // Clear any previous errors
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleDeleteAsset = async (asset: HotelAsset) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('hotel-assets')
        .remove([asset.file_path])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('hotel_assets')
        .delete()
        .eq('id', asset.id)

      if (dbError) {
        setError(dbError.message)
        return
      }

      // Reload assets
      await loadHotelAndAssets()
    } catch (err: any) {
      setError(`Failed to delete file: ${err.message}`)
    }
  }

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('hotel-assets')
      .getPublicUrl(filePath)
    return data.publicUrl
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
              <p className="text-gray-600">Manage assets and files</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Upload Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload New Asset</CardTitle>
              <CardDescription>
                Upload images (JPG, PNG, WebP) or PDF files for your hotel landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select value={uploadSection} onValueChange={setUploadSection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="dining">Dining</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="activities">Activities</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={uploadLanguage} onValueChange={setUploadLanguage}>
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
                  <Label>File</Label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" disabled={uploading} className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {asset.file_type === 'image' ? (
                        <Image className="w-5 h-5 text-blue-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-red-500" />
                      )}
                      <span className="ml-2 text-sm font-medium truncate">
                        {asset.file_name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAsset(asset)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {asset.file_type === 'image' && (
                    <div className="mb-3">
                      <img
                        src={getFileUrl(asset.file_path) || "/placeholder.svg"}
                        alt={asset.file_name}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {asset.section_type || 'general'}
                      </Badge>
                      {asset.language && (
                        <Badge variant="secondary" className="text-xs">
                          {asset.language.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    {asset.file_size && (
                      <p className="text-xs text-gray-500">
                        {formatFileSize(asset.file_size)}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(getFileUrl(asset.file_path), '_blank')}
                    >
                      View File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {assets.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assets uploaded</h3>
                <p className="text-gray-600">Upload your first image or PDF file to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
