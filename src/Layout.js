import React, {useState} from 'react';
import Tree from './Tree';

import { Route, Switch } from 'react-router';
import FileEntries from './Application/FileEntries';
import HomeEntries from './Application/HomeEntries';
import Accommodation from './Application/Accommodation';
import Events from './Application/Events';
import Gallery from './Application/Gallery';
import AllMovies from './Application/AllMovies';
import Articles from './Application/Articles'
import SocialGrps from './Application/Socialgrps';
import AboutPlaces from './Application/AboutPlaces';
import Coupons from './Application/Coupons';

import Home from './Home';
import {withRouter} from 'react-router-dom';



function Layout(props){
    const [leaf, setLeaf] = useState(props.history ? props.history.path : '/');    
    props.history.listen((location, action) => {
        setLeaf(location.pathname);
    });
    
    return (
        <div className="row" style={{position:"relative", padding:"0px", margin:"0px", height:"40%"}} >
            <div className="col-lg-2 col-md-2 tree-cover" id="leftmenu" style={{marginLeft:"-10px"}}>
                <div><Tree items={['About Places', 'Accommodation', 'Articles',  'All Movies', 'Coupons', 'Events', 'File Entries', 'Gallery', 'Social Groups']} leaf={leaf}/></div>
            </div>

            <div className="col-lg-10 col-md-10" style={{padding:"5px"}} id="body">
                <Switch>
                    <Route exact path='/' component={HomeEntries}></Route>
                    <Route exact path='/File Entries' component={FileEntries}></Route>
                    <Route exact path="/Accommodation" component={Accommodation}></Route>
                    <Route exact path="/Events" component={Events}></Route>
                    <Route exact path="/Coupons" component={Coupons}></Route>
                    <Route exact path="/Gallery" component={Gallery}></Route>
                    <Route exact path="/All Movies" component={AllMovies}></Route>
                    <Route exact path="/Articles" component={Articles}></Route>
                    <Route exact path="/About Places" component={AboutPlaces}></Route>
                    <Route exact path="/Social Groups" component={SocialGrps}></Route>
                </Switch>
            </div>
        </div>
    );
}
export default withRouter(Layout);