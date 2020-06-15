import React, {useState, useEffect} from 'react';
import { Editor} from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromRaw} from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {electronStore} from './Electron';
import ImageResizer from './ImageResizer';
import WireFrame from './WireFrame';

const defaultArticle = {heading:'', article:'', id:'', liner:'', postid:''}

function Articles(props){
    const [highlighted, setHighlighted] = useState({});
    const [selectedArticle, setSelectedArticle] = useState(defaultArticle);
    const [articles, setArticles] = useState({});
    const setArticle = (selection)=>{
        setSelectedArticle(selection);
        setHighlighted({[selection.id]:'table-info'});
    }
    const clearHighlighted = ()=>{
        setHighlighted({});
        setSelectedArticle(defaultArticle);
    }
    const filterPredicate = (key, filter)=>{
        if(filter.length === 0) return true;
        let entry = articles[key];
        return (entry.heading.indexOf(filter) > -1)
    }
    const refreshList= callback=>{
        electronStore.articles().then(articles=>{
            debugger;
            setArticles(articles)
        
        });
        callback();
    }
    useEffect(()=>refreshList(()=>{}), []);
    const gn = (thName, val)=> val==='th'? thName: val;
    
    const saveArticle= (key, articleform, callback)=>{
        const {heading, article, liner, postid} = articleform
        const newobj = {[key]:{heading, article, liner, postid}};
            electronStore.saveArticles({...articles, ...newobj}, 
                Object.keys(articles).length === 0).then(_=>refreshList(()=>{
                setHighlighted({[key]:'table-info'});
                setSelectedArticle({...articleform, id:key})
                callback();
            }));
    }
    return(
        <WireFrame entries={articles} filterPredicate={filterPredicate} setFormobj={setArticle} 
        homepageTitle='home-page-articles' homepageMap = {x=>({heading:x.heading, liner:x.liner, postid:x.postid})}
        highlighted={highlighted} headerControl={<HeaderControl />}
        gridcolumns={{heading:val=>gn('Article', val)}}
        editcontrol={<ActicleInputForm selected={selectedArticle} saveArticle={saveArticle} clearHighlighted={clearHighlighted} />}
        />  
    );

}
function HeaderControl(props){
    const[addons, setAddOns] = useState({resizer:false, og:false, ocr:false});
    return(
        <>
            <div className="mb-3">
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="inlineCheckbox1" checked={addons.resizer} 
                        onChange={e=>setAddOns({...addons, resizer:e.target.checked})} />
                        <label className="form-check-label" htmlFor="inlineCheckbox1">Image Resizer</label>
                    </div>
            </div>
            {addons.resizer && <ImageResizer />}
        </>
    );
}
function ActicleInputForm(props){
    const {selected, saveArticle, clearHighlighted} = props;
    const[spinner, setSpinner] = useState(false);
    const[readonly, setReadOnly] = useState(false)
    const [form, setForm] = useState({...selected, trigger:false});//
    const [wygState, setwygState] = useState(form.article.length === 0 ? EditorState.createEmpty() :  EditorState.createWithContent(convertFromRaw(JSON.parse(form.article))));
    const getFileBase64 = (file, callback) => {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        // Since FileReader is asynchronous,
        // we need to pass data back.
        reader.onload = () => callback(reader.result);
        // TODO: catch an error
        reader.onerror = error => {};
    };
      
    const imageUploadCallback = file => new Promise(
        (resolve, reject) => getFileBase64(file, data => resolve({ data: { link: data } }))
    );

    const editorStateChg = newstate=>{
        setwygState(newstate);
        //setForm({...form, article:JSON.stringify(convertToRaw(wygState.getCurrentContent()))});
    }
    const cleanup= ()=>{
        setSpinner(false);
        setForm(defaultArticle);
        clearHighlighted();
        setwygState(EditorState.createEmpty())
    };
    const saveArticleForm = ()=>{
        let articleText = JSON.stringify(convertToRaw(wygState.getCurrentContent()));
        setForm({...form, trigger:true, article:articleText});
        if(form.heading.length > 0 && form.liner && form.liner.length > 0 && form.postid && form.postid.length > 0)
        {
            setSpinner(true);
            let keyid = form.id === '' ? +new Date() : form.id;
            saveArticle(keyid, {...form, article:articleText}, ()=>{
                setSpinner(false);
                setForm({...form, id:keyid});
            });
        }
    }
    return (
        <>
        <div className="row mt-3">
            <div className="col-lg-4">
                <div className="shadow p-3 mb-3 bg-white rounded">
                    <div className="input-group mb-2 mt-2">
                        <div className="input-group-prepend"><span className="input-group-text">Heading</span></div>
                        <input type="text" className={"form-control " + (form.heading.length === 0 && form.trigger ? " is-invalid" : "")}  
                        value={form.heading} onChange={e=>setForm({...form, heading:e.target.value})} />
                        {form.trigger && <div className="invalid-feedback">heading is required</div>}
                    </div>
                    <div className="input-group mb-2 mt-2">
                        <div className="input-group-prepend"><span className="input-group-text">Liner</span></div>
                        <input type="text" className={"form-control " + ((!form.liner || form.liner.length === 0) && form.trigger ? " is-invalid" : "")}  
                        value={!!form.liner ? form.liner : ""} onChange={e=>setForm({...form, liner:e.target.value})} />
                        {form.trigger && <div className="invalid-feedback">liner is required</div>}
                    </div>
                    <div className="input-group mb-2 mt-2">
                        <div className="input-group-prepend"><span className="input-group-text">postid</span></div>
                        <input type="text" className={"form-control " + ((!form.postid || form.postid.length === 0) && form.trigger ? " is-invalid" : "")}  
                        value={!!form.postid ? form.postid : ""} onChange={e=>setForm({...form, postid:e.target.value})} />
                        {form.trigger && <div className="invalid-feedback">postid is required</div>}
                    </div>
                    <div className="btn-group-lg">
                        <button className="btn-sm btn-outline-primary" onClick={saveArticleForm}>
                                {spinner && <span className="spinner-border spinner-border-sm"></span>} 
                                {form.id.length === 0  ? "Add Article" : "Update Article"}
                        </button>
                        <button className="btn-sm btn-outline-success ml-2" onClick={cleanup}>Clear</button>
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col-11">
                <div className="input-group mb-1">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Readonly</span>
                        <div className="input-group-text"><input type="checkbox" checked={readonly} onChange={e=>setReadOnly(e.target.checked)} /></div>
                    </div>
                </div>

                <Editor editorState={wygState} wrapperClassName="card" editorClassName="card-body wysiwyg editor-images" readOnly={readonly} toolbarHidden={readonly}
                onEditorStateChange={editorStateChg} toolbar={{image: {uploadCallback: imageUploadCallback,previewImage: true}}}  />
            </div>
        </div>
        </>
    )
}
export default Articles;