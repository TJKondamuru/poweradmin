import React, {useState, useEffect} from 'react';
import {electronStore} from './Electron';

function HomeEntries(props){
    const [homepageentries, setHomepageentries] = useState({});
    
    const gn = (thName, val)=>{ 
        if(val !== 'th' && thName==='Show Times')
            return <div>{val.slice(0,2).join('')}</div>
        if(val !== 'th' && thName==='Thumb')
            return <a href={val} target="_blank">poster</a>
        return val==='th'? thName: val
    };
    const tabldef = {
        'home-page-coupouns':{customclass:"event-grid", gridcolumns:{heading:val=>gn('Vendor Name', val), liner:val=>gn('Coupon Desc', val)}},
        'home-page-events': {customclass:"event-grid", gridcolumns:{heading:val=>gn('Heading', val), liner:val=>gn('Event Desc', val)}},
        'home-page-movies': {customclass:"files-grid", gridcolumns:{heading:val=>gn('Movie Name', val), thumb:val=>gn('Thumb', val), theater:val=>gn('Theater', val), showtimes1:val=>gn('Show Times', val)}},
        'home-page-articles': {customclass:'', gridcolumns:{heading:val=>gn('Article', val)}},
        'home-page-social' : {customclass:'', gridcolumns:{heading:val=>gn('Group Name', val), liner:val=>gn('Group Desc', val)}} 
    }
    const dt = (key)=>{
        let d = new Date(key*1);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString();
    }
    useEffect(()=>{
        electronStore.homePageEntries().then(entries=>{
            setHomepageentries(entries);
        });
    }, [])
    return (
        <>
        {true && <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="box-content">
                <div style={{width:"99%"}}>
                    <fieldset style={{border: "1px solid #ccc",padding: "10px", marginBottom:"0px"}}>
                        
                        <div className="row">
                            <div className="col-lg-12">
                                {Object.keys(homepageentries).filter(prop=>!!homepageentries[prop].length && homepageentries[prop].length > 0).map(pagekey=>{
                                    let gridcolumns = tabldef[pagekey].gridcolumns;
                                    let customclass = tabldef[pagekey].customclass;
                                    return(
                                        <div className="mt-4" key={pagekey}>
                                            <h4 style={{textTransform:"capitalize"}}>{pagekey}</h4>
                                            <table className={'table table-sm table-striped ' + customclass}>
                                                <thead>
                                                    <tr>
                                                        <th>Created</th>{Object.keys(gridcolumns).map(col=> <th style={{textTransform:"capitalize"}} key={col}>{gridcolumns[col]('th')}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {homepageentries[pagekey].map(entryRow=>{
                                                        
                                                        const {key, entry} = entryRow;
                                                        return (
                                                            <tr key={key} className="wire-tr">
                                                                <td style={{width:"220px"}}>{dt(key)}</td>
                                                                {Object.keys(gridcolumns).map(col=> <td key={key+col}>{gridcolumns[col](entry[col])}</td>)}
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>}
        </>
    );
}
export default HomeEntries;