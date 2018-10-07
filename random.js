var streetview = null

var shapes = []
var area = 0

function reloadArea() {
  area = 0
  shapes.sort(function(a, b) {return a.area - b.area})
  shapes.forEach(function(s) {area += s.area})
}

function loadGeoJson(json) {
  // Only works on polygons; omits holes!
  let features = new google.maps.Data().addGeoJson(json)
  shapes = features.flatMap(function(feature) {
    let ring  = feature.getGeometry().getAt(0)
    let poly  = new google.maps.Polygon({paths: ring.getArray()})
    poly.name = feature.getProperty('name') || 'Here be Dragons'
    poly.area = feature.getProperty('area') || 1000000.0 // 1km^2
    return poly
  })

  reloadArea()
}

function loadGeoLite(lite) {
  // Only works on polygons; chokes on holes!
  shapes = lite.polygons.map(function(p) {
    let path  = []
    let regex = /([^,]+),([^ ]+)/g
    let match = undefined
    while(match = regex.exec(p.poly)) {
      path.push(new google.maps.LatLng({
        lat: Number(match[2]),
        lng: Number(match[1])
      }))
    }

    let poly  = new google.maps.Polygon({paths: [path]})
    poly.name = p.name || 'Here be Dragons'
    poly.area = p.area || 1000000.0 // 1km^2
    return poly
  })

  reloadArea()
}

const random = {
  polygon: function() {
    let r = Math.random() * area
    for(const shape of shapes) {
      if(r <= shape.area) return shape
      else r -= shape.area
    }

    // Just in case...
    let i = shapes.length
    return shapes[i-1]
  },

  location: function(polygon) {
    let n =  -90
    let s =  +90
    let e = -180
    let w = +180

    polygon = polygon || random.polygon()
    polygon.getPaths().forEach(function(path) {
      path.forEach(function(point) {
        n = Math.max(n, point.lat())
        s = Math.min(s, point.lat())
        e = Math.max(e, point.lng())
        w = Math.min(w, point.lng())
      })
    })

    for(let count = 1; count <= 50; count += 1) {
      // TODO: Fix the latitude distribution!
      let lat = Math.random() * (n - s) + s
      let lng = Math.random() * (e - w) + w
      let loc = new google.maps.LatLng({lat, lng})

      if(google.maps.geometry.poly.containsLocation(loc, polygon)) {
        console.log('Point found in ' + polygon.name + ' in ' + count + ' iterations.')
        return loc
      }
    }

    console.log('Point lookup failed in ' + polygon.name + '.')
    return undefined
  },

  panorama: function() {
    let options = {
      location: random.location(),
      preference: 'nearest',
      source: 'outdoor',
      radius: 1000
    }

    if(!options.location) {
      // We failed to find a point in the polygon!
      setTimeout(random.panorama, 0)
      return
    }

    streetview.getPanorama(options, function(data, status) {
      if(status === 'OK' && data.links.length > 1) {
        console.log('Panorama lookup successful!')
        target.setPosition(data.location.latLng)
        panoid = data.location.pano
        set_panorama(panoid)
      }
      else {
        console.log('Panorama lookup failed.')
        setTimeout(random.panorama, 0)
      }
    })
  }
}
