import React, {useState} from 'react';
import {nativeImg} from './Electron';
import SpinnerBar from './SpinnerBar'

function ImageResizer(props)
{
    const [minmode, setMinMode] = useState(true);
    const def = {url:'', type:'', size:0, filename:'', trigger:false, err:null, res:'', basename:''}
    const deff = {normalize:false, ArticleImg:false, slide:false, thumb:false, quality:100, galleryThumb:false};
    const adjdef = {size:0, filename:'', res:'',  basename:''};
    const [optmizer, setOptimizer] = useState(deff);
    
    const [cloudLiners, setCloudLines] = useState([]);
    const [handle, setHandle] = useState('')

    const [imginter,setImginter] = useState(def);
    const [adjimg, setAdjImg] = useState(adjdef);

    const [spinner, setSpinner] = useState(false);
    const reset = ()=>{
        setImginter(def);
        setSpinner(false);
    }
    const validInd = ()=> {
        if(imginter.filename.length > 0) return 'is-valid';
        if(imginter.trigger && imginter.url.length === 0) return 'is-invalid';
        return '';
    }
    const uploadFile = (filepath)=>{
        setSpinner(true);
        nativeImg.UploadFile(filepath, handle, {token:!!props.token ? props.token : 'default'}).then(url=>{
            cloudLiners.push({url, filepath})
            setCloudLines(cloudLiners);
        }).finally(()=>setSpinner(false));
    }

    const adjustImg = ()=>{
        if(imginter.filename.length === 0)
            return;

        const options = {}
        let quality = optmizer.quality;
        if(optmizer.normalize){
            options['width'] = 600;
            options['quality']='better';
            quality = 85;
        }
        if(optmizer.ArticleImg){
            delete options['width'];
            options['height'] = 600;
        }
        if(optmizer.slide){
            options['width'] = 800;
            options['height'] = 600;
        }
        if(optmizer.thumb){
            options['width'] = 160;
            options['height'] = 160;
        }
        if(optmizer.galleryThumb){
            delete options['width'];
            delete options['height'];
            options['width'] = 255;
            options['height'] = 180;
        }
        nativeImg.adjustImg(imginter.filename, options, quality).then(res=>{
            if(res.err)
                setAdjImg({...adjimg, filename:res.err, size:0, res:'na', basename:''});
            else
                setAdjImg({...adjimg, filename:res.filename, size:res.size, res:res.res, basename:res.basename});
        }).catch(err=>{
            setAdjImg({...adjimg, filename:err});
         }).finally(()=>setSpinner(false));
    }
    
    const captureImg = (type, skipvalidation=false)=>{
        setImginter({...imginter, trigger:true});
        if(imginter.url.length > 0 || skipvalidation){
            setSpinner(true);
            nativeImg.makeImg(imginter.url, type).then(res=>{
                setImginter({...imginter, filename:res.filename, size:res.size, res:res.res, basename:res.basename})
            })
            .catch(err=>{
                setImginter({...imginter, err:err})
            }).finally(()=>setSpinner(false));
        }
    }
    return(
        <div className="shadow p-3 mb-3 bg-white rounded">
            <legend className="legend mb-2" style={{marginBottom:"-10px"}}>
                <input type="checkbox" checked={minmode} id="chkminmode" name="chkminmode" onChange={e=>setMinMode(e.target.checked)}></input> 
                <label htmlFor="chkminmode" className="ml-1">image interface</label>
            </legend>
            {minmode && <div className="row">
                <div className="col-md-6">
                    <div className="input-group mb-2">
                        <div className="input-group-prepend">
                            {imginter.filename.length === 0 && <span className="input-group-text">Image link</span>}
                            {imginter.filename.length > 0 && <span className="input-group-text"><a target="_blank" href={imginter.filename}>Image link</a></span>}
                        </div>
                        {imginter.filename.length === 0 && <input type="text" className={'form-control ' + validInd()} placeholder="image link" value={imginter.url} 
                            onChange={e=>setImginter({...imginter, url:e.target.value})} />}
                        
                        {imginter.filename.length > 0 && <input type="text" className="form-control is-valid" defaultValue={imginter.filename} readOnly={true} />}
                        <div className="text-muted valid-feedback">file size: {imginter.size}, res: {imginter.res}</div>
                        <div className="text-muted invalid-feedback">input value missing</div>
                    </div>
                    <div>
                        {imginter.filename.length === 0 && false && 
                        <div className="btn-group mr-2">
                            <button type="button" className="btn btn-secondary btn-sm" onClick={()=>captureImg('path')}>local</button>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={()=>captureImg('url')}>link</button>
                            
                            <button type="button" className="btn btn-secondary btn-sm" onClick={()=>captureImg('base64')}>base64</button>
                        </div>}
                        {imginter.filename.length === 0 && <div className="btn-group mr-2">
                            <button type="button" className="btn btn-secondary btn-sm" onClick={()=>captureImg('clip', true)}>clip</button>
                        </div>}
                        <div className="btn-group mr-2">
                            <button type="button" className="btn btn-secondary btn-sm" onClick={()=>reset()}>clear</button>
                            {spinner && <div><SpinnerBar /></div>}
                        </div>
                    </div>
                    
                </div>
                
                <div className="col-md-6">
                    <table className="table table-sm table-bordered">
                        {imginter.filename.length > 0 && 
                        <caption>
                            <span>
                                <div className="btn-group mt-2">
                                    <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={()=>adjustImg()}>Adjust</button>
                                    <div className="input-group">
                                        <div className="input-group-prepend"><span className="input-group-text">upload handle</span></div>
                                        <input type="text" className="form-control" value={handle} onChange={e=>setHandle(e.target.value)}/>
                                    </div>

                                    <button type="button" className="btn btn-info btn-sm ml-1" onClick={()=>uploadFile(imginter.filename)}>raw</button>
                                    <button type="button" className="btn btn-info btn-sm ml-1" onClick={()=>uploadFile(adjimg.filename)}>resized</button>
                                    <button type="button" className="btn btn-info btn-sm ml-1" onClick={()=>uploadFile(handle)}>external</button>
                                </div>
                            </span>
                            <p>
                                {adjimg.filename.length > 0 && <span><a href={adjimg.filename} target="_blank">{adjimg.basename}</a>&nbsp;</span>} 
                                {adjimg.filename.length > 0 && <span className="text-muted">file size: {adjimg.size}, res: {adjimg.res}</span>}
                            </p>
                        </caption>}
                        <thead><tr className="table-success"><th colSpan="3">image options</th></tr></thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="form-check" style={{marginTop:"10px"}}>
                                        <input type="checkbox" className="form-check-input" id="normalize" checked={optmizer.normalize} 
                                        onChange={e=>setOptimizer({...optmizer, normalize:e.target.checked})}/>
                                        <label className="form-check-label" htmlFor="normalize">Normalize</label>
                                    </div>
                                </td>
                                <td>
                                    <div className="form-check" style={{marginTop:"10px"}}>
                                        <input type="checkbox" className="form-check-input" id="slideimage" checked={optmizer.ArticleImg} 
                                        onChange={e=>setOptimizer({...optmizer, ArticleImg:e.target.checked})}/>
                                        <label className="form-check-label" htmlFor="slideimage">Article Image</label>
                                    </div>
                                </td>
                                <td>
                                    <div className="form-check" style={{marginTop:"10px"}}>
                                        <input type="checkbox" className="form-check-input" id="homeslide" checked={optmizer.slide} 
                                        onChange={e=>setOptimizer({...optmizer, slide:e.target.checked})}/>
                                        <label className="form-check-label" htmlFor="homeslide">Homepage slide</label>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="form-check" style={{marginTop:"10px"}}>
                                        <input type="checkbox" className="form-check-input" id="thumb" checked={optmizer.thumb} 
                                        onChange={e=>setOptimizer({...optmizer, thumb:e.target.checked})}/>
                                        <label className="form-check-label" htmlFor="thumb">Thumb</label>
                                    </div>
                                </td>
                                <td>
                                    <div className="form-check" style={{marginTop:"10px"}}>
                                        <input type="checkbox" className="form-check-input" id="gthumb" checked={optmizer.galleryThumb} 
                                        onChange={e=>setOptimizer({...optmizer, galleryThumb:e.target.checked})}/>
                                        <label className="form-check-label" htmlFor="gthumb">Gallery Thumb</label>
                                    </div>
                                </td>
                                <td>
                                    <select className="form-control" value={optmizer.quality} style={{width:"200px"}}
                                        onChange={e=>setOptimizer({...optmizer, quality:e.target.value})} >
                                        <option value="100">100% Quality</option>
                                        <option value="90">90% Quality</option>
                                        <option value="80">80% Quality</option>
                                        <option value="60">60% Quality</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>}
            {cloudLiners.map((line,index)=>
                <div key={index}>
                    <div className="btn-group">
                        <div className="text-muted">{line.url} &nbsp; </div>
                        <div><a href={line.url} target="_blank">link</a></div>
                    </div>
                </div>
            )}
            {imginter.err != null && <div className="alert-danger alert">{imginter.err}</div>}
        </div>
    );
}
export default ImageResizer;