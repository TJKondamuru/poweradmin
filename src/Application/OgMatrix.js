import React, {useState} from 'react';
import {nativeImg} from './Electron';
import SpinnerBar from './SpinnerBar'
function OgMatrix(props){
    const def = {eventlink:'', title:'', oneliner:'', trigger:false, imagelink:'', postlink:''}
    const [minmode, setMinMode] = useState(true);
    const [spinner, setSpinner] = useState(false);
    const [eventinter,setEventinter] = useState(def);
    const reset = ()=>setEventinter(def);
    const getOgTags = ()=>{
        setEventinter({...eventinter, trigger:true});
        if(eventinter.eventlink.length > 0)
        {
            setSpinner(true);
            nativeImg.OgMarkers(eventinter.eventlink).then(ogref=>{
                debugger;
                if(ogref.success)
                    setEventinter({...eventinter, title:ogref.data.ogTitle, oneliner:ogref.data.ogDescription, postlink:ogref.data.ogUrl,
                    imagelink:ogref.data.ogImage.url}) 
            })
            .catch(err=>setEventinter({...eventinter, title:err}))
            .finally(()=>setSpinner(false));
        }
    }
    return(
        <div className="shadow p-3 mb-3 bg-white rounded">
            <legend className="legend mb-2" style={{marginBottom:"-10px"}}>
                <input type="checkbox" checked={minmode} id="chkminmode1" name="chkminmode1" onChange={e=>setMinMode(e.target.checked)}></input> 
                <label htmlFor="chkminmode1" className="ml-1">Og Tags</label>
            </legend>
            {minmode && <div className="row">
                <div className="col-md-8">
                    <div className="input-group mb-2">
                        <div className="input-group-prepend"><span className="input-group-text">Event link</span></div>
                        <input type="text" className={"form-control" + (eventinter.trigger && eventinter.eventlink.length === 0 ? " is-invalid": "")} placeholder="event link" value={eventinter.eventlink}
                         onChange={e=>setEventinter({...eventinter, eventlink:e.target.value})} />
                        <div className="text-muted valid-feedback"></div>
                        <div className="text-muted invalid-feedback">event link missing</div>
                    </div>
                    <div className="input-group mb-2">
                        <div className="input-group-prepend"><span className="input-group-text">Title</span></div>
                        <input type="text" className="form-control" value={eventinter.title} 
                        onChange={e=>setEventinter({...eventinter, title:e.target.value})}/>
                    </div>
                    <div className="input-group mb-2">
                        <div className="input-group-prepend"><span className="input-group-text">One liner</span></div>
                        <input type="text" className="form-control" value={eventinter.oneliner} 
                        onChange={e=>setEventinter({...eventinter, oneliner:e.target.value})}/>
                    </div>
                    <div className="input-group mb-2">
                        <div className="input-group-prepend">
                            {eventinter.imagelink.length === 0 && <span className="input-group-text">Image link</span>}
                            {eventinter.imagelink.length > 0 && <span className="input-group-text"><a href={eventinter.imagelink} target="_blank">Image link</a></span>}
                        </div>
                        <input type="text" className="form-control" value={eventinter.imagelink} 
                        onChange={e=>setEventinter({...eventinter, imagelink:e.target.value})}/>
                    </div>
                    <div className="input-group mb-2">
                        <div className="input-group-prepend"><span className="input-group-text">Post link</span></div>
                        <input type="text" className="form-control" value={eventinter.postlink} 
                        onChange={e=>setEventinter({...eventinter, postlink:e.target.value})}/>
                    </div>
                    <div className="btn-group">
                        <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={()=>getOgTags()}>Og Tags</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={()=>reset()}>clear</button>
                    </div>
                    {spinner && <div><SpinnerBar /></div>}
                </div>
            </div>}
        </div>
    )
}

export default OgMatrix;