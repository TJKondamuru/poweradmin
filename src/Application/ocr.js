import React, {useState} from 'react';
import {nativeImg} from './Electron';
import SpinnerBar from './SpinnerBar'
function OCRForm(props){
    const def = {trigger:false, imagelink:'', ocrLines:[]}
    const [minmode, setMinMode] = useState(true);
    const [spinner, setSpinner] = useState(false);
    const [eventinter,setEventinter] = useState(def);
    const reset = ()=>setEventinter(def);
    
    const getOCR = ()=>{
        setEventinter({...eventinter, trigger:true});
        if(eventinter.imagelink.length > 0)
        {
            setSpinner(true);
            nativeImg.OCRText(eventinter.imagelink).then(lines=>setEventinter({...eventinter, ocrLines: lines}))
            .catch(err=>setEventinter({...eventinter, ocrLines: [err]}))
            .finally(()=>setSpinner(false));
        }
    }
    return(
        <div className="shadow p-3 mb-3 bg-white rounded">
            <legend className="legend mb-2" style={{marginBottom:"-10px"}}>
                <input type="checkbox" checked={minmode} id="chkminmode1" name="chkminmode1" onChange={e=>setMinMode(e.target.checked)}></input> 
                <label htmlFor="chkminmode1" className="ml-1">OCR Text</label>
            </legend>
            {minmode && <div className="row">
                <div className="col-md-6">
                    <div className="input-group mb-2">
                        <div className="input-group-prepend"><span className="input-group-text">Image link</span></div>
                        <input type="text" className={"form-control" + (eventinter.trigger && eventinter.imagelink.length === 0 ? " is-invalid": "")} placeholder="image link"
                         value={eventinter.imagelink}
                         onChange={e=>setEventinter({...eventinter, imagelink:e.target.value.trim()})} />
                        <div className="text-muted valid-feedback"></div>
                        <div className="text-muted invalid-feedback">image link missing</div>
                    </div>
                    <div className="btn-group">
                        <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={()=>getOCR()}>Extract Text</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={()=>reset()}>clear</button>
                    </div>
                    {spinner && <div><SpinnerBar /></div>}
                </div>
                <div className="col-md-6">
                    {eventinter.ocrLines.map((line,index)=><div key={index} className="text-muted">{line}</div>)}
                </div>
            </div>}
        </div>
    );

}
export default OCRForm;