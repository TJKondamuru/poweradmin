import React from 'react';
import { Route, Switch } from 'react-router';
import FileEntries from './FileEntries';
import HomeEntries from './HomeEntries';
import Accommodation from './Accommodation'
import Home from '../Home';

const Menu={'User Admin':{items:['Accommodation', 'Events', 'File Entries', 'Home Entries']}};
 export default Menu;

export function AllRoutes(){
     return (
        <React.Fragment>
            <Route exact path='/' component={Home}></Route>
            <Route path='/File Entries' component={FileEntries}></Route>
            <Route path="/Home Entries" component={HomeEntries}></Route>
            <Route path="/Accommodation" component={Accommodation}></Route>
        </React.Fragment>

     )
 }
