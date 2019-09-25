// Modified from: http://bl.ocks.org/knownasilya/89a32e572989f0aff1f8

var selection = null
var shapes = new Set()
var map = null

function select(poly) {
  if(selection) {
    selection.setEditable(false)
  }

  let name = document.getElementById('name')

  if(poly) {
    poly.setEditable(true)
    name.value = poly.name
  }
  else {
    name.value = ''
  }

  selection = poly
}

function deselect() {
  select(null)
}

function bindpoly(poly) {
  shapes.add(poly)
  google.maps.event.addListener(poly, 'click', event => {
    if(event.vertex !== undefined) {
      let path = poly.getPaths().getAt(event.path)
      path.removeAt(event.vertex)
      if(path.length < 3) {
        rempoly(poly)
        return
      }
    }

    select(poly)
  })
}

function rempoly(poly) {
  if(poly) {
    if(selection === poly) {
      deselect()
    }

    shapes.delete(poly)
    poly.setMap(null)
  }
}

function initialize() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0},
    disableDefaultUI: true,
    streetViewControl: true,
    scaleControl: true,
    zoom: 2
  })

  let streetview = new google.maps.StreetViewCoverageLayer()
  streetview.setMap(map)

  let drawingManager = new google.maps.drawing.DrawingManager({
    drawingControlOptions: {drawingModes: ['polygon']},
    polygonOptions: {editable: true},
    map: map
  })

  google.maps.event.addListener(drawingManager, 'overlaycomplete', event => {
    drawingManager.setDrawingMode(null)

    let poly  = event.overlay
    poly.name = 'New Polygon'
    bindpoly(poly)
    select(poly)

    document.getElementById('name').select()
  })

  // Clear the current selection when the drawing mode is changed, or when the map is clicked.
  google.maps.event.addListener(drawingManager, 'drawingmode_changed', deselect)
  google.maps.event.addListener(map, 'click', deselect)

  document.getElementById('name').addEventListener('change', event => {
    if(selection) selection.name = event.target.value
  })

  document.getElementById('name').addEventListener('keydown', event => {
    if(event.key == 'Enter') {
      event.stopPropagation()
      event.preventDefault()

      drawingManager.setDrawingMode('polygon')
      select(null)
    }
  })

  document.getElementById('dele').addEventListener('click', event => {
    event.stopPropagation()
    event.preventDefault()
    rempoly(selection)
  })

  document.getElementById('file').addEventListener('change', event => {
    event.stopPropagation()
    event.preventDefault()

    let reader = new FileReader()
    reader.onload = function() {
      geotxt.decode(reader.result).forEach(poly => {
        poly.setMap(map)
        bindpoly(poly)
      })
    }

    reader.readAsText(event.target.files[0])
  })

  document.getElementById('save').addEventListener('click', function(event) {
    event.stopPropagation()
    event.preventDefault()

    let list = Array.from(shapes).sort((a, b) => a.name.localeCompare(b.name))
    let data = geotxt.encode(list)

    // Download trick based on answers to:
    // https://stackoverflow.com/questions/19327749
    let link = document.getElementById('download')
    let blob = new Blob([data], {type: 'text/plain'})
    let href = window.URL.createObjectURL(blob)
    link.href = href
    link.click()

    setTimeout(function() {
      window.URL.revokeObjectURL(href)
    }, 0)
  })

  window.addEventListener('beforeunload', function(event) {
    event.preventDefault()
    event.returnValue = ''
  })
}

google.maps.event.addDomListener(window, 'load', initialize)
