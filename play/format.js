const format = {
  distance: function(meters) {
    let suffix    = ' m'
    let precision = 0

    if(meters > 1000) {
      meters /= 1000
      suffix  = ' km'
    }

    if(meters < 100) precision += 1
    if(meters <  10) precision += 1
    return meters.toFixed(precision) + suffix
  }
}
