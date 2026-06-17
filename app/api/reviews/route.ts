import { NextResponse } from 'next/server'

// Static fallback reviews — same data used by TestimonialsSection as FALLBACK_REVIEWS
// This route exists to prevent 404 console errors. In future, replace with real Google
// Reviews API integration when a Places API key is configured.
const FALLBACK_REVIEWS = [
  { author_name: 'Priya Sharma',   profile_photo_url: '', rating: 5, relative_time_description: '2 weeks ago',  text: 'Karya Saarthi helped me with my MBA thesis. The quality was outstanding and delivered before deadline. Highly recommend to anyone looking for academic support!' },
  { author_name: 'Rahul Verma',    profile_photo_url: '', rating: 5, relative_time_description: '1 month ago',  text: "Got my website developed by their team. Professional, responsive, and the design exceeded my expectations. Best investment I've made for my business." },
  { author_name: 'Ananya Singh',   profile_photo_url: '', rating: 5, relative_time_description: '3 weeks ago',  text: 'The campus ambassador program was an amazing experience. Learned so much about marketing and networking. The team is incredibly supportive. Thank you KS!' },
  { author_name: 'Mohit Gupta',    profile_photo_url: '', rating: 5, relative_time_description: '1 month ago',  text: 'Used their digital marketing services for my startup. Saw real results in just 2 months. ROI was excellent! Highly professional team.' },
  { author_name: 'Sneha Patel',    profile_photo_url: '', rating: 5, relative_time_description: '2 months ago', text: 'Research paper assistance was top-notch. The team understood exactly what I needed and delivered beyond expectations. Will definitely use again!' },
  { author_name: 'Arjun Nair',     profile_photo_url: '', rating: 4, relative_time_description: '3 weeks ago',  text: 'Very professional team. Quick turnaround on my project presentation. 24/7 support as promised. Would recommend for any technical work.' },
  { author_name: 'Kavya Reddy',    profile_photo_url: '', rating: 5, relative_time_description: '1 week ago',   text: 'Excellent service! They guided me through every step of my dissertation. The support is genuinely unmatched. 10/10 would recommend.' },
]

export async function GET() {
  return NextResponse.json(
    { reviews: FALLBACK_REVIEWS },
    {
      headers: {
        // Cache for 24h on CDN — reviews don't change frequently
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    }
  )
}
