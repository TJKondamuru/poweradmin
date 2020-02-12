import React, {useState, useEffect}  from 'react';
import {nativeImg} from './Electron';
import WireFrame from './WireFrame';
function FileEntries(props)
{
    
    const [highlighted, setHighlighted] = useState({});
    const [files, setFiles] = useState({});

    const filterPredicate = (key, filter)=>{
        if(filter.length === 0) return true;
        let entry = files[key];
        return (entry.name.indexOf(filter) > -1 || entry.token.indexOf(filter) > -1)
    }
    const setEvent = (selection)=>{}
    const refreshList= callback=>{
        nativeImg.ListUploadFiles().then(allfiles=>setFiles(allfiles))
        callback();
    }
    useEffect(()=>refreshList(()=>{}), []);

    const gn = (thName, val)=>{ 
        if(val !== 'th' && thName==='File Name')
            return <a href={val} target="_blank">{val.substring(val.lastIndexOf('/') + 1)}</a>
        return val==='th'? thName: val
    };
    return (
        <WireFrame entries={files} filterPredicate={filterPredicate} setFormobj={setEvent} 
        highlighted={highlighted} customclass="files-grid"
        gridcolumns={{link:val=>gn('File Name', val), size:val=>gn('File Size', val), createTime:val=>gn('File Created', val), token:val=>gn('Token', val)}}
        
        />          
    );
}



export default FileEntries;