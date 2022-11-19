import React, { useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { useState } from 'react'
import * as mui from '@mui/material'
import _ from 'lodash'

const months = (isLeap: boolean) => [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const isLeap = (y: number) => y % 4 == 0 && y % 100 != 0 || y % 400 == 0
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

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
    date: getRandomDate(1900, 2100),
    won: 0, did: 0,
    showSolution: false,
    lastClicked: null as (null | number),
    isCorrect: null as (null | boolean),
    showTables: true,
    timeStart: Date.now(),
    timeEnd: null as (null | number),
    yearStart: 1900,
    yearEnd: 2100,
  })
  function refresh() {
    setState({
      ...state,
      date: getRandomDate(state.yearStart, state.yearEnd),
      showSolution: false,
      isCorrect: null,
      timeStart: Date.now(),
      timeEnd: null,
    })
  }
  function getRandomDate(yearStart: number, yearEnd: number): {y: number, m: number, d: number} {
    const y = _.random(yearStart, yearEnd, false)
    const m = _.random(1, 12, false)
    const d = _.random(1, months(isLeap(y))[m - 1], false)
    return { y: y, m: m, d: d };
  }
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
      <mui.DialogTitle variant="h4" padding={0}
          color={state.isCorrect === null ? 'default'
               : state.isCorrect ? 'green' : 'error'}>
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
              timeEnd: Date.now(),
            })
          }}>
          {i}
        </mui.Button>)}</mui.Stack>}
      {state.timeEnd ?
          <mui.Typography variant="h5" color={state.isCorrect === null ? 'default'
                                            : state.isCorrect ? 'green' : 'error'}>
            {((state.timeEnd - state.timeStart) / 1000).toFixed(2).toString() + ' s'}
          </mui.Typography>
        : <></>
      }
      {!state.showSolution ? [] :
          <mui.Button onClick={refresh}>Continue</mui.Button>
      }
      {state.showTables ?
        <mui.Stack direction="row">
          <mui.Card>
            <mui.Table size="small">
              {MONTHS_DIFF.map((d, i) => <mui.TableRow sx={{ color: d == 0 ? 'lightgrey' : 'primary'}}>
                <mui.TableCell align="right" sx={{ color: d == 0 ? 'lightgrey'
                   : [0,1].includes(i) ? 'blue'
                   : 'primary' }}>{MONTHS[i % 12]}</mui.TableCell>
                <mui.TableCell align="right">{d}</mui.TableCell>
              </mui.TableRow>)}
            </mui.Table>
          </mui.Card>
          <mui.Card>
            <mui.Table size="small">
              {DECADE.map((d, i) => <mui.TableRow sx={{ color: i == 0 ? 'lightgrey' : 'primary'}}>
                <mui.TableCell><span style={{ color: i % 2 == 1 ? 'red' : 'primary'}}>{i.toString()}</span><span>0</span></mui.TableCell>
                <mui.TableCell>{d}</mui.TableCell>
              </mui.TableRow>)}
            </mui.Table>
          </mui.Card>
          <mui.Card>
            <mui.Table size="small">
              {[0,1,2,3,4,5,6,7,8,9].map(i => <mui.TableRow sx={{ color: i <= 1 ? 'lightgrey' : 'primary'}}>
                <mui.TableCell align="right" sx={{ color: [2,3,6,7].includes(i) ? 'red' : 'primary'}}>{i}</mui.TableCell>
                <mui.TableCell align="right">{(i + Math.floor(i / 4)) % 7}</mui.TableCell>
              </mui.TableRow>)}
            </mui.Table>
          </mui.Card>
        </mui.Stack>
        : <></>}
    {!(state.showTables && state.showSolution) ? [] :
          <div>
            <mui.Table size="small">
              <mui.TableRow>
                <mui.TableCell align="right">Day</mui.TableCell>
                <mui.TableCell align="right"></mui.TableCell>
                <mui.TableCell align="right">{d % 7}</mui.TableCell>
              </mui.TableRow>
              <mui.TableRow>
                <mui.TableCell align="right">Month</mui.TableCell>
                <mui.TableCell align="right"><span style={{color: [1,2].includes(m) ? 'blue' : 'primary'}}>{MONTHS_DIFF[m - 1]}</span></mui.TableCell>
                <mui.TableCell align="right">{(d + MONTHS_DIFF[m - 1]) % 7}</mui.TableCell>
              </mui.TableRow>
              <mui.TableRow>
                <mui.TableCell align="right">Century</mui.TableCell>
                <mui.TableCell align="right">{CENTURY[c % 4]}</mui.TableCell>
                <mui.TableCell align="right">{(d + MONTHS_DIFF[m - 1] + CENTURY[c % 4]) % 7}</mui.TableCell>
              </mui.TableRow>
              <mui.TableRow>
                <mui.TableCell align="right">Decade</mui.TableCell>
                <mui.TableCell align="right">{DECADE[u]}</mui.TableCell>
                <mui.TableCell align="right">{(d + MONTHS_DIFF[m - 1] + CENTURY[c % 4] + DECADE[u]) % 7}</mui.TableCell>
              </mui.TableRow>
              <mui.TableRow>
                <mui.TableCell align="right">Units</mui.TableCell>
                <mui.TableCell align="right">{YDIGIT[z]}</mui.TableCell>
                <mui.TableCell align="right">{(d + MONTHS_DIFF[m - 1] + CENTURY[c % 4] + DECADE[u] + YDIGIT[z]) % 7}</mui.TableCell>
              </mui.TableRow>
              <mui.TableRow>
                <mui.TableCell align="right">Leap</mui.TableCell>
                <mui.TableCell align="right">{(x => <span style={{color: x > 0 ? 'red' : 'primary'}}>{x}</span>)(u % 2 != 0 && LEAPSX.includes(z) ? 1 : 0)}</mui.TableCell>
                <mui.TableCell align="right">{(d + MONTHS_DIFF[m - 1] + CENTURY[c % 4] + DECADE[u] + YDIGIT[z] + (u % 2 != 0 && LEAPSX.includes(z) ? 1 : 0)) % 7}</mui.TableCell>
              </mui.TableRow>
            </mui.Table>
          </div>
      }
        <mui.FormControlLabel
          control={<mui.Switch />}
          checked={state.showTables}
          onChange={(_, v) => setState({ ...state, showTables: v })}
          label="Show tables" />
        <mui.Stack spacing={1} direction="row">
          <mui.TextField type="number" size="small" label="Start year" variant="outlined" value={state.yearStart} onChange={e => setState({ ...state, yearStart: parseInt(e.target.value) })} />
          <mui.TextField type="number" size="small" label="End year" variant="outlined" value={state.yearEnd} onChange={e => setState({ ...state, yearEnd: parseInt(e.target.value) })} />
        </mui.Stack>
    </mui.Stack>)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
