const random = {
  polygon: function(map) {
    let r = Math.random() * map.randomness
    for(const polygon of map.polygons) {
      if(r <= polygon.weight) return polygon
      else r -= polygon.weight
    }

    // Just in case...
    console.warn('Weighted polygon selection failed!')
    let i = Math.random() * map.polygons.length
    return map.polygons[Math.floor(i)]
  },

  location: function(map) {
    let n =  -90
    let s =  +90
    let e = -180
    let w = +180

    let polygon = random.polygon(map)
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
      let location = new google.maps.LatLng({
        lat: Math.random() * (n - s) + s,
        lng: Math.random() * (e - w) + w
      })

      if(google.maps.geometry.poly.containsLocation(location, polygon)) {
        console.debug('Point found in ' + polygon.name + ' in ' + count + ' iterations.')
        return location
      }
    }

    console.warn('Point lookup failed in ' + polygon.name + '.')
    return undefined
  },

  panorama: function(map) {
    let options = {
      location:   random.location(map),
      preference: 'nearest',
      source:     'outdoor',
      radius:     1000
    }

    if(!options.location) {
      // We failed to find a point in the polygon!
      setTimeout(() => {random.panorama(map)}, 0)
      return
    }

    streetview.getPanorama(options, function(data, status) {
      if(status === 'OK' && data.links.length > 1) {
        console.debug('Panorama lookup successful!')
        viewer.reset({
          id:      data.location.pano,
          heading: 0,
          pitch:   0,
          zoom:    1
        })

        // Wait a little for images to load...
        setTimeout(function() {
          finder.reset(data.location.latLng)
          document.getElementById('main-wrapper').classList.add('hide')

          document.body.classList.remove('loading')
          loading = false
        }, 1000)
      }
      else {
        console.log('Panorama lookup failed.')
        setTimeout(() => {random.panorama(map)}, 200)
      }
    })
  }
}
