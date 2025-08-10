import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { Plus, Settings, ExternalLink, Upload, AlertCircle, Globe } from 'lucide-react'
import { t, SUPPORTED_LANGUAGES, type Language } from '@/lib/translations'
import type { Hotel } from '@/lib/types/database'
import { LanguageSelector } from '@/components/language-selector'

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { lang?: string }
}) {
  const lang = (searchParams.lang as Language) || 'en'
  
  let supabase
  let user
  let profile
  let hotels

  try {
    supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !userData.user) {
      redirect('/login')
    }

    user = userData.user

    // Get user profile to check subscription status
    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = profileData

    // Get user's hotels
    const { data: hotelsData, error: hotelsError } = await supabase
      .from('hotels')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (hotelsError) {
      console.error('Error fetching hotels:', hotelsError)
    }

    hotels = hotelsData
  } catch (error: any) {
    if (error.message.includes('Missing Supabase environment variables')) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                Configuration Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  Supabase environment variables are missing. Please add your Supabase URL and API key to your .env.local file.
                </AlertDescription>
              </Alert>
              <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
                <p className="font-medium mb-2">Add these to your .env.local file:</p>
                <code className="block">
                  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br/>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    // For other errors, redirect to login
    redirect('/login')
  }

  const handleSignOut = async () => {
    'use server'
    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
    redirect('/login')
  }

  const updateAdminLanguage = async (language: string) => {
    'use server'
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('users')
          .update({ admin_language: language })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Error updating admin language:', error)
    }
    redirect(`/dashboard?lang=${language}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard', lang)}</h1>
              <p className="text-gray-600">{t('welcomeBack', lang)}, {profile?.full_name || user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <LanguageSelector 
                  currentLang={lang}
                  onLanguageChange={updateAdminLanguage}
                  label={t('adminLanguage', lang)}
                />
              </div>
              <Badge variant={profile?.subscription_status === 'active' ? 'default' : 'secondary'}>
                {t(profile?.subscription_plan?.toUpperCase() as any || 'basic', lang)} - {t(profile?.subscription_status?.toUpperCase() as any || 'inactive', lang)}
              </Badge>
              <form action={handleSignOut}>
                <Button variant="outline" type="submit">{t('signOut', lang)}</Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">{t('yourHotels', lang)}</h2>
            <Link href={`/dashboard/new?lang=${lang}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('addHotel', lang)}
              </Button>
            </Link>
          </div>

          {profile?.subscription_status !== 'active' && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">{t('subscriptionRequired', lang)}</CardTitle>
                <CardDescription className="text-yellow-700">
                  {t('subscriptionInactive', lang, { status: profile?.subscription_status || 'inactive' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">{t('manageSubscription', lang)}</Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels?.map((hotel: Hotel) => (
              <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {hotel.name}
                    <div className="flex space-x-1">
                      {(hotel.supported_languages || ['en', 'hr']).map((langCode) => (
                        <Badge key={langCode} variant="outline" className="text-xs">
                          {langCode.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {hotel.description || t('noDescription', lang)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>{t('slug', lang)}:</strong> {hotel.slug}
                    </p>
                    {hotel.address && (
                      <p className="text-sm text-gray-600">
                        <strong>{t('address', lang)}:</strong> {hotel.address}
                      </p>
                    )}
                    {hotel.phone && (
                      <p className="text-sm text-gray-600">
                        <strong>{t('phone', lang)}:</strong> {hotel.phone}
                      </p>
                    )}
                    <div className="flex space-x-2 pt-4">
                      <Link href={`/dashboard/${hotel.slug}/assets?lang=${lang}`}>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-1" />
                          {t('assets', lang)}
                        </Button>
                      </Link>
                      <Link href={`/${hotel.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {t('view', lang)}
                        </Button>
                      </Link>
                      <Link href={`/dashboard/${hotel.slug}/customize?lang=${lang}`}>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          {t('edit', lang)}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!hotels || hotels.length === 0) && (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noHotelsYet', lang)}</h3>
                <p className="text-gray-600 mb-4">{t('getStartedFirst', lang)}</p>
                <Link href={`/dashboard/new?lang=${lang}`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('createFirstHotel', lang)}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
