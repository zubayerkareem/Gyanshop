import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react'

const LINKS = {
  information: [
    'আমাদের সম্পর্কে',
    'যোগাযোগ করুন',
    'কোম্পানির তথ্য',
    'শর্তাবলী',
    'গোপনীয়তা নীতি',
    'ক্যারিয়ার',
  ],
  shopBy: [
    'শার্ট',
    'পাঞ্জাবি',
    'প্যান্ট',
    'জ্যাকেট',
    'টি-শার্ট',
    'অ্যাক্সেসরি',
  ],
  support: [
    'সাপোর্ট সেন্টার',
    'কীভাবে অর্ডার করবেন',
    'অর্ডার ট্র্যাকিং',
    'পেমেন্ট',
    'ডেলিভারি',
    'সাধারণ জিজ্ঞাসা',
  ],
  policy: [
    'রিটার্ন পলিসি',
    'রিফান্ড পলিসি',
    'এক্সচেঞ্জ',
    'বাতিল করা',
    'প্রি-অর্ডার',
    'অতিরিক্ত ছাড়',
  ],
}


export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">

      {/* Main footer grid */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand column */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div>
              <p className="text-lg font-bold text-foreground">আমার শপ</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                সেরা মানের পণ্য নিয়ে আমরা প্রতিটি বাড়িতে পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।
              </p>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                ঢাকা, বাংলাদেশ
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                ০১৮০০-০০০০০০
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                info@amarshop.com.bd
              </span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {[
                { icon: Facebook,  label: 'Facebook' },
                { icon: Twitter,   label: 'Twitter' },
                { icon: Instagram, label: 'Instagram' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

          </div>

          {/* Link columns */}
          {[
            { heading: 'তথ্য',          links: LINKS.information },
            { heading: 'ক্যাটাগরি',    links: LINKS.shopBy },
            { heading: 'সাপোর্ট',      links: LINKS.support },
            { heading: 'ক্রেতা নীতি',  links: LINKS.policy },
          ].map(col => (
            <div key={col.heading}>
              <p className="mb-4 text-sm font-semibold text-foreground">{col.heading}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} আমার শপ। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  )
}
