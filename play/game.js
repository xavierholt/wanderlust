class Game {
  constructor(map, rounds) {
    this.map     = map
    this.rounds  = rounds
    this.history = []
    this.current = 0
    this.score   = 0
  }

  next() {
    document.body.classList.add('loading')
    loading = true

    random.panorama(this.map)
  }

  guess() {
    if(loading) {
      return
    }

    let  score  = finder.score()
    this.score += score
    this.history.push({
      start: finder.target.getPosition(),
      guess: finder.marker.getPosition(),
      score: score
    })
  }
}
