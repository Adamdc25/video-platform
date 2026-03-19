import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'

// TikTok icon (not available in lucide-react)
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Policy Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Policy</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://discover-tmj-streaming.vercel.app/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://discover-tmj-streaming.vercel.app/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="https://discover-tmj-streaming.vercel.app/cookies-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cookies Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Other Links Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Other Links</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://discover-tmj-streaming.vercel.app/ad-choices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Advertise With Us
                </a>
              </li>
              <li>
                <a
                  href="https://discover-tmj-streaming.vercel.app/community-guidelines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Community Guidelines
                </a>
              </li>
              <li>
                <a
                  href="https://discover-tmj-streaming.vercel.app/end-user-licence-agreement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  End User Licence Agreement (EULA)
                </a>
              </li>
            </ul>
          </div>

          {/* Connect with us Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Connect with us</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/PhillipUllmannAdvisory"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/the_manna_journey/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/phillipullmann/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@phillip_ullmann"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
              <a
                href="https://www.youtube.com/channel/UCWqPrdvhmxW1_0JEcYu21hA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Download App Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Download App</h3>
            <div className="flex items-center gap-3">
              <a
                href="https://apps.apple.com/app/discover-tmj/id6746241681"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/200px-Download_on_the_App_Store_Badge.svg.png"
                  alt="Download on the App Store"
                  className="h-10"
                />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.discovertmj.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/200px-Google_Play_Store_badge_EN.svg.png"
                  alt="Get it on Google Play"
                  className="h-10"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-500 text-sm">
            ©2025 Aeon Library | Covenant Advisory CIC. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
