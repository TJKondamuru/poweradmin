import React from 'react';
import {Link} from 'react-router-dom';
//import MenuData from './Application/Menu';

function Tree(props){    
    //const menu={...MenuData};
    //const [tree, changeTree] = useState(menu);
    const {items} = props;
    return (
        <React.Fragment>
            <ul className="tree" style={{marginTop:"10px"}}>
                <li className="leaf-node" style={{"fontWeight": ("/" === props.leaf) ? "bold" : "normal"}}><Link to="/">Home</Link></li>
                {
                  items.map((item, index1)=><li className="leaf-node" key={index1} style={{"fontWeight": ("/" + item === props.leaf) ? "bold" : "normal"}} >
                      <Link to={"/" + item}>{item}</Link></li>)  
                }
                
                {/*
                    Object.keys(tree).map((option,index)=>(
                        <li className="sub-root" key={index}>
                            <div onClick={()=>changeTree({...menu, [option]:{...tree[option], minus:!tree[option].minus}})}>
                                <img src={tree[option].minus ? "assets/img/minus-icon.png" : "assets/img/plus-icon.png"} className="subtree" style={{cursor:"pointer"}} alt={option} />
                                <span className="node-text">{option}</span>
                            </div>
                            <ul style={{display:tree[option].minus ? "block": "none"}}>
                                {tree[option].items.map((item, index1)=>(
                                    <li className="leaf-node" key={index1}><Link to={"/" + item}>{item}</Link></li>
                                ))}
                            </ul>
                        </li>
                    ))

                */}
            </ul>
        </React.Fragment>
    );

}
export default Tree;