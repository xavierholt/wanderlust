const geotxt = {
  decode: function(text) {
    let result = []
    let match1 = undefined
    let regex1 = /([^\n]*)\n([^\n]*)\n/g
    while(match1 = regex1.exec(text)) {
      let name = match1[1]
      let data = match1[2]

      console.log(name)

      let path  = []
      let rings = [path]
      let match = undefined
      let regex = /([^ ,;]+),([^ ;]+)/g
      while(match = regex.exec(data)) {
        path.push(new google.maps.LatLng({
          lat: Number(match[2]),
          lng: Number(match[1])
        }))

        if(data[regex.lastIndex] === ';') {
          rings.push(path = [])
        }
      }

      let poly  = new google.maps.Polygon({paths: rings})
      // TODO: This seems to only compute the area of the outer ring:
      poly.area = google.maps.geometry.spherical.computeArea(poly.getPath())
      poly.name = name || 'Here be Dragons'
      result.push(poly)
    }

    return result
  },

  encode: function(data) {
    let result = ''
    for(const poly of data) {
      result += poly.name
      result += '\n'
      result += poly.getPaths().getArray().map(ring => {
        return ring.getArray().map(p => {
          return p.lng().toFixed(5) + ',' + p.lat().toFixed(5)
        }).join(' ')
      }).join(';')
      result += '\n'
    }

    return result
  }
}
