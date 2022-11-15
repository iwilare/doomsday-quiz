import React, { useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { useState } from 'react'
import * as mui from '@mui/material'
import _ from 'lodash'

const months = (isLeap: boolean) => [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const isLeap = (y: number) => y % 4 == 0 && y % 100 != 0 || y % 400 == 0
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
const randomQuizDate = () => randomDate(new Date(1600, 1, 1), new Date(2100, 12, 31))

function getRandomDate() {
  const y = _.random(1600, 2100, false)
  const m = _.random(1, 12, false)
  const d = _.sample(months(isLeap(m)))
  return new Date(y, m, d);
}

const DECADE = [0,5,4,2,1,6,5,3,2,0]
const YDIGIT = [0,1,2,3,5,6,0,1,3,4]
const LEAPSX = [2,3,6,7]
const CENTURY = [2,0,5,3]
const MONTHS_DIFF = [-2, // jan
                      1, // feb
                      0, // mar
                      3, // apr
                     -2, // may
                      1, // jun
                      3, // jul
                     -1, // aug
                      2, // sep
                     -3, // oct
                      0, // nov
                      2  // dec
                     ]

function myDoomsday(y: number, m: number, d: number) {
  y += [1,2].includes(m) ? -1 : 0
  const [c, u, z] = [Math.floor(y / 100), Math.floor(y / 10) % 100, y % 10]
  return (
          CENTURY[c % 4] +
          DECADE[u] +
          YDIGIT[z] +
          (u % 2 != 0 && LEAPSX.includes(z) ? 1 : 0) +
          MONTHS_DIFF[m - 1] + d
         ) % 7
}
const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"]

function App() {
  const [state, setState] = useState({
    month: _.random(1, 12, false),
    input: "",
    won: 0,
  })
  return (
    <div className="App">
      <mui.Typography variant="h3">{MONTHS[state.month]}</mui.Typography>
      <mui.TextField id="outlined-basic" variant="outlined"
             value={state.input}
             onChange={e => {
              (7 + parseInt(e.target.value)) % 7 == (7 + MONTHS_DIFF[state.month]) % 7
                ? setState({
                    month: _.random(1, 12, false),
                    input: "",
                    won: state.won + 1
                  }) : setState({...state, input: e.target.value })
             }}
             />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
