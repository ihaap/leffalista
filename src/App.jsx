//
//
//  ██      ███████ ███████ ███████  █████  ██      ██ ███████ ████████  █████  
//  ██      ██      ██      ██      ██   ██ ██      ██ ██         ██    ██   ██ 
//  ██      █████   █████   █████   ███████ ██      ██ ███████    ██    ███████ 
//  ██      ██      ██      ██      ██   ██ ██      ██      ██    ██    ██   ██ 
//  ███████ ███████ ██      ██      ██   ██ ███████ ██ ███████    ██    ██   ██ 
//
// Pilvipalvelut web-kehityksessä (DIG001AS3A-3001) harjoitustyö 12/2023. 
// Saa käyttää / muokata / mitä vaan ihan vapaasti.
                                                                            

// Importteja muutama
import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, TextField, Button, Container, Paper, FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent } from '@mui/material';
import { styled } from '@mui/system';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Firebase-konfiguraatio
const firebaseConfig = {
  apiKey: "AIzaSyDhBi1vD-XZyZBNvgqncm5cHtWNrpwLeWU",
  authDomain: "leffa-11879.firebaseapp.com",
  projectId: "leffa-11879",
  storageBucket: "leffa-11879.appspot.com",
  messagingSenderId: "275682473552",
  appId: "1:275682473552:web:50e3d542e96651dba0c355",
  measurementId: "G-XMJR5S3HCY"
};

// Alustetaan Firebase-app
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Genret elokuville
const genres = [
  'Toiminta',
  'Seikkailu',
  'Komedia',
  'Rikos',
  'Dokumentti',
  'Fantasia',
  'Musikaali',
  'Sci-Fi',
  'Kauhu',
  'Jännitys',
  'Western',
  'Draama',
];

// Tyylikomponentit
const LogoImage = styled('img')({
  display: 'block',
  margin: '0 auto',
  height: 'auto',
  marginBottom: '16px',
  '@media (min-width: 600px)': {
    maxWidth: '100%',
  },
});

const InputContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  '@media (min-width: 600px)': {
    flexDirection: 'row',
    gap: '16px',
    alignItems: 'flex-end',
  },
});

const MovieItem = styled(ListItem)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '8px',
  '@media (min-width: 600px)': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const BoredApiSection = styled('div')({
  marginBottom: '0px',
  textAlign: 'center',
});

const BoredApiButton = styled(Button)({
  marginTop: '0px',
});

const BoredApiActivity = styled(Typography)({
  margin: '8px 0',
});

// State-muuttujat
const App = () => {
  const [movies, setMovies] = useState([]);
  const [newMovie, setNewMovie] = useState({ title: '', year: '', genre: '' });
  const [totalMovies, setTotalMovies] = useState(0);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [editMode, setEditMode] = useState(null);
  const [boredActivity, setBoredActivity] = useState(null);

  // useEffect - Haetaan data komponentin asennuksen yhteydessä
  useEffect(() => {
    fetchMovies();
    fetchTotalMovies();
    checkAuthState();
  }, []);

  // Haetaan elokuvat Firestoresta
  const fetchMovies = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'movies'));
      const movieList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMovies(movieList);
    } catch (error) {
      console.error('Virhe haettaessa elokuvia: ', error);
    }
  };


  // Haetaan elokuvien kokonaismäärä
  const fetchTotalMovies = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'movies'));
      setTotalMovies(snapshot.size);
    } catch (error) {
      console.error('Virhe haettaessa elokuvien kappalemäärää: ', error);
    }
  };

  // Tarkistetaan kirjautumistilan muutos
  const checkAuthState = () => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      if (user) {
        setUsername(user.email);
      }
    });
  };

  // Kirjaudutaan sisään
  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, username, password);
      checkAuthState();

      // Jos kirjautuminen onnistuu
      alert('Kirjautuminen onnistui. Tervetuloa!');
    } catch (error) {
      console.error('Virhe kirjautuessa sisään: ', error);

      // Mahdolliset virheet
      if (error.code === 'auth/invalid-credential') {
        alert('Väärä käyttäjätunnus tai salasana. Kokeile uudelleen!');
      } else {
        alert('Tapahtui virhe kirjautuessa sisään. Kokeile uudelleen!');
      }
    }
  };

  // Kirjaudutaan ulos
  const signOut = async () => {
    try {
      await auth.signOut();
      checkAuthState();

      // Kirjautuminen ulos onnistui
      alert('Olet nyt kirjautunut ulos.');
    } catch (error) {
      // Kirjautuminen ulos ei onnistunut
      console.error('Virhe kirjautuessa ulos: ', error);
      alert('Tapahtui virhe kirjautuessa ulos. Kokeile uudelleen!');
    }
  };

  // Lisätään elokuva Firestoreen
  const addMovie = async () => {
    // Tarkista että kaikki kentät ovat varmasti syötetty
    if (!newMovie.title.trim() || !newMovie.year.trim() || !newMovie.genre.trim()) {
      alert('Täytä kaikki kentät!');
      return;
    }

    try {
      await addDoc(collection(db, 'movies'), newMovie);
      fetchMovies();
      fetchTotalMovies();
      setNewMovie({ title: '', year: '', genre: '' });
    } catch (error) {
      console.error('Virhe lisätessä elokuvaa: ', error);
    }
  };

  // Poistetaan elokuva Firestoresta
  const deleteMovie = async (id) => {
    try {
      // Oletko aivan varma...?
      const isConfirmed = window.confirm('Haluatko varmasti poistaa tämän elokuvan?');

      // Jos olet varma, niin...
      if (isConfirmed) {
        await deleteDoc(doc(db, 'movies', id));
        fetchMovies();
        fetchTotalMovies();
      }
    } catch (error) {
      console.error('Virhe poistettaessa elokuvaa: ', error);
    }
  };

  // Siirrytään muokkaustilaan
  const enterEditMode = (index) => {
    setEditMode(index);
    const selectedMovie = movies[index];
    setNewMovie({ ...selectedMovie });
  };

  // Poistutaan muokkaustilasta
  const exitEditMode = () => {
    setEditMode(null);
    setNewMovie({ title: '', year: '', genre: '' });
  };

  // Päivitetään elokuva Firestoresta
  const updateMovie = async (id) => {
    try {
      const movieRef = doc(db, 'movies', id);
      await updateDoc(movieRef, newMovie);

      // Konsoliin viesti onnistumisesta
      console.log('Päivitys onnistui!');
      fetchMovies(); // Päivitetään lista
      exitEditMode(); // Poistutaan muokkaustilasta
    } catch (error) {
      // Mahdolliset virheet konsoliin
      console.error('Virhe päivitettäessä: ', error);
    }
  };

  // Haetaan aktiviteettia APIsta (Piti alunperin hakea jokaiselle elokuvalle OMDB API:sta juliste (300x300px .JPG) mutta meni hermot kun ei vaan toiminut ;__;
  // Tällänen nyt sitten tilalle...
  const fetchBoredActivity = async () => {
    try {
      // Avoin API, ei vaadi avainta tms...
      const response = await fetch('https://www.boredapi.com/api/activity');
      const data = await response.json();
      setBoredActivity(data);
    } catch (error) {
      // Virhetilanne, sos apua!
      console.error('Virhe haettaessa aktiviteettia:', error);
    }
  };


  // Älä koske - se toimii.
  // Kiitos ja anteeksi.
  return (
    <Container maxWidth="md" sx={{ marginTop: '32px' }}>
      <Paper elevation={3} sx={{ padding: '16px' }}>
        {isAuthenticated ? (
          <>
            <LogoImage src="logo.png" alt="Logo" />
            <p style={{ textAlign: 'center', marginTop: '16px' }}>Leffalista on sovellus, jonka avulla voit hallinnoida elokuvakokoelmaasi. <br />Voit lisätä, poistaa, muokata ja tarkastella elokuviasi kätevästi. <br />Sovellus hyödyntää Firebasea käyttäjähallinnassa ja leffojen tallentamisessa.</p>
            <BoredApiSection sx={{ margin: '10px' }}>
              <BoredApiButton variant="contained" color="primary" onClick={fetchBoredActivity}>
                API-testi: Klikkaa tästä.
              </BoredApiButton>
              {boredActivity && (
                <BoredApiActivity>
                  Aktiviteetti: {boredActivity.activity} ({boredActivity.type}).
                </BoredApiActivity>
              )}
            </BoredApiSection>
            <InputContainer>
              <TextField
                label="Nimi"
                variant="outlined"
                sx={{ marginTop: '20px', width: isSmallScreen ? '100%' : '30%' }}
                value={newMovie.title}
                onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
              />
              <TextField
                label="Vuosi"
                variant="outlined"
                sx={{ marginTop: '20px', width: isSmallScreen ? '100%' : '20%' }}
                value={newMovie.year}
                onChange={(e) => setNewMovie({ ...newMovie, year: e.target.value })}
              />
              <FormControl variant="outlined" sx={{ marginTop: '20px', width: isSmallScreen ? '100%' : '20%' }}>
                <InputLabel htmlFor="genre-select">Genre</InputLabel>
                <Select
                  label="Genre"
                  id="genre-select"
                  value={newMovie.genre}
                  onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                >
                  {genres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" sx={{ marginBottom: '10px', width: isSmallScreen ? '100%' : '20%' }} onClick={addMovie}>
                Lisää
              </Button>
            </InputContainer>
            <List sx={{ marginTop: '16px' }}>
              <Grid container spacing={2}>
                {movies.map((movie, index) => (
                  <Grid item key={index} xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent style={{ position: 'relative' }}>
                        {editMode === index ? (
                          <>
                            <TextField
                              label="Nimi"
                              variant="outlined"
                              sx={{ marginBottom: '8px', width: '100%' }}
                              value={newMovie.title}
                              onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                            />
                            <TextField
                              label="Vuosi"
                              variant="outlined"
                              sx={{ marginBottom: '8px', width: '100%' }}
                              value={newMovie.year}
                              onChange={(e) => setNewMovie({ ...newMovie, year: e.target.value })}
                            />
                            <FormControl variant="outlined" sx={{ marginBottom: '8px', width: '100%' }}>
                              <InputLabel htmlFor="genre-select">Genre</InputLabel>
                              <Select
                                label="Genre"
                                id="genre-select"
                                value={newMovie.genre}
                                onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                              >
                                {genres.map((genre) => (
                                  <MenuItem key={genre} value={genre}>
                                    {genre}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Button variant="contained" color="primary" sx={{ width: '100%' }} onClick={() => updateMovie(movie.id)}>
                              Tallenna muutokset
                            </Button>
                            <Button variant="outlined" color="secondary" sx={{ marginTop: '8px', width: '100%' }} onClick={exitEditMode}>
                              Peruuta
                            </Button>
                          </>
                        ) : (
                          <>
                            <Typography>
                              {movie.title.length > 25 ? (
                                <>
                                  {movie.title.substring(0, 25)}
                                  <br />
                                  {movie.title.substring(25)}
                                </>
                              ) : (
                                movie.title
                              )}
                            </Typography>
                            <Typography>
                              {`Vuosi: ${movie.year}`}
                            </Typography>
                            <Typography>
                              {`Genre: ${movie.genre}.`}
                            </Typography>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => enterEditMode(index)}
                              sx={{ position: 'absolute', top: 15, right: 5, }}
                            >
                              <EditIcon />
                            </Button>
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => deleteMovie(movie.id)}
                              sx={{ position: 'absolute', bottom: 15, right: 5 }}
                            >
                              <DeleteIcon />
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </List>
          </>
        ) : (
          <>
            <LogoImage src="logo.png" alt="Logo" />
            <p style={{ textAlign: 'center', marginTop: '16px' }}>Leffalista on sovellus, jonka avulla voit hallinnoida elokuvakokoelmaasi. <br />Voit lisätä, poistaa, muokata ja tarkastella elokuviasi kätevästi. <br />Sovellus hyödyntää Firebasea käyttäjähallinnassa ja leffojen tallentamisessa.</p>
            <BoredApiSection sx={{ margin: '10px' }}>
              <BoredApiButton variant="contained" color="primary" onClick={fetchBoredActivity}>
                API-testi: Klikkaa tästä.
              </BoredApiButton>
              {boredActivity && (
                <BoredApiActivity>
                  Aktiviteetti: {boredActivity.activity} ({boredActivity.type}).
                </BoredApiActivity>
              )}
            </BoredApiSection>
            <TextField
              label="Username"
              variant="outlined"
              sx={{ marginBottom: '8px', width: '100%' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              sx={{ marginBottom: '8px', width: '100%' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button variant="contained" color="primary" sx={{ width: '100%' }} onClick={signIn}>
              Sign In
            </Button>
          </>
        )}
      </Paper>
      {isAuthenticated && (
        <div sx={{ textAlign: 'center', marginTop: '16px' }}>
          <Typography variant="body1" sx={{ textAlign: 'center', display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span>Elokuvia: {totalMovies} kpl.</span>
            <span>Olet kirjautunut käyttäjällä {username}.</span>
            <Button variant="contained" color="secondary" sx={{ width: '20%' }} onClick={signOut}>
              Kirjaudu ulos
            </Button>
          </Typography>
        </div>
      )}
    </Container>
  );
};
export default App;