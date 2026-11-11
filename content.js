/* ==========================================================================
   YOUR PORTFOLIO CONTENT
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit. Everything on the site is built
   from what's in here.

   • Text wrapped in *asterisks* becomes the fancy italic accent font.
   • Leave a field as "" to hide it.
   • Videos: drop .mp4 files in assets/videos/ and point to them below,
     e.g. video: "assets/videos/budgeting-app.mp4"
   • Images: drop files in assets/images/ the same way.
   ========================================================================== */

window.CONTENT = {
  name: "Owen Giordano",
  logo: "owen",                           // wordmark shown in the top-left
  role: "UGC Creator",
  location: "Boston, MA",
  timezone: "America/New_York",           // shows your local time in the contact section ("" to hide)
  availability: "Open to brand partnerships",
  email: "contact@owenugc.com",

  hero: {
    photo: "assets/images/profile.jpg",                // portrait, roughly 4:5, works best
    statsImage: "assets/images/stats.jpg",             // screenshot of your TikTok profile stats, shown as a floating card ("" to hide)
    statsLink: "https://www.tiktok.com/@owengiordano", // where the card links to
  },

  // Scrolling banner under the hero. Plain names, or { name: "Brand", logo: "assets/images/brand.svg" }
  // (Swap these for brand names once you want to list partners.)
  marqueeLabel: "What I create content about",
  brands: ["Tech", "Side Hustles", "Finance", "Education"],

  // Shown in the hero under your name.
  stats: [
    { value: 143, suffix: "K", label: "TikTok followers" },
    { value: 9.2, suffix: "M", label: "Likes" },
  ],

  about: {
    photo: "",                            // optional second photo for the About section
    statement: "I turn complicated products into *content people actually watch* — simple, honest and built to hold attention.",
    paragraphs: [
      "I'm a Boston-based creator with an audience of 143K on TikTok, where I break down tech, money and side hustles in a way that's easy to follow.",
      "I bring that same approach to brand work: understand the product, find the hook, and explain it the way I would to a friend.",
    ],
    niches: ["Tech", "Side Hustles", "Finance", "Educational"],
  },

  // Your portfolio (3–5 videos). Add "video" paths as you drop files into assets/videos/.
  // "views" / "likes" (optional) show as big numbers under the video, e.g. views: "3M", likes: "293.1K".
  // "link" (optional) opens a TikTok URL instead if there's no video file.
  portfolio: [
    { title: "Real or AI? The Drake verse test",    brand: "",            category: "Educational", views: "3M", likes: "293.1K", video: "assets/videos/video-4.mp4", poster: "assets/images/video-4.jpg", link: "" },
    { title: "Day 2: turning $40 into a supercar",  brand: "",            category: "Finance",     views: "108K", likes: "7.1K", video: "assets/videos/video-3.mp4", poster: "assets/images/video-3.jpg", link: "" },
    { title: "A pitch deck in under 2 minutes",     brand: "",            category: "Tech",        views: "", likes: "", video: "assets/videos/video-1.mp4", poster: "assets/images/video-1.jpg", link: "" },
    { title: "My browser can finally breathe",      brand: "Context.dev", category: "Tech",        views: "", likes: "", video: "assets/videos/video-2.mp4", poster: "assets/images/video-2.jpg", link: "" },
  ],

  // "What I create" section. Empty = hidden. Add items like { title: "UGC Video Ads", desc: "..." } to bring it back.
  services: [],

  process: [
    { title: "Brief",   desc: "We align on goals, audience, key messages and deliverables." },
    { title: "Script",  desc: "I write concepts and hooks for your approval before filming." },
    { title: "Create",  desc: "Filming, voiceover and editing, styled natively for each platform." },
    { title: "Deliver", desc: "You get final files ready to post or run as ads." },
  ],

  // Add real quotes here when you have them: { quote: "...", name: "...", role: "..." }
  testimonials: [],

  showRates: false,                       // set to true and fill in rates.packages to show a Rates section
  rates: { note: "", packages: [] },

  contact: {
    heading: "Let's make something *worth watching*.",
    sub: "Tell me about your brand and what you're launching, and I'll get back to you.",
  },

  socials: [
    { label: "TikTok", url: "https://www.tiktok.com/@owengiordano" },
  ],
};
