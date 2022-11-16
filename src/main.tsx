import React, { useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { useState } from 'react'
import * as mui from '@mui/material'
import _ from 'lodash'

const months = (isLeap: boolean) => [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const isLeap = (y: number) => y % 4 == 0 && y % 100 != 0 || y % 400 == 0
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

function getRandomDate() {
  const y = _.random(1900, 2100, false)
  const m = _.random(1, 12, false)
  const d = _.random(1, months(isLeap(y))[m - 1], false)
  return { y: y, m: m, d: d };
}

const DECADE = [0, 5, 4, 2, 1, 6, 5, 3, 2, 0]
const YDIGIT = [0, 1, 2, 3, 5, 6, 0, 1, 3, 4]
const LEAPSX = [2, 3, 6, 7]
const CENTURY = [2, 0, 5, 3]
const MONTHS_DIFF = [-2, // jan next year
  1, // feb next year
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
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function myDoomsday(y: number, m: number, d: number) {
  y += [1, 2].includes(m) ? -1 : 0
  const [c, u, z] = [Math.floor(y / 100), Math.floor(y / 10) % 10, y % 10]
  return (
    CENTURY[c % 4] +
    DECADE[u] +
    YDIGIT[z] +
    (u % 2 != 0 && LEAPSX.includes(z) ? 1 : 0) +
    MONTHS_DIFF[m - 1] + d
  ) % 7
}

function App() {
  const [state, setState] = useState({
    date: getRandomDate(),
    won: 0, did: 0,
    showSolution: false,
    lastClicked: null as (null | number),
    isCorrect: null as (null | boolean),
    showTables: false,
  })
  function refresh() {
    setState({
      ...state,
      date: getRandomDate(), showSolution: false, isCorrect: null
    })
  }
  const maybeShowModulus = (v: number) => v >= 7 ? <> = {v - 7}</> : <></>
  const date = new Date(state.date.y, state.date.m - 1, state.date.d)
  const name = date.toLocaleDateString('en-uk', { month: 'long', year: 'numeric', day: 'numeric' })
  const correctDay = date.getDay();

  let [y, m, d] = [state.date.y, state.date.m, state.date.d]
  y += [1, 2].includes(m) ? -1 : 0
  const [c, u, z] = [Math.floor(y / 100), Math.floor(y / 10) % 10, y % 10]

  const dateComponent = MONTHS_DIFF[m - 1] + (d % 7)
  const yearComponent = DECADE[u] + YDIGIT[z] + (u % 2 != 0 && LEAPSX.includes(z) ? 1 : 0)
  const fullYearComponent = CENTURY[c % 4] + yearComponent
  const resultComponent = fullYearComponent + dateComponent

  return (
    <mui.Stack alignItems="center" spacing={1}>
      <mui.DialogTitle variant="h3" padding={0}
          color={state.isCorrect === null ? 'default'
               : state.isCorrect ? 'primary' : 'error'}>
        {name}
      </mui.DialogTitle>
      <mui.Typography variant="h5">{state.won} / {state.did}</mui.Typography>
      {<mui.Stack spacing={0.5} direction="row">{[0, 1, 2, 3, 4, 5, 6].map(i =>
        <mui.Button
          variant="contained"
          key={i}
          color={
            !state.showSolution ? 'primary'
              : i == correctDay ? 'success'
                : i == state.lastClicked ? 'error' :
                  'primary'}
          onClick={e => {
            if (state.showSolution) {
              refresh();
              return;
            }
            let correct = i == correctDay;
            setState({
              ...state,
              won: state.won + (correct ? 1 : 0),
              did: state.did + 1,
              isCorrect: correct,
              lastClicked: i,
              showSolution: true,
            })
          }}>
          {i}
        </mui.Button>)}</mui.Stack>}
      {!state.showSolution ? [] :
        <>
          <div>
            <mui.Table size="medium">
              <mui.TableRow>
                <mui.TableCell>Date:</mui.TableCell>
                <mui.TableCell>{MONTHS[m - 1]} {d}</mui.TableCell>
                <mui.TableCell>{MONTHS_DIFF[m - 1]} + {d % 7} = {dateComponent}{maybeShowModulus(dateComponent)}</mui.TableCell>
              </mui.TableRow>
              <mui.TableRow>
                <mui.TableCell>Year:</mui.TableCell>
                <mui.TableCell>{y}</mui.TableCell>
                <mui.TableCell>{CENTURY[c % 4]} + {DECADE[u]} + {
                  YDIGIT[z]} + {(u % 2 != 0 && LEAPSX.includes(z) ? 1 : 0)} = {fullYearComponent}{maybeShowModulus(fullYearComponent)} </mui.TableCell>
              </mui.TableRow>
              <mui.TableRow>
                <mui.TableCell>Result:</mui.TableCell>
                <mui.TableCell></mui.TableCell>
                <mui.TableCell>{dateComponent % 7} + {fullYearComponent % 7} = {resultComponent}{maybeShowModulus(resultComponent)}</mui.TableCell>
              </mui.TableRow>
            </mui.Table>
          </div>
          <mui.Button onClick={refresh}>Continue</mui.Button>
        </>
      }
      <mui.FormControlLabel
        control={<mui.Switch />}
        checked={state.showTables}
        onChange={(_, k) => setState({ ...state, showTables: k })}
        label="Show tables" />
      {state.showTables ?
        <mui.Stack direction="row">
          <mui.Card>
            <mui.Table size="small">
              {DECADE.map((d, i) => <mui.TableRow>
                <mui.TableCell>{_.padStart((i * 10).toString(), 2, '0')}</mui.TableCell>
                <mui.TableCell>{d}</mui.TableCell>
              </mui.TableRow>)}
            </mui.Table>
          </mui.Card>
          <mui.Card>
            <mui.Table size="small">
              {MONTHS_DIFF.map((d, i) => <mui.TableRow>
                <mui.TableCell align="right">{MONTHS[i]}</mui.TableCell>
                <mui.TableCell align="right">{d}</mui.TableCell>
              </mui.TableRow>)}
            </mui.Table>
          </mui.Card>
        </mui.Stack>
        : <></>}
    </mui.Stack>)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
