import { useEffect, useState } from 'react'
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react'
import { api } from '@/lib/api'

const DEFAULTS = {
  footer_shop_name:     'আমার শপ',
  footer_tagline:       'সেরা মানের পণ্য নিয়ে আমরা প্রতিটি বাড়িতে পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।',
  footer_address:       'ঢাকা, বাংলাদেশ',
  footer_phone:         '০১৮০০-০০০০০০',
  footer_email:         'info@amarshop.com.bd',
  footer_facebook:      '',
  footer_twitter:       '',
  footer_instagram:     '',
  footer_copyright:     'আমার শপ। সর্বস্বত্ব সংরক্ষিত।',
  footer_links_info:    ['আমাদের সম্পর্কে','যোগাযোগ করুন','শর্তাবলী','গোপনীয়তা নীতি'],
  footer_links_support: ['সাপোর্ট সেন্টার','অর্ডার ট্র্যাকিং','পেমেন্ট','সাধারণ জিজ্ঞাসা'],
  footer_links_policy:  ['রিটার্ন পলিসি','রিফান্ড পলিসি','এক্সচেঞ্জ','বাতিল করা'],
}

export default function Footer() {
  const [data, setData] = useState(DEFAULTS)

  useEffect(() => {
    api.getFooter()
      .then(d => setData(prev => ({ ...prev, ...d })))
      .catch(() => {})
  }, [])

  const linkCols = [
    { heading: 'তথ্য',         key: 'footer_links_info' },
    { heading: 'সাপোর্ট',     key: 'footer_links_support' },
    { heading: 'ক্রেতা নীতি', key: 'footer_links_policy' },
  ]

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div>
              <p className="text-lg font-bold text-foreground">{data.footer_shop_name}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{data.footer_tagline}</p>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              {data.footer_address && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {data.footer_address}
                </span>
              )}
              {data.footer_phone && (
                <a href={`tel:${data.footer_phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {data.footer_phone}
                </a>
              )}
              {data.footer_email && (
                <a href={`mailto:${data.footer_email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {data.footer_email}
                </a>
              )}
            </div>

            {/* Social */}
            <div className="flex items-center gap-2">
              {[
                { key: 'footer_facebook',  Icon: Facebook,  label: 'Facebook' },
                { key: 'footer_twitter',   Icon: Twitter,   label: 'Twitter' },
                { key: 'footer_instagram', Icon: Instagram, label: 'Instagram' },
              ].map(({ key, Icon, label }) => (
                <a
                  key={label}
                  href={data[key] || '#'}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {linkCols.map(col => (
            <div key={col.key}>
              <p className="mb-4 text-sm font-semibold text-foreground">{col.heading}</p>
              <ul className="flex flex-col gap-2.5">
                {(Array.isArray(data[col.key]) ? data[col.key] : []).map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:underline">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {data.footer_copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
