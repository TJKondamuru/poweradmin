import React, {useState, useEffect}  from 'react';
import Events from './Events';

function AllMovies(props){
    const gn = (thName, val)=> val==='th'? thName: val;
    return (<Events filename='movies-entries' savefilename='save-movies-entries' homepageTitle='home-page-movies'
    helperText={{'heading':'enter movie name', 'thumb':'enter thumb image', 'liner':'enter theater', 'readmore':'enter address here', 'tags':'enter timings seperated by ;'}}
    gridcolumns={{heading:val=>gn('Movie Name', val), liner:val=>gn('Theater Name', val)}}></Events>);

}

export default AllMovies;