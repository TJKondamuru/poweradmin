import React, {useState, useEffect} from 'react';
import ImageResizer from './ImageResizer';
import OgMatrix from './OgMatrix';
import {electronStore} from './Electron';
import WireFrame from './WireFrame';
import OCRForm from './ocr';

const defaultEvent = {heading:'', liner:'', thumb:'', readmore:'', tags:'', trigger:false, id:'100', eventid:''};

function Events(props){
    
    const [highlighted, setHighlighted] = useState({});
    const [selections, setSelections] = useState({"100":defaultEvent});
    const clearSelectionHighlights = ()=>{
        setHighlighted({});
        setSelections({"100":defaultEvent});
    }
    const [events, setEvents] = useState({});
    const filterPredicate = (key, filter)=>{
        if(key==='post-id') return false;
        if(filter.length === 0) return true;
        let entry = events[key];
        return (entry.heading.indexOf(filter) > -1 || entry.liner.indexOf(filter) > -1)
    }
    const setEvent = (selection)=>{
        setSelections({...selections, [selection.id]:selection})
        setHighlighted({...highlighted, [selection.id]:'table-info'});
    }

    const refreshList= callback=>{
        electronStore.events(props.filename).then(entries=>{
            setEvents(entries);
        });
        callback();
    }
    useEffect(()=>refreshList(()=>{}), []);
    const savePostId = postid=>{
        electronStore.saveEvent(props.filename, props.savefilename, {...events, 'post-id' : postid}, false).then(_=>refreshList(()=>{}));
    }
    const saveEvent= (key, event, callback)=>{
        const {heading, liner, thumb, readmore, tags, eventid} = event;
        if(heading.length > 0 && readmore.length > 0)
        {
            const newobj = {[key]:{heading, liner, thumb, readmore, tags, eventid}};
            electronStore.saveEvent(props.filename, props.savefilename, {...events, ...newobj}, 
                Object.keys(events).length === 0).then(_=>refreshList(()=>{
                setSelections({...selections, [key]:{...event, id:key}});
                setHighlighted({...highlighted, [key]:'table-info'});
                callback();
            }));
        }
    }
    const gn = (thName, val)=> val==='th'? thName: val;
    const gridcolumns = !!props.gridcolumns ? props.gridcolumns : {heading:val=>gn('Heading', val), liner:val=>gn('Event Desc', val)};
    return(
        <>
            <WireFrame entries={events} filterPredicate={filterPredicate} setFormobj={setEvent} headerControl={<HeaderControl token={props.token}/>} 
            highlighted={highlighted} homepageTitle={!!props.homepageTitle ? props.homepageTitle : 'home-page-events'} gridcolumns={gridcolumns} customclass="event-grid"
            deleteEntries={{fn:(obj, isEmpty)=>electronStore.saveEvent(props.filename, props.savefilename,obj,isEmpty), rf:()=>refreshList(clearSelectionHighlights)}}
            editcontrol={
                <div className="row mt-4">
                    
                    <button className="btn btn-danger" style={{position:"absolute", right:"10px", top:"0px"}} 
                        onClick={clearSelectionHighlights}>Clear All</button>

                    {Object.keys(selections).map(key=> 
                        <EventInputForm key={key} key1={key} selected={selections[key]} 
                        saveEvent={saveEvent} helperText={props.helperText || {}} />
                    )}
                </div>
            }
            />  
            <div style={{marginLeft:"10px"}}>
                •	Location is tag that starts with @
                •	Cost is tag that starts with $
                •	Dates start with # 
                •	Special text start with * 
            </div>
        </>
    );

}
function HeaderControl(props){
    const[addons, setAddOns] = useState({resizer:false, og:false, ocr:false});
    return(
        <>
            <div className="mb-3">
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="inlineCheckbox1" checked={addons.resizer} onChange={e=>setAddOns({...addons, resizer:e.target.checked})} />
                        <label className="form-check-label" htmlFor="inlineCheckbox1">Image Resizer</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="inlineCheckbox2" checked={addons.og} onChange={e=>setAddOns({...addons, og:e.target.checked})} />
                        <label className="form-check-label" htmlFor="inlineCheckbox2">Og Matrix</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="inlineCheckbox3" checked={addons.ocr} onChange={e=>setAddOns({...addons, ocr:e.target.checked})}  />
                        <label className="form-check-label" htmlFor="inlineCheckbox3">OCR Text</label>
                    </div>
                </div>
                {addons.resizer && <ImageResizer token={!!props.token ? props.token : 'events'} />}
                {addons.og && <OgMatrix />}
                {addons.ocr && <OCRForm />}
        </>
    );
}
function EventInputForm(props){
    const [form, setForm] = useState({...props.selected, trigger:false});
    
    const saveEvent = ()=>{
        setForm({...form, trigger:true});
        if(form.heading.length > 0 && form.readmore.length > 0){
            setSpinner(true);
            props.saveEvent(form.id === "100" ? +new Date() : form.id, form, ()=>{
                setSpinner(false);
                if(form.id==="100")
                    setForm(defaultEvent);
            });
        }
    }
    const[spinner, setSpinner] = useState(false);
    return (
        <div className="col-md-4">
            <div className="shadow p-3 mb-3 bg-white rounded">
                <div className="input-group mb-2 mt-2">
                    <div className="input-group-prepend"><span className="input-group-text">Id</span></div>
                    <input type="text" value={form.eventid ? form.eventid : ''} onChange={e=>setForm({...form, eventid:e.target.value})} />
                    <div className="input-group-append">
                        <button className="btn btn-small btn-info" onClick={e=>setForm({...form, eventid:Number(new Date())})}>Stamp</button>
                    </div>
                </div>
                <div className="input-group mb-2 mt-2">
                    <div className="input-group-prepend"><span className="input-group-text">Heading</span></div>
                    <input type="text" className={"form-control " + (form.heading.length === 0 && form.trigger ? " is-invalid" : "")}  
                    value={form.heading} onChange={e=>setForm({...form, heading:e.target.value})} />
                    {form.trigger && <div className="invalid-feedback">heading name is required</div>}
                    {props.helperText['heading'] && <p><small className="form-text text-muted">{props.helperText['heading']}</small></p>}
                </div>

                <div className="input-group mb-2">
                    <div className="input-group-prepend"><span className="input-group-text">Liner</span></div>
                    <input type="text" className="form-control" value={form.liner} onChange={e=>setForm({...form, liner:e.target.value})}  />
                    {props.helperText['liner'] && <small className="form-text text-muted">{props.helperText['liner']}</small>}
                </div>
                <div className="input-group mb-2">
                    <div className="input-group-prepend"><span className="input-group-text">Thumb</span></div>
                    <input type="text" className="form-control" value={form.thumb} onChange={e=>setForm({...form, thumb:e.target.value})}  />
                    {props.helperText['thumb'] && <small className="form-text text-muted">{props.helperText['thumb']}</small>}
                </div>

                <div className="input-group mb-2">
                    <div className="input-group-prepend"><span className="input-group-text">Read More</span></div>
                    <input type="text" className={"form-control " + (form.readmore.length === 0 && form.trigger ? " is-invalid" : "")}  
                    value={form.readmore} onChange={e=>setForm({...form, readmore:e.target.value})}  />
                    {form.trigger && <div className="invalid-feedback">read more link is required</div>}
                    {props.helperText['readmore'] && <small className="form-text text-muted">{props.helperText['readmore']}</small>}
                </div>
                <div className="input-group mb-2">
                    <div className="input-group-prepend"><span className="input-group-text">Tags</span></div>
                    <input type="text" className="form-control" value={!form.tags ? '' : form.tags + ''} onChange={e=>setForm({...form, tags:e.target.value})}  />
                    {props.helperText['tags'] && <small className="form-text text-muted">{props.helperText['tags']}</small>}
                </div>
                
                <div>
                    <button className={`btn ${form.id !== "100" ? "btn-success" : "btn-info"} btn-sm`} onClick={saveEvent}>
                    {spinner && <span className="spinner-border spinner-border-sm"></span>}Save</button>
                </div>
            </div>
        </div>
    );
}





export default Events;