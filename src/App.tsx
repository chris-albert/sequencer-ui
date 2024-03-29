import React from 'react';
import './styles.scss'
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {useMidiContext} from "./contexts/MidiContext";
import {MidiInput} from "./midi/WindowMidi";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Layout} from "./pages/Layout";
import {IndexPage} from "./pages/IndexPage";
import {MidiInputRequiredComponent} from "./components/MidiInputRequiredComponent";
import {MonitorPage} from "./pages/MonitorPage";
import {SettingsPage} from "./pages/SettingsPage";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {

  const midi = useMidiContext()
  const [midiInput, setMidiInput] = React.useState<MidiInput | undefined>(undefined)

  return (
    <div className="App">
      <BrowserRouter>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Routes>
              <Route
                path='/'
                element={
                  <Layout midi={midi} onInputSelect={setMidiInput}/>
                }
              >
                <Route
                  index
                  element={
                    <MidiInputRequiredComponent
                      midiInput={midiInput}
                      element={(mi) => (
                        <IndexPage midiInput={mi} />
                      )}
                    />
                  }
                />
                <Route
                  path='monitor'
                  element={
                    <MidiInputRequiredComponent
                      midiInput={midiInput}
                      element={(mi) => (
                        <MonitorPage midiInput={mi} />
                      )}
                    />
                  }
                />
                <Route
                  path='settings'
                  element={
                    <SettingsPage />
                  }
                />
              </Route>
            </Routes>
          </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
