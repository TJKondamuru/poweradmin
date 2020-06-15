import React, {useState, useEffect} from 'react';
import {electronStore} from './Electron';
import WireFrame from './WireFrame';
const defaultPost = {showinlist:true, visits:0,ip:'',showallfiles:false, premium:false, header:'', postid:'',stamp:0, trigger:false, files:{}};
const axios = require('axios').default;

function Posts(props){
    const [highlighted, setHighlighted] = useState({});
    const [selections, setSelections] = useState({}); //"100":defaultPost
    const [posts, setPosts] = useState({});
    const clearSelectionHighlights = ()=>{
        setHighlighted({});
        setSelections({}); //"100":defaultComment
    }
    const setPost = (selection)=>{
        
        setSelections({[selection.id]:selection})
        setHighlighted({[selection.id]:'table-info'});
    }

    const filterPredicate = (key, filter)=>{
        if(filter.length === 0) return true;
        let entry = posts[key];
        return (entry.header.indexOf(filter) > -1 || entry.owner.indexOf(filter) > -1);
    }
    const refreshList= callback=>{
        electronStore.posts().then(entries=>{
            setPosts(entries);
        });
        callback();
    }
    useEffect(()=>refreshList(()=>{}), []);
    const savePost= (key, post, callback)=>{
        const {showinlist, visits, showallfiles, premium, files, ip, owner} = post;
        debugger;
        if(!isNaN(visits))
        {
            const updtobj = {[`${key}.files`]:files, [`${key}.ip`]:ip, [`${key}.owner`]:owner, [`${key}.showinlist`]:showinlist,[`${key}.visits`]:visits,[`${key}.showallfiles`]:showallfiles, [`${key}.premium`]:premium};
            electronStore.savePosts(updtobj, Object.keys(posts).length === 0).then(_=>refreshList(()=>{
                setSelections({...selections, [key]:{...post, id:key}});
                setHighlighted({...highlighted, [key]:'table-info'});
                callback();
            }));
        }
    }
    const gn = (thName, val)=> val==='th'? thName: val;
    return (
        <WireFrame entries={posts} filterPredicate={filterPredicate} setFormobj={setPost} highlighted={highlighted} 
            deleteEntries={{fn:electronStore.savePosts, rf:()=>refreshList(clearSelectionHighlights)}} customclass="comment-grid"
            gridcolumns={{header:val=>gn("Post Header", val),visits:val=>gn("Visits", val), owner:val=>gn("Secret", val)}}
            headerControl={<HeaderControl />}
            editcontrol={
                <div className="row mt-4">
                    <button className="btn btn-danger" style={{position:"absolute", right:"10px", top:"0px"}} 
                    onClick={clearSelectionHighlights}>Clear All</button>
                    
                    {Object.keys(selections).map(key=> 
                        <Unit key={key} key1={key} selected={selections[key]} savePost={savePost} />
                    )}
                </div>
            }
        />
    );
}
function Unit(props){
    const [form, setForm] = useState({...props.selected, trigger:false});
    const {savePost} = props;
    const[spinner, setSpinner] = useState(false);
    const[uspinner, setUspinner] = useState(false);
    
    const cloneFilesList = (linklist)=>{
        let keys = Object.keys(form.files);
        let linkKeys = Object.keys(linklist);
        let cloneObj = {};
        for(let i = 0; i < keys.length; i++){
            if(form.files[keys[i]].status === 'New' && !form.files[keys[i]].active)
                continue;
            if(form.files[keys[i]].status === 'New' && form.files[keys[i]].active){
                let matchlink = linkKeys.find(x=>x.indexOf(keys[i]) > -1);    

                cloneObj[keys[i]] = {...form.files[keys[i]], status:'Upload', link:linklist[matchlink]};
                delete cloneObj[keys[i]].blob;
            }
            else
                cloneObj[keys[i]] = {...form.files[keys[i]]};
        }
        return cloneObj;
    }
    const UploadAllFiles = ()=> {
        const formData = new FormData();
        let noempty = false;
        let aryKeys = Object.keys(form.files);
        for(let i = 0; i < aryKeys.length; i++){
            if(form.files[aryKeys[i]].active && form.files[aryKeys[i]].status === 'New'){
                formData.append(form.files[aryKeys[i]].name, form.files[aryKeys[i]].blob);
                noempty = true;
            }
        }
        if(noempty)
        {
            setUspinner(true);
            fetch('https://us-central1-burghindian.cloudfunctions.net/upLoadFiles', {body:formData, method:'POST'})
            .then(response=>response.json())
            .then(data=>{
                
                let newObj = cloneFilesList(data.uploadfiles);
                setForm({...form, files: newObj});
                
            }).catch(err=>{
                debugger;
            }).finally(_=>{
                setUspinner(false);
            });
        }
    }
    const UplodFileChange = (key, props) =>{
        let fileobj = form.files[key];
        setForm({...form, files: {...form.files, [key]:{...fileobj, ...props}}});
    }
    const SelecUploadFiles = list =>{
        let obj = {};
        for(let i = 0; i < list.length; i++)
            obj[list[i].name] = {name:list[i].name, link:'', blob:list[i], size:list[i].size, active:true, status:'New', stamp:Number(new Date())};
        setForm({...form, files: {...form.files, ...obj}});
    };
    const saveUnit = ()=>{
        if(!isNaN(form.visits))
        {
            setSpinner(true);
            savePost(form.id, form, ()=>{
                setSpinner(false);
            });
        }
    }
    const dt = (key)=>{
        let d = new Date(key*1);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString();
    }
    return (
        <>
            <div className="mb-2 col-4">
                <div className="card">
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <div className="input-group mb-1">
                                <div className="input-group-prepend"><span className="input-group-text">Header</span></div>
                                <textarea className="form-control" value={form.header} readOnly></textarea>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <div className="input-group mb-1">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Show in List</span>
                                    <div className="input-group-text"><input type="checkbox" checked={!!form.showinlist} onChange={e=>setForm({...form, showinlist:e.target.checked})} /></div>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <div className="input-group mb-1">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Show All files</span>
                                    <div className="input-group-text"><input type="checkbox" checked={!!form.showallfiles} onChange={e=>setForm({...form, showallfiles:e.target.checked})} /></div>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <div className="input-group mb-1">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Premium</span>
                                    <div className="input-group-text"><input type="checkbox" checked={!!form.premium} onChange={e=>setForm({...form, premium:e.target.checked})} /></div>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <div className="input-group mb-1">
                                <div className="input-group-prepend"><span className="input-group-text">visits</span></div>
                                <input type="text" value={form.visits} onChange={e=>setForm({...form, visits:e.target.value})} style={{'textAlign':'center', 'width':'40px'}}  />
                            </div>
                        </li>
                        <li className="list-group-item">
                            <div className="input-group mb-1">
                                <div className="input-group-prepend"><span className="input-group-text">ip</span></div>
                                <input type="text" value={!form.ip ? '' : form.ip} onChange={e=>setForm({...form, ip:e.target.value})} style={{'textAlign':'center', 'width':'140px'}}  />
                            </div>
                        </li>
                        <li className="list-group-item">
                            <div className="input-group mb-1">
                                <div className="input-group-prepend"><span className="input-group-text">Secret</span></div>
                                <input type="text" value={!form.owner ? '' : form.owner} onChange={e=>setForm({...form, owner:e.target.value})} style={{'textAlign':'center', 'width':'240px'}}  />
                            </div>
                        </li>
                        <li className="list-group-item"><b>{dt(form.stamp)}</b></li>
                        <li className="list-group-item">
                            <button className="btn-info btn-sm" onClick={saveUnit}>{spinner && <span className="spinner-border spinner-border-sm"></span>}Save</button>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mb-2 col-6">
                <div className="card">
                    <ul className="list-group list-group-flush">
                        <li  className="list-group-item">
                            <div className="input-group mb-1">
                                <div className="input-group-prepend"><span className="input-group-text">upload files</span></div>
                                <input type="file" id="fileupload" onChange={e=>SelecUploadFiles(e.target.files)} multiple="multiple" />
                            </div>
                        </li>
                        <li className="list-group-item">
                            <table className="table table-sm table-striped">
                                <thead>
                                    <tr><th></th><th>status</th><th>Name</th></tr>
                                </thead>
                                <tbody>
                                    {form.files && Object.keys(form.files).map(key=><tr key={key} style={{'opacity': form.files[key].active ? '1' :'.5' }}>
                                        <td><input type="checkbox" checked={form.files[key].active} onChange={e=>UplodFileChange(key, {active:e.target.checked})} ></input></td>
                                        <td>{form.files[key].status}</td>
                                        <td>
                                            {form.files[key].link && <a href={form.files[key].link} target="_blank">{form.files[key].name}</a>}
                                            {!form.files[key].link && <span>{form.files[key].name}</span>}
                                        </td>
                                    </tr>)}
                                    <tr>
                                        <td colSpan="3">
                                            <button className="btn btn-sm btn-info" onClick={e=>UploadAllFiles()}>
                                                {uspinner && <span className="spinner-border spinner-border-sm"></span>} Upload Files
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}

function HeaderControl(props){
    let def={header:'', trigger:false, postid:'', overrideid:''};
    const[spinner, setSpinner] = useState(false);
    const[form,setForm] = useState(def);
    const clearpost=()=>{
        setForm(def);
    }
    const savepost=()=>{
        setForm({...form, trigger:true});
        if(form.header.length > 0){
            setSpinner(true);
            let data = {header:form.header,owner:'ADMIN SDK', overrideid:form.overrideid, post:'alias post'};
            axios.post('https://us-central1-burghindian.cloudfunctions.net/createPost', data)
            .then(postjson=>{
                debugger;
                setForm({...form, trigger:false, postid:postjson.data.postid});
                setSpinner(false);
            }).catch(reason=>{
                console.log(reason);
                setSpinner(false);
            });
               
        }
    }
    const[addons, setAddOns] = useState({formcreate:false});
    return(
        <div className="col-6">

            <div className="mb-3">
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="inlineCheckbox1" checked={addons.resizer} 
                    onChange={e=>setAddOns({...addons, formcreate:e.target.checked})} />
                    <label className="form-check-label" htmlFor="inlineCheckbox1">Create Post</label>
                </div>
            </div>
            {addons.formcreate && <div className="mb-3">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <div className="input-group mb-1">
                            <div className="input-group-prepend"><span className="input-group-text">Post Id</span></div>
                            <input type="text" className="form-control" value={form.overrideid} 
                             onChange={e=>setForm({...form, overrideid:e.target.value})}></input>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <div className="input-group mb-1">
                            <div className="input-group-prepend"><span className="input-group-text">Header</span></div>
                            <input type="text"  className={"form-control " + (form.header.length === 0 && form.trigger ? " is-invalid" : "")}
                            value={form.header} onChange={e=>setForm({...form, header:e.target.value})}></input>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <button  onClick={e=>savepost()} className="btn-info btn-sm">{spinner && <span className="spinner-border spinner-border-sm"></span>}Create</button>
                        <button  onClick={e=>clearpost()} className="btn-danger btn-sm ml-1">Clear</button>
                    </li>
                    
                    {form.postid.length > 0 && <li className="list-group-item">
                        <div className="alert alert-secondary">{form.postid}</div>
                    </li>}
                </ul>
            </div>}
        </div>
    );
}
export default Posts;