var viewer = null
var finder = null
var panoid = null

var marker = null
var target = null
var gdesic = null

function init() {
  // Global declared in random.js:
  streetview = new google.maps.StreetViewService()

  viewer = new google.maps.StreetViewPanorama(document.getElementById('viewer'), {
    disableDefaultUI: true,
    showRoadLabels: false,
    linksControl: true,
    panControl: true,
    panControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP
    }
  })

  // For more on clickable markers and how to hide them:
  // https://stackoverflow.com/questions/7538444/how-do-i-remove-default-markers
  finder = new google.maps.Map(document.getElementById('finder'), {
    streetView: viewer,
    draggableCursor: 'pointer',
    draggingCursor: 'all-scroll',
    disableDefaultUI: true,
    clickableIcons: false,
    center: {lat: 0, lng: 0},
    zoom: 2
  })

  let opts = {map: finder, visible: false, geodesic: true}
  gdesic = new google.maps.Polyline(opts)
  marker = new google.maps.Marker(opts)
  target = new google.maps.Marker(opts)

  google.maps.event.addListener(finder, 'click', function(event) {
    if(!scoring) set_marker(event.latLng)
  })

  loadGeoLite(coverage)
  random.panorama()
}

var scoring = false
function set_scoring(flag) {
  document.body.classList.toggle('score', flag)
  scoring = flag
}

function set_panorama(id) {
  viewer.setPov({heading: 0, pitch: 0})
  viewer.setPano(id)
  viewer.setZoom(1)
}

function more_finder() {
  if(scoring) return
  let wrap = document.getElementById('finder-wrapper')
  if(wrap.classList.contains('half')) {
    wrap.classList.replace('half', 'full')
  }
  else {
    wrap.classList.add('half')
  }
}

function less_finder() {
  if(scoring) return
  let wrap = document.getElementById('finder-wrapper')
  if(wrap.classList.contains('full')) {
    wrap.classList.replace('full', 'half')
  }
  else {
    wrap.classList.remove('half')
  }
}

function set_marker(position) {
  if(position) {
    document.getElementById('finder-wrapper').classList.add('mark')
    marker.setPosition(position)
    marker.setVisible(true)
  }
  else {
    document.getElementById('finder-wrapper').classList.remove('mark')
    marker.setVisible(false)
  }
}

function format_meters(meters) {
  if(meters > 1000) {
    return Math.round(meters / 1000) + " km"
  }
  else if(meters < 1) {
    return Math.round(meters * 100) + " cm"
  }
  else {
    return Math.round(meters) + " m"
  }
}

function show_score(meters) {
  document.getElementById('distance').textContent = "Distance: " + format_meters(meters)
  document.getElementById('finder-wrapper').classList.replace('half', 'full')
  set_scoring(true)
}

function next_round(meters) {
  let wrap = document.getElementById('finder-wrapper')
  wrap.classList.remove('half')
  wrap.classList.remove('full')

  finder.setCenter({lat: 0, lng: 0})
  finder.setZoom(2)

  gdesic.setVisible(false)
  target.setVisible(false)
  set_marker(undefined)

  // Here we go again!
  set_scoring(false)
  random.panorama()
}

window.addEventListener('load', function() {
  document.getElementById('more-finder').addEventListener('click', e => more_finder())
  document.getElementById('less-finder').addEventListener('click', e => less_finder())
  document.getElementById('clear-guess').addEventListener('click', e => set_marker())
  document.getElementById('next-round' ).addEventListener('click', e => next_round())
  document.getElementById('reset'      ).addEventListener('click', e => set_panorama(panoid))

  document.getElementById('make-guess').addEventListener('click', function(event) {
    if(!marker.getVisible()) return
    let a = marker.getPosition()
    let b = target.getPosition()

    gdesic.setPath([a, b])
    gdesic.setVisible(true)
    target.setVisible(true)

    let bounds = new google.maps.LatLngBounds()
    bounds.extend(a)
    bounds.extend(b)

    let m = google.maps.geometry.spherical.computeDistanceBetween(a, b)
    console.log("Distance was " + format_meters(m) + ".")
    finder.fitBounds(bounds)
    show_score(m)
  })


  document.addEventListener('keydown', function(event) {
    if(event.key === '[') more_finder()
    if(event.key === ']') less_finder()
  })

})