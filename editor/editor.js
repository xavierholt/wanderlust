// Modified from: http://bl.ocks.org/knownasilya/89a32e572989f0aff1f8

var selection = null
var shapes = new Set()
var map = null

function select(poly) {
  if(selection) {
    selection.setEditable(false)
  }

  var name = document.getElementById('name')
  var isle = document.getElementById('island')

  if(poly) {
    poly.setEditable(true)
    name.value = poly.name
    island.checked = poly.island
  }
  else {
    name.value = ''
    island.checked = false
  }

  selection = poly
}

function deselect() {
  select(null)
}

function bindpoly(poly) {
  shapes.add(poly)
  google.maps.event.addListener(poly, 'click', function(e) {
    if(e.vertex !== undefined) {
      var path = poly.getPaths().getAt(e.path)
      path.removeAt(e.vertex)
      if(path.length < 3) {
        rempoly(poly)
        return
      }
    }

    select(poly)
  })
}

function addpoly(geom, feature) {
  var poly = new google.maps.Polygon({
    paths: geom.getArray().map(ring => ring.getArray()),
    map: map
  })

  poly.name = feature.getProperty('name') || "Unnamed Polygon"
  poly.island = feature.getProperty('island') || false
  bindpoly(poly)
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

  var streetview = new google.maps.StreetViewCoverageLayer()
  streetview.setMap(map)

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingControlOptions: {drawingModes: ['polygon']},
    polygonOptions: {editable: true},
    map: map
  })

  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
    var poly = e.overlay
    poly.name = "New Polygon"
    poly.island = false

    drawingManager.setDrawingMode(null)
    bindpoly(poly)
    select(poly)
  })

  // Clear the current selection when the drawing mode is changed, or when the map is clicked.
  google.maps.event.addListener(drawingManager, 'drawingmode_changed', deselect)
  google.maps.event.addListener(map, 'click', deselect)

  document.getElementById('name').addEventListener('change', function(event) {
    if(selection) selection.name = event.target.value
  })

  document.getElementById('island').addEventListener('change', function(event) {
    if(selection) selection.island = event.target.checked
  })

  document.getElementById('dele').addEventListener('click', function(event) {
    event.stopPropagation()
    event.preventDefault()
    rempoly(selection)
  })

  document.getElementById('file').addEventListener('change', function(event) {
    event.stopPropagation()
    event.preventDefault()

    var reader = new FileReader()
    reader.onload = function(){
      var json = JSON.parse(reader.result)
      var data = new google.maps.Data().addGeoJson(json)
      data.forEach(function(feature) {
        var geom = feature.getGeometry()
        if(geom.getType() === 'MultiPolygon') {
          geom.getArray().forEach(poly => {addpoly(poly, feature)})
        }
        else if(geom.getType() === 'Polygon') {
          addpoly(geom, feature)
        }
      })
    }

    reader.readAsText(event.target.files[0])
  })

  document.getElementById('save').addEventListener('click', function(event) {
    event.stopPropagation()
    event.preventDefault()

    var data = {
      type: "FeatureCollection",
      features: Array.from(shapes).map(function(poly) {
        return {
          type: "Feature",
          properties: {
            name:   poly.name,
            area:   google.maps.geometry.spherical.computeArea(poly.getPath()),
            island: poly.island
          },
          geometry: {
            type: "Polygon",
            coordinates: poly.getPaths().getArray().map(function(ring) {
              let array = ring.getArray().map(p => [p.lng(), p.lat()])
              array.push(array[0])
              return array
            })
          }
        }
      })
    }

    // Download trick based on answers to:
    // https://stackoverflow.com/questions/19327749
    var link = document.getElementById('download')
    var json = JSON.stringify(data, null, 2)
    var blob = new Blob([json], {type: 'application/json'})
    var href = window.URL.createObjectURL(blob)
    link.href = href
    link.click()

    setTimeout(function() {
      window.URL.revokeObjectURL(href)
    }, 0)
  })
}

google.maps.event.addDomListener(window, 'load', initialize)
