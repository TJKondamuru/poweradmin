import React, {useState} from 'react';
import Events from './Events';
import ImageResizer from './ImageResizer';

function SocialGrps()
{
    const gn = (thName, val)=> val==='th'? thName: val;
    return (<Events filename='social-group-entries' savefilename='save-social-group-entries' homepageTitle='home-page-social'
    
    gridcolumns={{heading:val=>gn('Group Name', val), liner:val=>gn('Group Desc', val)}}></Events>);
}

export default SocialGrps;

