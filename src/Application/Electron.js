const { ipcRenderer} = window.require('electron');
const promiseDict = {};

function storeEntry(entryname, args, invalidate=[], force=false){
    
    if(!promiseDict[entryname] || promiseDict[entryname] === null || force){
        promiseDict[entryname] = new Promise((resolve, reject)=>{
            try{
                    ipcRenderer.once(`${entryname}-response`, (event, data)=>{
                        for(let ii = 0; ii < invalidate.length; ii++)
                            promiseDict[invalidate[ii]] = null;
                        resolve(data);
                    })
                    ipcRenderer.send(`${entryname}`, args);
            }
            catch(e){
                reject(e);
            }
        }); 
    };
    return promiseDict[entryname];
}



function cacheEntry(entryname, propstate){
    return ipcRenderer.sendSync(entryname, propstate)
}

function sendEvnt(namedEvent, eventData){    
    return new Promise((resolve, reject)=>{
        try
        {
            ipcRenderer.once(`${namedEvent}-response`, (event, rtndata)=>{
                resolve(rtndata)    
            })
            ipcRenderer.send(namedEvent, eventData);
            //let filedata = ipcRenderer.sendSync(namedEvent, eventData);
            //resolve(filedata);
        }
        catch(ex){
            reject(ex);
        }
    });
}

function adjustImg(origpath, options, quality){
    return sendEvnt('adjust-native-image', {origpath, options, quality});
}

function makeImg(url, type){
    return sendEvnt('get-native-image', {url, type});
}

function OgMarkers(eventlink){
    return sendEvnt('get-events-og-tags', {url:eventlink})
}
function UploadFile(filepath, newname, meta){
    return sendEvnt('upload-file-as-blob', {filepath,newname,meta});
}
function OCRText(imageUrl){
    return sendEvnt('ocr-image-entry', {imageUrl})
}
function ListUploadFiles(){
    return sendEvnt('list-upload-files', {})
}

export const electronStore = {
    init : args=>storeEntry('init', args),
    homeEntries : ()=>storeEntry('home-entries', {}),
    saveHomeEntry : (newobj, isEmpty)=>storeEntry('save-home-entry', {newobj, isEmpty}, ['home-entries'], true),

    homePageEntries : ()=>storeEntry('home-page-entries', {}),
    saveHomePageEntry : (newobj, isEmpty)=>storeEntry('save-home-page-entry', {newobj, isEmpty}, ['home-page-entries'], true),

    appFiles : ()=>storeEntry('all-files', {}),
    saveAppFile : (newobj, isEmpty)=>storeEntry('save-all-file', {newobj, isEmpty}, ['all-files'], true),
    
    exportHomeEntry : propstate => cacheEntry('all-files-key-cache', propstate),

    accommodations:()=>storeEntry('house-entries', {}),
    saveAccommodation : (newobj, isEmpty)=>storeEntry('save-house-entry', {newobj, isEmpty}, ['house-entries'], true),

    comments:()=>storeEntry('comment-list', {}),
    saveComment : (newobj, isEmpty)=>storeEntry('save-comment-list', {newobj, isEmpty}, ['comment-list'], true),

    posts:()=> storeEntry('post-list', {}),
    savePosts : (newobj, isEmpty)=>storeEntry('save-post-list', {newobj, isEmpty}, ['post-list'], true),

    events:(filename)=>storeEntry(!filename ? 'event-entries' : filename + '', {}),
    saveEvent:(filename, savefilename, newobj, isEmpty)=>storeEntry(!savefilename ? 'save-event-entry' : savefilename + '', {newobj, isEmpty}, 
                                                                    [!filename ? 'event-entries' : filename + ''], true),

    gallaries: ()=>storeEntry('gallery-entries', {}),
    saveGallary:(newobj, isEmpty)=>storeEntry('save-gallery-entry', {newobj, isEmpty}, ['gallery-entries'], true),

    articles: ()=>storeEntry('article-entries', {}),
    saveArticles:(newobj, isEmpty)=>storeEntry('save-article-entry', {newobj, isEmpty}, ['article-entries'], true),

    socialgroups: ()=>storeEntry('social-group-entries', {}),
    saveSocialgroups:(newobj, isEmpty)=>storeEntry('save-social-group-entries', {newobj, isEmpty}, ['social-group-entries'], true),

    listAllMovies : ()=>storeEntry('list-running-movies', {})
}

export const nativeImg = {
    makeImg : (url, type)=>makeImg(url, type),
    adjustImg : (path, options, quality)=>adjustImg(path, options, quality),
    OgMarkers : eventlink=>OgMarkers(eventlink),
    OCRText   : imageUrl=>OCRText(imageUrl),  
    UploadFile : (filepath, newname, meta)=>UploadFile(filepath, newname, meta),
    ListUploadFiles: ()=>ListUploadFiles()
    
}

