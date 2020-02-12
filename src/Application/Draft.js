import React, {useState, useEffect} from 'react';

import { Editor, EditorState, convertToRaw, convertFromRaw, DefaultDraftBlockRenderMap} from 'draft-js';
import {Map}  from 'immutable'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
  

function BlockQuote(props){
    return (<div class="shadow-lg p-3 mb-5 bg-white rounded">{props.children}</div>);
}
function CustomEditor(props){
    const [wygState, setwygState] = useState(EditorState.createEmpty());
    const [renderMap, setRenderMap] = useState(DefaultDraftBlockRenderMap)
    useEffect(()=>{
        
        const blockRenderMap = Map({
            'Quote': {
                element: 'div',
                wrapper: <BlockQuote />,
            }
        }); 
        setRenderMap(renderMap.merge(blockRenderMap));
    }, []);

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
    }
    
    return (
        <div className="row">
            <div className="col-12">
                <Editor editorState={wygState} wrapperClassName="card" editorClassName="card-body wysiwyg editor-images" blockRenderMap={renderMap}
                onEditorStateChange={editorStateChg} toolbar={{image: {uploadCallback: imageUploadCallback,previewImage: true}}}  />
            </div>
        </div>
    )
}
export default CustomEditor;