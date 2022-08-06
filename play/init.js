var viewer     = null
var finder     = null
var streetview = null

var atlas = new Atlas()
atlas.add('The World',       1.0, 'play/maps/world.json')
atlas.add('Cities',          0.0, 'play/maps/cities.json')
atlas.add('California',      1.0, 'play/maps/california.json')
atlas.add('Japan',           0.5, 'play/maps/japan.json')
atlas.add('Manhattan',       1.0, 'play/maps/manhattan.json')
// atlas.add('Finland',         1.0, 'play/maps/finland.json')
atlas.add('Taiwan',          1.0, 'play/maps/taiwan.json')
atlas.add('Cities of India', 0.5, 'play/maps/india.json')

var game    = null
var loading = false

function init() {
  viewer     = new Viewer('viewer')
  finder     = new Finder('finder')
  streetview = new google.maps.StreetViewService()

  document.getElementById('more-finder').addEventListener('click', e => finder.more())
  document.getElementById('less-finder').addEventListener('click', e => finder.less())
  document.getElementById('clear-guess').addEventListener('click', e => finder.mark())
  document.getElementById('make-guess' ).addEventListener('click', e => game.guess())
  document.getElementById('next-round' ).addEventListener('click', e => game.next())
  document.getElementById('reset'      ).addEventListener('click', e => viewer.reset())
  document.getElementById('back'       ).addEventListener('click', e => viewer.back())

  let mapi = 0

  document.getElementById('game-map').addEventListener('click', e => {
    if(loading) return
    mapi = (mapi + 1) % atlas.names.length
    event.target.textContent = atlas.names[mapi]
  })

  document.getElementById('game-play').addEventListener('click', async e => {
    if(loading) return
    document.body.classList.add('loading')
    loading = true

    let map = await atlas.get(atlas.names[mapi])
    game = new Game(map, 0)
    game.next()
  })

  document.addEventListener('keydown', function(event) {
    switch(event.key) {
    case 'Backspace':
      viewer.back()
      break
    case '0':
      viewer.zoom(1)
      break
    case '[':
      finder.more()
      break
    case ']':
      finder.less()
      break
    default:
      return
    }

    event.preventDefault()
    return false
  })
}
