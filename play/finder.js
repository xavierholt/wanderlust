class Finder {
  constructor(id) {
    this.scoring = false
    this.element = document.getElementById(id)
    this.wrapper = this.element.parentElement
    this.impl    = new google.maps.Map(this.element, {
      draggableCursor: 'pointer',
      draggingCursor:  'move',
      disableDefaultUI: true,
      clickableIcons:   false
    })

    let opts = {map: this.impl, visible: false, geodesic: true}
    this.geodesic = new google.maps.Polyline(opts)
    this.marker   = new google.maps.Marker(opts)
    this.target   = new google.maps.Marker(opts)

    // TODO: Custom start / guess markers.

    this.impl.addListener('click', e => {
      this.mark(e.latLng)
    })
  }

  less() {
    if(this.scoring) {
      return
    }
    else if(this.wrapper.classList.contains('full')) {
      this.wrapper.classList.replace('full', 'half')
    }
    else {
      this.wrapper.classList.remove('half')
    }
  }

  mark(position) {
    if(position) {
      this.wrapper.classList.remove('unmarked')
      this.marker.setPosition(position)
      this.marker.setVisible(true)
    }
    else {
      this.wrapper.classList.add('unmarked')
      this.marker.setVisible(false)
    }
  }

  more() {
    if(this.scoring) {
      return
    }
    else if(this.wrapper.classList.contains('half')) {
      this.wrapper.classList.replace('half', 'full')
    }
    else {
      this.wrapper.classList.add('half')
    }
  }

  reset(position) {
    this.wrapper.classList.remove('half')
    this.wrapper.classList.remove('full')

    this.impl.setCenter({lat: 0, lng: 0})
    this.impl.setZoom(2)

    this.geodesic.setVisible(false)
    this.target.setVisible(false)
    this.mark(undefined)

    this.target.setPosition(position)
    document.body.classList.remove('score')
    this.scoring = false
  }

  score() {
    if(!this.marker.getVisible()) return
    let a = this.marker.getPosition()
    let b = this.target.getPosition()

    this.geodesic.setPath([a, b])
    this.geodesic.setVisible(true)
    this.target.setVisible(true)

    let bounds = new google.maps.LatLngBounds()
    bounds.extend(a)
    bounds.extend(b)

    let m = google.maps.geometry.spherical.computeDistanceBetween(a, b)
    document.getElementById('distance').textContent = 'Distance: ' + format.distance(m)
    this.wrapper.classList.replace('half', 'full')
    this.impl.fitBounds(bounds, 50)

    document.body.classList.add('score')
    this.scoring = true
    return m
  }
}
