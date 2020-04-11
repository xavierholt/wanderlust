class Atlas {
  constructor() {
    this.cache = new Map()
    this.names = []
  }

  add(name, weight, url) {
    this.names.push(name)
    this.cache.set(name, {
      loaded: false,
      weight: weight,
      url:    url
    })
  }

  async get(name) {
    let map = this.cache.get(name)
    if(map && !map.loaded) {
      let data = await fetch(map.url)
      let json = await data.json()

      map = this.process(json, map.weight)
      this.cache.set(name, map)
    }

    return map
  }

  process(data, weight) {
    let polygons   = geoson.decode(data)
    let randomness = 0

    for(const polygon of polygons) {
      polygon.weight = weight * polygon.area + 1.0
      randomness    += polygon.weight
    }

    return {
      randomness: randomness,
      polygons:   polygons,
      loaded:     true
    }
  }
}
