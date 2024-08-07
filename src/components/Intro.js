import React, { useState, useEffect } from 'react';
import './Intro.css';

const Intro = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [wordDetails, setWordDetails] = useState(null);
    const [wordOfTheDay, setWordOfTheDay] = useState(null);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [currentWODAudio, setCurrentWODAudio] = useState(null);
    const [date, setDate] = useState(new Date().toDateString());
    const [error, setError] = useState('');
    const [logoutError, setLogoutError] = useState('');

    useEffect(() => {
        getWODDetails();
        setDate();
    }, []);

    const checkLetterPress = (event) => {
        const isLetter = /^[a-zA-Z\s]$/.test(event.key) || event.key === 'Backspace';
        if (!isLetter) {
            event.preventDefault();
        }
    };

    const getWODDetails = async () => {
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/dig`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setWordOfTheDay(data[0]);
            setCurrentWODAudio(new Audio(data[0].phonetics[0].audio));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const processData = () => {
        getWordDetails(searchQuery);
    };

    const getWordDetails = async (inputWord) => {
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${inputWord}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setWordDetails(data[0]);
            setCurrentAudio(new Audio(data[0].phonetics[0].audio));
            setError('');
        } catch (error) {
            setError('kindly enter a valid word');
            setWordDetails(null);
        }
    };

    const updateBackgroundColor = () => {
        const searchResult = document.getElementById('result');
        if (areAllEmpty(searchResult)) {
            searchResult.classList.add('noContent');
        } else {
            searchResult.classList.remove('noContent');
        }
    };

    const areAllEmpty = (element) => {
        const paragraphs = element.querySelectorAll('p');
        return Array.from(paragraphs).every(p => p.innerText.trim() === '');
    };

    useEffect(() => {
        updateBackgroundColor();
    }, [wordDetails]);

    const handleLogout = async () => {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const response = await fetch('https://goldratecalculator-backend.onrender.com/logout', options);
            if (response.status === 200) {
                localStorage.removeItem('token');
                // Redirect to login page after successful logout
                window.location.href = '/';
            } else {
                // Handle error if logout fails
                const data = await response.json();
                if (data.error) {
                    setLogoutError(data.error);
                } else {
                    setLogoutError('An error occurred during logout.');
                }
            }
        } catch (err) {
            setLogoutError('An error occurred during logout.');
        }
    };

    return (
        <div>
            <div className='container d-flex justify-content-between my-4'>
                <h1>Dictionary</h1>
                <div>
                    <button className="btn btn-outline-primary mb-3" onClick={handleLogout}>Logout</button>
                    {logoutError && <p className="text-danger">{logoutError}</p>}
                </div>
            </div>         

            <div className="form-group container d-flex justify-content-center searchBox">
                <input
                    className="form-control me-2"
                    type="search"
                    name="searchBar"
                    id="searchBar"
                    placeholder="Search Dictionary"
                    onKeyDown={checkLetterPress}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-outline-dark" type="submit" onClick={processData}>Search</button>
            </div>

            {wordOfTheDay && (
                <div className="container d-flex align-items-start flex-column wordOfTheDay">
                    <h5>word of the day</h5>
                    <p>{date}</p>
                    <div className="d-flex align-items-center justify-content-top">
                        <p className="word" id="wordOfTheDay">{wordOfTheDay.word}</p>
                        <p id="wodAudio">
                            <i className="fa fa-volume-up p-1" onClick={() => currentWODAudio.play()}></i>
                        </p>
                    </div>
                    <p id="wodPronounciation">{wordOfTheDay.phonetic || ''}</p>
                    <p id="wodPartOfSpeech">{wordOfTheDay.meanings[0].partOfSpeech || ''}</p>
                    <p id="wodMeaning">{wordOfTheDay.meanings[0].definitions[0].definition || ''}</p>
                    <p id="wodExample">{wordOfTheDay.meanings[0].definitions[0].example || ''}</p>
                    <p id="wodSynonym">{wordOfTheDay.meanings[0].definitions[0].synonyms.length > 0 ? `Synonyms: ${wordOfTheDay.meanings[0].definitions[0].synonyms.join(', ')}` : ''}</p>
                    <p id="wodAntonym">{wordOfTheDay.meanings[0].definitions[0].antonyms.length > 0 ? `Antonyms: ${wordOfTheDay.meanings[0].definitions[0].antonyms.join(', ')}` : ''}</p>
                </div>
            )}

            <div className="container d-flex align-items-start flex-column searchResult" id="result">
                {error && <p>{error}</p>}
                {wordDetails && (
                    <>
                        <div className="d-flex align-items-center justify-content-center">
                            <p className="word" id="word">{wordDetails.word}</p>
                            <p id="audio">
                                <i className="fa fa-volume-up p-1" onClick={() => currentAudio.play()}></i>
                            </p>
                        </div>
                        <p id="pronunciation">{wordDetails.phonetic}</p>
                        <p id="partOfSpeech">{wordDetails.meanings[0].partOfSpeech}</p>
                        <p id="meaning">{wordDetails.meanings[0].definitions[0].definition}</p>
                        <p id="example">{wordDetails.meanings[0].definitions[0].example}</p>
                        <p id="synonym">{wordDetails.meanings[0].definitions[0].synonyms.length > 0 ? `Synonyms: ${wordDetails.meanings[0].definitions[0].synonyms.join(', ')}` : ''}</p>
                        <p id="antonym">{wordDetails.meanings[0].definitions[0].antonyms.length > 0 ? `Antonyms: ${wordDetails.meanings[0].definitions[0].antonyms.join(', ')}` : ''}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Intro;
