import React, {useState, useEffect} from 'react';
import WireFrame from './WireFrame';
import ImageResizer from './ImageResizer';
import {electronStore} from './Electron';

const defaultform = {images:[], trigger:false, id:'', name:'', desc:''};

function Gallery(props){
    const [highlighted, setHighlighted] = useState({});
    const [galleries, setGalleries] = useState({});
    
    const clearSelectionHighlights = ()=>{
        setHighlighted({});
        setSelectedGallery(defaultform);
    }

    const [selectedGallery, setSelectedGallery] = useState(defaultform);
    const setGallery = (selection)=>{
        setSelectedGallery(selection);
        setHighlighted({[selection.id]:'table-info'});
    }
    const clearHighlighted = ()=>{
        setHighlighted({});
        setSelectedGallery(defaultform);
    }
    const filterPredicate = (key, filter)=>{
        if(filter.length === 0) return true;
        let entry = galleries[key];
        return (entry.name.indexOf(filter) > -1 ||   entry.desc.indexOf(filter) > -1)
    }
    const saveGallery= (key, gallery, callback)=>{
        const {name, desc, images} = gallery
        const newobj = {[key]:{name, desc, images}};
            electronStore.saveGallary({...galleries, ...newobj}, 
                Object.keys(galleries).length === 0).then(_=>refreshList(()=>{
                setHighlighted({[key]:'table-info'});
                setSelectedGallery({...gallery, id:key})
                callback();
            }));
    }
    const refreshList= callback=>{
        electronStore.gallaries().then(gallaries=>{
            setGalleries(gallaries);
        });
        callback();
    }
    useEffect(()=>refreshList(()=>{}), []);
    const gn = (thName, val)=> val==='th'? thName: val;
    return(
        <WireFrame entries={galleries} filterPredicate={filterPredicate} setFormobj={setGallery} 
        highlighted={highlighted} headerControl={<HeaderControl />}
        gridcolumns={{name:val=>gn('Gallery Name', val), desc:val=>gn('Gallery Desc', val), images:val=>val==='th' ? 'Image Count' : val.length}}
        deleteEntries={{fn:electronStore.saveGallary, rf:()=>refreshList(clearSelectionHighlights)}}
        customclassName="home-grid"
        editcontrol={<GalleryInputForm selected={selectedGallery} saveGallery={saveGallery} clearHighlighted={clearHighlighted} />}
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
            {addons.resizer && <ImageResizer token='gallery-images' />}
        </>
    );
}
function GalleryInputForm(props)
{
    const {selected, saveGallery, clearHighlighted} = props;
    const [form, setForm] = useState(selected);
    const [imageform, setImageForm] = useState({thumb:'', link:'', trigger:false});
    const[spinner, setSpinner] = useState(false);
    const[spinnerImage, setSpinnerImage] = useState(false);
    const [delImages,setdelImages] = useState({});
    
    const cleanup = (savetype)=>{
        if(savetype === 'gallery')
        {
            setSpinner(false);
            setForm(defaultform);
            clearHighlighted();
        }
        else
        {
            setSpinnerImage(false);
            setImageForm({thumb:'', link:'', trigger:false});
        }
        
    };
    const SaveEntry= (savetype)=>{
        if(savetype === 'gallery')
        {
            setForm({...form, trigger:true});
            if(form.name.length > 0 && form.desc.length > 0){
                setSpinner(true);
                let keyid = (form.id === '' ? +new Date() : form.id) + '';
                saveGallery(keyid, form, ()=>{
                    setSpinner(false);
                    setForm({...form, id:keyid});
                })
            }
        }
        else
        {
            let delIndexes = Object.keys(delImages).filter(key=>delImages[key]).map(x=>parseInt(x,10)).sort((a,b)=> b-a);
            setImageForm({...imageform, trigger:true});
            if((imageform.link.length > 0 && imageform.thumb.length > 0) || delIndexes.length > 0)
            {
                setSpinnerImage(true);
                let newImages = form.images.map(img=>({link:img.link, thumb:img.thumb}))
                if(delIndexes.length === 0)
                    newImages.push({link:imageform.link, thumb:imageform.thumb});
                else
                    for(let i = 0; i < delIndexes.length; i++)
                        newImages.splice(delIndexes[i], 1)
                

                const newObj = {...form, images:newImages}
                saveGallery(form.id, newObj, ()=>{
                    setSpinnerImage(false);
                    setImageForm({thumb:'', link:'', trigger:false});
                    setdelImages({});
                    setForm(newObj);
                }) 
            }
        }
        
    }
    return (
        <>
            <div className="row mt-3">
                <div className="col-lg-6">
                    
                    <div className="input-group mb-3">
                        <div className="input-group-prepend"><span className="input-group-text">Gallery Name</span></div>
                        <input type="text" className={"form-control " + (form.name.length === 0 && form.trigger ? " is-invalid" : "")} 
                        value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
                        {form.trigger && <div className="invalid-feedback">gallery name is required</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="DescText">Gallery Desc</label>
                        <textarea className={"form-control " + (form.name.length === 0 && form.trigger ? " is-invalid" : "")} 
                        rows="3"value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})}></textarea>
                        {form.trigger && <div className="invalid-feedback">description is required</div>}
                    </div>
                    <div className="btn-group-lg">
                        <button className="btn-sm btn-outline-primary" onClick={()=>SaveEntry('gallery')}>
                                {spinner && <span className="spinner-border spinner-border-sm"></span>} 
                                {form.id.length === 0  ? "Add Gallery Entry" : "Update Gallery Entry"}
                        </button>
                        <button className="btn-sm btn-outline-success ml-2" onClick={()=>cleanup('gallery')}>Clear</button>
                    </div>
                </div>
                {form.id.length > 0 && <div className="col-lg-6">
                    <div className="input-group mb-3">
                        <div className="input-group-prepend"><span className="input-group-text">Image Link</span></div>
                        <input type="text" className={"form-control " + (imageform.link.length === 0 && imageform.trigger ? " is-invalid" : "")} 
                            value={imageform.link} onChange={e=>setImageForm({...imageform, link:e.target.value})} />
                            {imageform.trigger && <div className="invalid-feedback">image link is required</div>}
                    </div>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend"><span className="input-group-text">Thumb Link</span></div>
                        <input type="text" className={"form-control " + (imageform.thumb.length === 0 && imageform.trigger ? " is-invalid" : "")} 
                        value={imageform.thumb} onChange={e=>setImageForm({...imageform, thumb:e.target.value})} />
                        {imageform.trigger && <div className="invalid-feedback">image thumb is required</div>}
                    </div>
                    <button className="btn-sm btn-outline-primary" onClick={()=>SaveEntry('image')}>
                            {spinnerImage && <span className="spinner-border spinner-border-sm"></span>} Add Image 
                    </button>
                    <button className="btn-sm btn-outline-success ml-2" onClick={()=>cleanup('image')}>Clear</button>
                </div>}
            </div>
            <div className="row mt-3">
                <div className="btn-group-lg mt-3">
                        {form.images.map((img, index)=>
                            <img className="ml-2 mb-2" src={img.thumb} alt={img.thumb} key={img.thumb} style={{opacity:!!delImages[index + ''] ? '.5' :'1'}}
                                onDoubleClick={()=>setdelImages({...delImages, [index + ''] : !!delImages[index + ''] ? !delImages[index + ''] : true})} />
                        )}
                    </div>
            </div>
        </>    
    )

}

export default Gallery