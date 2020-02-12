import React, {useState, useEffect} from 'react';
import {electronStore} from './Electron';
import WireFrame from './WireFrame';

const defaultaccom = {desc:'', trigger:false, user:'', id:'100', postedon:''};

function Accommodation(props){
    const [highlighted, setHighlighted] = useState({});
    const [selections, setSelections] = useState({"100":defaultaccom});
    const [accommodations, setAccommodations] = useState({});
    
    const clearSelectionHighlights = ()=>{
        setHighlighted({});
        setSelections({"100":defaultaccom});
    }
    const setaccom = (selection)=>{
            setSelections({...selections, [selection.id]:selection})
            setHighlighted({...highlighted, [selection.id]:'table-info'});
    }
    const filterPredicate = (key, filter)=>{
        if(filter.length === 0) return true;
        let entry = accommodations[key];
        return (entry.user.indexOf(filter) > -1 ||   entry.desc.indexOf(filter) > -1)
    }

    const refreshList= callback=>{
        electronStore.accommodations().then(entries=>{
            setAccommodations(entries);
        });
        callback();
    }
    useEffect(()=>refreshList(()=>{}), []);

    const saveAccom= (key, accom, callback)=>{
        const {desc, user, postedon} = accom;
        if(user.length > 0)
        {
            const newobj = {[key]:{desc, user, postedon}};
            electronStore.saveAccommodation({...accommodations, ...newobj}, Object.keys(accommodations).length === 0).then(_=>refreshList(()=>{
                setSelections({...selections, [key]:{...accom, id:key}});
                setHighlighted({...highlighted, [key]:'table-info'});
                callback();
            }));
        }
    }
    const gn = (thName, val)=> val==='th'? thName: val;
    return (
        <WireFrame entries={accommodations} filterPredicate={filterPredicate} setFormobj={setaccom} highlighted={highlighted} 
            deleteEntries={{fn:electronStore.saveAccommodation, rf:()=>refreshList(clearSelectionHighlights)}}
            gridcolumns={{user:val=>gn("Owner Name", val),desc:val=>gn("Accommodation Desc", val)}}
            editcontrol={
                <div className="row mt-4">
                    <button className="btn btn-danger" style={{position:"absolute", right:"10px", top:"0px"}} 
                    onClick={clearSelectionHighlights}>Clear All</button>
                    
                    {Object.keys(selections).map(key=> 
                        <Unit key={key} key1={key} selected={selections[key]} saveAccom={saveAccom} />
                    )}
                </div>
            }
        />
    )
}

function Unit(props){
    const [form, setForm] = useState({...props.selected, trigger:false});
    const {saveAccom} = props;
    const saveUnit = ()=>{
        setSpinner(true);
        saveAccom(form.id === "100" ? +new Date() : form.id, form, ()=>{
            setSpinner(false);
            if(form.id==="100")
                setForm(defaultaccom);
        });
    }
    const[spinner, setSpinner] = useState(false);
    const dt = ()=>{
        let d = new Date(form.id*1);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString();
    }
    return (
        <div className="mb-2 col-3">
            <div className="card ">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item" style={{"padding":"5px"}}>
                        <textarea rows="6" style={{"width":"100%"}} value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})} ></textarea>
                        <div className="input-group mb-1">
                            <input type="text" className="form-control" placeholder="user name" value={form.user} onChange={e=>setForm({...form, user:e.target.value})} />
                            <input type="text" className="form-control" placeholder="date posted" value={form.postedon} onChange={e=>setForm({...form, postedon:e.target.value})} />

                            <div className="input-group-append">
                                <button className={`btn ${form.id !== "100" ? "btn-success" : "btn-info"} btn-sm`} onClick={saveUnit}>
                                {spinner && <span className="spinner-border spinner-border-sm"></span>}Save</button>
                            </div>
                        </div>
                        <p className="text-secondary">{form.id !== "100" ? dt() :"add new entry"}</p>
                    </li>
                </ul>
            </div>
        </div>
    )
}
 export default Accommodation;