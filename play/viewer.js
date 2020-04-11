class Viewer {
  constructor(id) {
    this.history = new History()
    this.element = document.getElementById(id)
    this.wrapper = this.element.parentElement
    this.impl    = new google.maps.StreetViewPanorama(this.element, {
      disableDefaultUI: true,
      showRoadLabels:   false,
      linksControl:     true,
      panControl:       true,
      panControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
      }
    })

    this.impl.addListener('pano_changed', e => this.history.push(this))
    this.impl.addListener( 'pov_changed', e => this.history.push(this))
  }

  back() {
    let view = this.history.pop()
    if(view) this.goto(view)
  }

  goto(view) {
    this.impl.setPano(view.id)
    this.impl.setZoom(view.zoom)
    this.impl.setPov({
      heading: view.heading,
      pitch:   view.pitch
    })
  }

  reset(view) {
    let start = this.history.clear()
    this.goto(view || start)
  }

  zoom(level) {
    this.impl.setZoom(level)
  }
}
