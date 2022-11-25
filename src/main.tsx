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
import _ from 'lodash'
import { styled } from '@mui/material/styles';

const months = (isLeap: boolean) => [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const isLeap = (y: number) => y % 4 == 0 && y % 100 != 0 || y % 400 == 0
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const DECADE = [0, 5, 4, 2, 1, 6, 5, 3, 2, 0]
const YDIGIT = [0, 1, 2, 3, 5, 6, 0, 1, 3, 4]
const LEAPSX = [2, 3, 6, 7]
const CENTURY = [2, 0, 5, 3]
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
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const COLORS = [
  'purple', // jan next year
  'purple', // feb next year
  'lightgrey', // mar
  'red', // apr
  'blue', // may
  'green', // jun
  'red', // jul
  'darkgreen', // aug
  'orange', // sep
  '#009fff', // oct
  'lightgrey', // nov
  'orange'  // dec
]

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
    animationTime: 1500,
    showOptions: true,
    showAnimations: false,
    showColors: true,
    nightMode: useMediaQuery('(prefers-color-scheme: dark)'),
    query: null as (null | Dayjs.Dayjs),
  })
  console.log(useMediaQuery('(prefers-color-scheme: dark)'))
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

  let [y, m, d] = [state.date.y, state.date.m, state.date.d]
  y += [1, 2].includes(m) ? -1 : 0
  const [c, u, z] = [Math.floor(y / 100), Math.floor(y / 10) % 10, y % 10]

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <mui.Stack alignItems="center" spacing={1}>
        <mui.DialogTitle variant="h4" padding={0}
          color={state.isCorrect === null ? 'default'
            : state.isCorrect ? 'green' : 'error'}>
          {state.showAnimations && state.$ == 'day' ? name.split(' ')[0]
            : state.showAnimations && state.$ == 'month' ? name.split(' ')[1]
              : state.showAnimations && state.$ == 'year' ? name.split(' ')[2]
                : state.showAnimations && state.$ == 'wait' ? '?'
                  : name}
        </mui.DialogTitle>
        <mui.Typography variant="h5">{state.won} / {state.did}</mui.Typography>
        <mui.Stack spacing={0.5} alignItems="center" direction="row">{[0, 1, 2, 3, 4, 5, 6].map(i =>
          <mui.Button
            variant="contained"
            key={i}
            sx={{
              minWidth: 0,
            }}
            fullWidth={true}
            color={
              state.$ != 'answer' ? 'primary'
                : i == correctDay ? 'success'
                  : i == state.lastClicked ? 'error' :
                    'primary'}
            onClick={e => {
              if (state.$ == 'answer')
                refresh();
              else {
                const correct = i == correctDay;
                setState(_ => ({
                  ..._,
                  won: _.won + (correct ? 1 : 0),
                  did: _.did + 1,
                  isCorrect: correct,
                  lastClicked: i,
                  $: 'answer',
                  timeEnd: Date.now(),
                }))
              }
            }}>{i}</mui.Button>)}</mui.Stack>
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
                {MONTHS_DIFF.map((d, i) => <mui.TableRow sx={{ color: d == 0 ? 'lightgrey' : 'primary' }}>
                  <mui.TableCell align="right" sx={{
                    textDecoration: [0, 1].includes(i) ? 'underline' : '',
                    color: state.showColors ? COLORS[i] : 'primary'
                  }}>{MONTHS[i % 12]}</mui.TableCell>
                  <mui.TableCell align="right">{d}</mui.TableCell>
                </mui.TableRow>)}
              </mui.Table>
            </mui.Card>
            <mui.Card>
              <mui.Table size="small">
                {DECADE.map((d, i) => <mui.TableRow sx={{ color: i == 0 ? 'lightgrey' : 'primary' }}>
                  <mui.TableCell><span style={{ color: i % 2 == 1 ? 'red' : 'primary' }}>{i.toString()}</span><span style={{ color: '#eeeeee' }}>0</span></mui.TableCell>
                  <mui.TableCell padding="none" align="center">{i == 5 ? '⇵'
                                 : i == 6 ? '⇵'
                                 : '⟶'}</mui.TableCell><mui.TableCell>{d}</mui.TableCell>
                </mui.TableRow>)}
              </mui.Table>
            </mui.Card>
            <mui.Card>
              <mui.Table size="small">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <mui.TableRow sx={{ color: [0, 1, 2, 3, 6].includes(i) ? 'lightgrey' : 'primary' }}>
                  <mui.TableCell align="right" sx={{ color: [2, 3, 6, 7].includes(i) ? 'red' : 'primary' }}>{i}</mui.TableCell><mui.TableCell padding="none">⟶</mui.TableCell>
                  <mui.TableCell align="right">{(i + Math.floor(i / 4)) % 7}</mui.TableCell>
                </mui.TableRow>)}
              </mui.Table>
            </mui.Card>
            <mui.Card>
              <mui.Table size="small">
                {[16, 17, 18, 19, 20, 21, 22, 23].map(i => <mui.TableRow sx={{ color: [19, 20].includes(i) ? 'primary' : 'lightgrey' }}>
                  <mui.TableCell align="right">{i}</mui.TableCell><mui.TableCell padding="none">⟶</mui.TableCell>
                  <mui.TableCell align="right">{CENTURY[i % 4]}</mui.TableCell>
                </mui.TableRow>)}
              </mui.Table>
            </mui.Card>
          </mui.Stack>
          : <></>}
        {!(state.showTables && state.$ == 'answer') ? [] :
          <div>
            <mui.Table size="small">
              <mui.TableRow>
                <mui.TableCell align="right">Day</mui.TableCell>
                <mui.TableCell align="right"></mui.TableCell>
                <mui.TableCell align="right">{d % 7}</mui.TableCell>
              </mui.TableRow>
              <mui.TableRow>
                <mui.TableCell align="right">Month</mui.TableCell>
                <mui.TableCell align="right"><span style={{ color: [1, 2].includes(m) ? 'blue' : 'primary' }}>{MONTHS_DIFF[m - 1]}</span></mui.TableCell>
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
                <mui.TableCell align="right">{(x => <span style={{ color: x > 0 ? 'red' : 'primary' }}>{x}</span>)(u % 2 != 0 && LEAPSX.includes(z) ? 1 : 0)}</mui.TableCell>
                <mui.TableCell align="right">{(d + MONTHS_DIFF[m - 1] + CENTURY[c % 4] + DECADE[u] + YDIGIT[z] + (u % 2 != 0 && LEAPSX.includes(z) ? 1 : 0)) % 7}</mui.TableCell>
              </mui.TableRow>
            </mui.Table>
          </div>
        }
        <ExpandMore expand={state.showOptions} onClick={() => setState(_ => ({ ..._, showOptions: !_.showOptions }))}>
          <ExpandMoreIcon />
        </ExpandMore>
        <mui.Collapse in={state.showOptions} timeout="auto" unmountOnExit>
          <mui.Stack alignItems="center" spacing={1}>
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
              <mui.FormControlLabel
                control={<mui.Switch />}
                checked={!state.showColors}
                onChange={(_, v) => setState(_ => ({ ..._, showColors: !v }))}
                label="Hide colors" />
            </mui.FormGroup>
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
