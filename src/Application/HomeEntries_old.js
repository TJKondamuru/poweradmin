import React, {useState, useEffect} from 'react';
import {electronStore} from './Electron';
import WireFrame from './WireFrame';

const defaultform = {entrytype : 'home-slide', heading : '', subheading : '', tagline : '', help : '', errtext : '', attach1type : 'link', 
attach1value : '', attach2type : 'link', attach2value : '', desc:'', id:'', trigger:false};


function HomeEntries(props)
{
    const [homeentries, setHomeentries] = useState({});
    const [formobj, setFormobj] = useState(defaultform);
    const [highlighted, setHighlighted] = useState({});
    const setFormobjAndHighlight  = selobj =>{
        
        setFormobj(selobj);
        setHighlighted({[selobj.id]:'table-info'});
    }
    useEffect(()=>{
        electronStore.homeEntries().then(entries=>{
            setHomeentries(entries);
        });
    }, [])
    
    const filterPredicate = (key, filter)=>{
        if(filter.length === 0) return true;
        let entry = homeentries[key];
        return (entry.entrytype.indexOf(filter) > -1 || entry.heading.indexOf(filter) > -1 ||
        entry.subheading.indexOf(filter) > -1 || entry.tagline.indexOf(filter) > -1 ||
        entry.help.indexOf(filter) > -1)
    }
    const SaveEntry=(newobj,callback)=>{
        electronStore.saveHomeEntry(newobj, Object.keys(homeentries).length === 0).then(data=>{
            electronStore.homeEntries().then(entries=>{
                setHomeentries(entries);
                callback();
            });
        });
    }
    const gn = (thName, val)=> val==='th'? thName: val;
    return (
        <WireFrame entries={homeentries} filterPredicate={filterPredicate} setFormobj={setFormobjAndHighlight} highlighted={highlighted}
            gridcolumns={{entrytype:val=>gn('Entry Type', val),heading:val=>gn('Heading', val),
            subheading:val=>gn('Section Name', val), tagline:val=>gn('Caption', val), help:val=>gn('Help', val)}}
            customclass="home-grid"
            editcontrol={<HomeInputForm  selected={formobj} SaveEntry={SaveEntry} setHighlighted={setHighlighted}></HomeInputForm>}
        />
    )

}

 function HomeInputForm(props){
    
    const [form, setForm] = useState({...props.selected, trigger:false});
    const[spinner, setSpinner] = useState(false);
    const cleanup = ()=>{
        setSpinner(false);
        setForm(defaultform);
        props.setHighlighted({});
    };
    const SaveEntry= ()=>{
        
        setForm({...form, trigger:true});
        if(form.heading.length > 0){
            setSpinner(true);
            let newobjId = form.id.length === 0 ? +new Date() : form.id;
            const newobj = {
                [newobjId]:{
                    entrytype:form.entrytype, heading:form.heading, subheading:form.subheading, tagline:form.tagline, 
                    help:form.help, errtext:form.errtext, desc:form.desc, 
                    attach1type:form.attach1type === 'export-file' ? 'link' : form.attach1type, attach1value:form.attach1value, 
                    attach2type:form.attach2type === 'export-file' ? 'link' : form.attach2type, attach2value:form.attach2value
                }
            }
            props.SaveEntry(newobj, ()=>{
                setForm({...newobj[newobjId], trigger:true, id:newobjId});
                setSpinner(false);
            });
        }
    }
    return (
        <div className="row mt-4">
            <div className="col-lg-5 col-md-12">
                <div className="input-group mb-3">
                
                    <div className="input-group-prepend"><span className="input-group-text">Type</span></div>
                    <select className="form-control" value={form.entrytype} onChange={e=>setForm({...form, entrytype:e.target.value})} >
                        <option value="home-slide">home-slide</option>
                        <option value="all-groupon">all-groupon</option>
                        <option value="all-specials">all-specials</option>
                        <option value="all-movies">all-movies</option>
                        <option value="all-social">all-social</option>
                    </select>
                </div>
                <div className="input-group mb-3">
                    <div className="input-group-prepend"><span className="input-group-text">Heading</span></div>
                    <input type="text" className={"form-control " + (form.heading.length === 0 && form.trigger ? " is-invalid" : "")} 
                    placeholder="Main heading" value={form.heading}  onChange={e=>setForm({...form, heading:e.target.value})} />
                    {form.trigger && <div className="invalid-feedback">heading name is required</div>}
                </div>
                
                <div className="input-group mb-3">
                    <div className="input-group-prepend"><span className="input-group-text">Sub Heading</span></div>
                    <input type="text" className="form-control" value={form.subheading} onChange={e=>setForm({...form, subheading:e.target.value})}/>
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend"><span className="input-group-text">Tag Line</span></div>
                    <input type="text" className="form-control" value={form.tagline} onChange={e=>setForm({...form, tagline:e.target.value})} />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend"><span className="input-group-text">Help Text</span></div>
                    <input type="text" className="form-control" value={form.help} onChange={e=>setForm({...form, help:e.target.value})} />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend"><span className="input-group-text">Error Text</span></div>
                    <input type="text" className="form-control" value={form.errtext} onChange={e=>setForm({...form, errtext:e.target.value})}  />
                </div>
                
            </div>
            <div className="col-lg-5 col-md-12">
                <div className="input-group mb-3">
                    <div className="input-group-prepend"><span className="input-group-text">Attach Link 1</span></div>
                    <input type="text" className="form-control" value={form.attach1value} onChange={e=>setForm({...form, attach1value:e.target.value})} />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend"><span className="input-group-text">Attach Link 2</span></div>
                    <input type="text" className="form-control" value={form.attach2value} onChange={e=>setForm({...form, attach2value:e.target.value})} />
                </div>
                <div className="form-group">
                    <label htmlFor="DescText">Topic Desc</label>
                    <textarea className="form-control" id="DescText" rows="3"value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})}></textarea>
                </div>
                <div>
                    <button className="btn btn-outline-primary" onClick={SaveEntry}>
                        {spinner && <span className="spinner-border spinner-border-sm"></span>} 
                        {form.id.length === 0  ? "Add Entry" : "Update Entry"}
                    </button>
                    <button className="btn btn-outline-success ml-2" onClick={cleanup}>Clear</button>
                </div>
            </div>
        </div>
    )

 }   




export default HomeEntries;
