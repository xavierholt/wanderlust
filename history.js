class View {
  constructor(pano) {
    this.update(pano)
  }

  static clear() {
    this.history = []
  }

  static push(pano) {
    let top = this.top()
    if(!top || top.id !== pano.getPano()) {
      this.history.push(new View(pano))
    }
  }

  static pop() {
    if(this.history.length < 2) {
      return
    }

    this.history.pop()
    let pov = this.top()

    let id      = pov.id
    let heading = pov.heading
    let pitch   = pov.pitch
    let zoom    = pov.zoom

    viewer.setPano(id)
    viewer.setPov({heading, pitch})
    viewer.setZoom(zoom)
  }

  static top() {
    let len = this.history.length
    return this.history[len - 1]
  }

  static update(pano) {
    let top = this.top()
    if(top) top.update(pano)
  }

  update(pano) {
    let pov = pano.getPov()

    this.id      = pano.getPano()
    this.heading = pov.heading
    this.pitch   = pov.pitch
    this.zoom    = pov.zoom

    if(this.zoom === undefined) {
      this.zoom = 1
    }
  }
}

View.history = []
