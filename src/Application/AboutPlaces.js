import React, {useState} from 'react';
import Events from './Events';
//this is for about places.
function AboutPlaces()
{
    const gn = (thName, val)=> val==='th'? thName: val;
    return (<Events filename='aboutplaces-entries' savefilename='save-aboutplaces-entries' token='about-places'
    gridcolumns={{heading:val=>gn('Site Name', val), liner:val=>gn('Site Desc', val)}} />);
}
export default AboutPlaces; 