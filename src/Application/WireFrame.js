import React, {useState, useEffect} from 'react';
import {electronStore} from './Electron';
function WireFrame(props)
{
    const {entries, filterPredicate, setFormobj, gridcolumns, customclass, highlighted, homepageTitle, 
            homepageMap, deleteEntries, savePostId, keymap} = props;
    
    const [mode,setMode] = useState(1);

    const [homeselected, setHomeSelected] = useState([]);
    const[homePage, setHomePage] = useState({})
    
    useEffect(()=>{
        if(!!homepageTitle)
            refreshExportEntries(()=>{});
    }, [])

    const refreshExportEntries = callback=>{
        electronStore.homePageEntries().then(homepage=>{
            setHomePage(homepage);
            const newObj = {};
            if(!!homepage[homepageTitle])
            {
                let keys = homepage[homepageTitle].filter(x=>!!x.entry).map(x=>x.key);
                for(let k = 0; k < keys.length;k++)
                    newObj[keys[k]] = true;
            }
            
            setHomeSelected(newObj);
            callback();
        });
    }

    const exportToHome = (selSet, callback)=>{
        /*const delObj = {}
        delObj.isDelete = true;
        delObj[homepageTitle] = homepageTitle;
        electronStore.saveHomePageEntry(delObj, false).then(()=>{
            
        })*/
        electronStore.saveHomePageEntry({...homePage, [homepageTitle]:selSet}, Object.keys(homePage).length === 0).then(()=>refreshExportEntries(callback));
    }
    

    const loadForm = id=> {
        setFormobj({...entries[id], id});
        //setMode(2);
    }
    
    return (
        <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="box-content">
                <div style={{width:"99%"}}>
                    <fieldset style={{border: "1px solid #ccc",padding: "10px", marginBottom:"0px"}}>
                        <legend className="legend mb-2" style={{marginBottom:"-10px"}}></legend>
                        <div className="row">
                            <div className="col-lg-12">
                                {props.headerControl}
                                <div>
                                    <div className="btn-group">
                                        
                                        <div className="input-group-prepend">
                                            <button className={"btn " + (mode === 2 ? "btn-secondary" : "btn-primary")} onClick={()=>setMode(1)}> 
                                                <i className="fa-icon fa-icon-home"></i> &nbsp;grid
                                            </button>
                                        </div>
                                        
                                        {!!props.editcontrol && <><div className="arrow-line"></div>
                                        <div className="arrow-right"></div>
                                        <div className="input-group-prepend">
                                            <button className={"btn " + (mode === 1 ? "btn-secondary" : "btn-primary")} onClick={()=>setMode(2)}> 
                                                <i className="fa-icon fa-icon-edit"></i>&nbsp; add/edit
                                            </button>
                                        </div></>}

                                    </div>
                                </div>
                                {mode===1 && <FilesGrid docs={entries} loadForm={loadForm} filterPredicate={filterPredicate} gridcolumns={gridcolumns} savePostId={savePostId}
                                    customclass={customclass} highlighted={highlighted} deleteEntries={deleteEntries} homepageMap={homepageMap}
                                    homeselected={homeselected} setHomeSelected={setHomeSelected} homepageTitle={homepageTitle} exportToHome={exportToHome} 
                                    keymap={keymap}></FilesGrid>}
                                {mode===2 && props.editcontrol}
                            </div>
                        </div>
                    </fieldset>
                </div>
          </div>
        </div>
    )
}

function FilesGrid(props){
    const {filterPredicate, docs, loadForm, gridcolumns, customclass, highlighted, keymap,
        homeselected, setHomeSelected, homepageTitle, homepageMap, exportToHome, deleteEntries} = props;
    
    const [delselected, setDelselected] = useState({});
    const [filter, setFilter] = useState('');
    const [grpfilter, setGrpFilter] = useState('');
    const [page_number, setpage_number] = useState(1);
    const [spinner, setSpinner] = useState(false);
    const[postid, setPostId] = useState('');

    const [exportdelete, setExportDelete] = useState(!(!!homepageTitle || !!deleteEntries) ? {exp:false, del:false} : 
                                                     (!!homepageTitle ? {exp:true, del:false} : {exp:false, del:true})); 

    let page_size= 15;
    const filterFn = key =>{
        if(grpfilter.length ===0)
            return filterPredicate(key, filter);
        else{
            if(grpfilter === 'home')
                return homeselected[key] && !!docs[key]
        }
        return true;
    }
    const sortedSet = Object.keys(docs).filter(x=>filterFn(x)).sort((x,y)=>x > y);
    const [buttons, setButtons] = useState(Math.ceil(sortedSet.length/page_size))

    const paginate = (array) => array.slice((page_number -1) * page_size, page_number * page_size)
    
    const saveToHome = ()=>{
        const selSet = Object.keys(homeselected).filter(x=>homeselected[x] && !!docs[x]).map(key=>({key, entry:!!homepageMap ? homepageMap(docs[key]) : docs[key]}));
        setSpinner(true);
        exportToHome(selSet, ()=>setSpinner(false));
    }
    const removeEntries = ()=>{
        const selSet = Object.keys(delselected).filter(x=>delselected[x])
        if(selSet.length > 0)
        {
            setSpinner(true);
            const delObj = {}
            for(let i = 0; i < selSet.length; i++)
            delObj[selSet[i]] = selSet[i];
            delObj.isDelete = true;
            deleteEntries.fn(delObj, false).then(()=>{
                setSpinner(false);
                deleteEntries.rf();
            });
        }
            
    }
    useEffect(()=>{
        //console.log(sortedSet.length);
        setButtons(Math.ceil(sortedSet.length/page_size))
    }, [sortedSet, page_size])

    const dt = (key)=>{
        if(keymap)
            return keymap(key);

        if(isNaN(key))
            return key;
        let d = new Date(key*1);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString();
    }

    return (
        <div className="mt-4">
            <table className={'table table-sm table-striped ' + customclass}>
                <thead>
                    <tr>
                        <th colSpan={Object.keys(gridcolumns).length + 1} style={{textAlign:"left"}}>
                            <div className="btn-group float-left">
                                <div className="input-group mr-3 mb-0">
                                    <div className="input-group-prepend"><span className="input-group-text">Filter</span></div>
                                    <input type="text" className="form-control" value={filter} onChange={e=>{setFilter(e.target.value); setpage_number(1);}}   />
                                </div>
                                <div className="input-group mr-3 mb-0">
                                    <select className="custom-select mr-sm-2" onChange={e=>setGrpFilter(e.target.value)}>
                                        <option selected="">Group Filter</option>
                                        <option value="home">In Home</option>
                                    </select>
                                </div>
                                <nav>
                                    <ul className="pagination mb-0 mr-3">
                                        {[...Array(buttons)].map( (_, i)=>
                                            <li className={page_number === i + 1 ? "page-item active" : "page-item"} key={i+1}>
                                                <span className="page-link" onClick={e=>setpage_number(i + 1)}>{i + 1}</span>
                                            </li>
                                        )}
                                    </ul>
                                </nav>
                                {props.savePostId && <div className="input-group-prepend"><span className="input-group-text">{docs['post-id'] || ''}</span></div>}
                            </div>
                            <div className="float-right">
                                {!!homepageTitle && <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="rdoinline" id="rdoinline1" checked={exportdelete.exp} 
                                     onChange={e=>setExportDelete({...exportdelete, exp:e.target.checked, del:!e.target.checked}) }
                                    />
                                    <label className="form-check-label" htmlFor="rdoinline1">Add to Home Page</label>
                                </div>}
                                {!!deleteEntries && <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="rdoinline" id="rdoinline2"  checked={exportdelete.del} 
                                     onChange={e=>setExportDelete({...exportdelete, del:e.target.checked, exp:!e.target.checked}) }
                                    />
                                    <label className="form-check-label" htmlFor="rdoinline2">Remove Entries</label>
                                </div>}
                                {(exportdelete.exp || exportdelete.del) && <div className="form-check form-check-inline">
                                    <button className="btn btn-secondary" onClick={()=>{
                                        if(exportdelete.exp)
                                            saveToHome();
                                        else
                                            removeEntries();
                                    }}>
                                        {spinner && <span className="spinner-border spinner-border-sm"></span>} Update
                                    </button>
                                </div>}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th>Created</th>{Object.keys(gridcolumns).map(col=> <th style={{textTransform:"capitalize"}} key={col}>{gridcolumns[col]('th')}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(props.docs).length === 0 && <tr><td colSpan="6">No records uploaded yet.</td></tr>}
                    {paginate(sortedSet).map(key=>
                        <tr key={key} onDoubleClick={()=>loadForm(key)} className={!!highlighted[key] ? highlighted[key] : 'wire-tr'}
                            style={{color:!!homeselected[key]?"black":"#6c757d"}}>
                            <td style={{width:"220px"}}>
                                {exportdelete.exp && <input type="checkbox" id={key} name={key} checked={!!homeselected[key]} className="mr-1"
                                    onChange={e=>setHomeSelected({...homeselected, [key]:e.target.checked})} /> 
                                }
                                {exportdelete.del && <input type="checkbox" id={key} name={key} checked={!!delselected[key]} className="mr-1"
                                    onChange={e=>setDelselected({...delselected, [key]:!!homeselected[key] ? false : e.target.checked})} /> 
                                }
                                <label htmlFor={key}>{dt(key)}</label>
                            </td>
                            {Object.keys(gridcolumns).map(col=> <td key={key+col}>{gridcolumns[col](docs[key][col])}</td>)}
                        </tr>
                    )}
                </tbody>
            </table>
            {props.savePostId && <div className="input-group mr-3 mb-0 col-4">
                <div className="input-group-prepend"><span className="input-group-text">Post Id</span></div>
                <input type="text" className="form-control" value={postid} onChange={e=>setPostId(e.target.value)}   />
                <button className="btn btn-sm btn-info" onClick={e=>props.savePostId(postid)}>Update post-id</button>
            </div>}
        </div>
        
    )
 }
 export default WireFrame;


