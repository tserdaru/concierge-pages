import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Phone, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { Hotel, HotelAsset, AccordionSection, AccordionBlock } from '@/lib/types/database'

interface LandingPageProps {
  params: {
    slug: string
  }
  searchParams: {
    lang?: string
  }
}

const LANGUAGE_NAMES = {
  en: 'EN',
  hr: 'HR', 
  de: 'DE',
  it: 'IT'
}

export default async function HotelLandingPage({ params, searchParams }: LandingPageProps) {
  const { slug } = params
  const lang = (searchParams.lang as 'en' | 'hr' | 'de' | 'it') || 'en'
  
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isConfigured) {
    return <div>Configuration required</div>
  }

  let hotel: Hotel | null = null
  let sections: AccordionSection[] = []
  let blocks: AccordionBlock[] = []
  let assets: HotelAsset[] = []

  try {
    const supabase = await createClient()

    const { data: hotelData, error: hotelError } = await supabase
      .from('hotels')
      .select('*')
      .eq('slug', slug)
      .single()

    if (hotelError || !hotelData) {
      notFound()
    }

    hotel = hotelData

    // Get accordion sections
    const { data: sectionsData } = await supabase
      .from('accordion_sections')
      .select('*')
      .eq('hotel_id', hotel.id)
      .eq('language', lang)
      .eq('is_active', true)
      .order('order_index')

    sections = sectionsData || []

    // Get accordion blocks
    if (sections.length > 0) {
      const { data: blocksData } = await supabase
        .from('accordion_blocks')
        .select('*')
        .in('section_id', sections.map(s => s.id))
        .eq('is_active', true)
        .order('order_index')

      blocks = blocksData || []
    }

    // Get assets
    const { data: assetsData } = await supabase
      .from('hotel_assets')
      .select('*')
      .eq('hotel_id', hotel.id)
      .order('created_at', { ascending: false })

    assets = assetsData || []
  } catch (error) {
    console.error('Error loading hotel data:', error)
    notFound()
  }

  const getAssetUrl = (filePath: string) => {
    try {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = supabase.storage
        .from('hotel-assets')
        .getPublicUrl(filePath)
      return data.publicUrl
    } catch {
      return "/placeholder.svg"
    }
  }

  const getAssetById = (assetId: string | null) => {
    if (!assetId) return null
    return assets.find(a => a.id === assetId)
  }

  const getBlocksBySection = (sectionId: string) => {
    return blocks.filter(b => b.section_id === sectionId)
  }

  const supportedLanguages = hotel.supported_languages || ['en', 'hr']
  const logoAsset = hotel.logo_asset_id ? getAssetById(hotel.logo_asset_id) : null

  // Generate Google Fonts URL
  const fontName = hotel.custom_font_family?.replace(/\s+/g, '+') || 'Raleway'
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`

  // Format phone instructions with line breaks
  const formatPhoneInstructions = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  // Create CSS filter for accent color on phone icon
  const getAccentColorFilter = (hexColor: string) => {
    // Convert hex to RGB
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Create CSS filter to achieve the accent color
    // This is a simplified approach - for exact color matching, you'd need more complex calculations
    const brightness = (r + g + b) / 3 / 255 * 100
    const sepia = 100
    const saturate = 200
    const hueRotate = 0 // This would need calculation based on target color
    
    return `brightness(0) saturate(100%) invert(${brightness > 50 ? 0 : 100}%) sepia(${sepia}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg)`
  }

  return (
    <>
      {/* Load Google Font */}
      <link href={googleFontsUrl} rel="stylesheet" />
      
      <div 
        className="hotel-template"
        style={{
          '--accent-color': hotel.custom_accent_color,
          '--background-color': hotel.custom_background_color,
          '--text-color': hotel.custom_text_color || '#ffffff',
          fontFamily: hotel.custom_font_family || 'Raleway'
        } as React.CSSProperties}
      >
        {/* Header */}
        <header className="header">
          <div className="container-wide">
            <div className="header-flex">
              <div className="grow-1">
                <div className="header-logo">
                  {logoAsset ? (
                    <img src={getAssetUrl(logoAsset.file_path) || "/placeholder.svg"} alt={hotel.name} />
                  ) : (
                    <img src="/placeholder.svg?height=40&width=140&text=Hotel+Logo" alt={hotel.name} />
                  )}
                </div>
              </div>
              
              {/* Language switcher - dropdown for 3+ languages, links for 2 */}
              {supportedLanguages.length <= 2 ? (
                supportedLanguages.map((langCode) => (
                  <Link 
                    key={langCode}
                    className={`lang-switch ${lang === langCode ? 'aria-current' : ''}`} 
                    href={`/${slug}?lang=${langCode}`}
                    aria-current={lang === langCode ? 'page' : undefined}
                  >
                    {LANGUAGE_NAMES[langCode as keyof typeof LANGUAGE_NAMES]}
                  </Link>
                ))
              ) : (
                <div className="lang-dropdown">
                  <button className="lang-dropdown-trigger">
                    {LANGUAGE_NAMES[lang as keyof typeof LANGUAGE_NAMES]}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="lang-dropdown-content">
                    {supportedLanguages.map((langCode) => (
                      <Link
                        key={langCode}
                        href={`/${slug}?lang=${langCode}`}
                        aria-current={lang === langCode ? 'page' : undefined}
                      >
                        {LANGUAGE_NAMES[langCode as keyof typeof LANGUAGE_NAMES]}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {hotel.phone && (
                <a className="phone-link" href={`tel:${hotel.phone}`}>
                  <span className="sr-only">Call us</span>
                  <img 
                    src="/phone-icon.svg" 
                    alt="Phone" 
                    className="icon"
                    style={{ 
                      width: '1.2rem', 
                      height: '1.2rem',
                      filter: getAccentColorFilter(hotel.custom_accent_color)
                    }}
                  />
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <div className="container-main">
            <h1 className="main-heading">
              <span style={{color: hotel.custom_accent_color}}>
                {hotel.custom_welcome_title || 'WELCOME TO'}
              </span>
              <br />
              <span style={{color: hotel.custom_text_color || '#f7f7f7'}}>
                {hotel.name.toUpperCase()}
              </span>
            </h1>

            <h2 className="main-heading1">
              {hotel.custom_welcome_subtitle || 'Discover exclusive offers, bespoke services and key hotel information.'}
            </h2>

            {hotel.phone && hotel.custom_phone_instructions && (
              <h2 className="main-heading1">
                {formatPhoneInstructions(hotel.custom_phone_instructions)}
              </h2>
            )}

            <div className="accordion" id="hotel-accordion">
              {sections.map((section, index) => {
                const sectionBlocks = getBlocksBySection(section.id)
                
                if (sectionBlocks.length === 0) return null

                return (
                  <section key={section.id} className="card accordion-panel">
                    <h2 id={`panel${index}-heading`}>
                      <button
                        className="accordion-trigger"
                        aria-controls={`panel${index}-content`}
                        aria-expanded="false"
                      >
                        <span id={`panel${index}-title`}>
                          {section.title}
                        </span>
                        <svg className="icon icon-arrow" viewBox="0 0 32 20">
                          <path d="M9.156 6L16 12.844 22.844 6 25.5 8.656l-9.5 9.5L6.5 8.656z"></path>
                        </svg>
                      </button>
                    </h2>
                    <ul
                      className="card-list"
                      id={`panel${index}-content`}
                      aria-labelledby={`panel${index}-heading`}
                      aria-hidden="true"
                      role="region"
                    >
                      {sectionBlocks.map((block) => {
                        const imageAsset = getAssetById(block.image_asset_id)
                        const linkUrl = block.external_url || '#'
                        
                        return (
                          <li key={block.id}>
                            <a 
                              href={linkUrl}
                              target={block.external_url ? '_blank' : undefined}
                              rel={block.external_url ? 'noopener noreferrer' : undefined}
                            >
                              <img
                                src={imageAsset 
                                  ? getAssetUrl(imageAsset.file_path)
                                  : "/placeholder.svg?height=120&width=160&text=" + encodeURIComponent(block.title)
                                }
                                alt={block.title}
                              />
                              <span>{block.title.toUpperCase()}</span>
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </div>

            <div className="logotip" aria-hidden="true">
              <img src="/placeholder.svg?height=30&width=100&text=Powered+by" className="imglogo" alt="" />
            </div>
          </div>
        </main>

        {/* Accordion JavaScript - Original */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const accordion = document.querySelector('.accordion');
              if (!accordion) return;

              accordion.addEventListener('click', (e) => {
                const activePanel = e.target.closest('.accordion-panel');
                if (!activePanel) return;

                toggleAccordion(activePanel);
              });

              function toggleAccordion(panelToActivate) {
                let alreadyActive = panelToActivate.dataset.status;
                
                if(alreadyActive !== undefined){
                  panelToActivate.removeAttribute('data-status');
                  panelToActivate
                    .querySelector('.accordion-trigger')
                    .setAttribute('aria-expanded', false);
                  panelToActivate
                    .querySelector('.card-list')
                    .setAttribute('aria-hidden', true);
                  return;
                }

                const panels = document.querySelectorAll('.accordion-panel');
                const buttons = panelToActivate.parentElement.querySelectorAll('.accordion-trigger');
                const contents = panelToActivate.parentElement.querySelectorAll('.card-list');

                document.documentElement.style.setProperty('--panelHeight', '0px');

                panels.forEach((panel) => {
                  panel.removeAttribute('data-status');
                });

                buttons.forEach((button) => {
                  button.setAttribute('aria-expanded', false);
                });

                contents.forEach((content) => {
                  content.setAttribute('aria-hidden', true);
                });

                const panelHeight = panelToActivate.querySelector('.card-list').offsetHeight;

                document.documentElement.style.setProperty('--panelHeight', panelHeight + 'px');

                panelToActivate.setAttribute('data-status', 'expanded');
                panelToActivate
                  .querySelector('.accordion-trigger')
                  .setAttribute('aria-expanded', true);
                panelToActivate
                  .querySelector('.card-list')
                  .setAttribute('aria-hidden', false);
              }
            });
          `
        }} />
      </div>
    </>
  )
}
