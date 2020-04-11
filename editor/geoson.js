const geoson = {
  decode: function(data) {
    return Object.keys(data).map(name => {
      let coords = data[name]
      let ring   = []
      for(let i = 0; i < coords.length; i += 2) {
        ring.push(new google.maps.LatLng({
          lat: coords[i + 1],
          lng: coords[i]
        }))
      }

      let  poly = new google.maps.Polygon({paths: [ring]})
      let  area = google.maps.geometry.spherical.computeArea(poly.getPath())
      poly.area = area  / 1000000 // Square kilometers
      poly.name = name || 'Here be Dragons'
      return poly
    })
  },

  encode: function(polygons) {
    let newline = false
    let result  = '{\n'

    for(const poly of polygons) {
      if(newline) result += ',\n'
      else newline = true

      let comma = false
      result += JSON.stringify(poly.name) + ': ['
      poly.getPaths().getArray()[0].forEach(point => {
        if(comma) result += ', '
        else comma = true

        result += point.lng().toFixed(5) + ','
        result += point.lat().toFixed(5)
      })

      result += ']'
    }

    result += '\n}\n'
    return result
  }
}