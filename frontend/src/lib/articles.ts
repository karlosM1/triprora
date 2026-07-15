import beachView from '@/assets/beach-view.jpg'
import ditumaboFalls from '@/assets/ditumabo-falls.jpg'
import hillBeachView from '@/assets/hill-beach-view.jpg'
import surfingSabang from '@/assets/surfing-sabang.jfif'

export type Article = {
  slug: string
  tag: string
  date: string
  title: string
  description: string
  author: string
  image: string
  content: string[]
}

export const ARTICLES: Article[] = [
  {
    slug: 'hidden-gems-aurora',
    tag: 'Hidden Gems',
    date: '12 June 2024',
    title: 'Top 10 Must-Visit Hidden Gems in Aurora Province',
    description:
      "From the misty trails of Ditumabo Falls to the secluded coves of Baler, discover Aurora's best-kept secrets away from the crowds.",
    author: 'Maria Santos',
    image: ditumaboFalls,
    content: [
      'Aurora Province rewards travelers who venture beyond the usual tourist stops. Tucked along the eastern coast of Luzon, its towns and barangays hide waterfalls, quiet beaches, and forest trails that feel worlds away from Metro Manila.',
      'Ditumabo Falls in San Luis remains one of the province\'s most iconic day hikes. The trail winds through lush vegetation before opening to a powerful cascade plunging into a natural pool, perfect for a refreshing swim after the trek.',
      'In Baler, Sabang Beach draws surfers from across the country, but nearby coves like Cemento and Charlie\'s Point offer quieter stretches of sand for those who prefer solitude. Early mornings here are especially peaceful.',
      'Maria Aurora is home to the famous Millennium Tree, a towering balete believed to be over 600 years old. The surrounding area is rich in birdlife and makes for a gentle nature walk suitable for families.',
      'For a true off-the-beaten-path experience, head to Dingalan\'s cliffside viewpoints or explore the coastal barangays of Casiguran, where fishing villages and unspoiled shorelines define the local rhythm of life.',
      'Whether you\'re chasing waterfalls, surf, or simply fresh mountain air, Aurora\'s hidden gems are best reached by van. Door-to-door service lets you skip the long bus transfers and start exploring sooner.',
    ],
  },
  {
    slug: 'surfing-baler-beginners-guide',
    tag: 'Surf Guide',
    date: '28 May 2024',
    title: "Surfing in Baler: The Ultimate Beginner's Guide",
    description:
      'Sabang Beach is the birthplace of Philippine surfing. Learn when to visit, where to rent boards, and how to catch your first wave.',
    author: 'Juan Dela Cruz',
    image: surfingSabang,
    content: [
      'Baler earned its place in Philippine surf history when the film Apocalypse Now put its waves on the map in the late 1970s. Today, Sabang Beach welcomes everyone from first-timers to seasoned riders.',
      'The best months for beginners are typically October through March, when swells are consistent but manageable. Mornings offer cleaner conditions and fewer crowds, ideal for your first lesson.',
      'Surf schools and board rentals line the beachfront. Most offer two-hour introductory sessions that cover paddling, popping up, and ocean safety. Expect to spend around ₱500–₱800 for a lesson with equipment included.',
      'Start on a longboard or foam board. These are more stable and forgiving than shortboards, giving you a better chance of standing up on your first few waves.',
      'Respect the lineup: wait your turn, don\'t drop in on other surfers, and stay within the beginner zone marked closer to shore. Locals are welcoming when visitors show basic surf etiquette.',
      'After a session, Baler town offers plenty of spots for a hearty meal. Try the local pinakbet or fresh seafood before heading back. Book a door-to-door van so you can travel with your board bag comfortably.',
    ],
  },
  {
    slug: 'aurora-nature-mountains-guide',
    tag: 'Nature',
    date: '15 May 2024',
    title: "A Nature Lover's Guide to Aurora's Lush Mountains",
    description:
      "Trek through the Sierra Madre range, visit the Millennium Tree in Maria Aurora, and explore the province's rich biodiversity.",
    author: 'Ana Reyes',
    image: hillBeachView,
    content: [
      'Aurora sits at the foot of the Sierra Madre, the longest mountain range in the Philippines. This geography shapes everything from the climate to the wildlife you\'ll encounter on a nature-focused trip.',
      'The trek to Ditumabo Falls is the most popular mountain outing, but lesser-known trails in Dinalungan and Dipaculao reward hikers with river crossings, bamboo groves, and occasional wildlife sightings.',
      'Birdwatchers should bring binoculars. The province\'s forests host species like the Philippine eagle-owl and various hornbills. Dawn is the best time for sightings near forest edges.',
      'The Millennium Tree in Maria Aurora is a must-see. This ancient balete tree has become a symbol of the province\'s natural heritage. The short walk to the site is accessible for most fitness levels.',
      'Pack light but come prepared: sturdy shoes, rain gear, insect repellent, and plenty of water. Weather in the mountains can shift quickly, especially during the rainy season from June to September.',
      'Guided eco-tours are available in several municipalities and help support local communities. Pair your nature trip with a comfortable van ride from Metro Manila for a stress-free journey into the green heart of Aurora.',
    ],
  },
  {
    slug: 'budget-travel-aurora-tips',
    tag: 'Budget Tips',
    date: '3 May 2024',
    title: 'Budget-Friendly Travel Tips for Your Aurora Adventure',
    description:
      'Stretch your peso with local homestays, carinderia eats, and off-season travel hacks for an affordable Aurora getaway.',
    author: 'Carlo Mendoza',
    image: beachView,
    content: [
      'Aurora doesn\'t have to be expensive. With a bit of planning, you can enjoy the province\'s beaches, falls, and mountain trails without overspending.',
      'Accommodation: skip the resort premiums and book a local homestay or budget inn in Baler, Maria Aurora, or Casiguran. Rates often start at ₱500–₱800 per night, and hosts frequently share insider tips on where to eat and explore.',
      'Food: carinderias and roadside eateries serve hearty Filipino meals for ₱80–₱150. Fresh seafood is abundant in coastal towns. Ask locals for the best turo-turo spots rather than defaulting to tourist-facing restaurants.',
      'Transport: traveling off-peak (weekdays, outside holidays) can lower van fares significantly. Door-to-door vans also save you the cost and hassle of multiple bus transfers between terminals.',
      'Activities: many of Aurora\'s best experiences are free or low-cost: beach walks, waterfall hikes, and viewpoint visits rarely require entrance fees beyond a small environmental or parking charge.',
      'Travel during the shoulder months (April–May or September–October) for fewer crowds and better deals. Book your van early, pack snacks for the road, and you\'ll have an unforgettable Aurora trip that\'s easy on the wallet.',
    ],
  },
]

export function getArticleBySlug(slug: string) {
  return ARTICLES.find((article) => article.slug === slug)
}

export function getFeaturedArticles(limit = 4) {
  return ARTICLES.slice(0, limit)
}
