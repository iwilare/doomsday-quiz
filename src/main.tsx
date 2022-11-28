import React, { useEffect, useRef, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { useState } from 'react'
import * as mui from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import * as Dayjs from 'dayjs'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import _, { kebabCase } from 'lodash'
import { styled } from '@mui/material/styles';
import { color } from '@mui/system';

const months = (isLeap: boolean) => [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const isLeap = (y: number) => y % 4 == 0 && y % 100 != 0 || y % 400 == 0
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const MONTHS_DIFF = [
  -2, // jan next year
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
const CENTURY = [2, 0, 5, 3]
const DECADE = [0, -2, -3, 2, 1, -1, -2, 3, 2, 0]
const UNITS = [0, 1, 2, 3, -2, -1, 0, 1, 3, 4]
const LEAPSX = [2, 3, 6, 7]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const colorValue = (x: number) =>
  [ 'primary',
    'green',
    'orange',
    'red',
    'blue',
    'DeepSkyBlue',
    'violet'
  ][(x + 7) % 7]

type $ = "day" | "month" | "year" | "wait" | "question" | "answer"

function App() {
  const [state, setState] = useState({
    $: "question" as $,
    date: getRandomDate(1900, 2100),
    won: 0, did: 0,
    lastClicked: null as (null | number),
    isCorrect: null as (null | boolean),
    showTables: false,
    timeStart: Date.now(),
    timeEnd: null as (null | number),
    yearStart: 1900,
    yearEnd: 2100,
    animationTime: 1000,
    showOptions: true,
    showAnimations: false,
    nightMode: useMediaQuery('(prefers-color-scheme: dark)'),
    query: null as (null | Dayjs.Dayjs),
  })
  const nullColor = state.nightMode ? '#000000' : '#e0e0e0'
  function Row(_: { k: any, v: any, hideKey?: boolean, hideArrVal?: boolean, swap?: boolean, underlineKey?: boolean }) {
    return <mui.TableRow>
      <mui.TableCell align="right">
        <span style={{border: _.underlineKey ? "1px solid silver" : '', padding: 1.3, borderRadius: 8,
                      color: _.hideKey ? nullColor
                           : colorValue(_.v)}}>
          {_.k}
        </span>
      </mui.TableCell>
      <mui.TableCell align="center" padding="none"
          sx={{ color: _.hideArrVal ? nullColor : 'primary' }}>{_.swap || false ? '⇵' : '⟶' }</mui.TableCell>
      <mui.TableCell align="right" sx={{color: _.hideArrVal ? nullColor : 'primary'}}>{_.v}</mui.TableCell>
    </mui.TableRow>
  }
  const theme = useMemo(() =>
    createTheme({
      palette: { mode: state.nightMode ? 'dark' : 'light' },
    }),
    [state.nightMode],
  );
  const animationTimeout = useRef(undefined as (number | undefined))
  const ExpandMore = styled((props: IconButtonProps & { expand: boolean }) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  })(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  }));

  function animation() {
    cancelAnimation()
    const actions: { next: $, time: number }[] = [
      { next: 'day', time: state.animationTime },
      { next: 'month', time: state.animationTime },
      { next: 'year', time: state.animationTime },
      { next: 'wait', time: 0 },
    ]
    actions.reduceRight((s, { next, time }) => () => {
      setState(_ => ({ ..._, $: _.$ != 'answer' ? next : _.$ }));
      animationTimeout.current = setTimeout(s, time)
    }, () => { })()
  }
  function cancelAnimation() {
    clearTimeout(animationTimeout.current)
  }
  function refresh() {
    setState({
      ...state,
      date: getRandomDate(state.yearStart, state.yearEnd),
      isCorrect: null,
      timeStart: Date.now(),
      timeEnd: null,
      $: "question"
    })
    if (state.showAnimations && !['day', 'month', 'year'].includes(state.$))
      animation()
  }
  function getRandomDate(yearStart: number, yearEnd: number): { y: number, m: number, d: number } {
    const y = _.random(yearStart, yearEnd, false)
    const m = _.random(1, 12, false)
    const d = _.random(1, months(isLeap(y))[m - 1], false)
    return { y: y, m: m, d: d };
  }

  const date = new Date(state.date.y, state.date.m - 1, state.date.d)
  const name = date.toLocaleDateString('en-uk', { month: 'long', year: 'numeric', day: 'numeric' })
  const correctDay = date.getDay();

  function doomsdayComputations(y: number, m: number, d: number) {
    y += [1, 2].includes(m) ? -1 : 0
    const [c, u, z] = [Math.floor(y / 100), Math.floor(y / 10) % 10, y % 10]

    return [
      ['Day',     d % 7],
      ['Month',   MONTHS_DIFF[m - 1]],
      ['Century', CENTURY[c % 4]],
      ['Decade',  DECADE[u]],
      ['Units',   UNITS[z]],
      ['Leap',    (u % 2 != 0 && LEAPSX.includes(z) ? 1 : 0)],
    ] as [string, number][]
  }
  function doomsday(y: number, m: number, d: number) {
    return (14 + doomsdayComputations(y, m, d).map(([_, n]) => n).reduce((a,b) => a + b, 0)) % 7
  }
  function test() {
    let errors = 0
    for(let y = 1600; y <= 2100; y++) {
      for(let m = 1; m <= 12; m++) {
        for(let d = 1; d <= months(isLeap(y))[m - 1]; d++) {
          if(doomsday(y, m, d) != new Date(y, m-1, d).getDay()) {
            errors += 1
          }
        }
      }
    }
    return errors
  }
  //console.log(test())
  const Computations = doomsdayComputations(state.date.y, state.date.m, state.date.d)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <mui.Stack sx={{ mt: 8 }} alignItems="center" spacing={1}>
        <mui.DialogTitle variant="h4" align="center" sx={{ px: 0 }}
          color={ state.isCorrect === null ? 'default'
                : state.isCorrect ? 'green' : 'error'}>
          { state.showAnimations && state.$ == 'day'   ? name.split(' ')[0]
          : state.showAnimations && state.$ == 'month' ? name.split(' ')[1]
          : state.showAnimations && state.$ == 'year'  ? name.split(' ')[2]
          : state.showAnimations && state.$ == 'wait'  ? '?'
          : name}
        </mui.DialogTitle>
        <mui.Box sx={{ px: 1, width: '100%' }}>
          <mui.Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>{[0, 1, 2, 3, 4, 5, 6].map(i =>
            <mui.Button variant="contained" key={i} fullWidth={true}
              sx={{ minWidth: 0, maxWidth: 55, mx: 0.25 }} color={
                state.$ != 'answer' ? 'primary'
               : i == correctDay ? 'success'
               : i == state.lastClicked ? 'error'
               : 'primary'}
              onClick={e => {
                if (state.$ == 'answer')
                  refresh();
                else {
                  const correct = i == correctDay;
                  setState(_ => ({
                    ..._,
                    $: 'answer',
                    won: _.won + (correct ? 1 : 0),
                    did: _.did + 1,
                    isCorrect: correct,
                    lastClicked: i,
                    timeEnd: Date.now(),
                  }))
                }
              }}>{i}</mui.Button>)}</mui.Box></mui.Box>
        {state.timeEnd ?
          <mui.Typography variant="h5" color={state.isCorrect === null ? 'default'
            : state.isCorrect ? 'green' : 'error'}>
            {((state.timeEnd - state.timeStart) / 1000).toFixed(2).toString() + ' s'}
          </mui.Typography>
          : <></>
        }
        {state.$ != 'answer' ? [] :
          <mui.Button onClick={refresh}>Continue</mui.Button>
        }
        {state.showTables ?
          <mui.Stack direction="row" pt={1.5}>
            <mui.Card>
              <mui.Table size="small">
                {MONTHS_DIFF.map((d, i) => <Row underlineKey={[0, 1].includes(i)} hideKey={d == 0} hideArrVal={d == 0} k={MONTHS[i % 12]} v={d}/>)}
              </mui.Table>
            </mui.Card>
            <mui.Card>
              <mui.Table size="small">
                {DECADE.map((d, i) => <Row swap={[5, 6].includes(i)} hideKey={[0, 9].includes(i)} hideArrVal={[0, 9].includes(i)} k={<>'{i.toString()}0</>} v={d}/>)}
              </mui.Table>
            </mui.Card>
            <mui.Card>
              <mui.Table size="small">
                {[...Array(10)].map((_, i) => <Row hideKey={[0, 1].includes(i)} hideArrVal={[0, 1, 2, 3, 6].includes(i)} underlineKey={[2,3,6,7].includes(i)} k={i} v={UNITS[i]}/>)}
              </mui.Table>
            </mui.Card>
          </mui.Stack>
          : <></>}
        {!(state.showTables && state.$ == 'answer') ? [] :
          <div>
            <mui.Table size="small">{
              Computations.reduce<{tally: number, elements: JSX.Element[]}>(
                ({tally, elements}, [name, value], i) =>
                  ({tally: tally + value, elements: [...elements,
                    <mui.TableRow>
                      <mui.TableCell align="right">{name}</mui.TableCell>
                      <mui.TableCell align="right">{value}</mui.TableCell>
                      <mui.TableCell align="right">{i == 0 ? '' : value == 0 ? '-' : (tally + value) % 7}</mui.TableCell>
                    </mui.TableRow>]}), {tally: 0, elements: []}).elements
            }
            </mui.Table>
          </div>
        }
        <ExpandMore expand={state.showOptions} onClick={() => setState(_ => ({ ..._, showOptions: !_.showOptions }))}>
          <ExpandMoreIcon />
        </ExpandMore>
        <mui.Collapse in={state.showOptions} timeout="auto" unmountOnExit>
          <mui.Stack alignItems="center" spacing={1}>
            <mui.Typography variant="h5" >{state.won} / {state.did}</mui.Typography>
              <mui.Stack spacing={1}>
                <mui.Stack spacing={1} direction="row" sx={{ width: 300 }}>
                  <mui.TextField type="number" size="small" label="Start year" variant="outlined" value={state.yearStart} onChange={e => setState(_ => ({ ..._, yearStart: parseInt(e.target.value) }))} />
                  <mui.TextField type="number" size="small" label="End year" variant="outlined" value={state.yearEnd} onChange={e => setState(_ => ({ ..._, yearEnd: parseInt(e.target.value) }))} />
                </mui.Stack>
              <mui.TextField type="number" size="small" label="Animation time" variant="outlined" value={state.animationTime} sx={{ width: 300 }} onChange={e => setState(_ => ({ ..._, animationTime: parseInt(e.target.value) }))} />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Query"
                  value={state.query}
                  onChange={q => setState(_ => ({ ..._, query: q }))}
                  renderInput={p => <mui.TextField sx={{ width: 300 }} {...p} />}
                />
              </LocalizationProvider>
              {state.query !== null ? <mui.Typography variant="h5">{state.query.day()}</mui.Typography> : <></>}
              </mui.Stack>
              <mui.Stack>
                <mui.FormGroup>
                  <mui.FormControlLabel
                    control={<mui.Switch />}
                    checked={state.showTables}
                    onChange={(_, v) => setState(_ => ({ ..._, showTables: v }))}
                    label="Table" />
                  <mui.FormControlLabel
                    control={<mui.Switch />}
                    checked={state.showAnimations}
                    onChange={(_, v) => setState(_ => ({ ..._, showAnimations: v }))}
                    label="Animations" />
                  <mui.FormControlLabel
                    control={<mui.Switch />}
                    checked={state.nightMode}
                    onChange={(_, v) => setState(_ => ({ ..._, nightMode: v }))}
                    label="Night mode" />
                </mui.FormGroup>
              </mui.Stack>
          </mui.Stack>
        </mui.Collapse>
      </mui.Stack>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
