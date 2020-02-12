import React from 'react';
import Events from './Events';
function Coupons()
{
    const gn = (thName, val)=> val==='th'? thName: val;
    return (<Events filename='coupons-entries' savefilename='save-coupons-entries' homepageTitle='home-page-coupouns'
    gridcolumns={{heading:val=>gn('Vendor Name', val), liner:val=>gn('Coupon Desc', val)}}></Events>);
}

export default Coupons;