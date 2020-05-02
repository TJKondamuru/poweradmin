import React, {useState, useEffect} from 'react';
import {electronStore} from './Electron';
import WireFrame from './WireFrame';

const defaultComment = {text:'', trigger:false, by:'', id:'100', when:'', postid:''};
function Comments(props){
    const [highlighted, setHighlighted] = useState({});
    const [selections, setSelections] = useState({}); //"100":defaultComment
    const [comments, setComments] = useState({});

    const clearSelectionHighlights = ()=>{
        setHighlighted({});
        setSelections({}); //"100":defaultComment
    }
    const setComment = (selection)=>{
        setSelections({...selections, [selection.id]:selection})
        setHighlighted({...highlighted, [selection.id]:'table-info'});
    }
    const filterPredicate = (key, filter)=>{
        if(filter.length === 0) return true;
        let entry = comments[key];
        return (entry.text.indexOf(filter) > -1 ||   entry.by.indexOf(filter) > -1 || key.indexOf(filter) > -1);
    }
    const refreshList= callback=>{
        electronStore.comments().then(entries=>{
            setComments(entries);
        });
        callback();
    }
    useEffect(()=>refreshList(()=>{}), []);
    const saveComm= (key, comment, callback)=>{
        const {text, by, when} = comment;
        if(by.length > 0)
        {
            const newobj = {[key]:{text, by, when}};
            electronStore.saveComment({...comments, ...newobj}, Object.keys(comments).length === 0).then(_=>refreshList(()=>{
                setSelections({...selections, [key]:{...comment, id:key}});
                setHighlighted({...highlighted, [key]:'table-info'});
                callback();
            }));
        }
    }
    const gn = (thName, val)=> val==='th'? thName: val;
    return (
        <WireFrame entries={comments} filterPredicate={filterPredicate} setFormobj={setComment} highlighted={highlighted} 
            deleteEntries={{fn:electronStore.saveComment, rf:()=>refreshList(clearSelectionHighlights)}} customclass="comment-grid"
            gridcolumns={{by:val=>gn("User Name", val),text:val=>gn("Comment Desc", val)}}
            editcontrol={
                <div className="row mt-4">
                    <button className="btn btn-danger" style={{position:"absolute", right:"10px", top:"0px"}} 
                    onClick={clearSelectionHighlights}>Clear All</button>
                    
                    {Object.keys(selections).map(key=> 
                        <Unit key={key} key1={key} selected={selections[key]} saveComm={saveComm} />
                    )}
                </div>
            }
        />
    )
}

function Unit(props){
    const [form, setForm] = useState({...props.selected, postid:props.key1 === "100" ? "" : props.key1, trigger:false});
    const {saveComm} = props;
    const saveUnit = ()=>{
        setSpinner(true);
        setForm({...form, trigger:true});
        if(form.postid.length > 0)
        {
            let commentid = `comment-${Number(new Date())}-${form.postid}`;
            saveComm(form.id === "100" ? commentid : form.id, form, ()=>{
                setSpinner(false);
                if(form.id==="100")
                    setForm(defaultComment);
            });
        }
    }
    const[spinner, setSpinner] = useState(false);
    return (
        <div className="mb-2 col-3">
            <div className="card ">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item" style={{"padding":"5px"}}>
                        <div className="input-group mb-1">
                            <div className="input-group-prepend"><span className="input-group-text">Id</span></div>
                            <input type="text" className={"form-control " + (form.postid.length === 0 && form.trigger ? " is-invalid" : "")} 
                            value={form.postid} onChange={e=>setForm({...form, postid:e.target.value})} />
                            {form.trigger && <div className="invalid-feedback">post id required.</div>}
                        </div>
                        <textarea rows="6" style={{"width":"100%"}} value={form.text} onChange={e=>setForm({...form, text:e.target.value})} ></textarea>
                        <div className="input-group mb-1">
                            <input type="text" className="form-control" placeholder="user name" value={form.by} onChange={e=>setForm({...form, by:e.target.value})} />
                            <input type="text" className="form-control" placeholder="date posted" value={form.when} onChange={e=>setForm({...form, when:e.target.value})} />

                            <div className="input-group-append">
                                <button className={`btn ${form.id !== "100" ? "btn-success" : "btn-info"} btn-sm`} onClick={saveUnit}>
                                {spinner && <span className="spinner-border spinner-border-sm"></span>}Save</button>
                            </div>
                        </div>
                        <p className="text-secondary">{form.id !== "100" ? form.id :"add new entry"}</p>
                    </li>
                </ul>
            </div>
        </div>
    );
}
export default Comments;