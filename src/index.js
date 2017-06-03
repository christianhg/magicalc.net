import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { compose, flatten, filter, map, prop, reverse, sortBy, take } from 'ramda'
const { task } = require('folktale/data/task')

import './index.scss'

const httpGet = url =>
  task(resolver => axios.get(url).then(resolver.resolve).catch(resolver.reject))
const getJson = url => httpGet(url).map(res => res.data)
const getSets = () => getJson('http://mtgjson.com/json/AllSetsArray.json')
const getCards = () => getSets().map(map(prop('cards'))).map(flatten)

const getLength = s => s.length
const sortByNameLength = sortBy(compose(getLength, prop('name')))
const sortByTextLength = sortBy(compose(getLength, prop('text')))
const takeTen = take(10)
const cardsWithLongestNames = compose(takeTen, reverse, sortByNameLength)
const cardsWithShortestNames = compose(takeTen, sortByNameLength)
const cardsWithLeastText = compose(takeTen, sortByTextLength, filter(prop('text')))
const cardListView = card => <li key={card.id}>{card.name}</li>
const calculations = [
  {
    id: 0,
    title: 'Cards with longest names',
    cards: []
  },
  {
    id: 1,
    title: 'Cards with shortest names',
    cards: []
  },
  {
    id: 2,
    title: 'Cards with least text',
    cards: []
  }
]

function Calculation(props) {
  return (
    <div key={props.id} className="calculation">
      <h2>{props.title}</h2>
      <ol>
        {props.cards.map(cardListView)}
      </ol>
    </div>
  )
}

class Magicalc extends React.Component {
  constructor() {
    super()
    this.state = {
      calculations
    }
  }

  componentDidMount() {
    getCards().run().future().listen({
      onRejected: console.error,
      onResolved: cards =>
        this.setState(prevState => ({
          calculations: [
            {
              ...prevState.calculations[0],
              cards: cardsWithLongestNames(cards)
            },
            {
              ...prevState.calculations[1],
              cards: cardsWithShortestNames(cards)
            },
            {
              ...prevState.calculations[2],
              cards: cardsWithLeastText(cards)
            }
          ]
        }))
    })
  }

  render() {
    const calculations = this.state.calculations.map(Calculation)

    return (
      <div>
        <h1>Magicalc</h1>
        {calculations}
      </div>
    )
  }
}

ReactDOM.render(<Magicalc />, document.getElementById('root'))
