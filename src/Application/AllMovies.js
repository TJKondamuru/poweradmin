import React, {useState, useEffect}  from 'react';
import {electronStore} from './Electron';
import WireFrame from './WireFrame';

function AllMovies(props){
    const [highlighted, setHighlighted] = useState({});
    const [movies, setMovies] = useState({});

    const filterPredicate = (key, filter)=>{
        if(filter.length === 0) return true;
        let entry = movies[key];
        return (entry.heading.indexOf(filter) > -1 || entry.theater.indexOf(filter) > -1)
    }

    const setEvent = (selection)=>{}
    const refreshList= callback=>{
        electronStore.listAllMovies().then(allMovies=>setMovies(allMovies))
        callback();
    }
    useEffect(()=>refreshList(()=>{}), []);
    const gn = (thName, val)=>{ 
        if(val !== 'th' && thName==='Show Times')
            return <div>{val.slice(0,2).join('')}</div>
        if(val !== 'th' && thName==='Thumb')
            return <a href={val} target="_blank">poster</a>
        return val==='th'? thName: val
    };
    return (
        <WireFrame entries={movies} filterPredicate={filterPredicate} setFormobj={setEvent} homepageTitle='home-page-movies'
        highlighted={highlighted} customclass="files-grid"
        gridcolumns={{heading:val=>gn('Movie Name', val), thumb:val=>gn('Thumb', val), theater:val=>gn('Theater', val), showtimes1:val=>gn('Show Times', val)}}
        
        />          
    );

}

export default AllMovies;