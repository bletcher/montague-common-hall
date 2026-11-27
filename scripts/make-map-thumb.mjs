// Builds public/images/map-thumb.png: a small street map around the hall with a pin, shown next
// to every Google Maps link on the site. Made once from OpenStreetMap tiles (a handful of
// requests, within their tile usage policy) and kept as a static file, so the site never calls a
// map service. Run from the repo root: node scripts/make-map-thumb.mjs
import sharp from 'sharp'

const LAT = 42.5349177 // the hall, from its Google Maps listing
const LON = -72.5333797
const ZOOM = 17
const WIDTH = 800
const HEIGHT = 400
const TILE = 256
const OUT = 'public/images/map-thumb.png'

// Pixel position of the hall in the whole-world map at this zoom.
const n = 2 ** ZOOM
const px = ((LON + 180) / 360) * n * TILE
const rad = (LAT * Math.PI) / 180
const py = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n * TILE
const left = Math.round(px - WIDTH / 2)
const top = Math.round(py - HEIGHT / 2)

const tiles = []
for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + WIDTH - 1) / TILE); tx++) {
  for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + HEIGHT - 1) / TILE); ty++) {
    const res = await fetch(`https://tile.openstreetmap.org/${ZOOM}/${tx}/${ty}.png`, {
      headers: { 'User-Agent': 'montague-common-hall-site/1.0 (one-time static map for the hall website)' },
    })
    if (!res.ok) throw new Error(`tile ${tx},${ty}: ${res.status}`)
    tiles.push({ input: Buffer.from(await res.arrayBuffer()), left: tx * TILE - left, top: ty * TILE - top })
  }
}

const pin = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="58" viewBox="0 0 44 58">
  <path d="M22 2C11 2 2 11 2 22c0 15 20 34 20 34s20-19 20-34C42 11 33 2 22 2z" fill="#b5533c" stroke="#fff" stroke-width="3"/>
  <circle cx="22" cy="22" r="7" fill="#fff"/></svg>`)
const credit = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="250" height="26">
  <rect width="250" height="26" fill="#fff" fill-opacity="0.85"/>
  <text x="8" y="18" font-family="Arial, sans-serif" font-size="15" fill="#333">© OpenStreetMap contributors</text></svg>`)

await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: '#eee' } })
  .composite([
    // Tiles off the left or top edge are cropped first, since composite needs non-negative offsets.
    ...(await Promise.all(
      tiles.map(async (t) => {
        const cropLeft = Math.max(0, -t.left)
        const cropTop = Math.max(0, -t.top)
        const width = Math.min(TILE - cropLeft, WIDTH - Math.max(0, t.left))
        const height = Math.min(TILE - cropTop, HEIGHT - Math.max(0, t.top))
        const input = await sharp(t.input).extract({ left: cropLeft, top: cropTop, width, height }).toBuffer()
        return { input, left: Math.max(0, t.left), top: Math.max(0, t.top) }
      }),
    )),
    { input: pin, left: WIDTH / 2 - 22, top: HEIGHT / 2 - 56 },
    { input: credit, left: WIDTH - 250, top: HEIGHT - 26 },
  ])
  .png({ palette: true })
  .toFile(OUT)
console.log(`wrote ${OUT}`)
