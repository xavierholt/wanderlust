class History {
  constructor() {
    this.stack = []
  }

  clear() {
    let start  = this.stack[0]
    this.stack = []
    return start
  }

  push(pano) {
    let view = this.top()
    let pid  = pano.impl.getPano()
    let pov  = pano.impl.getPov()

    if(!view || view.id !== pid) {
      this.stack.push({})
      view = this.top()
    }

    view.id      = pid
    view.heading = pov.heading
    view.pitch   = pov.pitch
    view.zoom    = pov.zoom

    if(view.zoom === undefined) {
      view.zoom = 1
    }
  }

  pop() {
    if(this.stack.length > 1) {
      this.stack.pop()
      return this.top()
    }
  }

  top() {
    let len = this.stack.length
    return this.stack[len - 1]
  }
}
